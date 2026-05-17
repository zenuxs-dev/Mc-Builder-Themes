'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, ShoppingCart, Activity, MessageSquare, Image, 
  Trophy, HelpCircle, Users, FileText, ArrowRight, 
  ChevronRight, Sparkles, Star, Zap, Shield, Heart,
  LogOut, ExternalLink, Copy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─── Bottom Dock Navigation ──────────────────────
export function Navbar({ site, pages, primary, mcStatus }: { site: any; primary: string; pages: any[]; mcStatus?: any }) {
  const [active, setActive] = useState('/');
  const { user, logout } = useAuth();
  const authEnabled = site.authSettings?.enabled;
  const serverIcon = mcStatus?.icon;
  
  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Store', href: '/store', icon: ShoppingCart },
    { label: 'Status', href: '/status', icon: Activity },
    { label: 'Gallery', href: '/gallery', icon: Image },
    { label: 'Forums', href: '/discussions', icon: MessageSquare },
  ];

  const navPages = [...pages].filter(p => p.visible && !['home','store','status','gallery','discussions','leaderboard','faq'].includes(p.slug))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="dock-container">
      {serverIcon && (
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)' }}>
          <img src={serverIcon} alt="" style={{ width: '40px', height: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
        </div>
      )}
      <nav className="dock">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setActive(item.href)}>
            <div className="dock-item" data-label={item.label} style={{ color: active === item.href ? primary : '#1a1a2e' }}>
              <item.icon size={22} />
              {active === item.href && <div style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', background: primary }} />}
            </div>
          </Link>
        ))}
        
        {navPages.length > 0 && <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 4px' }} />}
        
        {navPages.map((p) => (
          <Link key={p._id} href={`/${p.slug}`} onClick={() => setActive(`/${p.slug}`)}>
            <div className="dock-item" data-label={p.title} style={{ color: active === `/${p.slug}` ? primary : '#1a1a2e' }}>
              <FileText size={20} />
            </div>
          </Link>
        ))}

        <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 4px' }} />
        
        {authEnabled && (
          user ? (
            <div className="dock-item" data-label={user.username} onClick={logout} style={{ color: '#ef4444' }}>
              <LogOut size={20} />
            </div>
          ) : (
            <Link href="/login">
              <div className="dock-item" data-label="Login">
                <Sparkles size={22} color={primary} />
              </div>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}

// ─── Hero Section ───────────────────────────────
export function HeroSection({ site, primary, mcStatus, content, styles }: any) {
  const [copied, setCopied] = useState(false);
  const title = content?.title || "Higher Experience.";
  const tag = content?.subtitle || "✨ The Next Chapter";
  const description = content?.description || content?.subtitle || "Titan isn't just a server. It's a curated digital playground designed for those who seek the extraordinary.";
  const buttonText = content?.buttonText || "Get Started";

  const copyIp = () => {
    navigator.clipboard.writeText(site.serverIp || 'mc.server.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '95vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
      <div className="reveal" style={{ animationDelay: '0.1s' }}>
        <span className="section-tag" style={{ background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>{tag}</span>
      </div>
      
      <h1 className="serif animate-elastic" style={{ fontSize: 'clamp(56px, 10vw, 160px)', lineHeight: 1.05, marginTop: '32px', marginBottom: '32px' }}>
        {title.includes(' ') ? <>{title.split(' ')[0]} <br /> <span style={{ color: primary }}>{title.split(' ')[1]}</span></> : title}
      </h1>

      <p className="reveal" style={{ animationDelay: '0.3s', fontSize: '20px', color: '#6b7280', maxWidth: '600px', lineHeight: 1.6, marginBottom: '60px' }}>
        {description}
      </p>

      <div className="reveal" style={{ animationDelay: '0.5s', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/store" style={{ background: '#1a1a2e', color: '#fff', padding: '18px 48px', borderRadius: '20px', fontWeight: 700, fontSize: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          {buttonText}
        </Link>
        <button onClick={copyIp} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 24px', borderRadius: '20px', border: '1px solid #eee', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <div style={{ width: '8px', height: '8px', background: mcStatus?.online ? '#22c55e' : '#ef4444', borderRadius: '50%' }} />
          {copied ? 'Copied!' : (site.serverIp || 'mc.server.com')}
          <Copy size={16} opacity={0.3} />
        </button>
      </div>

      <div className="reveal" style={{ animationDelay: '0.7s', marginTop: '100px' }}>
         <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#ccc' }}>Scroll to Explore</p>
         <div style={{ width: '1px', height: '60px', background: 'linear-gradient(transparent, #eee)', margin: '12px auto' }} />
      </div>
    </div>
  );
}

// ─── Status Section ──────────────────────────────
export function ServerStatusSection({ site, mcStatus, primary, content, styles }: any) {
  const title = content?.heading || "Rock Solid Infrastructure.";
  const description = content?.description || "Our systems are monitored 24/7 to ensure zero downtime and peak performance for all players globally.";

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
      <div>
         <h2 className="serif" style={{ fontSize: '48px', marginBottom: '24px' }}>
            {title}
         </h2>
         <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: '40px' }}>{description}</p>
         <Link href="/status" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: primary, fontWeight: 700 }}>
           View Live Metrics <ArrowRight size={18} />
         </Link>
      </div>
      
      <div className="glass-2" style={{ padding: '48px', borderRadius: '40px' }}>
        <div style={{ display: 'grid', gap: '40px' }}>
           <div>
              <p style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>SERVER LATENCY</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
                {[40, 35, 45, 30, 50, 42, 38].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: primary, borderRadius: '4px 4px 0 0', height: `${h}%`, opacity: i === 6 ? 1 : 0.2 }} />
                ))}
              </div>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                 <p style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>STATUS</p>
                 <p className="outfit" style={{ fontSize: '24px', fontWeight: 800, color: mcStatus?.online ? '#22c55e' : '#ef4444' }}>{mcStatus?.online ? 'ONLINE' : 'OFFLINE'}</p>
              </div>
              <div>
                 <p style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4, marginBottom: '8px' }}>LOAD</p>
                 <p className="outfit" style={{ fontSize: '32px', fontWeight: 800 }}>{mcStatus?.players?.online || 0}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Online Players Section ──────────────────────
