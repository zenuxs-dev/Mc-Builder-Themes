'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServerStatus } from '@/lib/api';
import { Navbar, Footer } from '../components';

export function StatusClient({ site, pages, mcStatus: initialMcStatus }: { site: any; pages: any[]; mcStatus: any }) {
  const [mcStatus, setMcStatus] = useState(initialMcStatus);
  const [refreshing, setRefreshing] = useState(false);
  const accent = site.theme.primaryColor || '#00ff88';
  const mc = mcStatus || { online: false };
  const history = site.statusHistory || [];
  const uptime = history.length > 0 
    ? (history.filter((h: any) => h.online).length / history.length * 100).toFixed(1)
    : (mc.online ? '100' : '0');

  const refresh = async () => {
    setRefreshing(true);
    if (site.serverIp) {
      const data = await getServerStatus(site.serverIp);
      setMcStatus(data);
    }
    setRefreshing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <Navbar site={site} pages={pages} accent={accent} />
      
      <div style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ color: accent, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>● Live Monitor</span>
              <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginTop: '8px' }}>Server Status</h1>
              <p style={{ color: '#555', fontSize: '14px', marginTop: '4px' }}>Monitoring {site.serverIp}</p>
            </div>
            <button onClick={refresh} disabled={refreshing}
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${accent}20`, padding: '10px 20px', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: refreshing ? 'not-allowed' : 'pointer' }}>
              {refreshing ? '◌ Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {/* Status Card */}
          <div className="glass-card" style={{ padding: '36px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: mc.online ? '#00ff88' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: `0 0 30px ${mc.online ? '#00ff8840' : '#ef444440'}` }}>
                {mc.online ? '✓' : '✕'}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{mc.online ? 'All Systems Operational' : 'Server Offline'}</h2>
                <p style={{ color: '#555', fontSize: '14px' }}>{mc.online ? `${mc.players?.online || 0} players online` : 'Unable to connect'}</p>
              </div>
            </div>

            {mc.online && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Players', value: `${mc.players?.online || 0} / ${mc.players?.max || 0}` },
                  { label: 'Latency', value: `${mc.debug?.ping || mc.ping || 0} ms` },
                  { label: 'Version', value: mc.version?.name?.split(' ')[0] || '1.20.x' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#555', letterSpacing: '0.1em', marginBottom: '6px' }}>{stat.label}</p>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: accent }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uptime */}
          <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Uptime History</h3>
              <span style={{ color: '#22c55e', fontWeight: 800 }}>{uptime}%</span>
            </div>
            <div style={{ display: 'flex', gap: '3px', height: '28px', marginBottom: '8px' }}>
              {Array.from({ length: 40 }).map((_, i) => {
                const histIdx = history.length - 1 - (39 - i);
                const s = history[histIdx];
                return <div key={i} style={{ flex: 1, background: s ? (s.online ? '#00ff88' : '#ef4444') : '#222', borderRadius: '2px', opacity: s ? 0.7 : 0.2 }} />;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', fontWeight: 700 }}>
              <span>Past</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      </div>

      <Footer site={site} accent={accent} />
    </div>
  );
}