'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite } from '@/lib/api';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [site, setSite] = useState<any>(null);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getSite().then((siteData) => {
      setSite(siteData);
      if (!siteData) return;

      // Check for Zenuxs OAuth callback query parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (code && state) {
        // Prevent duplicate execution during double-mount in StrictMode
        const processedCodeKey = `zenuxs_processed_code_${code}`;
        if (sessionStorage.getItem(processedCodeKey)) {
          return;
        }
        sessionStorage.setItem(processedCodeKey, 'true');

        setLoading(true);
        setError('');
        const savedState = localStorage.getItem('zenuxs_oauth_state') || '';
        const savedVerifier = localStorage.getItem('zenuxs_oauth_verifier') || '';
        const siteKey = siteData.siteKey;
        const redirectUri = `${window.location.origin}/login`;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        fetch(`${API_URL}/auth/zenuxs/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            siteKey,
            fullUrl: window.location.href,
            state: savedState,
            codeVerifier: savedVerifier,
            redirectUri,
            mergeUserId: localStorage.getItem('zenuxs_merge_user_id') || undefined
          })
        })
          .then((res) => {
            if (!res.ok) {
              return res.json().then((errData) => {
                throw new Error(errData.error || 'OAuth verification failed');
              });
            }
            return res.json();
          })
          .then((data) => {
            login(data.username, data.token, 'zenuxs');
            localStorage.removeItem('zenuxs_oauth_state');
            localStorage.removeItem('zenuxs_oauth_verifier');

            const savedRedirect = localStorage.getItem('zenuxs_oauth_redirect');
            localStorage.removeItem('zenuxs_oauth_redirect');
            localStorage.removeItem('zenuxs_merge_user_id'); // Clear it after use
            const redirect = savedRedirect || params.get('redirect') || '/';
            router.push(redirect);
          })
          .catch((err) => {
            setError(err.message || 'Failed to complete Zenuxs OAuth login.');
            setLoading(false);
          });
      }
    });
  }, [router, login]);

  useEffect(() => {
    // Only redirect if they are not in the middle of a callback
    const params = new URLSearchParams(window.location.search);
    if (user && !params.get('code')) {
      const redirect = params.get('redirect') || '/';
      router.push(redirect);
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!site?.authSettings?.enabled) {
      setError('Authentication is not enabled for this server.');
      setLoading(false);
      return;
    }

    const { apiKey, serverKey } = site.authSettings;

    try {
      const url = `https://plugins.zenuxs.in/api/dataapikey/query?tag=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&apikey=${apiKey}${serverKey ? `&serverKey=${serverKey}` : ''}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-api-key': apiKey }
      });

      const data = await res.json();

      if (data.valid) {
        const params = new URLSearchParams(window.location.search);
        login(data.username, apiKey, 'advanced_auth');
        const redirect = params.get('redirect') || '/';
        router.push(redirect);
      } else {
        setError('The credentials provided do not match our records.');
      }
    } catch (err) {
      setError('Could not establish connection with the authentication portal.');
    } finally {
      setLoading(false);
    }
  };

  const handleZenuxsLogin = async () => {
    setError('');
    setLoading(true);

    if (!site?.zenuxsOauth?.enabled) {
      setError('Zenuxs OAuth is not enabled for this server.');
      setLoading(false);
      return;
    }

    try {
      const siteKey = site.siteKey;
      const redirectUri = `${window.location.origin}/login`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        localStorage.setItem('zenuxs_oauth_redirect', redirect);
      }
      
      if (user) {
        localStorage.setItem('zenuxs_merge_user_id', user.id || user._id || '');
      }

      const res = await fetch(`${API_URL}/auth/zenuxs/login?siteKey=${siteKey}&redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to initiate Zenuxs OAuth login');
      }

      const data = await res.json();
      
      localStorage.setItem('zenuxs_oauth_state', data.state);
      localStorage.setItem('zenuxs_oauth_verifier', data.codeVerifier);

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Zenuxs OAuth login.');
      setLoading(false);
    }
  };

  if (!site) return null;

  const isAdvEnabled = site?.authSettings?.enabled;
  const isZenuxsEnabled = site?.zenuxsOauth?.enabled;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      color: 'var(--text-primary)'
    }}>
      <div className="bc-card" style={{ 
        width: '100%', 
        maxWidth: '480px', 
        padding: '40px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 30px var(--red-glow)',
        border: '1px solid var(--red-primary)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'rgba(231, 76, 60, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            color: 'var(--red-primary)',
            border: '1px solid rgba(231, 76, 60, 0.2)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>Welcome Portal</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sign in to {site.name} to continue your journey.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-btn)', 
            background: 'rgba(231, 76, 60, 0.05)', 
            border: '1px solid rgba(231, 76, 60, 0.15)', 
            color: 'var(--red-primary)', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!isAdvEnabled && !isZenuxsEnabled ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ opacity: 0.5, fontSize: '13px', color: 'var(--text-secondary)' }}>Authentication is not configured for this server.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {isAdvEnabled && (
              <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>USERNAME / IN-GAME NAME</label>
                   <input 
                     type="text" 
                     placeholder="Steve"
                     required
                     value={username}
                     onChange={e => setUsername(e.target.value)}
                     className="bc-input"
                   />
                </div>

                <div>
                   <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PASSWORD</label>
                   <input 
                     type="password" 
                     placeholder="••••••••"
                     required
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="bc-input"
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="bc-btn-red"
                  style={{ 
                    marginTop: '12px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    width: '100%',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Validating...' : (
                    <>
                      Sign In <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {isAdvEnabled && isZenuxsEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', opacity: 0.2 }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--text-muted)' }} />
                <span style={{ padding: '0 12px', fontSize: '10px', fontWeight: 700 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--text-muted)' }} />
              </div>
            )}

            {isZenuxsEnabled && (
              <button 
                type="button"
                onClick={handleZenuxsLogin}
                disabled={loading}
                className="bc-btn-outline"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  width: '100%',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {user ? 'Link Zenuxs Account' : 'Login with Zenuxs'}
              </button>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            ← Return to Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
