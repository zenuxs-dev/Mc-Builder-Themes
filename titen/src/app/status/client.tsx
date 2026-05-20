'use client';
import { useState } from 'react';
import { getServerStatus } from '@/lib/api';
import { Navbar, Footer } from '../components';

export function StatusClient({ site, pages, mcStatus: initialMcStatus }: { site: any; pages: any[]; mcStatus: any }) {
  const [mcStatus, setMcStatus] = useState(initialMcStatus);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const primary = site.theme.primaryColor || '#1a1a2e';
  const mc = mcStatus || { online: false };
  const history = site.statusHistory || [];
  const uptime = history.length > 0 
    ? (history.filter((h: any) => h.online).length / history.length * 100).toFixed(1)
    : (mc.online ? '100' : '0');

  const javaIp = site.serverIp + (site.requirePortInJava && site.serverPort ? `:${site.serverPort}` : '');

  const refresh = async () => {
    setRefreshing(true);
    if (site.serverIp) {
      const data = await getServerStatus(site.serverIp);
      setMcStatus(data);
    }
    setRefreshing(false);
  };

  const copyIp = () => {
    navigator.clipboard.writeText(javaIp || 'mc.server.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="outfit" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <main style={{ paddingBottom: '120px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 40px 40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '8px' }}>System Status</h1>
              <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 500 }}>Live monitoring for <strong>{site.serverIp}</strong></p>
            </div>
            <button onClick={refresh} disabled={refreshing}
              style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '16px', color: '#0f172a', fontSize: '14px', fontWeight: 700, cursor: refreshing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: '0.2s' }}>
              {refreshing ? 'Scanning...' : 'Refresh Status'}
            </button>
          </div>

          {/* Status Card */}
          <div style={{ padding: '40px', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '24px', background: mc.online ? '#ecfdf5' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: mc.online ? '#10b981' : '#ef4444' }}>
                {mc.online ? '✓' : '✕'}
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>{mc.online ? 'All Systems Operational' : 'Server Offline'}</h2>
                <p style={{ color: '#64748b', fontSize: '15px' }}>{mc.online ? `${mc.players?.online || 0} players are currently connected.` : 'Unable to reach the server at this time.'}</p>
              </div>
            </div>

            {mc.online && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                {[
                  { label: 'Online Players', value: `${mc.players?.online || 0} / ${mc.players?.max || 0}` },
                  { label: 'Response Time', value: `${mc.debug?.ping || mc.ping || 0} ms` },
                  { label: 'Server Version', value: mc.version?.name?.split(' ')[0] || '1.20.x' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '24px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '8px' }}>{stat.label}</p>
                    <p style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connection Instructions */}
          <div style={{ padding: '40px', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Connection Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '24px' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Java Edition</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Address</p>
                    <p style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
                      {javaIp}
                    </p>
                  </div>
                  <button onClick={copyIp} style={{ padding: '12px 20px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              
              {site.bedrockSupported && (
                <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '24px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Bedrock Edition</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Address</p>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>{site.bedrockIp || site.serverIp}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Port</p>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>{site.bedrockPort || 19132}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Uptime */}
          <div style={{ padding: '40px', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Uptime History</h3>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 16px', borderRadius: '99px', fontWeight: 800, fontSize: '14px' }}>
                {uptime}% Uptime
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '4px', height: '40px', marginBottom: '12px' }}>
              {Array.from({ length: 40 }).map((_, i) => {
                const histIdx = history.length - 1 - (39 - i);
                const s = history[histIdx];
                return <div key={i} title={s ? `${new Date(s.timestamp).toLocaleString()} - ${s.online ? 'Online' : 'Offline'}` : 'No data'} 
                            style={{ flex: 1, background: s ? (s.online ? '#10b981' : '#ef4444') : '#f1f5f9', borderRadius: '4px', opacity: s ? 1 : 0.5, transition: '0.2s' }} />;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>
              <span>Past</span>
              <span>Now</span>
            </div>
          </div>
          
        </div>
        <Footer site={site} primary={primary} />
      </main>
      <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
    </div>
  );
}
