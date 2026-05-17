"use client";
import React, { useState } from 'react';
import { submitForm } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CheckCircle2, Lock, Send, User } from 'lucide-react';
import Link from 'next/link';

export default function FormRenderer({ form }: { form: any }) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    (form.fields || []).forEach((f: any) => init[f.name || f.label || 'field'] = '');
    return init;
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'login_required'>('idle');

  const handleChange = (name: string, v: any) => setValues(s => ({ ...s, [name]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.requireLogin && !user) {
      setStatus('login_required');
      return;
    }

    setStatus('sending');
    const payload = { ...values };
    if (user) {
      payload.authenticatedUser = user.username; // Explicitly send the authenticated username
    }

    const res = await submitForm(form._id, payload);
    if (res.ok) {
      setStatus('sent');
      setValues(Object.fromEntries(Object.keys(values).map(k => [k, ''])));
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

      {form.requireLogin && (
        <div style={{ 
          padding: '16px 20px', 
          borderRadius: '16px', 
          background: user ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
          border: `1px solid ${user ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`,
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {user ? (
            <>
              <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>
                Logged in as <strong>{user.username}</strong>. Your username will be attached to this submission.
              </p>
            </>
          ) : (
            <>
              <Lock size={18} style={{ color: '#eab308' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#eab308' }}>
                Login Required. You must <Link href="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>Login with Advanced Auth</Link> to submit this form.
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
            disabled={status === 'sending' || (form.requireLogin && !user)}
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '14px 32px', 
              borderRadius: '12px', 
              border: 'none', 
              fontWeight: 800, 
              fontSize: '15px', 
              cursor: (status === 'sending' || (form.requireLogin && !user)) ? 'not-allowed' : 'pointer',
              opacity: (status === 'sending' || (form.requireLogin && !user)) ? 0.5 : 1,
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
    </div>
  );
}
