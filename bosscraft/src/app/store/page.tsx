'use client';

import { useEffect, useState } from 'react';
import { getSite, getPages, getProducts, createPaymentOrder, verifyPayment } from '@/lib/api';
import { Navbar, Sidebar, Footer } from '../components';
import { useAuth } from '@/context/AuthContext';
import { UserIcon, Gamepad2, ShieldCheck, AlertCircle, Sparkles, X, Check } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─── Username Verification Modal ──────────────────────
function UsernameModal({
  product,
  site,
  onClose,
  onConfirm,
}: {
  product: any;
  site: any;
  onClose: () => void;
  onConfirm: (username: string) => void;
}) {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [mode, setMode] = useState<'choose' | 'direct'>(
    user?.username ? 'direct' : 'choose'
  );
  
  // If user is already logged in via Advanced Auth, skip directly
  useEffect(() => {
    if (user?.username) {
      onConfirm(user.username);
    }
  }, []);

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onConfirm(username.trim());
    }
  };

  const handleMinecraftLogin = () => {
    window.location.href = '/login?redirect=' + encodeURIComponent('/store?buy=' + product._id);
  };

  if (user?.username) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(5, 6, 8, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '460px',
        background: 'var(--bg-card)', border: '1px solid var(--red-primary)',
        borderRadius: 'var(--radius-card)', padding: '36px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 30px var(--red-glow)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-secondary)' }}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(231, 76, 60, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', border: '1px solid rgba(231, 76, 60, 0.3)',
            boxShadow: '0 0 15px var(--red-glow)'
          }}>
            <Gamepad2 size={28} style={{ color: 'var(--red-primary)' }} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>
            Deliver {product.name}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            ₹{product.price} · {product.category}
          </p>
        </div>

        {site.authSettings?.enabled && mode === 'choose' ? (
          <>
            {/* Recommended alert */}
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(39, 174, 96, 0.05)', border: '1px solid rgba(39, 174, 96, 0.2)',
              color: 'var(--green-primary)', fontSize: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '24px',
            }}>
              <ShieldCheck size={16} />
              Verify credentials to receive your purchase instantly!
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: Minecraft Login */}
              <button onClick={handleMinecraftLogin} className="bc-btn-red" style={{
                padding: '16px', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}>
                <ShieldCheck size={18} />
                Portal Sign-In (Recommended)
              </button>

              {/* Or Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '6px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              {/* Option 2: Enter Username manually */}
              <button onClick={() => setMode('direct')} className="bc-btn-outline" style={{
                padding: '12px', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}>
                <UserIcon size={16} />
                Enter Username Manually
              </button>
            </div>
          </>
        ) : (
          /* Direct Username Form */
          <form onSubmit={handleDirectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--red-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Minecraft In-Game Name *
              </label>
              <input
                required
                type="text"
                placeholder="Steve"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="bc-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} className="bc-btn-outline" style={{ flex: 1, padding: '12px' }}>
                Cancel
              </button>
              <button type="submit" className="bc-btn-red" style={{ flex: 2, padding: '12px' }}>
                Next Step
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Payment Details Modal ────────────────────────
function PaymentModal({
  product,
  site,
  buyerUsername,
  onClose,
}: {
  product: any;
  site: any;
  buyerUsername: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ payerName: buyerUsername, payerEmail: '', payerContact: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createPaymentOrder(site._id, product._id, { ...form, buyerUsername });

      if (!result.success) {
        setError(result.error || 'Failed to create payment order');
        setLoading(false);
        return;
      }

      const { keyId, orderId, amount, currency, merchantName, paymentId } = result.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: merchantName || site.name,
        description: product.name,
        order_id: orderId,
        prefill: {
          name: form.payerName,
          email: form.payerEmail,
          contact: form.payerContact,
        },
        theme: {
          color: '#e74c3c',
        },
        handler: async function (response: any) {
          const verifyResult = await verifyPayment({
            paymentId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyResult.success) {
            setSuccess(true);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (typeof window.Razorpay === 'undefined') {
        setError('Payment checkout scripts are loading. Try again in a second.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error?.description || 'Checkout failed. Please retry.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError('Checkout connection error. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(5, 6, 8, 0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%', maxWidth: '440px',
          background: 'var(--bg-card)', border: '1px solid var(--green-primary)',
          borderRadius: 'var(--radius-card)', padding: '48px', textAlign: 'center',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 30px rgba(39,174,96,0.2)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(39, 174, 96, 0.1)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px',
            border: '2px solid rgba(39, 174, 96, 0.3)',
            boxShadow: '0 0 15px rgba(39, 174, 96, 0.2)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>
            Order Completed!
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Thank you for supporting {site.name}.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--red-primary)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '32px' }}>
            ITEMS QUEUED FOR {buyerUsername.toUpperCase()}
          </p>
          <button onClick={onClose} className="bc-btn-red" style={{ padding: '12px 36px', width: 'auto', display: 'inline-block' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(5, 6, 8, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '460px',
        background: 'var(--bg-card)', border: '1px solid var(--red-primary)',
        borderRadius: 'var(--radius-card)', padding: '36px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 30px var(--red-glow)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-secondary)' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '28px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>
              Buy {product.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{product.category}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '26px', fontWeight: 900, color: 'var(--red-primary)' }}>₹{product.price}</p>
          </div>
        </div>

        <div style={{
          padding: '10px 14px', borderRadius: '10px',
          background: 'rgba(231, 76, 60, 0.06)', border: '1px solid rgba(231, 76, 60, 0.2)',
          color: 'var(--red-primary)', fontSize: '12px', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '24px', letterSpacing: '0.05em'
        }}>
          <UserIcon size={15} />
          DELIVER TO: {buyerUsername.toUpperCase()}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--red-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Billing Name *
            </label>
            <input
              required
              type="text"
              placeholder="John Doe"
              value={form.payerName}
              onChange={e => setForm(prev => ({ ...prev, payerName: e.target.value }))}
              className="bc-input"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--red-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address *
            </label>
            <input
              required
              type="email"
              placeholder="you@email.com"
              value={form.payerEmail}
              onChange={e => setForm(prev => ({ ...prev, payerEmail: e.target.value }))}
              className="bc-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--red-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              value={form.payerContact}
              onChange={e => setForm(prev => ({ ...prev, payerContact: e.target.value }))}
              className="bc-input"
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="bc-btn-outline" style={{ flex: 1, padding: '12px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bc-btn-red" style={{
              flex: 2, padding: '12px',
              opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Processing...' : `Pay ₹${product.price}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Store Page Component ────────────────────
export default function StorePage() {
  const [site, setSite] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [buyerUsername, setBuyerUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const s = await getSite();
      if (!s) return;
      setSite(s);
      const [pg, pr] = await Promise.all([getPages(s._id), getProducts(s._id)]);
      setPages(pg);
      setProducts(pr);
      setLoading(false);
    }
    load();
  }, []);

  const handleBuyClick = (product: any) => {
    setSelectedProduct(product);

    if (user?.username) {
      setBuyerUsername(user.username);
      setShowUsernameModal(false);
    } else {
      setBuyerUsername(null);
      setShowUsernameModal(true);
    }
  };

  const handleUsernameConfirm = (username: string) => {
    setBuyerUsername(username);
    setShowUsernameModal(false);
  };

  const handleCloseAll = () => {
    setSelectedProduct(null);
    setBuyerUsername(null);
    setShowUsernameModal(false);
  };

  if (loading || !site) return null;
  const primary = site.theme.primaryColor || '#e74c3c';
  const paymentsEnabled = site.paymentSettings?.paymentEnabled;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* Sticky Glassmorphic Navbar */}
      <Navbar site={site} pages={pages} primary={primary} />

      {/* Main Store Layout */}
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/store" />

        <main className="bc-main">
          <div style={{ marginBottom: '32px' }}>
            <h1 className="bc-heading" style={{ fontSize: '28px', marginBottom: '4px' }}>Server Store</h1>
            <h2 className="bc-subheading" style={{ fontSize: '12px', marginBottom: '16px' }}>Select a package below</h2>
            <p className="bc-text" style={{ fontSize: '13px' }}>
              All purchases made here are delivered automatically in-game. Please allow up to 10-15 minutes for delivery.
            </p>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }} className="bc-card">
              <p style={{ fontSize: '16px', fontWeight: 800 }}>Store Inventory is Empty</p>
              <p style={{ marginTop: '4px', fontSize: '12px' }}>Check back soon for new ranks!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {products.map((p: any, i: number) => (
                <div key={p._id || i} className="bc-card" style={{ 
                  padding: '24px', display: 'flex', flexDirection: 'column', 
                  justifyContent: 'space-between', height: '320px' 
                }}>
                  <div>
                    {/* Visual Badge Icon */}
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                      {['👑', '⚔️', '💎', '🔥', '🛡️', '🎯', '⚡', '🌟'][i % 8]}
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--red-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {p.category}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', marginBottom: '8px', color: '#fff' }}>
                      {p.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {p.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '16px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>₹{p.price}</span>
                    <button
                      onClick={() => paymentsEnabled ? handleBuyClick(p) : undefined}
                      className={paymentsEnabled ? "bc-btn-red bc-btn-sm" : "bc-btn-outline bc-btn-sm"}
                      style={{
                        width: 'auto',
                        cursor: paymentsEnabled ? 'pointer' : 'not-allowed',
                        opacity: paymentsEnabled ? 1 : 0.5,
                      }}
                    >
                      {paymentsEnabled ? 'Buy Now' : 'Locked'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer site={site} primary={primary} />

      {/* Username Verification Modal */}
      {showUsernameModal && selectedProduct && !user?.username && (
        <UsernameModal
          product={selectedProduct}
          site={site}
          onClose={handleCloseAll}
          onConfirm={handleUsernameConfirm}
        />
      )}

      {/* Payment Information Modal */}
      {selectedProduct && buyerUsername && !showUsernameModal && (
        <PaymentModal
          product={selectedProduct}
          site={site}
          buyerUsername={buyerUsername}
          onClose={handleCloseAll}
        />
      )}
    </div>
  );
}