'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite } from '@/lib/api';
import Link from 'next/link';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Terminal, Zap } from 'lucide-react';

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
      setError('AUTHENTICATION_DISABLED_FOR_THIS_SECTOR');
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
        setError('INVALID_CREDENTIALS_ACCESS_DENIED');
      }
    } catch (err) {
      setError('CONNECTION_FAILURE_SERVER_OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  const handleZenuxsLogin = async () => {
    setError('');
    setLoading(true);

    if (!site?.zenuxsOauth?.enabled) {
      setError('ZENUXS_OAUTH_SECTOR_NOT_ACTIVE');
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

  const accent = site.theme.primaryColor || '#00ff88';
  const isAdvEnabled = site?.authSettings?.enabled;
  const isZenuxsEnabled = site?.zenuxsOauth?.enabled;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#050508', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Space Grotesk', sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="cyber-grid" style={{ opacity: 0.1 }} />
      
      <div className="cyber-border" style={{ 
        width: '100%', 
        maxWidth: '450px', 
        background: 'rgba(255,255,255,0.01)', 
        padding: '56px',
        position: 'relative',
        zIndex: 2,
        boxShadow: `0 0 100px ${accent}05`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            background: accent, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 32px',
            color: '#000',
            boxShadow: `0 0 30px ${accent}40`,
            borderRadius: '4px'
          }}>
            <Terminal size={36} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px' }}>INITIALIZE_LOGIN</h1>
          <p style={{ fontSize: '12px', color: accent, fontWeight: 900, letterSpacing: '0.2em', opacity: 0.6 }}>SYSTEM AUTHENTICATION REQ_V2.0</p>
        </div>

        {error && (
          <div style={{ 
            padding: '16px', 
            background: '#ef444410', 
            border: '1px solid #ef444430', 
            color: '#ef4444', 
            fontSize: '11px', 
            fontWeight: 900,
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            letterSpacing: '0.05em',
            marginBottom: '24px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!isAdvEnabled && !isZenuxsEnabled ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ opacity: 0.5, fontSize: '13px', letterSpacing: '0.05em' }}>AUTHENTICATION_NOT_CONFIGURED</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isAdvEnabled && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ position: 'relative' }}>
                   <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#444', marginBottom: '8px', letterSpacing: '0.1em' }}>USER_IDENTIFIER</label>
                   <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ 
                          width: '100%', 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          padding: '18px 24px', 
                          fontSize: '15px',
                          color: 'white',
                          outline: 'none',
                          transition: '0.3s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = accent}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                   </div>
                </div>

                <div style={{ position: 'relative' }}>
                   <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#444', marginBottom: '8px', letterSpacing: '0.1em' }}>ACCESS_PHRASE</label>
                   <input 
                     type="password" 
                     required
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     style={{ 
                       width: '100%', 
                       background: 'rgba(255,255,255,0.02)', 
                       border: '1px solid rgba(255,255,255,0.1)', 
                       padding: '18px 24px', 
                       fontSize: '15px',
                       color: 'white',
                       outline: 'none',
                       transition: '0.3s'
                     }}
                     onFocus={e => e.currentTarget.style.borderColor = accent}
                     onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    background: accent, 
                    color: '#000', 
                    padding: '20px', 
                    border: 'none', 
                    fontWeight: 900, 
                    fontSize: '14px', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px',
                    transition: '0.3s',
                    marginTop: '12px',
                    letterSpacing: '0.1em',
                    width: '100%'
                  }}
                >
                  {loading ? 'CONNECTING...' : (
                    <>
                      BYPASS_FIREWALL <Zap size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {isAdvEnabled && isZenuxsEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', opacity: 0.15 }}>
                <div style={{ flex: 1, height: '1px', background: 'white' }} />
                <span style={{ padding: '0 12px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.25em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'white' }} />
              </div>
            )}

            {isZenuxsEnabled && (
              <button 
                type="button"
                onClick={handleZenuxsLogin}
                disabled={loading}
                style={{ 
                  background: 'transparent',
                  border: `2px solid ${accent}`,
                  color: accent, 
                  padding: '20px', 
                  fontWeight: 900, 
                  fontSize: '14px', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px',
                  transition: '0.3s',
                  width: '100%',
                  letterSpacing: '0.1em',
                  boxShadow: `0 0 15px ${accent}20`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = accent;
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = accent;
                }}
              >
                {user ? 'Link Zenuxs Account' : 'Login with Zenuxs'}
              </button>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/" style={{ fontSize: '11px', opacity: 0.3, textDecoration: 'none', color: '#fff', fontWeight: 900, letterSpacing: '0.1em' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}>
            EXIT_TO_MAIN_TERMINAL
          </Link>
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', fontSize: '100px', fontWeight: 900, color: 'rgba(255,255,255,0.01)', pointerEvents: 'none' }}>
        SECURE_V2
      </div>
    </div>
  );
}
