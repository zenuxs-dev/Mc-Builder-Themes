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
  const primary = site.theme.primaryColor || '#1e3a8a';

  if (!user || user.loginType !== 'zenuxs') {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '16px', fontFamily: 'serif' }}>Authentication Required</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>Please log in with Zenuxs to view your notifications.</p>
        <Link href="/login">
          <button style={{ 
            background: primary, 
            color: 'white', 
            border: 'none', 
            padding: '16px 32px', 
            fontWeight: 600, 
            borderRadius: '12px',
            cursor: 'pointer',
            transition: '0.3s'
          }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Log In to Continue</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '42px', fontWeight: 500, fontFamily: 'serif', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <Bell size={36} color={primary} />
            Notifications
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
            Stay updated with your form statuses and discussions.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={fetchNotifications} style={{ background: 'transparent', border: `1px solid rgba(255,255,255,0.1)`, color: 'white', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={markAllAsRead} style={{ background: primary, border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <CheckCircle size={16} /> Mark All as Read
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.4)' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '80px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'rgba(255,255,255,0.3)' }}>
            <Bell size={32} />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 500, fontFamily: 'serif', marginBottom: '8px' }}>You're all caught up!</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>You have no new notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {notifications.map(n => (
            <div 
              key={n._id}
              style={{
                padding: '32px',
                background: n.read ? 'rgba(255,255,255,0.02)' : `rgba(${primary.replace('#', '').match(/.{1,2}/g)?.map((v: string) => parseInt(v, 16)).join(',')}, 0.08)`,
                border: '1px solid',
                borderColor: n.read ? 'rgba(255,255,255,0.05)' : `rgba(${primary.replace('#', '').match(/.{1,2}/g)?.map((v: string) => parseInt(v, 16)).join(',')}, 0.3)`,
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: primary }} />}
              
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: n.read ? 'rgba(255,255,255,0.5)' : primary }}>
                {n.type === 'form_status' ? <Info size={24} /> : <Bell size={24} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'serif', color: n.read ? 'rgba(255,255,255,0.7)' : 'white' }}>{n.title}</h4>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>{n.message}</p>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  {n.link && (
                    <Link href={n.link}>
                      <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        View Details <ExternalLink size={14} />
                      </button>
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markAsRead(n._id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
