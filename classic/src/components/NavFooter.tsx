'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ExternalLink, Mail, Shield, Info, MessageSquare, PlayCircle, Send, Code, LogIn, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const BrandIcons = {
  Discord: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  ),
  Youtube: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Twitter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.84 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/>
    </svg>
  )
};

interface NavbarProps {
  site: any;
  pages: any[];
}

export function Navbar({ site, pages }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, socialLinks, name, authSettings } = site;
  const primary = theme.primaryColor;

  const socialButtons = [];
  if (socialLinks?.discord) socialButtons.push({ icon: <BrandIcons.Discord />, href: socialLinks.discord, color: '#5865F2' });
  if (socialLinks?.youtube) socialButtons.push({ icon: <BrandIcons.Youtube />, href: socialLinks.youtube, color: '#FF0000' });
  if (socialLinks?.twitter) socialButtons.push({ icon: <BrandIcons.Twitter />, href: socialLinks.twitter, color: '#1DA1F2' });

  const navPages = [...pages].sort((a, b) => {
    if (a.slug === 'home') return -1;
    if (b.slug === 'home') return 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        .nav-link {
          transition: all 0.2s;
          opacity: 0.7;
        }
        .nav-link:hover {
          opacity: 1;
          color: ${primary} !important;
        }
        .login-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${primary}40;
        }
      `}</style>
      
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: theme.backgroundColor + 'f2',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${primary}15`,
        padding: '0 24px',
        fontFamily: theme.font,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: '22px', letterSpacing: '-0.03em', color: theme.textColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.backgroundColor }}>
              {name.charAt(0)}
            </div>
            {name}
          </Link>

          {/* Desktop Nav */}
          <div className="nav-desktop" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {navPages.map(p => (
              <Link key={p.slug} href={p.slug === 'home' ? '/' : `/${p.slug}`} className="nav-link"
                style={{ fontSize: '14px', fontWeight: 600, color: theme.textColor, textDecoration: 'none' }}>
                {p.title}
              </Link>
            ))}
            
            <div style={{ width: '1px', height: '24px', background: theme.textColor + '15' }} />
            
            {authSettings?.enabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: theme.textColor }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: primary + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary }}>
                        <UserIcon size={14} />
                      </div>
                      {user.username}
                    </div>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: theme.textColor, opacity: 0.4, cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Logout">
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="login-btn" style={{ 
                    background: primary, 
                    color: theme.backgroundColor, 
                    padding: '8px 20px', 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    fontWeight: 800, 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <LogIn size={16} /> Login
                  </Link>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              {socialButtons.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ color: theme.textColor, opacity: 0.5, transition: '0.2s', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="nav-mobile-btn" onClick={() => setIsOpen(!isOpen)} 
            style={{ display: 'none', background: 'none', border: 'none', color: theme.textColor, cursor: 'pointer' }}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: theme.backgroundColor,
            borderBottom: `1px solid ${primary}15`,
            padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {navPages.map(p => (
              <Link key={p.slug} href={p.slug === 'home' ? '/' : `/${p.slug}`} onClick={() => setIsOpen(false)}
                style={{ fontSize: '16px', fontWeight: 700, color: theme.textColor, textDecoration: 'none' }}>
                {p.title}
              </Link>
            ))}

            {authSettings?.enabled && (
              <div style={{ paddingTop: '10px', borderTop: `1px solid ${theme.textColor}10` }}>
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 700, color: theme.textColor }}>
                      <UserIcon size={18} /> {user.username}
                    </div>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700 }}>Logout</button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)} style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', color: primary, fontWeight: 800, textDecoration: 'none' 
                  }}>
                    <LogIn size={20} /> Login with Advanced Auth
                  </Link>
                )}
              </div>
            )}

            <div style={{ paddingTop: '10px', borderTop: `1px solid ${theme.textColor}10`, display: 'flex', gap: '20px' }}>
              {socialButtons.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: theme.textColor }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export function Footer({ site }: { site: any }) {
  const { theme, socialLinks, name, plan } = site;
  const primary = theme.primaryColor;

  return (
    <footer style={{ 
      padding: '80px 24px 40px', 
      background: theme.backgroundColor, 
      borderTop: `1px solid ${primary}10`,
      fontFamily: theme.font,
      color: theme.textColor
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '48px',
          marginBottom: '60px'
        }}>
          {/* Brand Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link href="/" style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-0.04em', color: theme.textColor, textDecoration: 'none' }}>
              {name}
            </Link>
            <p style={{ fontSize: '14px', opacity: 0.5, lineHeight: 1.6, maxWidth: '300px' }}>
              The ultimate Minecraft community experience. Built with passion for players worldwide.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              {socialLinks?.discord && <a href={socialLinks.discord} target="_blank" style={{ color: primary, opacity: 0.8 }}><BrandIcons.Discord /></a>}
              {socialLinks?.twitter && <a href={socialLinks.twitter} target="_blank" style={{ color: primary, opacity: 0.8 }}><BrandIcons.Twitter /></a>}
              {socialLinks?.youtube && <a href={socialLinks.youtube} target="_blank" style={{ color: primary, opacity: 0.8 }}><BrandIcons.Youtube /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', color: primary }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Home', 'Store', 'Leaderboard', 'Rules'].map(l => (
                <Link key={l} href={l === 'Home' ? '/' : `/${l.toLowerCase()}`} style={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>{l}</Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', color: primary }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}><Mail size={14}/> Contact Us</a>
              <a href="#" style={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}><Shield size={14}/> Privacy Policy</a>
              <a href="#" style={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}><Info size={14}/> About Zenuxs</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          paddingTop: '40px', 
          borderTop: `1px solid ${theme.textColor}10`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px'
        }}>
          <p style={{ fontSize: '13px', opacity: 0.4 }}>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Powered by</span>
            <a href="https://zenuxs.com" target="_blank" style={{ 
              fontSize: '13px', 
              fontWeight: 800, 
              color: primary, 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: '0.2s'
            }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              ZENUXS WEB BUILDER <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
