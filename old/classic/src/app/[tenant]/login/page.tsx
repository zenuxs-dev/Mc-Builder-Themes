'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
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
  const params = useParams();

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
        login(data.username, apiKey);
        router.push('/');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Failed to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  if (!site) return null;

  const primary = site.theme.primaryColor;

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
          <p style={{ fontSize: '14px', opacity: 0.5 }}>Login to {site.name} with Advanced Auth</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              gap: '10px' 
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

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
                color: '#white',
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
                color: '#white',
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
              marginTop: '10px'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {loading ? 'Authenticating...' : (
              <>
                Login to Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/" style={{ fontSize: '13px', opacity: 0.4, textDecoration: 'none', color: 'inherit', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}>
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
