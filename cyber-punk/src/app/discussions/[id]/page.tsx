'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSite } from '@/lib/api';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronLeft, Send, Clock, Eye } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Recursive comment tree component
function CommentTree({ comments, depth, accent, user, postId, onReply }: any) {
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
      if (res.ok) {
        setReplyContent('');
        setReplyingTo(null);
        onReply();
      }
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {comments.map((c: any) => (
        <div key={c._id} style={{ marginLeft: depth > 0 ? '32px' : '0', borderLeft: depth > 0 ? `2px solid ${accent}15` : 'none', paddingLeft: depth > 0 ? '20px' : '0' }}>
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              {c.authorAvatar ? (
                <img src={c.authorAvatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${accent}30` }} />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${accent}20`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>
                  {(c.authorName || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#ccc' }}>{(c.authorName || 'UNKNOWN').toUpperCase()}</span>
              <span style={{ fontSize: '11px', color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={10} /> {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p style={{ color: '#999', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>{c.content}</p>
            
            {user && (
              <button onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)} style={{ background: 'none', border: 'none', color: accent, fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, letterSpacing: '0.05em', opacity: 0.7 }}>
                <MessageSquare size={12} /> REPLY
              </button>
            )}

            {replyingTo === c._id && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <input
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="TYPE_RESPONSE..."
                  style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  onKeyDown={e => e.key === 'Enter' && handleReply(c._id)}
                />
                <button onClick={() => handleReply(c._id)} disabled={submitting} style={{ background: accent, color: '#000', border: 'none', padding: '10px 16px', fontWeight: 900, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={14} /> {submitting ? '...' : 'SEND'}
                </button>
              </div>
            )}
          </div>
          {c.comments && c.comments.length > 0 && (
            <CommentTree comments={c.comments} depth={depth + 1} accent={accent} user={user} postId={postId} onReply={onReply} />
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
    const res = await fetch(`${API_URL}/discussions/${id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (res.ok) setPost(await res.json());
  };

  const handleDislike = async () => {
    if (!user) return;
    const res = await fetch(`${API_URL}/discussions/${id}/dislike`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
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
    if (res.ok) {
      setPost(await res.json());
      setCommentText('');
    }
    setSubmitting(false);
  };

  if (!site) return null;
  const accent = site.theme.primaryColor || '#00ff88';

  if (loading) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', color: accent, fontWeight: 900, letterSpacing: '0.1em', fontSize: '14px' }}>
        LOADING_THREAD_DATA...
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 900, color: '#ef4444' }}>THREAD_NOT_FOUND</h2>
        <Link href="/discussions" style={{ color: accent, fontSize: '13px', fontWeight: 900 }}>← RETURN_TO_THREADS</Link>
      </div>
    );
  }

  const userLiked = user && post.likes?.some((lid: string) => lid === user.id || lid === user._id);
  const userDisliked = user && post.dislikes?.some((lid: string) => lid === user.id || lid === user._id);

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Back Link */}
      <Link href="/discussions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: accent, fontSize: '12px', fontWeight: 900, textDecoration: 'none', marginBottom: '32px', letterSpacing: '0.1em', opacity: 0.7 }}>
        <ChevronLeft size={16} /> BACK_TO_THREADS
      </Link>

      {/* Post Header */}
      <div className="cyber-border" style={{ padding: '40px', background: 'rgba(0,0,0,0.4)', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {post.title?.toUpperCase()}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${accent}40` }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: accent, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>
                {(post.authorName || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#ccc' }}>{(post.authorName || 'UNKNOWN').toUpperCase()}</span>
          </div>
          <span style={{ fontSize: '12px', color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span style={{ fontSize: '12px', color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} /> {post.views || 0} VIEWS
          </span>
        </div>

        <div style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px', borderLeft: `3px solid ${accent}30`, paddingLeft: '20px' }}>
          {post.content}
        </div>

        {/* Like / Dislike Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleLike} style={{ 
            background: userLiked ? `${accent}20` : 'rgba(255,255,255,0.03)', 
            border: `1px solid ${userLiked ? accent : 'rgba(255,255,255,0.1)'}`, 
            color: userLiked ? accent : '#666', 
            padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed', 
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '13px', transition: '0.2s' 
          }}>
            <ThumbsUp size={16} /> {post.likes?.length || 0}
          </button>
          <button onClick={handleDislike} style={{ 
            background: userDisliked ? '#ef444420' : 'rgba(255,255,255,0.03)', 
            border: `1px solid ${userDisliked ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, 
            color: userDisliked ? '#ef4444' : '#666', 
            padding: '10px 20px', cursor: user ? 'pointer' : 'not-allowed', 
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '13px', transition: '0.2s' 
          }}>
            <ThumbsDown size={16} /> {post.dislikes?.length || 0}
          </button>
        </div>
      </div>

      {/* Comment Input */}
      <div className="cyber-border" style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 900, fontSize: '14px', color: accent, letterSpacing: '0.1em', marginBottom: '16px' }}>
          // ADD_COMMENT ({post.comments?.length || 0} THREAD{(post.comments?.length || 0) !== 1 ? 'S' : ''})
        </h3>
        {user ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="TYPE_YOUR_RESPONSE..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 18px', color: '#fff', fontSize: '14px', outline: 'none', transition: '0.3s' }}
              onFocus={e => e.currentTarget.style.borderColor = accent}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
            />
            <button onClick={handleComment} disabled={submitting} style={{ background: accent, color: '#000', border: 'none', padding: '14px 24px', fontWeight: 900, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
              <Send size={16} /> {submitting ? 'SENDING...' : 'TRANSMIT'}
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '12px', fontWeight: 900, letterSpacing: '0.05em' }}>
            [LOGIN_REQUIRED] <Link href="/login" style={{ color: accent, textDecoration: 'underline' }}>AUTHENTICATE</Link> TO POST COMMENTS
          </div>
        )}
      </div>

      {/* Comment Tree */}
      {post.comments && post.comments.length > 0 && (
        <div className="cyber-border" style={{ padding: '24px', background: 'rgba(0,0,0,0.2)' }}>
          <CommentTree comments={post.comments} depth={0} accent={accent} user={user} postId={id} onReply={fetchPost} />
        </div>
      )}
    </div>
  );
}
