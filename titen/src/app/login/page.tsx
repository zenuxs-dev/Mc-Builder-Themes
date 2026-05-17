'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite } from '@/lib/api';
import Link from 'next/link';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

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
        login(data.username, apiKey);
        router.push('/');
      } else {
        setError('The credentials provided do not match our records.');
      }
    } catch (err) {
      setError('Could not establish connection with the authentication portal.');
    } finally {
      setLoading(false);
    }
  };

  if (!site) return null;

  const primary = site.theme.primaryColor || '#1a1a2e';

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
          <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>Sign in to your account at {site.name} to continue your journey.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '24px' }}>
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
              fontWeight: 600
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

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
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? 'Validating...' : (
              <>
                Sign In to Platform <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

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
