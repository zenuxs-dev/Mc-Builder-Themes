'use client';
import React, { useState, useEffect } from 'react';
import { submitForm } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle2, Lock, Send } from 'lucide-react';
import Link from 'next/link';

export default function FormRenderer({ form }: { form: any }) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    (form.fields || []).forEach((f: any) => init[f.name || f.label || 'field'] = '');
    return init;
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'login_required'>('idle');
  const [responses, setResponses] = useState<any[]>([]);
  const [fetchingResponses, setFetchingResponses] = useState(false);

  const isAdvRequired = !!form.requireAdvancedAuth;
  const isZenuxsRequired = !!form.requireZenuxsAuth;
  const isAnyLoginRequired = isAdvRequired || isZenuxsRequired;

  let isAuthorized = true;
  if (isAdvRequired && isZenuxsRequired) {
    isAuthorized = !!user && (user.loginType === 'advanced_auth' || user.loginType === 'zenuxs');
  } else if (isAdvRequired) {
    isAuthorized = !!user && user.loginType === 'advanced_auth';
  } else if (isZenuxsRequired) {
    isAuthorized = !!user && user.loginType === 'zenuxs';
  }

  const fetchMyResponses = async () => {
    if (!user) return;
    setFetchingResponses(true);
    try {
      const token = user.token || localStorage.getItem('zenuxs_auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/forms/${form._id}/my-responses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setResponses(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    }
    setFetchingResponses(false);
  };

  useEffect(() => {
    if (user && form?._id) {
      fetchMyResponses();
    }
  }, [user, form?._id]);

  const handleChange = (name: string, v: any) => setValues(s => ({ ...s, [name]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAnyLoginRequired && !isAuthorized) {
      setStatus('login_required');
      return;
    }

    setStatus('sending');
    const payload: any = { data: { ...values } };
    if (user) {
      payload.authenticatedUser = user.username;
      payload.submitterDetails = {
        userId: user.id || user._id,
        loginType: user.loginType,
        name: user.name || user.username,
        email: user.email,
        avatar: user.avatar,
        gamertag: user.loginType === 'advanced_auth' ? user.username : undefined
      };
    }

    const res = await submitForm(form._id, payload);
    if (res.ok) {
      setStatus('sent');
      setValues(Object.fromEntries(Object.keys(values).map(k => [k, ''])));
      fetchMyResponses();
    } else {
      setStatus('error');
    }
  };

  if (!form) return null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '12px' }}>{form.title || form.name}</h2>
        {form.description && <p style={{ fontSize: '16px', opacity: 0.5, lineHeight: 1.6 }}>{form.description}</p>}
      </div>

      {isAnyLoginRequired && (
        <div style={{ 
          padding: '16px 20px', 
          borderRadius: '16px', 
          background: isAuthorized ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
          border: `1px solid ${isAuthorized ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`,
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {isAuthorized ? (
            <>
              <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>
                Logged in as <strong>{user?.username}</strong>. Your username will be attached to this submission.
              </p>
            </>
          ) : (
            <>
              <Lock size={18} style={{ color: '#eab308' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#eab308' }}>
                Login Required. You must <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`} style={{ color: 'inherit', textDecoration: 'underline' }}>Login</Link> with {isAdvRequired && isZenuxsRequired ? 'Advanced Auth or Zenuxs' : isAdvRequired ? 'Advanced Auth' : 'Zenuxs'} to submit this form.
              </p>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(form.fields || []).map((f: any, i: number) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.4 }}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea 
                required={f.required} 
                value={values[f.name]} 
                onChange={e => handleChange(f.name, e.target.value)} 
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  color: 'white', 
                  fontSize: '15px',
                  outline: 'none',
                  minHeight: '120px',
                  resize: 'vertical'
                }} 
              />
            ) : f.type === 'select' ? (
              <select 
                required={f.required} 
                value={values[f.name]} 
                onChange={e => handleChange(f.name, e.target.value)} 
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  color: 'white', 
                  fontSize: '15px',
                  outline: 'none'
                }}
              >
                <option value="" disabled>Select an option...</option>
                {(f.options || []).map((opt: string, oi: number) => <option key={oi} value={opt} style={{ background: '#111' }}>{opt}</option>)}
              </select>
            ) : (
              <input 
                required={f.required} 
                type={f.type === 'number' ? 'number' : 'text'} 
                value={values[f.name]} 
                onChange={e => handleChange(f.name, e.target.value)} 
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  color: 'white', 
                  fontSize: '15px',
                  outline: 'none'
                }} 
              />
            )}
          </div>
        ))}

        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            type="submit" 
            disabled={status === 'sending' || (isAnyLoginRequired && !isAuthorized)}
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '14px 32px', 
              borderRadius: '12px', 
              border: 'none', 
              fontWeight: 800, 
              fontSize: '15px', 
              cursor: (status === 'sending' || (isAnyLoginRequired && !isAuthorized)) ? 'not-allowed' : 'pointer',
              opacity: (status === 'sending' || (isAnyLoginRequired && !isAuthorized)) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: '0.2s'
            }}
          >
            {status === 'sending' ? 'Submitting...' : (
              <>
                Submit Application <Send size={18} />
              </>
            )}
          </button>

          {status === 'sent' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
              <CheckCircle2 size={18} /> Application sent successfully!
            </div>
          )}
          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>
              <AlertCircle size={18} /> Failed to send application.
            </div>
          )}
          {status === 'login_required' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '14px', fontWeight: 600 }}>
              <Lock size={18} /> Please login first.
            </div>
          )}
        </div>
      </form>

      {user && (
        <div style={{ marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>Your Submissions</h3>
          {fetchingResponses ? (
            <p style={{ fontSize: '14px', opacity: 0.5 }}>Loading submissions...</p>
          ) : responses.length === 0 ? (
            <p style={{ fontSize: '14px', opacity: 0.5 }}>No previous submissions found for this form.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {responses.map((resp: any) => (
                <div key={resp._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {resp.submitterDetails?.avatar ? (
                        <img src={resp.submitterDetails.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                          {(resp.submitterDetails?.name || resp.submitterDetails?.gamertag || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        {resp.submitterDetails?.loginType === 'zenuxs' ? (
                          <>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {resp.submitterDetails.name || 'Zenuxs User'}
                              <span style={{ fontSize: '9px', background: '#3b82f620', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800 }}>Zenuxs</span>
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.5 }}>{resp.submitterDetails.email}</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {resp.submitterDetails?.gamertag || resp.submittedBy || 'Gamertag'}
                              <span style={{ fontSize: '9px', background: '#f59e0b20', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800 }}>Advanced Auth</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        padding: '4px 10px', 
                        borderRadius: '6px',
                        background: resp.status === 'Accepted' || resp.status === 'accepted' ? '#22c55e15' : resp.status === 'Rejected' || resp.status === 'rejected' ? '#ef444415' : resp.status === 'Under Review' || resp.status === 'under review' ? '#f59e0b15' : 'rgba(255,255,255,0.05)',
                        color: resp.status === 'Accepted' || resp.status === 'accepted' ? '#22c55e' : resp.status === 'Rejected' || resp.status === 'rejected' ? '#ef4444' : resp.status === 'Under Review' || resp.status === 'under review' ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${resp.status === 'Accepted' || resp.status === 'accepted' ? '#22c55e30' : resp.status === 'Rejected' || resp.status === 'rejected' ? '#ef444430' : resp.status === 'Under Review' || resp.status === 'under review' ? '#f59e0b30' : 'rgba(255,255,255,0.1)'}`
                      }}>
                        {resp.status || 'pending'}
                      </span>
                      <span style={{ fontSize: '11px', opacity: 0.4 }}>{new Date(resp.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(resp.data || {}).map(([key, val]: any) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ opacity: 0.5, fontWeight: 500 }}>{key}:</span>
                        <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
