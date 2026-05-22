'use client';
import { useState } from 'react';
import { getServerStatus } from '@/lib/api';
import { Navbar, Sidebar, Footer } from '../components';

export function StatusClient({ site, pages, mcStatus: initialMcStatus }: { site: any; pages: any[]; mcStatus: any }) {
  const [mcStatus, setMcStatus] = useState(initialMcStatus);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const primary = site.theme.primaryColor || '#e74c3c';
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
    <>
      <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/status" />
        <main className="bc-main">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', marginBottom: '8px' }}>System Status</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Live monitoring for <strong>{site.serverIp}</strong></p>
            </div>
            <button onClick={refresh} disabled={refreshing}
              className="bc-btn-red"
              style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: refreshing ? 'not-allowed' : 'pointer' }}>
              {refreshing ? 'Scanning...' : 'Refresh Status'}
            </button>
          </div>

          {/* Status Card */}
          <div className="bc-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: mc.online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: mc.online ? '#10b981' : '#ef4444' }}>
                {mc.online ? '✓' : '✕'}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{mc.online ? 'All Systems Operational' : 'Server Offline'}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{mc.online ? `${mc.players?.online || 0} players are currently connected.` : 'Unable to reach the server at this time.'}</p>
              </div>
            </div>

            {mc.online && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Online Players', value: `${mc.players?.online || 0} / ${mc.players?.max || 0}` },
                  { label: 'Response Time', value: `${mc.debug?.ping || mc.ping || 0} ms` },
                  { label: 'Server Version', value: mc.version?.name?.split(' ')[0] || '1.20.x' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: '6px' }}>{stat.label}</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connection Details */}
          <div className="bc-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Connection Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Java Edition</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px' }}>Address</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                      {javaIp}
                    </p>
                  </div>
                  <button onClick={copyIp} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              
              {site.bedrockSupported && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Bedrock Edition</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px' }}>Address</p>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{site.bedrockIp || site.serverIp}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px' }}>Port</p>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{site.bedrockPort || 19132}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Uptime */}
          <div className="bc-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>Uptime History</h3>
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '99px', fontWeight: 800, fontSize: '13px' }}>
                {uptime}% Uptime
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '4px', height: '32px', marginBottom: '12px' }}>
              {Array.from({ length: 40 }).map((_, i) => {
                const histIdx = history.length - 1 - (39 - i);
                const s = history[histIdx];
                return <div key={i} title={s ? `${new Date(s.timestamp).toLocaleString()} - ${s.online ? 'Online' : 'Offline'}` : 'No data'} 
                            style={{ flex: 1, background: s ? (s.online ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.05)', borderRadius: '4px', opacity: s ? 1 : 0.5, transition: '0.2s' }} />;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              <span>Past</span>
              <span>Now</span>
            </div>
          </div>
          
        </main>
      </div>
      <Footer site={site} primary={primary} />
    </>
  );
}
