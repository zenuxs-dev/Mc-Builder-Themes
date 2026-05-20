'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Footer } from '../components';
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#1a1a2e', fontFamily: 'serif' }}>
        Loading Settings...
      </div>
    );
  }

  const primary = site.theme.primaryColor || '#1a1a2e';

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
    <div className="outfit" style={{ minHeight: '100vh', background: '#fff', color: '#1a1a2e' }}>
      <main style={{ paddingBottom: '120px', paddingTop: '160px', maxWidth: '800px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '56px' }}>
          <div>
            <h1 className="serif" style={{ fontSize: '48px', fontWeight: 500, letterSpacing: '-0.02em', color: '#1a1a2e' }}>Settings</h1>
            <p style={{ color: '#6b7280', fontSize: '15px', marginTop: '6px' }}>
              Manage your linked authentication methods and gaming profile
            </p>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '20px 24px', 
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '24px',
            marginBottom: '40px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gap: '48px' }}>
          {/* PROFILE SUMMARY */}
          <div style={{ padding: '40px', background: '#fff', border: '1px solid #eee', borderRadius: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
            <h3 className="serif" style={{ fontSize: '24px', marginBottom: '24px' }}>Identity Profile</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid #eee' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 500, color: '#1a1a2e' }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '22px', fontWeight: 600 }}>{user.username}</h4>
                <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                  Account ID: {user.id || user._id}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', background: '#f3f4f6', padding: '4px 12px', borderRadius: '8px', fontWeight: 600, color: '#4b5563' }}>
                    Plan: {user.plan || 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LINKED ACCOUNTS */}
          <div style={{ padding: '40px', background: '#fff', border: '1px solid #eee', borderRadius: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
            <h3 className="serif" style={{ fontSize: '24px', marginBottom: '24px' }}>Linked Accounts</h3>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* ZENUXS AUTH */}
              <div style={{ padding: '24px', background: '#fafafa', border: '1px solid #eee', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isZenuxsLinked ? '#059669' : '#9ca3af' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Zenuxs Account Link</h4>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', lineHeight: 1.5 }}>
                    {isZenuxsLinked ? 'Linked to your Zenuxs profile.' : 'Connect to synchronize forum permissions and storefront purchases.'}
                  </p>
                </div>

                {isZenuxsLinked ? (
                  <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, background: '#ecfdf5', padding: '8px 16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    Connected
                  </div>
                ) : (
                  <button 
                    onClick={handleLinkZenuxs}
                    disabled={loading}
                    style={{ 
                      background: '#1a1a2e', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '12px 24px', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      borderRadius: '16px',
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
              <div style={{ padding: '24px', background: '#fafafa', border: '1px solid #eee', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAdvancedAuthLinked ? '#059669' : '#9ca3af' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Advanced Auth (Minecraft)</h4>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', lineHeight: 1.5 }}>
                    {isAdvancedAuthLinked ? `Linked Minecraft Username: ${user.username}` : 'To link Advanced Auth, register in-game and log in via Advanced Auth first.'}
                  </p>
                </div>

                <div style={{ fontSize: '13px', color: isAdvancedAuthLinked ? '#059669' : '#6b7280', fontWeight: 600, background: isAdvancedAuthLinked ? '#ecfdf5' : '#f3f4f6', padding: '8px 16px', borderRadius: '12px', border: `1px solid ${isAdvancedAuthLinked ? '#a7f3d0' : '#e5e7eb'}` }}>
                  {isAdvancedAuthLinked ? 'Connected' : 'Not Linked'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer site={site} primary={primary} />
      </main>
      
      <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
    </div>
  );
}
