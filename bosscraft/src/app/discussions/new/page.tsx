'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Sidebar, Footer } from '../../components';
import Link from 'next/link';
import { ChevronLeft, Send, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function NewDiscussionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [site, setSite] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [mcStatus, setMcStatus] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ title, content, siteId: site._id })
      });
      if (res.ok) {
        const post = await res.json();
        router.push(`/discussions/${post._id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create discussion');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
    setSubmitting(false);
  };

  if (!site) return null;
  const primary = site.theme.primaryColor || '#e74c3c';

  if (!user) {
    return (
      <>
        <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
        <div className="bc-layout">
          <Sidebar site={site} pages={pages} activePage="/discussions" />
          <main className="bc-main">
            <div className="bc-card" style={{ padding: '40px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>Authentication Required</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Please log in to start a discussion.</p>
              <Link href="/login"><button className="bc-btn-red" style={{ padding: '12px 24px', fontWeight: 600 }}>Log In</button></Link>
            </div>
          </main>
        </div>
        <Footer site={site} primary={primary} />
      </>
    );
  }

  return (
    <>
      <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/discussions" />
        <main className="bc-main">
          <Link href="/discussions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: primary, fontSize: '14px', fontWeight: 500, textDecoration: 'none', marginBottom: '20px', opacity: 0.8 }}>
            <ChevronLeft size={16} /> Back to Discussions
          </Link>

          <div className="bc-card" style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Start a Discussion</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>Posting as {user.username}</p>

            {error && (
              <div style={{ padding: '12px 16px', background: '#ef444410', border: '1px solid #ef444430', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderRadius: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Discussion title..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s', borderRadius: '8px' }} onFocus={e => e.currentTarget.style.borderColor = primary} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Content</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts..." rows={8} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', color: '#fff', fontSize: '15px', outline: 'none', resize: 'vertical', lineHeight: 1.6, transition: '0.3s', borderRadius: '8px' }} onFocus={e => e.currentTarget.style.borderColor = primary} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              <button type="submit" disabled={submitting} className="bc-btn-red" style={{ padding: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={16} /> {submitting ? 'Posting...' : 'Post Discussion'}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Footer site={site} primary={primary} />
    </>
  );
}