export function OnlinePlayersSection({ site, mcStatus, primary, content }: any) {
  const players = mcStatus?.players?.list || [];
  const title = content?.heading || "Active Players";
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2 className="serif" style={{ fontSize: '48px', marginBottom: '16px' }}>{title}</h2>
      <p className="outfit" style={{ fontSize: '80px', fontWeight: 900, color: primary, marginBottom: '48px', lineHeight: 1 }}>{mcStatus?.players?.online || 0}</p>
      
      {players.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {players.slice(0, 20).map((p: any, i: number) => (
            <div key={i} style={{ padding: '10px 20px', borderRadius: '16px', background: '#fff', border: '1px solid #eee', color: '#1a1a2e', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              {p.name || p}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Store Section ──────────────────────────────
export function StoreSection({ site, products, primary, content, styles }: any) {
  const title = content?.title || "The Collection";

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h2 className="serif" style={{ fontSize: '64px' }}>{title}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
        {products.slice(0, 3).map((p: any, i: number) => (
          <div key={p._id} style={{ position: 'relative', borderRadius: '40px', overflow: 'hidden', height: '500px' }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.8))` }} />
            <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', zIndex: -1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '120px' }}>{'💎⚔️🔥'[i % 3]}</div>
            
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', color: '#fff' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, opacity: 0.6, letterSpacing: '0.2em' }}>LIMITED EDITION</span>
              <h3 className="serif" style={{ fontSize: '32px', marginTop: '8px', marginBottom: '24px' }}>{p.name}</h3>
              <Link href="/store" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#000', padding: '16px', borderRadius: '20px', fontWeight: 700, gap: '10px' }}>
                Purchase for ₹{p.price} <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── News Section ───────────────────────────────
export function NewsSection({ site, announcements, primary, content, styles }: any) {
  const title = content?.title || "Dispatches.";

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <h2 className="serif" style={{ fontSize: '48px' }}>{title}</h2>
        <Link href="/announcements" style={{ color: primary, fontWeight: 700 }}>Browse All</Link>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {announcements.slice(0, 3).map((a: any, i: number) => (
          <div key={a._id} className="reveal" style={{ animationDelay: `${0.2 * i}s`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px', borderRadius: '24px', background: '#fff', border: '1px solid #eee' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, marginBottom: '8px' }}>{new Date(a.createdAt).toLocaleDateString()}</p>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{a.title}</h3>
            </div>
            <Link href="/announcements" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              <ChevronRight size={20} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────
export function Footer({ site, primary }: { site: any; primary: string }) {
  return (
    <footer style={{ padding: '120px 24px 60px', background: '#fff', borderTop: '1px solid #eee' }}>
       <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="serif" style={{ fontSize: '40px', marginBottom: '40px' }}>{site.name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '60px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
            <Link href="/about">About</Link>
            <Link href="/faq">Support</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/discussions">Community</Link>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px', paddingTop: '40px', borderTop: '1px solid #f5f5f5' }}>
            <p style={{ fontSize: '12px', color: '#ccc', fontWeight: 500 }}>© {new Date().getFullYear()} {site.name.toUpperCase()}. ALL RIGHTS RESERVED.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span style={{ fontSize: '10px', color: '#eee', fontWeight: 800 }}>POWERED BY</span>
               <a href="https://zenuxs.com" target="_blank" style={{ fontSize: '12px', fontWeight: 800, color: primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 ZENUXS WEB BUILDER <ExternalLink size={12} />
               </a>
            </div>
          </div>
       </div>
    </footer>
  );
}

// ─── Specialized Sections ────────────────────────
export function GallerySection({ site, images, primary, content, styles }: any) {
  const title = content?.title || "The Gallery";
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="serif" style={{ fontSize: '64px', textAlign: 'center', marginBottom: '80px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
        {images.map((img: any, i: number) => (
          <div key={i} className="reveal" style={{ animationDelay: `${i * 0.1}s`, borderRadius: '32px', overflow: 'hidden', height: '350px', background: '#f5f5f5' }}>
            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiscussionsSection({ site, discussions, primary, content, styles }: any) {
  const title = content?.title || "Community";
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 className="serif" style={{ fontSize: '64px', textAlign: 'center', marginBottom: '80px' }}>{title}</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {discussions.map((d: any) => (
          <div key={d._id} className="reveal" style={{ padding: '32px', borderRadius: '24px', background: '#fff', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{d.title}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Posted by {d.author}</p>
            </div>
            <Link href="/discussions" style={{ color: primary }}><ChevronRight /></Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSection({ site, primary, content, styles }: any) {
  const title = content?.title || "Rankings";
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="serif" style={{ fontSize: '64px', textAlign: 'center', marginBottom: '80px' }}>{title}</h2>
      <div style={{ background: '#fff', borderRadius: '40px', border: '1px solid #eee', overflow: 'hidden' }}>
         {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '24px 40px', borderBottom: i === 5 ? 'none' : '1px solid #eee', gap: '24px' }}>
              <span className="serif" style={{ fontSize: '32px', color: i <= 3 ? primary : '#eee', width: '40px' }}>{i}</span>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f5f5f5' }} />
              <span style={{ fontWeight: 700, flex: 1, fontSize: '18px' }}>Player {i}</span>
              <span className="outfit" style={{ fontWeight: 800, fontSize: '20px' }}>{10000 - i * 500} XP</span>
            </div>
         ))}
      </div>
    </div>
  );
}

export function FAQSection({ site, faqItems, primary, content, styles }: any) {
  const title = content?.title || "Intel Base";
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="serif" style={{ fontSize: '64px', textAlign: 'center', marginBottom: '80px' }}>{title}</h2>
      <div style={{ display: 'grid', gap: '24px' }}>
        {faqItems.map((item: any, i: number) => (
          <div key={i} style={{ padding: '40px', borderRadius: '32px', background: '#fff', border: '1px solid #eee' }}>
            <h3 className="serif" style={{ fontSize: '24px', marginBottom: '16px', color: primary }}>{item.question}</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormsSection({ site, forms, primary, content, styles }: any) {
  const title = content?.title || "Applications";
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 className="serif" style={{ fontSize: '64px', textAlign: 'center', marginBottom: '80px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
         {forms.map((f: any) => (
            <div key={f._id} className="reveal" style={{ padding: '40px', borderRadius: '32px', background: '#fff', border: '1px solid #eee' }}>
              <h3 className="serif" style={{ fontSize: '24px', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px', lineHeight: 1.6 }}>{f.description}</p>
              <Link href={`/form/${f._id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: primary, fontWeight: 700 }}>
                Begin Application <ArrowRight size={18} />
              </Link>
            </div>
         ))}
      </div>
    </div>
  );
}

export function TeamSection({ site, members, primary, content, styles }: any) {
  const title = content?.title || "Our Team";
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="serif" style={{ fontSize: '64px', textAlign: 'center', marginBottom: '80px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
         {members.map((m: any, i: number) => (
            <div key={i} style={{ textAlign: 'center' }}>
              {m.image ? (
                <img src={m.image.fullUrl || m.image.url || m.image} style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 24px', border: '1px solid #eee' }} />
              ) : (
                <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: '#f5f5f5', margin: '0 auto 24px', border: '1px solid #eee' }} />
              )}
              <h3 className="serif" style={{ fontSize: '24px' }}>{m.name}</h3>
              <p style={{ color: primary, fontWeight: 700, fontSize: '13px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.role}</p>
            </div>
         ))}
      </div>
    </div>
  );
}

export function TextSection({ site, heading, body, primary, content, styles }: any) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="serif" style={{ fontSize: '56px', marginBottom: '32px' }}>{heading}</h2>
      <p style={{ color: '#6b7280', lineHeight: 2, fontSize: '20px' }}>{body}</p>
    </div>
  );
}

export function FeaturesSection({ site, primary, content, styles }: any) {
  const title = content?.heading || "Excellence Refined.";
  const items = content?.items || [
    { title: 'Global Edge', description: 'Experience gameplay with zero boundaries, powered by titan-class infrastructure.' },
    { title: 'Pure Vision', description: 'A server built on principles of aesthetic perfection and mechanical balance.' },
    { title: 'Elite Support', description: 'Direct access to our architect team for a seamless gaming experience.' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      <h2 className="serif" style={{ fontSize: '56px', textAlign: 'center', marginBottom: '80px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '48px' }}>
        {items.map((item: any, i: number) => (
          <div key={i} className="reveal" style={{ animationDelay: `${i * 0.1}s`, padding: '48px', background: '#fff', borderRadius: '40px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: primary + '10', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
               <Star size={24} />
            </div>
            <h3 className="serif" style={{ fontSize: '24px', marginBottom: '16px' }}>{item.title}</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '15px' }}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormRenderer({ form, primary }: any) {
  return (
    <div style={{ padding: '80px 40px', maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '48px', border: '1px solid #eee', boxShadow: '0 40px 100px rgba(0,0,0,0.05)' }}>
      <h2 className="serif" style={{ fontSize: '40px', marginBottom: '16px' }}>{form.title}</h2>
      <p style={{ color: '#6b7280', marginBottom: '48px' }}>{form.description}</p>
      <div style={{ display: 'grid', gap: '24px' }}>
        {form.fields?.map((field: any, i: number) => (
          <div key={i}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1a1a2e', marginBottom: '10px' }}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #eee', outline: 'none', minHeight: '120px' }} placeholder="..." />
            ) : field.type === 'select' ? (
              <select style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #eee', outline: 'none' }}>
                {field.options?.map((opt: string, j: number) => <option key={j} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type={field.type || 'text'} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #eee', outline: 'none' }} placeholder="..." />
            )}
          </div>
        ))}
        <button style={{ background: '#1a1a2e', color: '#fff', padding: '20px', borderRadius: '20px', fontWeight: 700, fontSize: '16px', marginTop: '24px' }}>Submit Application</button>
      </div>
    </div>
  );
}