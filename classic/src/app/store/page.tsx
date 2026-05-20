'use client';

import { useEffect, useState } from 'react';
import { getSite, getPages, getProducts, createPaymentOrder, verifyPayment } from '@/lib/api';
import { Navbar, Footer } from '@/components/NavFooter';
import { useAuth } from '@/context/AuthContext';
import { UserIcon, LogIn, Gamepad2, ShieldCheck, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const theme = site.theme;

  // If user is already logged in via Advanced Auth, skip to payment directly
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

  // If user is already logged in, this modal never shows (auto-confirms above)
  if (user?.username) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          background: '#111113', border: `1px solid ${theme.primaryColor}20`,
          borderRadius: '28px', padding: '36px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: theme.primaryColor + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', border: `1px solid ${theme.primaryColor}30`,
          }}>
            <Gamepad2 size={28} style={{ color: theme.primaryColor }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em', color: theme.textColor }}>
            Buying {product.name}
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px', color: theme.textColor }}>
            ₹{product.price} · {product.category}
          </p>
        </div>

        {site.authSettings?.enabled && mode === 'choose' ? (
          <>
            {/* Recommended: Be in game */}
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#22c55e10', border: '1px solid #22c55e30',
              color: '#4ade80', fontSize: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '20px',
            }}>
              <Gamepad2 size={16} />
              Recommended: Join the game before purchasing to receive your items instantly!
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: Minecraft Login */}
              <button
                onClick={handleMinecraftLogin}
                style={{
                  padding: '18px', borderRadius: '16px',
                  background: theme.primaryColor, border: 'none',
                  color: theme.backgroundColor, fontWeight: 800,
                  fontSize: '15px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: '0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ShieldCheck size={20} />
                Login with Minecraft Credentials
              </button>

              {/* Or divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Option 2: Direct Username */}
              <button
                onClick={() => setMode('direct')}
                style={{
                  padding: '14px', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                  color: theme.textColor, fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: '0.2s', opacity: 0.7,
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = theme.primaryColor + '50'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <UserIcon size={18} />
                Enter Minecraft Username
              </button>
            </div>
          </>
        ) : (
          /* Direct Username Input */
          <form onSubmit={handleDirectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* In-game recommendation */}
            {site.authSettings?.enabled && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: '#22c55e10', border: '1px solid #22c55e30',
                color: '#4ade80', fontSize: '12px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <Gamepad2 size={16} />
                Recommended: Be in-game to receive your items instantly!
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, opacity: 0.5, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textColor }}>
                Your Minecraft Username *
              </label>
              <input
                required
                type="text"
                placeholder="Steve"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                  padding: '14px 16px', fontSize: '14px', color: 'white', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, padding: '14px', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                  color: theme.textColor, fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  opacity: 0.6,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 2, padding: '14px', borderRadius: '14px', border: 'none',
                  background: theme.primaryColor, color: theme.backgroundColor,
                  fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        <p style={{ fontSize: '10px', opacity: 0.3, textAlign: 'center', color: theme.textColor, marginTop: '16px' }}>
          {site.authSettings?.enabled
            ? 'If already logged in via Advanced Auth, your username will be used automatically.'
            : 'Make sure you are in-game to receive your purchase immediately.'}
        </p>
      </div>
    </div>
  );
}

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
  const { theme } = site;

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
          color: theme.primaryColor || '#3b82f6',
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
            setError('Payment verification failed. Contact support.');
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
        setError('Payment system is loading. Please try again in a moment.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
        onClick={onClose}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '420px',
            background: '#111113', border: `1px solid ${theme.primaryColor}30`,
            borderRadius: '28px', padding: '48px', textAlign: 'center',
          }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#22c55e20', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px',
            border: '2px solid #22c55e40',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: theme.textColor }}>
            Payment Successful!
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '8px', color: theme.textColor }}>
            Thank you for purchasing {product.name}.
          </p>
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px', color: theme.primaryColor, fontWeight: 700 }}>
            Command queued for {buyerUsername}
          </p>
          <button
            onClick={onClose}
            style={{
              background: theme.primaryColor, color: theme.backgroundColor,
              padding: '14px 32px', borderRadius: '14px', border: 'none',
              fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          background: '#111113', border: `1px solid ${theme.primaryColor}20`,
          borderRadius: '28px', padding: '36px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '28px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em', color: theme.textColor }}>
              Buy {product.name}
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.4, marginTop: '4px', color: theme.textColor }}>{product.category}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '28px', fontWeight: 900, color: theme.textColor }}>₹{product.price}</p>
          </div>
        </div>

        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: theme.primaryColor + '10', border: `1px solid ${theme.primaryColor}30`,
          color: theme.primaryColor, fontSize: '12px', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '20px',
        }}>
          <UserIcon size={16} />
          Delivering to: {buyerUsername}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textColor, opacity: 0.5, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Name *
            </label>
            <input
              required
              type="text"
              placeholder="Aarav Sharma"
              value={form.payerName}
              onChange={e => setForm(prev => ({ ...prev, payerName: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                padding: '14px 16px', fontSize: '14px', color: 'white', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textColor, opacity: 0.5, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address *
            </label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={form.payerEmail}
              onChange={e => setForm(prev => ({ ...prev, payerEmail: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                padding: '14px 16px', fontSize: '14px', color: 'white', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: theme.textColor, opacity: 0.5, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              value={form.payerContact}
              onChange={e => setForm(prev => ({ ...prev, payerContact: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                padding: '14px 16px', fontSize: '14px', color: 'white', outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#ef444415', border: '1px solid #ef444430',
              color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '14px', borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                color: theme.textColor, fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                opacity: 0.6,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: '14px', borderRadius: '14px', border: 'none',
                background: theme.primaryColor, color: theme.backgroundColor,
                fontWeight: 800, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? 'Processing...' : `Pay ₹${product.price}`}
            </button>
          </div>

          <p style={{ fontSize: '10px', opacity: 0.3, textAlign: 'center', color: theme.textColor, marginTop: '4px' }}>
            Secured by Razorpay via Zenuxs Payments · Command delivered to {buyerUsername}
          </p>
        </form>
      </div>
    </div>
  );
}

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

    // If user is already logged in via Advanced Auth, use their username directly
    if (user?.username) {
      setBuyerUsername(user.username);
      setShowUsernameModal(false);
    } else {
      // Show username modal first
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
  const { theme } = site;
  const paymentsEnabled = site.paymentSettings?.paymentEnabled;

  return (
    <div style={{ minHeight: '100vh', background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.font }}>
      <Navbar site={site} pages={pages} />
      <div style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '12px' }}>Store</h1>
          <p style={{ opacity: 0.5, marginBottom: '56px', fontSize: '16px' }}>{products.length} products available</p>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', opacity: 0.3 }}>
              <p style={{ fontSize: '20px', fontWeight: 700 }}>Store is empty</p>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px' }}>
              {products.map((p: any, i: number) => (
                <div key={p._id || i} style={{ background: theme.primaryColor + '08', border: `1px solid ${theme.primaryColor}20`, borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '36px', marginBottom: '16px' }}>{'💎⚔️🔥👑🎯⚡🌟🛡️'[i % 8]}</div>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px' }}>{p.category}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{p.name}</h3>
                  <p style={{ fontSize: '13px', opacity: 0.55, flex: 1, lineHeight: 1.6, marginBottom: '24px' }}>{p.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900 }}>₹{p.price}</span>
                    <button
                      onClick={() => paymentsEnabled ? handleBuyClick(p) : undefined}
                      style={{
                        background: paymentsEnabled ? theme.primaryColor : 'rgba(255,255,255,0.05)',
                        color: paymentsEnabled ? theme.backgroundColor : theme.textColor,
                        border: paymentsEnabled ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        padding: '10px 20px',
                        borderRadius: theme.buttonStyle === 'pill' ? '9999px' : theme.buttonStyle === 'square' ? '4px' : '10px',
                        fontWeight: 700, fontSize: '13px',
                        cursor: paymentsEnabled ? 'pointer' : 'not-allowed',
                        opacity: paymentsEnabled ? 1 : 0.4,
                      }}
                    >
                      {paymentsEnabled ? 'Buy Now' : 'Coming Soon'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer site={site} />

      {/* Username Modal (shown first if not logged in) */}
      {showUsernameModal && selectedProduct && !user?.username && (
        <UsernameModal
          product={selectedProduct}
          site={site}
          onClose={handleCloseAll}
          onConfirm={handleUsernameConfirm}
        />
      )}

      {/* Payment Modal (shown after username is set) */}
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