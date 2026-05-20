'use client';
import { useState } from 'react';

interface Theme {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: string;
  font: string;
  fontSizeBase?: string;
  headingFont?: string;
  borderRadius?: string;
  containerWidth?: string;
}

interface Section {
  _id: string;
  type: string;
  visible: boolean;
  order: number;
  content: Record<string, any>;
  backgroundImage?: string;
  backgroundStyle?: string;
  styles?: {
    paddingTop?: string;
    paddingBottom?: string;
    textAlign?: string;
    backgroundColor?: string;
    textColor?: string;
    overlayOpacity?: number;
    borderRadius?: string;
    fontSize?: string;
  };
}

interface Props {
  section: Section;
  theme: Theme;
  extras?: any;
}

const btnRadius: Record<string, string> = {
  rounded: '12px', square: '4px', pill: '9999px',
};

export default function SectionRenderer({ section, theme, extras }: Props) {
  const [copied, setCopied] = useState(false);
  const { primaryColor, backgroundColor, textColor, buttonStyle, font, fontSizeBase, containerWidth } = theme;
  const radius = btnRadius[buttonStyle] || '12px';

  const bgUrl = typeof section.backgroundImage === 'string' 
    ? section.backgroundImage 
    : (section.backgroundImage as any)?.fullUrl || (section.backgroundImage as any)?.url || '';

  const bgStyle = bgUrl ? {
    backgroundImage: `url(${bgUrl})`,
    backgroundSize: section.backgroundStyle === 'contain' ? 'contain' : section.backgroundStyle === 'repeat' ? 'auto' : 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: section.backgroundStyle === 'fixed' ? 'fixed' : 'scroll',
    backgroundRepeat: section.backgroundStyle === 'repeat' ? 'repeat' : 'no-repeat',
  } : {};

  const s = section.styles || {};
  const sectionStyle: React.CSSProperties = {
    paddingTop: s.paddingTop || (section.type === 'Hero' ? '120px' : '80px'),
    paddingBottom: s.paddingBottom || (section.type === 'Hero' ? '120px' : '80px'),
    textAlign: (s.textAlign as any) || 'center',
    backgroundColor: s.backgroundColor || 'transparent',
    color: s.textColor || textColor,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: font,
    fontSize: s.fontSize || fontSizeBase || '16px',
    ...bgStyle
  };

  const overlayOpacity = s.overlayOpacity ?? (section.backgroundImage ? 0.45 : 0);

  const Btn = ({ children, href }: { children: React.ReactNode; href?: string }) => {
    const style = {
      backgroundColor: primaryColor, color: backgroundColor, borderRadius: radius,
      padding: '12px 28px', fontWeight: 700, fontSize: '14px',
      display: 'inline-block', cursor: 'pointer', textDecoration: 'none',
      border: 'none', transition: 'opacity 0.15s',
    };
    if (href) return <a href={href} style={style}>{children}</a>;
    return <button style={style}>{children}</button>;
  };

  switch (section.type) {
    case 'Hero': {
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          {!section.backgroundImage && !s.backgroundColor && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 50% -10%, ${primaryColor}33 0%, transparent 60%)` }} />
          )}
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', opacity: 0.4, marginBottom: '24px', textTransform: 'uppercase' }}>Minecraft Server</p>
            <h1 style={{ fontSize: 'clamp(40px,6vw,80px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: '24px', color: textColor }}>
              {section.content.title || 'Your Server Name'}
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.55, maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7, color: textColor }}>
              {section.content.subtitle || 'Join thousands of players on the best server experience.'}
            </p>
            {(() => {
              const buttons = section.content?.buttons && section.content.buttons.length > 0
                ? section.content.buttons
                : section.content?.buttonText ? [{ text: section.content.buttonText, url: section.content.buttonUrl }] : [];

              const javaIp = extras?.site?.serverIp ? (extras.site.serverIp + (extras.site.requirePortInJava && extras.site.serverPort ? `:${extras.site.serverPort}` : '')) : '';

              const copyIp = () => {
                navigator.clipboard.writeText(javaIp || 'mc.server.com');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              };

              return (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '18px', flexWrap: 'wrap' }}>
                  {buttons.map((b: any, i: number) => (
                    <Btn key={i} href={b.url || '#'}>{b.text}</Btn>
                  ))}
                  
                  <button onClick={copyIp} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: textColor, borderRadius: radius, padding: '12px 28px', fontWeight: 700, fontSize: '14px', border: `1px solid ${primaryColor}40`, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: extras?.mcData?.online ? '#22c55e' : '#ef4444', boxShadow: `0 0 10px ${extras?.mcData?.online ? '#22c55e' : '#ef4444'}` }} />
                     {copied ? 'Copied!' : (javaIp || 'mc.server.com')}
                  </button>
                </div>
              );
            })()}
          </div>
        </section>
      );
    }

    case 'ServerStats': {
      const { mcData } = extras || {};
      const stats = [
        { label: 'Players Online', value: mcData?.online ? String(mcData.players?.online ?? 0) : '—' },
        { label: 'Max Players', value: mcData?.online ? String(mcData.players?.max ?? 0) : '—' },
        { label: 'Version', value: mcData?.online ? (mcData.version?.name || '1.x') : 'Offline' },
        { label: 'Status', value: mcData?.online ? '✓ Online' : '✗ Offline' },
      ];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '48px', color: textColor }}>
              {section.content.heading || 'Server Info'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ padding: '28px', borderRadius: '20px', background: primaryColor + '12', border: `1px solid ${primaryColor}30`, textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', fontWeight: 900, color: textColor }}>{s.value}</p>
                  <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: textColor }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: primaryColor + '15', border: `1px solid ${primaryColor}40`, padding: '16px 32px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: primaryColor, background: primaryColor + '20', padding: '4px 8px', borderRadius: '6px' }}>Java</span>
                <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, color: textColor }}>
                  {extras?.site?.serverIp || section.content.serverIp}{extras?.site?.requirePortInJava && extras?.site?.serverPort ? `:${extras.site.serverPort}` : ''}
                </span>
              </div>
              
              {extras?.site?.bedrockSupported && (
                <div style={{ background: primaryColor + '08', border: `1px solid ${primaryColor}20`, padding: '16px 32px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', background: '#10b98120', padding: '4px 8px', borderRadius: '6px' }}>Bedrock</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: textColor }}>
                      {extras.site.bedrockIp || extras.site.serverIp || section.content.serverIp}
                    </span>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: primaryColor + '30' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: textColor }}>Port</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: textColor }}>{extras.site.bedrockPort || 19132}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    case 'OnlinePlayers': {
      const { mcData } = extras || {};
      const players: string[] = mcData?.players?.list || [];
      return (
        <section style={{ padding: '80px 40px', fontFamily: font, ...bgStyle }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px', color: textColor }}>
              {section.content.heading || 'Online Players'}
            </h2>
            <p style={{ fontSize: '48px', fontWeight: 900, color: primaryColor, marginBottom: '32px' }}>
              {mcData?.online ? mcData.players?.online ?? 0 : '—'}
            </p>
            {players.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {players.slice(0, 20).map((p: string, i: number) => (
                  <span key={i} style={{ padding: '6px 12px', borderRadius: '8px', background: primaryColor + '15', color: textColor, fontSize: '13px', fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'Store': {
      const products = extras?.products || [];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px', color: textColor }}>
                {section.content.heading || 'Server Store'}
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.5, color: textColor }}>{section.content.subheading || 'Get exclusive perks and support the server'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '20px' }}>
              {(products.length > 0 ? products : [
                { name: 'VIP', price: 199, description: 'Basic rank perks' },
                { name: 'MVP+', price: 499, description: 'Advanced commands & fly' },
                { name: 'Legend', price: 999, description: 'Full access + custom tag' },
              ]).map((p: any, i: number) => (
                <div key={i} style={{ background: backgroundColor, border: `1px solid ${primaryColor}25`, borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>{'💎⚔️🔥👑🎯⚡'[i % 6]}</div>
                  <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px', color: textColor }}>{p.name}</h3>
                  <p style={{ fontSize: '13px', opacity: 0.5, flex: 1, marginBottom: '20px', color: textColor }}>{p.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: textColor }}>₹{p.price}</span>
                    <Btn>Buy</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Announcements': {
      const allAnnouncements = extras?.announcements || [];
      const limit = section.content.limit ? Number(section.content.limit) : 0;
      const announcements = limit > 0 ? allAnnouncements.slice(0, limit) : allAnnouncements;
      return (
        <section style={{ padding: '80px 40px', fontFamily: font, ...bgStyle }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '48px', color: textColor }}>
              {section.content.heading || 'Latest Updates'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(announcements.length > 0 ? announcements : [
                { title: 'Sample Announcement', content: 'This is a placeholder. Create real ones in your dashboard.', createdAt: new Date().toISOString() },
              ]).map((a: any, i: number) => (
                <div key={i} style={{ padding: '24px', borderRadius: '16px', background: primaryColor + '08', border: `1px solid ${primaryColor}20`, display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryColor, marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '16px', color: textColor }}>{a.title}</h3>
                      <span style={{ fontSize: '11px', opacity: 0.4, whiteSpace: 'nowrap', color: textColor }}>{new Date(a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p style={{ fontSize: '14px', opacity: 0.6, lineHeight: 1.6, color: textColor }}>{a.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {limit > 0 && allAnnouncements.length > limit && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <a href="/announcements" style={{ color: primaryColor, fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                  View all {allAnnouncements.length} announcements →
                </a>
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'Gallery': {
      const images: any[] = section.content.images || [];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '48px', color: textColor }}>
              {section.content.heading || 'Gallery'}
            </h2>
            {images.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.3, color: textColor }}>No images yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                {images.map((img: any, i: number) => (
                  <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                    <img src={img.fullUrl || img.url} alt={img.caption || ''} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                    {img.caption && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(transparent,rgba(0,0,0,0.7))' }}>
                        <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'Features': {
      const items: any[] = section.content.items || [];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '56px', color: textColor }}>
              {section.content.heading || 'Features'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '24px' }}>
                    {(items.length > 0 ? items : [
                      { icon: '', title: 'Custom Gameplay', description: 'Unique plugins and game modes' },
                      { icon: '', title: 'Active Community', description: 'Thousands of players online daily' },
                      { icon: '', title: '24/7 Support', description: 'Staff always ready to help' },
                    ]).map((item: any, i: number) => (
                      <div key={i} style={{ padding: '32px', borderRadius: '20px', background: primaryColor + '08', border: `1px solid ${primaryColor}20`, textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                          <img src="/images/feature-placeholder.svg" alt="icon" style={{ width: '48px', height: '48px', display: 'inline-block' }} />
                        </div>
                        <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '10px', color: textColor }}>{item.title}</h3>
                        <p style={{ fontSize: '14px', opacity: 0.55, lineHeight: 1.6, color: textColor }}>{item.description}</p>
                      </div>
                    ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Team': {
      const members: any[] = section.content.members || [];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '56px', color: textColor }}>
              {section.content.heading || 'Our Team'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '32px' }}>
              {(members.length > 0 ? members : [
                { name: 'Admin', role: 'Owner', description: 'Server founder' },
              ]).map((m: any, i: number) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  {m.image ? (
                    <img src={typeof m.image === 'string' ? m.image : (m.image?.fullUrl || m.image?.url || '')} alt={m.name} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: `3px solid ${primaryColor}40` }} />
                  ) : (
                      <div style={{ margin: '0 auto 16px' }}>
                        <img src="/images/avatar-placeholder.svg" alt="placeholder" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', display: 'block', border: `3px solid ${primaryColor}30` }} />
                      </div>
                  )}
                  <h3 style={{ fontWeight: 800, fontSize: '16px', color: textColor, marginBottom: '4px' }}>{m.name}</h3>
                  <p style={{ fontSize: '12px', color: primaryColor, fontWeight: 600, marginBottom: '8px' }}>{m.role}</p>
                  {m.description && <p style={{ fontSize: '13px', opacity: 0.5, color: textColor, lineHeight: 1.5 }}>{m.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Text': {
      const size = section.content?.fontSize || 'normal';
      const fSize = size === 'small' ? '0.875em' : size === 'large' ? '1.25em' : '1em';
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            {section.content.heading && (
              <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '32px', color: textColor }}>
                {section.content.heading}
              </h2>
            )}
            <div style={{ fontSize: fSize, lineHeight: 1.8, opacity: 0.75, color: textColor, whiteSpace: 'pre-wrap' }}>
              {section.content.body || ''}
            </div>
            {(() => {
              const buttons = section.content?.buttons && section.content.buttons.length > 0
                ? section.content.buttons
                : section.content?.buttonText ? [{ text: section.content.buttonText, url: section.content.buttonUrl }] : [];
              if (buttons.length === 0) return null;
              return (
                <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {buttons.map((b: any, i: number) => (
                    <Btn key={i} href={b.url || '#'}>{b.text}</Btn>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>
      );
    }

    case 'FAQ': {
      const items: any[] = section.content.items || [];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '56px', color: textColor }}>
              {section.content.heading || 'FAQ'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(items.length > 0 ? items : [
                { question: 'How do I join?', answer: 'Add our server IP to your Minecraft multiplayer list.' },
                { question: 'What version?', answer: 'We support Java Edition 1.20+.' },
              ]).map((item: any, i: number) => (
                <FAQItem key={i} item={item} primaryColor={primaryColor} textColor={textColor} />
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'Forms': {
      const forms = extras?.forms || [];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '48px', color: textColor }}>
              {section.content.heading || 'Applications'}
            </h2>
            {forms.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.3, color: textColor }}>No forms available yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {forms.map((f: any, i: number) => (
                  <div key={i} style={{ padding: '28px', borderRadius: '16px', background: primaryColor + '08', border: `1px solid ${primaryColor}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '18px', color: textColor, marginBottom: '6px' }}>{f.title || f.name}</h3>
                      {f.description && <p style={{ fontSize: '14px', opacity: 0.55, color: textColor }}>{f.description}</p>}
                      <p style={{ fontSize: '12px', opacity: 0.35, color: textColor, marginTop: '6px' }}>{f.fields?.length || 0} fields</p>
                    </div>
                    <Btn href={`/form/${f._id}`}>Apply</Btn>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'Discussions': {
      const discussions = extras?.discussions || [];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: containerWidth || '1200px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', color: textColor }}>
                {section.content.heading || 'Discussions'}
              </h2>
              <Btn href="/discussions/new">Start Discussion</Btn>
            </div>
            {discussions.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.3, color: textColor }}>No discussions yet. Be the first!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {discussions.map((d: any, i: number) => (
                  <a key={i} href={`/discussions/${d._id}`} style={{ textDecoration: 'none', display: 'block', padding: '20px 24px', borderRadius: '14px', background: primaryColor + '06', border: `1px solid ${primaryColor}18`, transition: 'border-color 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '16px', color: textColor, marginBottom: '4px' }}>{d.title}</h3>
                        <p style={{ fontSize: '13px', opacity: 0.5, color: textColor }}>by {d.authorName}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', opacity: 0.4, color: textColor, flexShrink: 0 }}>
                        <span>Replies {d.comments?.length || 0}</span>
                        <span>Likes {d.likes || 0}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'Leaderboard': {
      const fakeLeaders = [
        { name: 'Zenuxs_Owner', score: 15420, rank: 1, avatar: 'https://minotar.net/avatar/Zenuxs_Owner/48' },
        { name: 'Dream', score: 12150, rank: 2, avatar: 'https://minotar.net/avatar/Dream/48' },
        { name: 'Technoblade', score: 11840, rank: 3, avatar: 'https://minotar.net/avatar/Technoblade/48' },
        { name: 'Grian', score: 9520, rank: 4, avatar: 'https://minotar.net/avatar/Grian/48' },
        { name: 'MumboJumbo', score: 8740, rank: 5, avatar: 'https://minotar.net/avatar/MumboJumbo/48' },
      ];
      return (
        <section style={sectionStyle}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})`, zIndex: 0 }} />
          <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px', color: textColor }}>
                {section.content.heading || 'Top Players'}
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.5, color: textColor }}>Server rankings updated every hour</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {fakeLeaders.map((p, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px', 
                  padding: '16px 24px', 
                  borderRadius: '20px', 
                  background: i < 3 ? primaryColor + '15' : 'rgba(255,255,255,0.02)', 
                  border: `1px solid ${i < 3 ? primaryColor + '30' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: i < 3 ? primaryColor : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: i < 3 ? backgroundColor : textColor }}>
                    {i + 1}
                  </div>
                  <img src={p.avatar} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '10px', border: i < 3 ? `2px solid ${primaryColor}` : 'none' }} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: '16px', color: textColor }}>{p.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 900, color: primaryColor, fontSize: '18px' }}>{p.score.toLocaleString()}</p>
                    <p style={{ fontSize: '10px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Btn href="/leaderboard">View Full Leaderboard</Btn>
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

function FAQItem({ item, primaryColor, textColor }: { item: any; primaryColor: string; textColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: '14px', background: primaryColor + '06', border: `1px solid ${primaryColor}18`, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px' }}
      >
        <span style={{ fontWeight: 700, fontSize: '15px', color: textColor }}>{item.question}</span>
        <span style={{ color: primaryColor, fontSize: '20px', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 24px 20px', fontSize: '14px', opacity: 0.65, lineHeight: 1.7, color: textColor }}>
          {item.answer}
        </div>
      )}
    </div>
  );
}
