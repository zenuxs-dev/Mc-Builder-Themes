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
  const primary = site.theme.primaryColor || '#3b82f6';

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Authentication Required</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Please log in to create a discussion.</p>
        <Link href="/login"><button style={{ background: primary, color: '#fff', border: 'none', padding: '12px 24px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>Log In</button></Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <Link href="/discussions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: primary, fontSize: '14px', fontWeight: 600, textDecoration: 'none', marginBottom: '28px', opacity: 0.8 }}>
        <ChevronLeft size={16} /> Back to Discussions
      </Link>

      <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Start a Discussion</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>Posting as {user.username}</p>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Discussion title..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#fff', fontSize: '15px', outline: 'none', transition: '0.2s' }} onFocus={e => e.currentTarget.style.borderColor = primary} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Content</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="Write your discussion..." rows={8} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#fff', fontSize: '15px', outline: 'none', resize: 'vertical', lineHeight: 1.7, transition: '0.2s' }} onFocus={e => e.currentTarget.style.borderColor = primary} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>
          <button type="submit" disabled={submitting} style={{ background: primary, color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontWeight: 700, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' }}>
            <Send size={18} /> {submitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </form>
      </div>
    </div>
  );
}
