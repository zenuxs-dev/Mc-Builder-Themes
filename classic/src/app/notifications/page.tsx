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
  const primary = site.theme.primaryColor || '#3b82f6';

  if (!user || user.loginType !== 'zenuxs') {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Authentication Required</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Please log in with Zenuxs to view your notifications.</p>
        <Link href="/login">
          <button style={{ 
            background: primary, 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            fontWeight: 600, 
            borderRadius: '8px',
            cursor: 'pointer',
            transition: '0.2s'
          }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Log In</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Bell size={32} color={primary} />
            Notifications
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Stay updated with your form statuses and discussions.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchNotifications} style={{ background: 'transparent', border: `1px solid rgba(255,255,255,0.1)`, color: 'white', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={markAllAsRead} style={{ background: primary, border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <CheckCircle size={14} /> Mark All as Read
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'rgba(255,255,255,0.3)' }}>
            <Bell size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>You're all caught up!</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>You have no new notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map(n => (
            <div 
              key={n._id}
              style={{
                padding: '24px',
                background: n.read ? 'rgba(255,255,255,0.02)' : `rgba(${primary.replace('#', '').match(/.{1,2}/g)?.map((v: string) => parseInt(v, 16)).join(',')}, 0.08)`,
                border: '1px solid',
                borderColor: n.read ? 'rgba(255,255,255,0.05)' : `rgba(${primary.replace('#', '').match(/.{1,2}/g)?.map((v: string) => parseInt(v, 16)).join(',')}, 0.3)`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: primary }} />}
              
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: n.read ? 'rgba(255,255,255,0.5)' : primary }}>
                {n.type === 'form_status' ? <Info size={20} /> : <Bell size={20} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: n.read ? 'rgba(255,255,255,0.7)' : 'white' }}>{n.title}</h4>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{n.message}</p>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  {n.link && (
                    <Link href={n.link}>
                      <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        View Details <ExternalLink size={12} />
                      </button>
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markAsRead(n._id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Mark as Read
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
