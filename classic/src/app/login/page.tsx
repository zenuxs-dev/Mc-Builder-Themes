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
      setError('Authentication is not enabled for this site.');
      setLoading(false);
      return;
    }

    const { apiKey, serverKey } = site.authSettings;

    try {
      const url = `https://plugins.zenuxs.in/api/dataapikey/query?tag=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&apikey=${apiKey}${serverKey ? `&serverKey=${serverKey}` : ''}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      });

      const data = await res.json();

      if (data.valid) {
        const params = new URLSearchParams(window.location.search);
        login(data.username, apiKey, 'advanced_auth');
        const redirect = params.get('redirect') || '/';
        router.push(redirect);
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Failed to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleZenuxsLogin = async () => {
    setError('');
    setLoading(true);

    if (!site?.zenuxsOauth?.enabled) {
      setError('Zenuxs OAuth is not enabled for this site.');
      setLoading(false);
      return;
    }

    try {
      const siteKey = site.siteKey;
      const redirectUri = `${window.location.origin}/login`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      // Save redirect target to localStorage if present
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

  const primary = site.theme.primaryColor;
  const isAdvEnabled = site?.authSettings?.enabled;
  const isZenuxsEnabled = site?.zenuxsOauth?.enabled;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: site.theme.backgroundColor, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      fontFamily: site.theme.font,
      color: site.theme.textColor
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        background: 'rgba(255,255,255,0.02)', 
        backdropFilter: 'blur(20px)',
        border: `1px solid ${primary}20`,
        borderRadius: '32px',
        padding: '48px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: primary, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            color: site.theme.backgroundColor,
            boxShadow: `0 10px 30px ${primary}40`
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ fontSize: '14px', opacity: 0.5 }}>Login to {site.name}</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '12px', 
            background: '#ef444415', 
            border: '1px solid #ef444430', 
            color: '#ef4444', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!isAdvEnabled && !isZenuxsEnabled ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ opacity: 0.5, fontSize: '14px' }}>Authentication is not configured for this website.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isAdvEnabled && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '16px', 
                      padding: '16px 16px 16px 48px', 
                      fontSize: '14px',
                      color: 'white',
                      outline: 'none',
                      transition: '0.2s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = primary}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: '16px', 
                      padding: '16px 16px 16px 48px', 
                      fontSize: '14px',
                      color: 'white',
                      outline: 'none',
                      transition: '0.2s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = primary}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    background: primary, 
                    color: site.theme.backgroundColor, 
                    padding: '16px', 
                    borderRadius: '16px', 
                    border: 'none', 
                    fontWeight: 800, 
                    fontSize: '15px', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    transition: '0.2s',
                    marginTop: '10px',
                    width: '100%'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {loading ? 'Authenticating...' : (
                    <>
                      Login with Advanced Auth <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {isAdvEnabled && isZenuxsEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', opacity: 0.3 }}>
                <div style={{ flex: 1, height: '1px', background: 'white' }} />
                <span style={{ padding: '0 10px', fontSize: '12px', fontWeight: 800 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'white' }} />
              </div>
            )}

            {isZenuxsEnabled && (
              <button 
                type="button"
                onClick={handleZenuxsLogin}
                disabled={loading}
                style={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white', 
                  padding: '16px', 
                  borderRadius: '16px', 
                  border: 'none', 
                  fontWeight: 800, 
                  fontSize: '15px', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  transition: '0.2s',
                  width: '100%',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {user ? 'Link Zenuxs Account' : 'Login with Zenuxs'}
              </button>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/" style={{ fontSize: '13px', opacity: 0.4, textDecoration: 'none', color: 'inherit', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}>
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
