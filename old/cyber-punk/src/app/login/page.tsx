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
    getSite().then(setSite);
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/');
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
        login(data.username, apiKey);
        router.push('/');
      } else {
        setError('INVALID_CREDENTIALS_ACCESS_DENIED');
      }
    } catch (err) {
      setError('CONNECTION_FAILURE_SERVER_OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  if (!site) return null;

  const accent = site.theme.primaryColor || '#00ff88';

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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              letterSpacing: '0.05em'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

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
              letterSpacing: '0.1em'
            }}
          >
            {loading ? 'CONNECTING...' : (
              <>
                BYPASS_FIREWALL <Zap size={18} />
              </>
            )}
          </button>
        </form>

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
