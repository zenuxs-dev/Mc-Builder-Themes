'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Footer } from '../components';
import { Shield, User, Link2, LogOut, CheckCircle, AlertCircle, Settings, Globe } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [site, setSite] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [mcStatus, setMcStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    // Auth guard
    if (!user) {
      const params = new URLSearchParams();
      params.set('redirect', '/settings');
      router.push(`/login?${params.toString()}`);
    }
  }, [user, router]);

  if (!site || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050508', color: '#00ff88', fontFamily: 'monospace' }}>
        LOADING_SYSTEM_SETTINGS...
      </div>
    );
  }

  const accent = site.theme.primaryColor || '#00ff88';

  const handleLinkZenuxs = async () => {
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
    <div style={{ minHeight: '100vh', background: '#050508', color: '#fff' }}>
      <Navbar site={site} pages={pages} accent={accent} mcStatus={mcStatus} />
      
      <main style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
          <Settings size={36} color={accent} />
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em' }}>USER_CONTROL_PANEL</h1>
            <p style={{ color: accent, opacity: 0.6, fontSize: '11px', fontWeight: 900, letterSpacing: '0.15em', marginTop: '4px' }}>
              MANAGE_LINKED_IDENTITIES_AND_SECTORS
            </p>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '16px 20px', 
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            marginBottom: '32px',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={18} />
            <span>✗_ERROR: {error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gap: '40px' }}>
          {/* PROFILE SUMMARY */}
          <div className="cyber-border" style={{ padding: '32px', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: accent, marginBottom: '24px', letterSpacing: '0.1em' }}>// IDENTITY_DOSSIER</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '12px', border: `2px solid ${accent}` }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: accent }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{user.username}</h4>
                <p style={{ color: '#666', fontSize: '13px', marginTop: '4px', fontFamily: 'monospace' }}>
                  UID: {user.id || user._id}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>
                    PLAN: {user.plan || 'FREE'}
                  </span>
                  <span style={{ fontSize: '9px', background: `${accent}15`, color: accent, border: `1px solid ${accent}40`, padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>
                    SESSION: ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LINKED ACCOUNTS */}
          <div className="cyber-border" style={{ padding: '32px', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: accent, marginBottom: '24px', letterSpacing: '0.1em' }}>// LINKED_AUTHENTICATORS</h3>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* ZENUXS AUTH */}
              <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isZenuxsLinked ? accent : '#ef4444' }} />
                    <h4 style={{ fontSize: '14px', fontWeight: 900 }}>ZENUXS_OAUTH_SYSTEM</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    {isZenuxsLinked ? 'Zenuxs credentials merged with local account.' : 'Connect your Zenuxs account to synchronize forums & purchases.'}
                  </p>
                </div>

                {isZenuxsLinked ? (
                  <div style={{ fontSize: '11px', color: accent, fontWeight: 900, letterSpacing: '0.1em', background: `${accent}15`, padding: '8px 16px', border: `1px solid ${accent}30` }}>
                    ✓ LINKED
                  </div>
                ) : (
                  <button 
                    onClick={handleLinkZenuxs}
                    disabled={loading}
                    style={{ 
                      background: 'transparent', 
                      border: `1px solid ${accent}`, 
                      color: accent, 
                      padding: '10px 20px', 
                      fontSize: '11px', 
                      fontWeight: 900, 
                      cursor: 'pointer',
                      letterSpacing: '0.1em',
                      transition: '0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = '#000'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent; }}
                  >
                    {loading ? 'CONNECTING...' : 'LINK_ZENUXS'}
                  </button>
                )}
              </div>

              {/* ADVANCED AUTH */}
              <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAdvancedAuthLinked ? accent : '#666' }} />
                    <h4 style={{ fontSize: '14px', fontWeight: 900 }}>ADVANCED_AUTH_MINECRAFT</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    {isAdvancedAuthLinked ? `Linked Minecraft Username: ${user.username}` : 'To link Advanced Auth, register in-game and log in via Advanced Auth first.'}
                  </p>
                </div>

                <div style={{ fontSize: '11px', color: isAdvancedAuthLinked ? accent : '#666', fontWeight: 900, letterSpacing: '0.1em', background: isAdvancedAuthLinked ? `${accent}15` : 'rgba(255,255,255,0.02)', padding: '8px 16px', border: `1px solid ${isAdvancedAuthLinked ? `${accent}30` : 'rgba(255,255,255,0.05)'}` }}>
                  {isAdvancedAuthLinked ? '✓ CONNECTED' : 'NOT LINKED'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer site={site} accent={accent} />
    </div>
  );
}
