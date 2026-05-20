'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Footer } from '@/components/NavFooter';
import { Shield, User, Link2, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [site, setSite] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [mcStatus, setMcStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSite().then(siteData => {
      setSite(siteData);
      if (!siteData) return;
      getPages(siteData._id).then(setPages);
      if (siteData.serverIp) {
        getServerStatus(siteData.serverIp).then(setMcStatus);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/settings');
    }
  }, [user, router]);

  if (!site || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#fff', fontFamily: 'sans-serif' }}>
        Loading Settings...
      </div>
    );
  }

  const primary = site.theme.primaryColor || '#3b82f6';
  const bg = site.theme.backgroundColor || '#09090b';
  const text = site.theme.textColor || '#ffffff';

  const handleLinkZenuxs = async () => {
    setError('');
    setLoading(true);
    if (!site?.zenuxsOauth?.enabled) {
      setError('Zenuxs OAuth is not enabled for this site');
      setLoading(false);
      return;
    }

    try {
      const siteKey = site.siteKey;
      const redirectUri = `${window.location.origin}/login`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      localStorage.setItem('zenuxs_oauth_redirect', '/settings');
      localStorage.setItem('zenuxs_merge_user_id', user.id || user._id || '');

      const res = await fetch(`${API_URL}/auth/zenuxs/login?siteKey=${siteKey}&redirectUri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate Zenuxs OAuth merge');
      }

      localStorage.setItem('zenuxs_oauth_state', data.state);
      localStorage.setItem('zenuxs_oauth_verifier', data.codeVerifier);
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Failed to link Zenuxs account.');
      setLoading(false);
    }
  };

  const isZenuxsLinked = user.loginType === 'zenuxs' || !!user.zenuxsId;
  const isAdvancedAuthLinked = user.loginType === 'advanced_auth' || !!user.minecraftUuid;

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'var(--font-inter), sans-serif' }}>
      <Navbar site={site} pages={pages} />
      
      <main style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: `${primary}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${primary}30`,
          }}>
            <Settings size={28} style={{ color: primary }} />
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>Account Settings</h1>
            <p style={{ opacity: 0.5, fontSize: '14px', marginTop: '4px' }}>
              Manage your linked accounts and profiles
            </p>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '16px 20px', 
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            borderRadius: '16px',
            marginBottom: '32px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gap: '32px' }}>
          {/* PROFILE SUMMARY */}
          <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Identity Profile</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', border: `2px solid ${primary}` }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: primary }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '20px', fontWeight: 700 }}>{user.username}</h4>
                <p style={{ opacity: 0.5, fontSize: '13px', marginTop: '4px' }}>
                  User ID: {user.id || user._id}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                    Plan: {user.plan || 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LINKED ACCOUNTS */}
          <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Linked Authentication Accounts</h3>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* ZENUXS AUTH */}
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isZenuxsLinked ? '#22c55e' : '#6b7280' }} />
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Zenuxs Account</h4>
                  </div>
                  <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '6px' }}>
                    {isZenuxsLinked ? 'Linked to your Zenuxs profile.' : 'Connect to synchronize forum permissions and storefront purchases.'}
                  </p>
                </div>

                {isZenuxsLinked ? (
                  <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600, background: 'rgba(34,197,94,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                    Connected
                  </div>
                ) : (
                  <button 
                    onClick={handleLinkZenuxs}
                    disabled={loading}
                    style={{ 
                      background: primary, 
                      color: '#fff', 
                      border: 'none', 
                      padding: '10px 20px', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {loading ? 'Connecting...' : 'Link Zenuxs Account'}
                  </button>
                )}
              </div>

              {/* ADVANCED AUTH */}
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAdvancedAuthLinked ? '#22c55e' : '#6b7280' }} />
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Advanced Auth (Minecraft)</h4>
                  </div>
                  <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '6px' }}>
                    {isAdvancedAuthLinked ? `Linked Minecraft Username: ${user.username}` : 'To link Advanced Auth, register in-game and log in via Advanced Auth first.'}
                  </p>
                </div>

                <div style={{ fontSize: '13px', color: isAdvancedAuthLinked ? '#22c55e' : 'rgba(255,255,255,0.4)', fontWeight: 600, background: isAdvancedAuthLinked ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${isAdvancedAuthLinked ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                  {isAdvancedAuthLinked ? 'Connected' : 'Not Linked'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer site={site} />
    </div>
  );
}
