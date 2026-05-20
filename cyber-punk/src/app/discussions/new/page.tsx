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
      setError('CONNECTION_FAILURE');
    }
    setSubmitting(false);
  };

  if (!site) return null;
  const accent = site.theme.primaryColor || '#00ff88';

  if (!user) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 900, color: '#ef4444', marginBottom: '12px' }}>ACCESS_DENIED</h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>Authentication required to create discussions.</p>
        <Link href="/login" style={{ color: accent, fontWeight: 900 }}>INITIALIZE_LOGIN</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/discussions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: accent, fontSize: '12px', fontWeight: 900, textDecoration: 'none', marginBottom: '32px', letterSpacing: '0.1em', opacity: 0.7 }}>
        <ChevronLeft size={16} /> BACK_TO_THREADS
      </Link>

      <div className="cyber-border" style={{ padding: '40px', background: 'rgba(0,0,0,0.4)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: accent, marginBottom: '8px', letterSpacing: '-0.02em' }}>CREATE_NEW_THREAD</h1>
        <p style={{ color: '#555', fontSize: '13px', fontWeight: 700, marginBottom: '32px', letterSpacing: '0.05em' }}>POSTING AS: {user.username.toUpperCase()}</p>

        {error && (
          <div style={{ padding: '12px 16px', background: '#ef444410', border: '1px solid #ef444430', color: '#ef4444', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: accent, letterSpacing: '0.15em', marginBottom: '8px' }}>// THREAD_TITLE *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter thread title..."
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', padding: '16px', color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s' }}
              onFocus={e => e.currentTarget.style.borderColor = accent}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: accent, letterSpacing: '0.15em', marginBottom: '8px' }}>// CONTENT *</label>
            <textarea
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your discussion content..."
              rows={8}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', padding: '16px', color: '#fff', fontSize: '15px', outline: 'none', resize: 'vertical', lineHeight: 1.7, transition: '0.3s' }}
              onFocus={e => e.currentTarget.style.borderColor = accent}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          <button type="submit" disabled={submitting} style={{ background: accent, color: '#000', border: 'none', padding: '18px', fontWeight: 900, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '0.1em', transition: '0.3s' }}>
            <Send size={18} /> {submitting ? 'TRANSMITTING...' : 'PUBLISH_THREAD'}
          </button>
        </form>
      </div>
    </div>
  );
}
