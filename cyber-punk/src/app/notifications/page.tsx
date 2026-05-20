'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCircle, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { getSite } from '@/lib/api';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    getSite().then(setSite);
  }, []);

  const fetchNotifications = async () => {
    if (!user || user.loginType !== 'zenuxs') return;
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!site) return null;
  const accent = site.theme.primaryColor || '#00ff88';

  if (!user || user.loginType !== 'zenuxs') {
    return (
      <div className="cyber-border" style={{ padding: '40px', textAlign: 'center', marginTop: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>ACCESS_DENIED</h2>
        <p style={{ color: '#888' }}>Zenuxs Authentication required to view notifications.</p>
        <Link href="/login">
          <button style={{ 
            marginTop: '20px', 
            background: accent, 
            color: '#000', 
            border: 'none', 
            padding: '12px 24px', 
            fontWeight: 900, 
            cursor: 'pointer' 
          }}>INITIALIZE_LOGIN</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={32} color={accent} />
            SYSTEM_ALERTS
          </h1>
          <p style={{ color: accent, opacity: 0.6, fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', marginTop: '4px' }}>
            REAL_TIME_NOTIFICATION_FEED
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchNotifications} style={{ background: 'transparent', border: `1px solid ${accent}40`, color: accent, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 900, fontSize: '12px' }}>
            <RefreshCw size={14} /> REFRESH
          </button>
          <button onClick={markAllAsRead} style={{ background: `${accent}20`, border: `1px solid ${accent}`, color: accent, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 900, fontSize: '12px' }}>
            <CheckCircle size={14} /> ACKNOWLEDGE_ALL
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: accent, opacity: 0.5, fontWeight: 900, letterSpacing: '0.1em' }}>
          LOADING_DATA_STREAM...
        </div>
      ) : notifications.length === 0 ? (
        <div className="cyber-border" style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
          <Bell size={48} color={accent} style={{ opacity: 0.2, margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#666', letterSpacing: '0.05em' }}>NO_NEW_ALERTS</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map(n => (
            <div 
              key={n._id}
              className="cyber-border"
              style={{
                padding: '24px',
                background: n.read ? 'rgba(255,255,255,0.01)' : `linear-gradient(90deg, ${accent}15 0%, rgba(255,255,255,0.02) 100%)`,
                borderLeft: n.read ? '1px solid rgba(255,255,255,0.1)' : `4px solid ${accent}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                transition: '0.3s'
              }}
            >
              <div style={{ width: '40px', height: '40px', background: `${accent}20`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent }}>
                {n.type === 'form_status' ? <Info size={20} /> : <Bell size={20} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: n.read ? '#aaa' : '#fff' }}>{n.title.toUpperCase()}</h4>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: 700 }}>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{n.message}</p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  {n.link && (
                    <Link href={n.link}>
                      <button style={{ background: 'transparent', border: 'none', color: accent, fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: 0 }}>
                        VIEW_DETAILS <ExternalLink size={12} />
                      </button>
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markAsRead(n._id)} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: 0 }}>
                      MARK_READ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
