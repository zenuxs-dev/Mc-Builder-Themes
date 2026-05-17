import { getSite, getPages } from '@/lib/api';
import { Navbar, Footer } from '@/components/NavFooter';
import { Trophy, Medal, Crown, Star, Target, Zap } from 'lucide-react';

export default async function LeaderboardPage() {
  const site = await getSite();
  if (!site) return null;

  const [pages] = await Promise.all([
    getPages(site._id),
  ]);
  
  const { theme } = site;
  const primary = theme.primaryColor;

  const categories = [
    { title: 'Top Kills', icon: <Target size={20} />, data: [
      { name: 'Zenuxs_Owner', value: '24,502', rank: 1, avatar: 'https://minotar.net/avatar/Zenuxs_Owner/64' },
      { name: 'Dream', value: '21,150', rank: 2, avatar: 'https://minotar.net/avatar/Dream/64' },
      { name: 'Technoblade', value: '20,840', rank: 3, avatar: 'https://minotar.net/avatar/Technoblade/64' },
      { name: 'Grian', value: '18,520', rank: 4, avatar: 'https://minotar.net/avatar/Grian/64' },
      { name: 'MumboJumbo', value: '17,740', rank: 5, avatar: 'https://minotar.net/avatar/MumboJumbo/64' },
    ]},
    { title: 'Playtime', icon: <Star size={20} />, data: [
      { name: 'Notch', value: '1,420h', rank: 1, avatar: 'https://minotar.net/avatar/Notch/64' },
      { name: 'Jeb_', value: '1,150h', rank: 2, avatar: 'https://minotar.net/avatar/Jeb_/64' },
      { name: 'Dinnerbone', value: '940h', rank: 3, avatar: 'https://minotar.net/avatar/Dinnerbone/64' },
      { name: 'Griffin', value: '820h', rank: 4, avatar: 'https://minotar.net/avatar/Griffin/64' },
      { name: 'Sparky', value: '740h', rank: 5, avatar: 'https://minotar.net/avatar/Sparky/64' },
    ]},
    { title: 'Economy', icon: <Zap size={20} />, data: [
      { name: 'Richie', value: '₹2.4M', rank: 1, avatar: 'https://minotar.net/avatar/Richie/64' },
      { name: 'Merchant', value: '₹1.9M', rank: 2, avatar: 'https://minotar.net/avatar/Merchant/64' },
      { name: 'Trader', value: '₹1.5M', rank: 3, avatar: 'https://minotar.net/avatar/Trader/64' },
      { name: 'Farmer', value: '₹1.2M', rank: 4, avatar: 'https://minotar.net/avatar/Farmer/64' },
      { name: 'Miner', value: '₹850K', rank: 5, avatar: 'https://minotar.net/avatar/Miner/64' },
    ]}
  ];
  const Btn = ({ children, href }: { children: React.ReactNode; href?: string }) => {
    const style = {
      backgroundColor: primary, color: theme.backgroundColor, borderRadius: '12px',
      padding: '12px 28px', fontWeight: 800, fontSize: '14px',
      display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none',
      border: 'none', transition: 'all 0.2s',
      boxShadow: `0 4px 12px ${primary}30`
    };
    if (href) return <a href={href} style={style} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{children}</a>;
    return <button style={style}>{children}</button>;
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.font }}>
      <Navbar site={site} pages={pages} />
      
      <div style={{ 
        padding: '100px 24px',
        background: `radial-gradient(circle at 50% 0%, ${primary}15 0%, transparent 50%)`,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '10px 24px', 
              borderRadius: '99px', 
              background: primary + '10', 
              border: `1px solid ${primary}20`,
              color: primary,
              fontSize: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '24px'
            }}>
              <Trophy size={18} /> Global Hall of Fame
            </div>
            <h1 style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '24px' }}>Server Leaderboards</h1>
            <p style={{ fontSize: '18px', opacity: 0.5, maxWidth: '600px', margin: '0 auto' }}>Track the top performers across our entire network. Updated in real-time from server data.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
            {categories.map((cat, ci) => (
              <div key={ci} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: '32px',
                padding: '32px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: primary, color: theme.backgroundColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{cat.title}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cat.data.map((p, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      padding: '16px', 
                      borderRadius: '20px', 
                      background: i === 0 ? primary + '10' : 'transparent',
                      border: `1px solid ${i === 0 ? primary + '20' : 'transparent'}`
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '14px', 
                        fontWeight: 900,
                        color: i === 0 ? primary : 'inherit',
                        opacity: i === 0 ? 1 : 0.3
                      }}>
                        {i === 0 ? <Crown size={18} /> : i + 1}
                      </div>
                      <img src={p.avatar} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 800, fontSize: '15px' }}>{p.name}</p>
                        <p style={{ fontSize: '12px', opacity: 0.4 }}>Global Player</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 900, color: i === 0 ? primary : 'inherit', fontSize: '18px' }}>{p.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer site={site} />
    </div>
  );
}
