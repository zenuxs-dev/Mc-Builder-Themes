'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Sidebar, Footer } from '../components';
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: '#fff', fontFamily: 'serif' }}>
        Loading Settings...
      </div>
    );
  }

  const primary = site.theme.primaryColor || '#e74c3c';

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
    <>
      <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/settings" />
        <main className="bc-main">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div>
              <h1 className="serif" style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.02em', color: '#fff' }}>Settings</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginTop: '6px' }}>
                Manage your linked authentication methods and gaming profile
              </p>
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '16px 20px', 
              background: '#ef444410',
              border: '1px solid #ef444430',
              color: '#ef4444',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* PROFILE SUMMARY */}
            <div className="bc-card">
              <h3 className="serif" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#fff' }}>Identity Profile</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 500, color: '#fff' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>{user.username}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>
                    Account ID: {user.id || user._id}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                      Plan: {user.plan || 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* LINKED ACCOUNTS */}
            <div className="bc-card">
              <h3 className="serif" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#fff' }}>Linked Accounts</h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* ZENUXS AUTH */}
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isZenuxsLinked ? '#10b981' : '#6b7280' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Zenuxs Account Link</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', lineHeight: 1.5 }}>
                      {isZenuxsLinked ? 'Linked to your Zenuxs profile.' : 'Connect to synchronize forum permissions and storefront purchases.'}
                    </p>
                  </div>

                  {isZenuxsLinked ? (
                    <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      Connected
                    </div>
                  ) : (
                    <button 
                      onClick={handleLinkZenuxs}
                      disabled={loading}
                      className="bc-btn-red"
                      style={{ 
                        padding: '10px 20px', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                    >
                      {loading ? 'Connecting...' : 'Link Zenuxs Account'}
                    </button>
                  )}
                </div>

                {/* ADVANCED AUTH */}
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAdvancedAuthLinked ? '#10b981' : '#6b7280' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Advanced Auth (Minecraft)</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', lineHeight: 1.5 }}>
                      {isAdvancedAuthLinked ? `Linked Minecraft Username: ${user.username}` : 'To link Advanced Auth, register in-game and log in via Advanced Auth first.'}
                    </p>
                  </div>

                  <div style={{ fontSize: '13px', color: isAdvancedAuthLinked ? '#10b981' : 'rgba(255,255,255,0.4)', fontWeight: 600, background: isAdvancedAuthLinked ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${isAdvancedAuthLinked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                    {isAdvancedAuthLinked ? 'Connected' : 'Not Linked'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer site={site} primary={primary} />
    </>
  );
}
