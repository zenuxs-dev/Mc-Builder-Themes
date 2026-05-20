'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite } from '@/lib/api';
import Link from 'next/link';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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

  const primary = site.theme.primaryColor || '#1a1a2e';
  const isAdvEnabled = site?.authSettings?.enabled;
  const isZenuxsEnabled = site?.zenuxsOauth?.enabled;

  return (
    <div className="outfit" style={{ 
      minHeight: '100vh', 
      background: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      color: '#1a1a2e'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '480px', 
        background: '#fff', 
        borderRadius: '48px',
        padding: '64px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.06)',
        border: '1px solid #f5f5f5'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: `${primary}10`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 32px',
            color: primary
          }}>
            <ShieldCheck size={40} />
          </div>
          <h1 className="serif" style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>Welcome Home</h1>
          <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>Sign in to {site.name} to continue your journey.</p>
        </div>

        {error && (
          <div style={{ 
            padding: '16px 20px', 
            borderRadius: '20px', 
            background: '#ef444408', 
            border: '1px solid #ef444415', 
            color: '#ef4444', 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {!isAdvEnabled && !isZenuxsEnabled ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ opacity: 0.5, fontSize: '15px' }}>Authentication is not configured for this server.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {isAdvEnabled && (
              <form onSubmit={handleLogin} style={{ display: 'grid', gap: '24px' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', opacity: 0.6 }}>USERNAME</label>
                   <input 
                     type="text" 
                     placeholder="Enter your in-game name"
                     required
                     value={username}
                     onChange={e => setUsername(e.target.value)}
                     style={{ 
                       width: '100%', 
                       background: '#fafafa', 
                       border: '1px solid #eee', 
                       borderRadius: '20px', 
                       padding: '18px 24px', 
                       fontSize: '15px',
                       outline: 'none',
                       transition: '0.3s'
                     }}
                     onFocus={e => e.currentTarget.style.borderColor = primary}
                     onBlur={e => e.currentTarget.style.borderColor = '#eee'}
                   />
                </div>

                <div>
                   <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', opacity: 0.6 }}>PASSWORD</label>
                   <input 
                     type="password" 
                     placeholder="••••••••"
                     required
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     style={{ 
                       width: '100%', 
                       background: '#fafafa', 
                       border: '1px solid #eee', 
                       borderRadius: '20px', 
                       padding: '18px 24px', 
                       fontSize: '15px',
                       outline: 'none',
                       transition: '0.3s'
                     }}
                     onFocus={e => e.currentTarget.style.borderColor = primary}
                     onBlur={e => e.currentTarget.style.borderColor = '#eee'}
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    background: '#1a1a2e', 
                    color: '#fff', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: 'none', 
                    fontWeight: 700, 
                    fontSize: '16px', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px',
                    transition: '0.3s',
                    marginTop: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    width: '100%'
                  }}
                >
                  {loading ? 'Validating...' : (
                    <>
                      Sign In with Advanced Auth <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            {isAdvEnabled && isZenuxsEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', opacity: 0.15 }}>
                <div style={{ flex: 1, height: '1px', background: 'black' }} />
                <span style={{ padding: '0 12px', fontSize: '12px', fontWeight: 700 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'black' }} />
              </div>
            )}

            {isZenuxsEnabled && (
              <button 
                type="button"
                onClick={handleZenuxsLogin}
                disabled={loading}
                style={{ 
                  background: 'transparent',
                  color: 'white', 
                  padding: '18px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  fontWeight: 600, 
                  fontSize: '15px', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  letterSpacing: '0.02em',
                  fontFamily: 'serif',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                {user ? 'Link Zenuxs Account' : 'Login with Zenuxs'}
              </button>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/" style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'none', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.color = '#1a1a2e'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
            ← Return to Hub
          </Link>
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '60px', opacity: 0.05, fontSize: '12px', fontWeight: 800, letterSpacing: '0.3em' }}>
        TITAN_ENCRYPTION_ACTIVE
      </div>
    </div>
  );
}
