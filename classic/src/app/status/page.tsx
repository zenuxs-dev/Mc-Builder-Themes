'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Footer } from '@/components/NavFooter';
import { CheckCircle2, XCircle, Clock, Activity, BarChart3, RefreshCw } from 'lucide-react';

export default function StatusPage() {
  const [site, setSite] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [mcStatus, setMcStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      const siteData = await getSite();
      if (siteData) {
        setSite(siteData);
        const [pagesData, statusData] = await Promise.all([
          getPages(siteData._id),
          siteData.serverIp ? getServerStatus(siteData.serverIp) : Promise.resolve({ online: false }),
        ]);
        setPages(pagesData);
        setMcStatus(statusData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!site) return null;

  const { theme } = site;
  const primary = theme.primaryColor;
  const mc = mcStatus || { online: false };
  
  // Calculate Uptime from history
  const history = site.statusHistory || [];
  const uptimePercent = history.length > 0 
    ? (history.filter((h: any) => h.online).length / history.length) * 100 
    : (mc.online ? 100 : 0);

  return (
    <div style={{ minHeight: '100vh', background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.font }}>
      <Navbar site={site} pages={pages} />
      
      <div style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '12px' }}>System Status</h1>
              <p style={{ fontSize: '16px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color={primary} /> Monitoring <strong>{site.serverIp}</strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={() => fetchData()} 
                disabled={refreshing}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '8px 16px', 
                  borderRadius: '10px', 
                  color: 'white', 
                  fontSize: '13px', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Scanning...' : 'Refresh Status'}
              </button>
              <p style={{ fontSize: '11px', opacity: 0.3, marginTop: '8px' }}>Last scan: {lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Current Status Card */}
          <div style={{ 
            padding: '40px', 
            borderRadius: '32px', 
            background: mc.online ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
            border: `1px solid ${mc.online ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            marginBottom: '40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '20px', 
                  background: mc.online ? '#22c55e' : '#ef4444', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: `0 0 30px ${mc.online ? '#22c55e40' : '#ef444440'}`
                }}>
                  {mc.online ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                </div>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{mc.online ? 'All Systems Operational' : 'Server Connection Lost'}</h2>
                  <p style={{ opacity: 0.6, fontSize: '15px' }}>{mc.online ? 'The server is performing within normal parameters.' : 'Our team has been notified and is working on a fix.'}</p>
                </div>
              </div>

              {mc.online && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="stat-item">
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.4, letterSpacing: '0.1em', marginBottom: '8px' }}>Current Load</p>
                    <p style={{ fontSize: '24px', fontWeight: 900 }}>{mc.players?.online || 0} <span style={{ fontSize: '14px', opacity: 0.3 }}>/ {mc.players?.max || 0}</span></p>
                  </div>
                  <div className="stat-item">
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.4, letterSpacing: '0.1em', marginBottom: '8px' }}>Response Time</p>
                    <p style={{ fontSize: '24px', fontWeight: 900 }}>{mc.debug?.ping || mc.ping || 0} <span style={{ fontSize: '14px', opacity: 0.3 }}>ms</span></p>
                  </div>
                  <div className="stat-item">
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.4, letterSpacing: '0.1em', marginBottom: '8px' }}>Version</p>
                    <p style={{ fontSize: '24px', fontWeight: 900 }}>{mc.version?.name?.split(' ')[0] || '1.20.x'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Uptime History */}
          <div style={{ 
            padding: '32px', 
            borderRadius: '24px', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} style={{ color: primary }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Uptime History</h3>
              </div>
              <div style={{ background: '#22c55e15', padding: '4px 12px', borderRadius: '99px', color: '#22c55e', fontSize: '13px', fontWeight: 800 }}>
                {uptimePercent.toFixed(1)}% Uptime
              </div>
            </div>

            {/* Status Line (The "Uptime Bars") */}
            <div style={{ display: 'flex', gap: '3px', height: '32px', marginBottom: '16px' }}>
              {Array.from({ length: 50 }).map((_, i) => {
                // Map history index to bars (right to left)
                const histIdx = history.length - 1 - (49 - i);
                const status = history[histIdx];
                const color = status ? (status.online ? '#22c55e' : '#ef4444') : 'rgba(255,255,255,0.05)';
                const opacity = status ? 1 : 0.2;

                return (
                  <div 
                    key={i} 
                    title={status ? `${new Date(status.timestamp).toLocaleString()} - ${status.online ? 'Online' : 'Offline'}` : 'No data'}
                    style={{ 
                      flex: 1, 
                      background: color, 
                      borderRadius: '3px',
                      opacity,
                      transition: '0.2s'
                    }} 
                  />
                );
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.3, fontWeight: 700, textTransform: 'uppercase' }}>
              <span>4 hours ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* MOTD if online */}
          {mc.online && mc.motd?.clean?.length > 0 && (
            <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: '10px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 800 }}>Server Broadcast</p>
              {mc.motd.clean.map((line: string, i: number) => (
                <p key={i} style={{ fontFamily: 'var(--font-space-grotesk), monospace', fontSize: '15px', opacity: 0.8, color: '#white', marginBottom: '4px' }}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer site={site} />
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: ${primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
