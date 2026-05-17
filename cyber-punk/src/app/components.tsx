'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, ShoppingCart, Activity, MessageSquare, Image, 
  Trophy, HelpCircle, Users, FileText, Layout, 
  Menu, X, ChevronRight, Zap, Monitor, Cpu, 
  Shield, Globe, Terminal, Ghost, Box, LogOut, CheckCircle,
  ExternalLink, Copy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const BrandIcons = {
  Discord: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0-1.333-.946 2.418-2.157 2.418z"/></svg>
  ),
  Youtube: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
  Twitter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.84 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>
  )
};

// ─── Sidebar Navigation ───────────────────────────
export function Navbar({ site, pages, accent, mcStatus }: { site: any; pages: any[]; accent: string; mcStatus?: any }) {
  const [active, setActive] = useState('/');
  const { user, logout } = useAuth();
  const authEnabled = site.authSettings?.enabled;
  const serverIcon = mcStatus?.icon;
  
  const navItems = [
    { label: 'HOME', href: '/', icon: Home },
    { label: 'STORE', href: '/store', icon: ShoppingCart },
    { label: 'STATUS', href: '/status', icon: Activity },
    { label: 'GALLERY', href: '/gallery', icon: Image },
    { label: 'FORUMS', href: '/discussions', icon: MessageSquare },
    { label: 'RANKINGS', href: '/leaderboard', icon: Trophy },
  ];

  const socialLinks = site.socialLinks || {};
  const navPages = [...pages].filter(p => p.visible && !['home','store','status','gallery','discussions','leaderboard','faq'].includes(p.slug))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <nav className="sidebar-nav">
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {serverIcon ? (
            <img src={serverIcon} alt={site.name} style={{ width: '40px', height: '40px', borderRadius: '8px', boxShadow: `0 0 20px ${accent}20` }} />
          ) : (
            <div style={{ width: '40px', height: '40px', background: accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 20px ${accent}40` }}>
              <Zap size={24} color="#050508" />
            </div>
          )}
          <span style={{ fontWeight: 900, fontSize: '18px', color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{site.name.toUpperCase()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px', height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setActive(item.href)}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              padding: '12px 16px', 
              borderRadius: '12px',
              color: active === item.href ? accent : '#555',
              background: active === item.href ? `${accent}10` : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }} className="glitch-text">
              <item.icon size={22} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>{item.label}</span>
              {active === item.href && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: accent, borderRadius: '0 4px 4px 0', boxShadow: `0 0 10px ${accent}` }} />}
            </div>
          </Link>
        ))}

        <div style={{ margin: '12px 8px', height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {navPages.map((p) => (
          <Link key={p._id} href={`/${p.slug}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '12px', color: '#444' }} className="glitch-text">
              <FileText size={22} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>{p.title.toUpperCase()}</span>
            </div>
          </Link>
        ))}

        <div style={{ marginTop: 'auto', padding: '20px 8px' }}>
           <div style={{ display: 'flex', gap: '16px', color: '#222' }}>
             {socialLinks.discord && <a href={socialLinks.discord} target="_blank" style={{ transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = accent} onMouseLeave={e => e.currentTarget.style.color = '#222'}><BrandIcons.Discord /></a>}
             {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" style={{ transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = accent} onMouseLeave={e => e.currentTarget.style.color = '#222'}><BrandIcons.Youtube /></a>}
             {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" style={{ transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = accent} onMouseLeave={e => e.currentTarget.style.color = '#222'}><BrandIcons.Twitter /></a>}
           </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', left: '12px', right: '12px' }}>
        {authEnabled && (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: accent, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px' }}>{user.username.charAt(0)}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ color: '#fff', fontSize: '11px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</p>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '9px', fontWeight: 800, padding: 0 }}>DEACTIVATE</button>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <div className="cyber-border" style={{ padding: '12px', textAlign: 'center', background: `${accent}05`, color: accent, fontSize: '12px', fontWeight: 900 }}>
                <Terminal size={18} style={{ marginBottom: '4px' }} />
                <span className="sidebar-label">INITIALIZE_LOGIN</span>
              </div>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

// ─── Hero Section ───────────────────────────────
export function HeroSection({ site, accent, mcStatus, content, styles }: any) {
  const [copied, setCopied] = useState(false);
  const title = content?.title || site.name;
  const tag = content?.subtitle || "System Online // V2.0";
  const description = content?.description || content?.subtitle || "Welcome to the next generation of competitive Minecraft. High performance, zero latency, maximum adrenaline.";
  
  const buttons = content?.buttons && content.buttons.length > 0 
    ? content.buttons 
    : (content?.buttonText ? [{ text: content.buttonText, url: content.buttonUrl || '/store' }] : []);

  const copyIp = () => {
    navigator.clipboard.writeText(site.serverIp || 'mc.server.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', padding: '0 40px' }}>
      <div className="cyber-grid" style={{ zIndex: 0 }} />
      
      <div style={{ maxWidth: '800px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ height: '1px', width: '40px', background: accent }} />
          <span style={{ color: accent, fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em' }}>{tag}</span>
        </div>
        
        <h1 style={{ fontSize: 'clamp(48px, 8vw, 120px)', fontWeight: 900, lineHeight: 0.9, color: '#fff', letterSpacing: '-0.05em', marginBottom: '32px' }}>
          {title.split(' ').map((word: string, i: number) => (
            <span key={i}>
              {i === 1 ? <><span style={{ color: accent }} className="glitch-text">{word}</span> <br /></> : <span>{word} </span>}
            </span>
          ))}
          {title.split(' ').length === 1 && <span style={{ color: accent }} className="glitch-text">{title}</span>}
        </h1>

        <p style={{ fontSize: '18px', color: '#888', maxWidth: '500px', lineHeight: 1.6, marginBottom: '48px', borderLeft: `2px solid ${accent}40`, paddingLeft: '24px' }}>
          {description}
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {buttons.map((btn: any, i: number) => (
            <Link key={i} href={btn.url || '#'} className="cyber-border" style={{ padding: '18px 40px', background: i === 0 ? accent : 'rgba(255,255,255,0.03)', color: i === 0 ? '#050508' : '#fff', fontWeight: 900, fontSize: '16px' }}>
              {btn.text}
            </Link>
          ))}
          {!content?.buttons && (
            <button onClick={copyIp} className="cyber-border" style={{ padding: '18px 30px', background: 'rgba(255,255,255,0.03)', color: '#fff', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer' }}>
              <span style={{ width: '8px', height: '8px', background: mcStatus?.online ? accent : '#ef4444', borderRadius: '50%', boxShadow: `0 0 10px ${mcStatus?.online ? accent : '#ef4444'}` }} />
              {copied ? 'COPIED_TO_CLIPBOARD' : (site.serverIp || 'mc.server.com')}
              <Copy size={16} opacity={0.5} />
            </button>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', right: '-100px', top: '50%', transform: 'translateY(-50%)', fontSize: '400px', fontWeight: 900, color: 'rgba(255,255,255,0.01)', userSelect: 'none', pointerEvents: 'none', zIndex: 0 }}>
        {site.name.charAt(0)}
      </div>
    </div>
  );
}

// ─── Status Section ──────────────────────────────
export function ServerStatus({ site, mcStatus, accent, content, styles }: any) {
  const mc = mcStatus || { online: false };
  const title = content?.heading || "SYSTEM ANALYTICS";
  const stats = [
    { label: 'STATUS', value: mc.online ? '✓_ONLINE' : '✗_OFFLINE', color: mc.online ? accent : '#ef4444' },
    { label: 'VERSION', value: mc.version?.name || '1.20.X', color: '#fff' },
    { label: 'PING', value: `${mc.ping || 0}MS`, color: '#3b82f6' },
    { label: 'LOAD', value: `${mc.players?.online || 0}/${mc.players?.max || 100}`, color: accent }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
      <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff' }}>{title}</h2>
          {site.serverIp && <p style={{ color: accent, fontSize: '12px', fontWeight: 900, marginTop: '8px', letterSpacing: '0.2em' }}>{site.serverIp}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} className="cyber-border" style={{ padding: '32px', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4, marginBottom: '12px', letterSpacing: '0.1em' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Online Players Section ──────────────────────
export function OnlinePlayers({ site, mcStatus, accent, content }: any) {
  const players = mcStatus?.players?.list || [];
  const title = content?.heading || "ACTIVE_UNITS";
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>{title}</h2>
      <p style={{ fontSize: '48px', fontWeight: 900, color: accent, marginBottom: '40px' }}>{mcStatus?.players?.online || 0}</p>
      
      {players.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {players.slice(0, 20).map((p: any, i: number) => (
            <div key={i} style={{ padding: '8px 16px', borderRadius: '4px', background: `${accent}10`, border: `1px solid ${accent}30`, color: '#fff', fontSize: '13px', fontWeight: 700 }}>
              {p.name || p}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Store Section ──────────────────────────────
export function StorePreview({ site, products, accent, content, styles }: any) {
  const title = content?.title || "UPGRADES_MODULES";
  const linkText = content?.linkText || "VIEW_ALL_DATABASE →";

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
        </h2>
        <Link href="/store" style={{ color: accent, fontWeight: 900, fontSize: '12px', letterSpacing: '0.2em' }}>{linkText}</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
        {products.slice(0, 4).map((p: any, i: number) => (
          <div key={p._id} className="cyber-border" style={{ padding: '32px', background: 'rgba(255,255,255,0.01)', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '40px', marginBottom: '24px' }}>{'💎⚔️🔥👑'[i % 4]}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>{p.name.toUpperCase()}</h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6, marginBottom: '32px' }}>{p.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: accent }}>₹{p.price}</span>
              <Link href="/store" style={{ width: '40px', height: '40px', background: `${accent}10`, color: accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accent}20` }}>
                <ShoppingCart size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── News Section ───────────────────────────────
export function NewsSection({ site, announcements, accent, content, styles }: any) {
  const title = content?.title || "LATEST_COMMS";
  const limit = content?.limit ? Number(content.limit) : 2;
  const items = announcements.slice(0, limit);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff' }}>
            {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
        {items.map((a: any, i: number) => (
          <div key={a._id} className="glass-card" style={{ padding: '40px', borderLeft: `4px solid ${accent}` }}>
            <p style={{ color: accent, fontSize: '11px', fontWeight: 900, marginBottom: '16px' }}>{new Date(a.createdAt).toLocaleDateString().toUpperCase()}</p>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>{a.title}</h3>
            <p style={{ color: '#888', lineHeight: 1.8, fontSize: '15px' }}>{a.content.substring(0, 150)}...</p>
            <Link href="/announcements" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px', fontWeight: 800, marginTop: '24px' }}>
              DECODE FULL MESSAGE <ChevronRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────
export function Footer({ site, accent }: { site: any; accent: string }) {
  return (
    <footer style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2, background: 'rgba(5, 5, 8, 0.8)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
             <Zap size={24} color={accent} />
             <span style={{ fontWeight: 900, fontSize: '20px', color: '#fff' }}>{site.name.toUpperCase()}</span>
          </div>
          <p style={{ color: '#555', fontSize: '14px', maxWidth: '300px' }}>THE ULTIMATE MINECRAFT EXPERIENCE. BUILT BY THE COMMUNITY, FOR THE COMMUNITY.</p>
        </div>

        <div style={{ display: 'flex', gap: '80px' }}>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 900, fontSize: '12px', marginBottom: '20px', letterSpacing: '0.1em' }}>DATABASE</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#555', fontSize: '14px', fontWeight: 700 }}>
              <Link href="/gallery" className="glitch-text">GALLERY</Link>
              <Link href="/leaderboard" className="glitch-text">STATS</Link>
              <Link href="/status" className="glitch-text">STATUS</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 900, fontSize: '12px', marginBottom: '20px', letterSpacing: '0.1em' }}>SUPPORT</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#555', fontSize: '14px', fontWeight: 700 }}>
              <Link href="/faq" className="glitch-text">KNOWLEDGE_BASE</Link>
              <Link href="/discussions" className="glitch-text">FORUMS</Link>
              <Link href="/forms" className="glitch-text">APPLICATIONS</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ maxWidth: '1200px', margin: '60px auto 0', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <p style={{ color: '#333', fontSize: '12px', fontWeight: 800 }}>© {new Date().getFullYear()} {site.name.toUpperCase()} // ALL_RIGHTS_RESERVED // [ENCRYPTED]</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <span style={{ fontSize: '10px', color: '#222', fontWeight: 900 }}>POWERED BY</span>
           <a href="https://zenuxs.com" target="_blank" style={{ fontSize: '12px', fontWeight: 900, color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
             ZENUXS WEB BUILDER <ExternalLink size={12} />
           </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Specialized Sections ────────────────────────
export function GallerySection({ site, images, accent, content, styles }: any) {
  const title = content?.title || "MEDIA_CAPSULES";
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '60px' }}>
          {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {images.map((img: any, i: number) => (
          <div key={i} className="cyber-border" style={{ height: '250px', background: '#111', overflow: 'hidden' }}>
            <img src={img.fullUrl || img.url} alt={img.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, transition: '0.3s' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiscussionsSection({ site, discussions, accent, content, styles }: any) {
  const title = content?.title || "COMM_THREADS";
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '60px' }}>
          {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {discussions.map((d: any) => (
          <div key={d._id} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{d.title}</h3>
              <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>By {d.authorName || d.author} // {new Date(d.createdAt).toLocaleDateString()}</p>
            </div>
            <ChevronRight size={20} color={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSection({ site, accent, content, styles }: any) {
  const title = content?.title || "RANKINGS_GRID";
  const fakeLeaders = [
    { name: 'Zenuxs_Owner', score: 15420, rank: 1, avatar: 'https://minotar.net/avatar/Zenuxs_Owner/48' },
    { name: 'Dream', score: 12150, rank: 2, avatar: 'https://minotar.net/avatar/Dream/48' },
    { name: 'Technoblade', score: 11840, rank: 3, avatar: 'https://minotar.net/avatar/Technoblade/48' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '60px', textAlign: 'center' }}>
          {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
      </h2>
      <div className="cyber-border" style={{ background: 'rgba(0,0,0,0.2)' }}>
        {fakeLeaders.map((p, i) => (
          <div key={i} style={{ display: 'flex', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '24px', fontWeight: 900, color: i < 3 ? accent : '#333', width: '40px' }}>#0{i+1}</span>
            <img src={p.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
            <span style={{ fontWeight: 800, color: '#fff', flex: 1 }}>{p.name.toUpperCase()}</span>
            <span style={{ fontWeight: 900, color: accent }}>{p.score} PTS</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FAQSection({ site, faqItems, accent, content, styles }: any) {
  const title = content?.title || "INTEL_BASE";
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '60px' }}>
          {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {faqItems.map((item: any, i: number) => (
          <div key={i} className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: accent, marginBottom: '12px' }}>{item.question}</h3>
            <p style={{ color: '#888', lineHeight: 1.6 }}>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormsSection({ site, forms, accent, content, styles }: any) {
  const title = content?.title || "REQUEST_FORMS";
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '60px' }}>
          {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {forms.map((f: any) => (
          <div key={f._id} className="cyber-border" style={{ padding: '32px', background: 'rgba(255,255,255,0.01)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>{f.description}</p>
              <Link href={`/form/${f._id}`} style={{ color: accent, fontWeight: 900, fontSize: '12px', letterSpacing: '0.1em' }}>INITIATE_APPLICATION →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamSection({ site, members, accent, content, styles }: any) {
  const title = content?.title || "STAFF_UNITS";
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '60px' }}>
          {title.includes('_') ? <>{title.split('_')[0]}_<span style={{ color: accent }}>{title.split('_')[1]}</span></> : title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
        {members.map((m: any, i: number) => (
          <div key={i} className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
            {m.image ? (
              <img src={m.image.fullUrl || m.image.url || m.image} style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover', margin: '0 auto 24px', border: `1px solid ${accent}30` }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: `${accent}10`, margin: '0 auto 24px', border: `1px solid ${accent}30` }} />
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{m.name}</h3>
            <p style={{ color: accent, fontSize: '12px', fontWeight: 900, marginTop: '4px' }}>{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TextSection({ site, heading, body, accent, content, styles }: any) {
  const buttons = content?.buttons && content.buttons.length > 0 
    ? content.buttons 
    : (content?.buttonText ? [{ text: content.buttonText, url: content.buttonUrl || '#' }] : []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '24px' }}>{heading}</h2>
      <p style={{ color: '#888', lineHeight: 1.8, fontSize: '16px', whiteSpace: 'pre-wrap' }}>{body}</p>
      {buttons.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
          {buttons.map((btn: any, i: number) => (
            <Link key={i} href={btn.url || '#'} className="cyber-border" style={{ padding: '12px 28px', background: i === 0 ? accent : 'transparent', color: i === 0 ? '#000' : accent, fontWeight: 900, fontSize: '14px' }}>
              {btn.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function FeaturesSection({ site, accent, content, styles }: any) {
  const title = content?.heading || "CORE_FEATURES";
  const items = content?.items || [
    { title: 'CUSTOM_PLUGINS', description: 'UNIQUE GAMEPLAY MECHANICS ENCRYPTED IN OUR CORE.' },
    { title: 'LATENCY_ZERO', description: 'HIGH PERFORMANCE INFRASTRUCTURE FOR COMPETITIVE PLAY.' },
    { title: 'SECURE_TRANSIT', description: 'ADVANCED PROTECTION AGAINST EXTERNAL THREATS.' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
      <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '60px', textAlign: 'center' }}>
          {title.toUpperCase().includes('_') ? <>{title.toUpperCase().split('_')[0]}_<span style={{ color: accent }}>{title.toUpperCase().split('_')[1]}</span></> : title.toUpperCase()}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
        {items.map((item: any, i: number) => (
          <div key={i} className="cyber-border" style={{ padding: '40px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1 }}>
              <CheckCircle size={40} color={accent} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: accent, marginBottom: '16px', letterSpacing: '0.1em' }}>{item.title.toUpperCase()}</h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>{item.description.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormRenderer({ form, accent }: any) {
  return (
    <div className="cyber-border" style={{ padding: '60px', background: 'rgba(0,0,0,0.4)' }}>
       <h2 style={{ fontSize: '32px', fontWeight: 900, color: accent, marginBottom: '24px' }}>{form.title.toUpperCase()}</h2>
       <p style={{ color: '#555', marginBottom: '40px' }}>SYSTEM READY. WAITING FOR INPUT SEQUENCE.</p>
       <div style={{ display: 'grid', gap: '20px' }}>
          {form.fields?.map((field: any, i: number) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#444', marginBottom: '8px' }}>{field.label.toUpperCase()}</label>
              {field.type === 'textarea' ? (
                <textarea style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', color: '#fff', minHeight: '120px' }} placeholder="..." />
              ) : field.type === 'select' ? (
                <select style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', color: '#fff' }}>
                  {field.options?.map((opt: string, j: number) => <option key={j} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input type={field.type || 'text'} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', color: '#fff' }} placeholder="..." />
              )}
            </div>
          ))}
          <button style={{ background: accent, color: '#000', padding: '18px', border: 'none', fontWeight: 900, marginTop: '20px' }}>SUBMIT_ENCRYPTED_DATA</button>
       </div>
    </div>
  );
}