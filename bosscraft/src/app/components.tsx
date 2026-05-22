'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, ShoppingCart, Activity, MessageSquare, Image, 
  Trophy, HelpCircle, Users, FileText, ArrowRight, 
  ChevronRight, Sparkles, Star, Zap, Shield, Heart,
  LogOut, ExternalLink, Copy, Check, Clock, Bell, Gamepad2, Video, Music
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitForm } from '@/lib/api';

const Twitter = (props: any) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// ─── Top Bar & Banner Navigation ─────────────────────
export function Navbar({ site, pages, primary, mcStatus }: { site: any; primary: string; pages: any[]; mcStatus?: any }) {
  const { user, logout } = useAuth();
  const authEnabled = site.authSettings?.enabled || site.zenuxsOauth?.enabled;
  const serverIcon = mcStatus?.icon;
  const [copied, setCopied] = useState(false);

  const javaIp = site.serverIp || 'play.titancraft.net';

  const copyIp = () => {
    navigator.clipboard.writeText(javaIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="bc-topbar">
        <div>
          <Link href="/">← BACK TO WEBSITE</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <select style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>
            <option style={{ background: 'var(--bg-secondary)', color: 'white' }}>INR (₹)</option>
            <option style={{ background: 'var(--bg-secondary)', color: 'white' }}>USD ($)</option>
            <option style={{ background: 'var(--bg-secondary)', color: 'white' }}>EUR (€)</option>
          </select>
          {authEnabled && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#fff' }}>Logged in as {user.username}</span>
                <Link href="/settings" style={{ color: 'var(--text-secondary)' }}>SETTINGS</Link>
                <button onClick={logout} style={{ color: 'var(--red-primary)', fontWeight: 600 }}>LOGOUT</button>
              </div>
            ) : (
              <Link href="/login">LOGIN / REGISTER</Link>
            )
          )}
        </div>
      </div>

      {/* Banner Area */}
      <div className="bc-banner">
        <div className="bc-banner-badges">
          {/* Discord Badge */}
          <a href={site.discordUrl || 'https://discord.gg'} target="_blank" className="bc-badge">
            <div className="bc-badge-icon" style={{ background: '#5865F2', color: '#fff' }}>
              <MessageSquare size={20} />
            </div>
            <div className="bc-badge-text">
              <div className="count">DISCORD</div>
              <div className="label">JOIN CHAT</div>
            </div>
          </a>

          {/* Center Logo */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {serverIcon ? (
              <img src={serverIcon} alt="" style={{ width: '80px', height: '80px', borderRadius: '16px', border: '2px solid var(--red-primary)', boxShadow: '0 0 20px var(--red-glow)' }} />
            ) : (
              <div style={{
                width: '80px', height: '80px', borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--red-primary), var(--red-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#fff', fontSize: '36px',
                boxShadow: '0 0 20px var(--red-glow)'
              }}>
                {(site.name || 'B').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase' }}>
              {site.name}
            </span>
          </Link>

          {/* Server IP Badge */}
          <div onClick={copyIp} className="bc-badge">
            <div className="bc-badge-icon" style={{ background: 'var(--red-primary)', color: '#fff' }}>
              <Gamepad2 size={20} />
            </div>
            <div className="bc-badge-text">
              <div className="count" style={{ fontFamily: 'monospace' }}>{javaIp.toUpperCase()}</div>
              <div className="label">{copied ? 'COPIED!' : 'CLICK TO COPY'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Component (Store Widgets) ────────────────
export function Sidebar({ site, pages, activePage }: { site: any; pages: any[]; activePage?: string }) {
  const getIconNameForSlug = (slug: string): string => {
    switch (slug) {
      case 'home': return 'Home';
      case 'store': return 'ShoppingCart';
      case 'status': return 'Activity';
      case 'gallery': return 'Image';
      case 'discussions': return 'MessageSquare';
      case 'leaderboard': return 'Trophy';
      case 'faq': return 'HelpCircle';
      case 'about': return 'Users';
      default: return 'FileText';
    }
  };

  const navPages = site.navLinks?.length > 0 
    ? site.navLinks.filter((l: any) => l.visible)
    : [...pages].sort((a, b) => {
        if (a.slug === 'home') return -1;
        if (b.slug === 'home') return 1;
        return a.title.localeCompare(b.title);
      }).map(p => ({
        label: p.title,
        url: p.slug === 'home' ? '/' : `/${p.slug}`,
        icon: getIconNameForSlug(p.slug),
        isExternal: false
      }));

  const { user } = useAuth();
  if (user && user.loginType === 'zenuxs') {
    navPages.push({
      label: 'Notifications',
      url: '/notifications',
      icon: 'Bell',
      isExternal: false
    });
  }

  const [giftcard, setGiftcard] = useState('');
  const [giftcardStatus, setGiftcardStatus] = useState<string | null>(null);

  const checkGiftcard = () => {
    if (giftcard.trim()) {
      setGiftcardStatus('Checking...');
      setTimeout(() => {
        setGiftcardStatus('Balance: ₹0.00');
      }, 1000);
    }
  };

  return (
    <aside className="bc-sidebar">
      {/* Store Menu widget */}
      <div className="bc-card">
        <h3 className="bc-card-title">STORE MENU</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navPages.map((link: any, index: number) => {
            const href = link.url || (link.slug === 'home' ? '/' : `/${link.slug}`);
            const label = link.label || link.title;
            const IconComponent = (Icons as any)[link.icon] || Icons.FileText;
            const isActive = activePage === href;

            return (
              <Link key={index} href={href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-btn)',
                fontSize: '13px',
                fontWeight: 700,
                background: isActive ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
                color: isActive ? 'var(--red-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(231, 76, 60, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s'
              }}>
                <IconComponent size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Voting widget */}
      <div className="bc-card">
        <h3 className="bc-card-title">SERVER VOTING</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '12px' }}>
          Vote daily to help us grow and receive in-game key rewards!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="https://minecraft-server-list.com" target="_blank" className="bc-btn-red bc-btn-sm" style={{ textTransform: 'uppercase' }}>Vote Link 1</a>
          <a href="https://minecraftservers.org" target="_blank" className="bc-btn-red bc-btn-sm" style={{ textTransform: 'uppercase' }}>Vote Link 2</a>
        </div>
      </div>

      {/* Giftcard Balance widget */}
      <div className="bc-card">
        <h3 className="bc-card-title">GIFTCARD BALANCE</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="bc-input" 
            placeholder="Enter code..." 
            value={giftcard}
            onChange={e => setGiftcard(e.target.value)}
          />
          <button onClick={checkGiftcard} className="bc-btn-blue bc-btn-sm" style={{ width: 'auto', whiteSpace: 'nowrap' }}>Check</button>
        </div>
        {giftcardStatus && (
          <p style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '8px', textAlign: 'center', fontWeight: 600 }}>{giftcardStatus}</p>
        )}
      </div>

      {/* Payment Goal widget */}
      <div className="bc-card">
        <h3 className="bc-card-title">SERVER GOAL</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Goal Progress</span>
          <span style={{ color: 'var(--red-primary)' }}>75%</span>
        </div>
        <div className="bc-progress">
          <div className="bc-progress-fill" style={{ width: '75%' }} />
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Help us reach our monthly hosting costs goal!
        </p>
      </div>

      {/* Top Customer / Supporter widget */}
      <div className="bc-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h3 className="bc-card-title">TOP DONOR</h3>
        <img 
          src="https://minotar.net/avatar/Boss_Lover/48" 
          alt="" 
          style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid var(--red-primary)', marginBottom: '8px' }} 
        />
        <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>Boss_Lover</span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>₹15,000.00 spent</span>
      </div>

      {/* Recent Payments widget */}
      <div className="bc-card">
        <h3 className="bc-card-title">RECENT PAYMENTS</h3>
        <div className="bc-avatar-grid">
          {['Steve', 'Alex', 'Mc_Builder', 'Nexus_Player', 'Herobrine', 'Notch'].map((name, i) => (
            <img 
              key={i} 
              src={`https://minotar.net/avatar/${name}/32`} 
              alt={name} 
              title={name} 
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Hero Section ─────────────────────────────────
export function HeroSection({ site, primary, mcStatus, content, styles }: any) {
  const title = site.name || "BossCraft";
  const promoText = site.theme?.promoText || "Use coupon code BOSSCRAFT for 15% off at checkout!";
  const description = content?.description || site.description || "Welcome to the official BossCraft Store. All purchases directly fund server hosting, custom plugins, and regular content updates.";

  return (
    <div style={{ padding: '12px 0' }}>
      <h1 className="bc-heading" style={{ fontSize: '32px', marginBottom: '4px' }}>{title}</h1>
      <h2 className="bc-subheading" style={{ fontSize: '14px', marginBottom: '24px' }}>OFFICIAL STORE</h2>

      {promoText && (
        <div className="bc-card bc-promo" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(231, 76, 60, 0.05)', border: '1px solid rgba(231, 76, 60, 0.15)', color: 'var(--red-primary)', fontWeight: 800, borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
          {promoText}
        </div>
      )}

      <div className="bc-card" style={{ marginBottom: '24px' }}>
        <p className="bc-text" style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {description}
        </p>
      </div>

      {/* Social Row */}
      <div className="bc-social-row">
        <a href={site.discordUrl || "https://discord.gg"} target="_blank" className="bc-social-btn">
          <MessageSquare className="social-icon" />
          <span>Discord</span>
        </a>
        <a href="https://youtube.com" target="_blank" className="bc-social-btn">
          <Video className="social-icon" />
          <span>YouTube</span>
        </a>
        <a href="https://twitter.com" target="_blank" className="bc-social-btn">
          <Twitter className="social-icon" />
          <span>Twitter</span>
        </a>
        <a href="https://tiktok.com" target="_blank" className="bc-social-btn">
          <Music className="social-icon" />
          <span>TikTok</span>
        </a>
      </div>

      {/* Help & Support / Refund Policy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div>
          <div className="bc-section-banner blue">HELP & SUPPORT</div>
          <div className="bc-card">
            <p className="bc-text" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Have questions or issues with a purchase? Contact our support team via Discord or submit a support ticket in the portal. We aim to respond within 24 hours.
            </p>
          </div>
        </div>
        <div>
          <div className="bc-section-banner red">REFUND POLICY</div>
          <div className="bc-card">
            <p className="bc-text" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              All payments are final and non-refundable. Attempting a chargeback or opening a dispute will result in an immediate and permanent ban from all our servers and store services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Status Section ───────────────────────────────
export function ServerStatusSection({ site, mcStatus, primary, content, styles }: any) {
  const title = content?.heading || "Server Status";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div className="bc-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Server Status</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: mcStatus?.online ? 'var(--green-primary)' : '#ef4444', marginTop: '4px' }}>
            {mcStatus?.online ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Players Online</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {mcStatus?.players?.online || 0} / {mcStatus?.players?.max || 100}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Server IP</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginTop: '8px', fontFamily: 'monospace' }}>
            {site.serverIp || 'play.titancraft.net'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Online Players Section ───────────────────────
export function OnlinePlayersSection({ site, mcStatus, primary, content }: any) {
  const players = mcStatus?.players?.list || [];
  const title = content?.heading || "Online Players";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      {players.length > 0 ? (
        <div className="bc-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {players.slice(0, 24).map((p: any, i: number) => {
            const name = p.name || p;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <img src={`https://minotar.net/avatar/${name}/16`} alt="" style={{ width: '16px', height: '16px', borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{name}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bc-card" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          No players currently online.
        </div>
      )}
    </div>
  );
}

// ─── Featured Store Section ──────────────────────
export function StoreSection({ site, products, primary, content, styles }: any) {
  const title = content?.title || "Featured Collections";

  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {products.slice(0, 3).map((p: any, i: number) => (
          <div key={p._id || i} className="bc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '320px' }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>
                {['👑', '⚔️', '💎', '🔥', '🛡️'][i % 5]}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--red-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.category}</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '4px', marginBottom: '8px' }}>{p.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.description}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '14px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>₹{p.price}</span>
              <Link href="/store" className="bc-btn-red bc-btn-sm" style={{ display: 'inline-block', width: 'auto' }}>
                Purchase
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── News / Announcements Section ─────────────────
export function NewsSection({ site, announcements, primary, content, styles }: any) {
  const title = content?.title || "Announcements";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {announcements.slice(0, 3).map((a: any, i: number) => (
          <div key={a._id || i} className="bc-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{a.title}</h3>
            </div>
            <Link href="/announcements" className="bc-btn-outline bc-btn-sm">Read</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────
export function Footer({ site, primary }: { site: any; primary: string }) {
  return (
    <footer className="bc-footer" style={{ marginTop: '40px' }}>
      {site.logo ? (
        <img src={site.logo} alt="" className="bc-footer-logo" />
      ) : (
        <div className="bc-footer-logo" style={{
          background: 'linear-gradient(135deg, var(--red-primary), var(--red-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, color: '#fff', fontSize: '20px'
        }}>
          {(site.name || 'B').charAt(0).toUpperCase()}
        </div>
      )}
      <div className="bc-footer-text">
        <div><strong>{site.name}</strong> &copy; {new Date().getFullYear()}. All Rights Reserved.</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
          We are not affiliated with Mojang Studios or Microsoft. Minecraft is copyright Mojang Synergies AB.
        </div>
      </div>
    </footer>
  );
}

// ─── Gallery Section ──────────────────────────────
export function GallerySection({ site, images, primary, content, styles }: any) {
  const title = content?.title || "Gallery";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {images.map((img: any, i: number) => (
          <div key={i} className="bc-card" style={{ padding: '8px', overflow: 'hidden', height: '200px' }}>
            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Forum Discussions Section ────────────────────
export function DiscussionsSection({ site, discussions, primary, content, styles }: any) {
  const title = content?.title || "Community Discussions";
  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="bc-heading" style={{ fontSize: '24px' }}>{title}</h2>
        <Link href="/discussions/new" className="bc-btn-outline bc-btn-sm">New Post</Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {discussions.map((d: any) => (
          <Link key={d._id} href={`/discussions/${d._id}`} className="bc-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{d.title}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Posted by <strong>{d.authorName || d.author}</strong> &middot; {new Date(d.createdAt).toLocaleDateString()}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                <span>👍 {d.likes?.length || 0} Likes</span>
                <span>💬 {d.comments?.length || 0} Comments</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--red-primary)" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard Section ──────────────────────────
export function LeaderboardSection({ site, primary, content, styles }: any) {
  const title = content?.title || "Leaderboard";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div className="bc-card" style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border-subtle)', padding: 0, overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((i) => {
          const colors = ['var(--red-primary)', 'var(--text-primary)', '#cd7f32', 'var(--text-muted)', 'var(--text-muted)'];
          const names = ['Boss_Lover', 'Steve', 'Alex', 'Mc_Builder', 'Nexus_Player'];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: '16px', background: 'var(--bg-card)' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: colors[i-1], width: '24px' }}>{i}</span>
              <img src={`https://minotar.net/avatar/${names[i-1]}/24`} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              <span style={{ fontWeight: 700, flex: 1, fontSize: '14px' }}>{names[i-1]}</span>
              <span style={{ fontWeight: 800, fontSize: '14px', color: i === 1 ? 'var(--red-primary)' : 'inherit' }}>{15000 - i * 1800} PTS</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FAQ Section ──────────────────────────────────
export function FAQSection({ site, faqItems, primary, content, styles }: any) {
  const title = content?.title || "FAQ";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqItems.map((item: any, i: number) => (
          <div key={i} className="bc-card">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--red-primary)', marginBottom: '8px' }}>{item.question}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Forms Section ────────────────────────────────
export function FormsSection({ site, forms, primary, content, styles }: any) {
  const title = content?.title || "Applications";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {forms.map((f: any) => (
          <div key={f._id} className="bc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{f.name || f.title}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f.description}</p>
            </div>
            <Link href={`/form/${f._id}`} className="bc-btn-outline bc-btn-sm" style={{ marginTop: '12px', display: 'inline-flex', alignSelf: 'flex-start' }}>
              Begin Form <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Team Section ─────────────────────────────────
export function TeamSection({ site, members, primary, content, styles }: any) {
  const title = content?.title || "Staff Team";
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        {members.map((m: any, i: number) => (
          <div key={i} className="bc-card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 12px' }}>
              {m.image ? (
                <img src={m.image.fullUrl || m.image.url || m.image} alt="" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--red-primary)' }} />
              ) : (
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={32} color="var(--text-muted)" />
                </div>
              )}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{m.name}</h3>
            <p style={{ fontSize: '11px', color: 'var(--red-primary)', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Text Section ─────────────────────────────────
export function TextSection({ site, heading, body, primary, content, styles }: any) {
  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '12px' }}>{heading}</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{body}</p>
    </div>
  );
}

// ─── Features Section ─────────────────────────────
export function FeaturesSection({ site, primary, content, styles }: any) {
  const title = content?.heading || "Features";
  const items = content?.items || [
    { title: 'Obsidian Grid', description: 'Zero boundaries, running on enterprise AMD Ryzen 9 dedicated infrastructure.' },
    { title: 'Economy Engine', description: 'Curated token flow, dynamic guild trades, and structured PvP payouts.' },
    { title: 'Gilded Security', description: 'Deep anti-cheat integrations, premium session protection, and instant assistance.' }
  ];

  return (
    <div style={{ padding: '12px 0' }}>
      <h2 className="bc-heading" style={{ fontSize: '24px', marginBottom: '20px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {items.map((item: any, i: number) => (
          <div key={i} className="bc-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.2)', color: 'var(--red-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Star size={16} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{item.title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Form Renderer ────────────────────────────────
export function FormRenderer({ form, primary }: any) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    (form.fields || []).forEach((f: any) => init[f.name || f.label || 'field'] = '');
    return init;
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'login_required'>('idle');
  const [responses, setResponses] = useState<any[]>([]);
  const [fetchingResponses, setFetchingResponses] = useState(false);

  const fetchMyResponses = async () => {
    if (!user) return;
    setFetchingResponses(true);
    try {
      const token = user.token || localStorage.getItem('zenuxs_auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mcbuilderapi.zenuxs.in/api'}/forms/${form._id}/my-responses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setResponses(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setFetchingResponses(false);
  };

  useEffect(() => {
    if (user && form?._id) {
      fetchMyResponses();
    }
  }, [user, form?._id]);

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

  return (
    <div className="bc-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{form.name || form.title}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>{form.description}</p>

      {isAnyLoginRequired && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-btn)', 
          background: isAuthorized ? 'rgba(39, 174, 96, 0.05)' : 'rgba(231, 76, 60, 0.05)',
          border: `1px solid ${isAuthorized ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)'}`,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: isAuthorized ? 'var(--green-primary)' : 'var(--red-primary)' }}>
            {isAuthorized ? (
              <>
                Logged in as <strong>{user?.username}</strong>. Account bound successfully.
              </>
            ) : (
              <>
                Login Required. You must <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`} style={{ color: 'inherit', textDecoration: 'underline' }}>Login</Link> to submit this application form.
              </>
            )}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        {form.fields?.map((field: any, i: number) => (
          <div key={i}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '6px', textTransform: 'uppercase' }}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea 
                required={field.required}
                value={values[field.name || field.label]}
                onChange={e => handleChange(field.name || field.label, e.target.value)}
                className="bc-input"
                style={{ minHeight: '120px', resize: 'vertical' }} 
                placeholder="..." 
              />
            ) : field.type === 'select' ? (
              <select 
                required={field.required}
                value={values[field.name || field.label]}
                onChange={e => handleChange(field.name || field.label, e.target.value)}
                className="bc-input"
              >
                <option value="" disabled style={{ background: 'var(--bg-secondary)' }}>Select option...</option>
                {field.options?.map((opt: string, j: number) => <option key={j} value={opt} style={{ background: 'var(--bg-secondary)' }}>{opt}</option>)}
              </select>
            ) : (
              <input 
                type={field.type || 'text'} 
                required={field.required}
                value={values[field.name || field.label]}
                onChange={e => handleChange(field.name || field.label, e.target.value)}
                className="bc-input"
                placeholder="..." 
              />
            )}
          </div>
        ))}
        <button 
          type="submit"
          disabled={status === 'sending' || (isAnyLoginRequired && !isAuthorized)}
          className="bc-btn-red"
          style={{ 
            marginTop: '12px',
            cursor: (status === 'sending' || (isAnyLoginRequired && !isAuthorized)) ? 'not-allowed' : 'pointer',
            opacity: (status === 'sending' || (isAnyLoginRequired && !isAuthorized)) ? 0.5 : 1
          }}
        >
          {status === 'sending' ? 'Sending...' : 'Submit Application'}
        </button>

        {status === 'sent' && (
          <div style={{ color: 'var(--green-primary)', fontSize: '13px', fontWeight: 700, textAlign: 'center', marginTop: '12px' }}>
            ✓ Application submitted successfully. We will review it shortly.
          </div>
        )}
        {status === 'error' && (
          <div style={{ color: 'var(--red-primary)', fontSize: '13px', fontWeight: 700, textAlign: 'center', marginTop: '12px' }}>
            ✗ Submission failed. Please verify connection and try again.
          </div>
        )}
        {status === 'login_required' && (
          <div style={{ color: 'var(--red-primary)', fontSize: '13px', fontWeight: 700, textAlign: 'center', marginTop: '12px' }}>
            ⚠ Authentication required.
          </div>
        )}
      </form>

      {/* Form Submission History */}
      {user && (
        <div style={{ marginTop: '36px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Submission History</h3>
          {fetchingResponses ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Retrieving history...</p>
          ) : responses.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No submissions on record for this account.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {responses.map((resp: any) => (
                <div key={resp._id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-btn)', padding: '16px', background: 'rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={`https://minotar.net/avatar/${resp.submitterDetails?.gamertag || user.username}/20`} alt="" style={{ width: '20px', height: '20px', borderRadius: '2px' }} />
                      <span style={{ fontWeight: 700, fontSize: '12px', color: '#fff' }}>
                        {resp.submitterDetails?.gamertag || resp.submittedBy || 'Gamertag'}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      padding: '3px 8px', 
                      borderRadius: '4px',
                      background: resp.status === 'Accepted' || resp.status === 'accepted' ? 'rgba(39, 174, 96, 0.1)' : resp.status === 'Rejected' || resp.status === 'rejected' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: resp.status === 'Accepted' || resp.status === 'accepted' ? 'var(--green-primary)' : resp.status === 'Rejected' || resp.status === 'rejected' ? 'var(--red-primary)' : 'var(--text-secondary)',
                      border: `1px solid ${resp.status === 'Accepted' || resp.status === 'accepted' ? 'rgba(39, 174, 96, 0.2)' : resp.status === 'Rejected' || resp.status === 'rejected' ? 'rgba(231, 76, 60, 0.2)' : 'var(--border-subtle)'}`
                    }}>
                      {resp.status || 'pending'}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '4px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(resp.data || {}).map(([key, val]: any) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{key}:</span>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{String(val)}</span>
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