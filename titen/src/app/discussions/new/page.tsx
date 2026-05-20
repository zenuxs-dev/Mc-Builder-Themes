'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSite } from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, Send, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function NewDiscussionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [site, setSite] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getSite().then(setSite); }, []);

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
  const primary = site.theme.primaryColor || '#1e3a8a';

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '48px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 500, fontFamily: 'serif', marginBottom: '16px' }}>Authentication Required</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Please log in to start a discussion.</p>
        <Link href="/login"><button style={{ background: primary, color: '#fff', border: 'none', padding: '14px 28px', fontWeight: 500, cursor: 'pointer', fontFamily: 'serif' }}>Log In</button></Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <Link href="/discussions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: primary, fontSize: '14px', fontWeight: 500, textDecoration: 'none', marginBottom: '28px', opacity: 0.8, fontFamily: 'serif' }}>
        <ChevronLeft size={16} /> Back to Discussions
      </Link>

      <div style={{ padding: '48px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 500, fontFamily: 'serif', marginBottom: '8px' }}>Start a Discussion</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', marginBottom: '36px', fontFamily: 'serif' }}>Posting as {user.username}</p>

        {error && (
          <div style={{ padding: '14px 18px', background: '#ef444410', border: '1px solid #ef444430', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'serif' }}>Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Discussion title..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', color: '#fff', fontSize: '16px', outline: 'none', transition: '0.3s', fontFamily: 'serif' }} onFocus={e => e.currentTarget.style.borderColor = primary} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'serif' }}>Content</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts..." rows={8} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', color: '#fff', fontSize: '16px', outline: 'none', resize: 'vertical', lineHeight: 1.8, transition: '0.3s', fontFamily: 'serif' }} onFocus={e => e.currentTarget.style.borderColor = primary} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>
          <button type="submit" disabled={submitting} style={{ background: primary, color: '#fff', border: 'none', padding: '18px', fontWeight: 500, fontSize: '16px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s', fontFamily: 'serif' }}>
            <Send size={18} /> {submitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </form>
      </div>
    </div>
  );
}
