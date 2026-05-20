'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSite } from '@/lib/api';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronLeft, Send, Clock, Eye } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function CommentTree({ comments, depth, primary, user, postId, onReply }: any) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/discussions/${postId}/comments/${commentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ content: replyContent })
      });
      if (res.ok) { setReplyContent(''); setReplyingTo(null); onReply(); }
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {comments.map((c: any) => (
        <div key={c._id} style={{ marginLeft: depth > 0 ? '28px' : '0', borderLeft: depth > 0 ? `2px solid ${primary}20` : 'none', paddingLeft: depth > 0 ? '20px' : '0' }}>
          <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              {c.authorAvatar ? (
                <img src={c.authorAvatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${primary}20`, color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                  {(c.authorName || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#ccc' }}>{c.authorName || 'Unknown'}</span>
              <span style={{ fontSize: '11px', color: '#555' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.7, marginBottom: '10px' }}>{c.content}</p>
            {user && (
              <button onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)} style={{ background: 'none', border: 'none', color: primary, fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, opacity: 0.8 }}>
                <MessageSquare size={12} /> Reply
              </button>
            )}
            {replyingTo === c._id && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <input value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Write a reply..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' }} onKeyDown={e => e.key === 'Enter' && handleReply(c._id)} />
                <button onClick={() => handleReply(c._id)} disabled={submitting} style={{ background: primary, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                  <Send size={14} />
                </button>
              </div>
            )}
          </div>
          {c.comments && c.comments.length > 0 && (
            <CommentTree comments={c.comments} depth={depth + 1} primary={primary} user={user} postId={postId} onReply={onReply} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getSite().then(setSite); }, []);

  const fetchPost = async () => {
    try {
      const res = await fetch(`${API_URL}/discussions/post/${id}`);
      if (res.ok) setPost(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { if (id) fetchPost(); }, [id]);

  const handleLike = async () => {
    if (!user) return;
    const res = await fetch(`${API_URL}/discussions/${id}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${user.token}` } });
    if (res.ok) setPost(await res.json());
  };

  const handleDislike = async () => {
    if (!user) return;
    const res = await fetch(`${API_URL}/discussions/${id}/dislike`, { method: 'POST', headers: { 'Authorization': `Bearer ${user.token}` } });
    if (res.ok) setPost(await res.json());
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user) return;
    setSubmitting(true);
    const res = await fetch(`${API_URL}/discussions/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify({ content: commentText })
    });
    if (res.ok) { setPost(await res.json()); setCommentText(''); }
    setSubmitting(false);
  };

  if (!site) return null;
  const primary = site.theme.primaryColor || '#3b82f6';

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;
  if (!post) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <h2 style={{ fontWeight: 700, color: '#ef4444', marginBottom: '12px' }}>Discussion Not Found</h2>
      <Link href="/discussions" style={{ color: primary }}>← Back to Discussions</Link>
    </div>
  );

  const userLiked = user && post.likes?.some((lid: string) => lid === user.id || lid === user._id);
  const userDisliked = user && post.dislikes?.some((lid: string) => lid === user.id || lid === user._id);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <Link href="/discussions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: primary, fontSize: '14px', fontWeight: 600, textDecoration: 'none', marginBottom: '28px', opacity: 0.8 }}>
        <ChevronLeft size={16} /> Back to Discussions
      </Link>

      <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>{post.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                {(post.authorName || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#ccc' }}>{post.authorName || 'Unknown'}</span>
          </div>
          <span style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
          <span style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {post.views || 0} views</span>
        </div>

        <p style={{ color: '#bbb', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px' }}>{post.content}</p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleLike} style={{ background: userLiked ? `${primary}20` : 'rgba(255,255,255,0.03)', border: `1px solid ${userLiked ? primary : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: userLiked ? primary : '#666', padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', transition: '0.2s' }}>
            <ThumbsUp size={16} /> {post.likes?.length || 0}
          </button>
          <button onClick={handleDislike} style={{ background: userDisliked ? '#ef444420' : 'rgba(255,255,255,0.03)', border: `1px solid ${userDisliked ? '#ef4444' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: userDisliked ? '#ef4444' : '#666', padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', transition: '0.2s' }}>
            <ThumbsDown size={16} /> {post.dislikes?.length || 0}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>Comments ({post.comments?.length || 0})</h3>
        {user ? (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#fff', fontSize: '14px', outline: 'none', transition: '0.2s' }} onFocus={e => e.currentTarget.style.borderColor = primary} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} onKeyDown={e => e.key === 'Enter' && handleComment()} />
            <button onClick={handleComment} disabled={submitting} style={{ background: primary, color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 24px', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={16} /> {submitting ? '...' : 'Post'}
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            <Link href="/login" style={{ color: primary }}>Log in</Link> to post comments.
          </div>
        )}
        {post.comments && post.comments.length > 0 && (
          <CommentTree comments={post.comments} depth={0} primary={primary} user={user} postId={id} onReply={fetchPost} />
        )}
      </div>
    </div>
  );
}
