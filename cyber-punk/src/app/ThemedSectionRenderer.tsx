'use client';
import { 
  HeroSection, ServerStatus, StorePreview, NewsSection, 
  GallerySection, DiscussionsSection, LeaderboardSection, 
  FAQSection, FormsSection, TeamSection, TextSection,
  FeaturesSection, FormRenderer, OnlinePlayers 
} from './components';

export default function ThemedSectionRenderer({ section, theme, extras, accent }: any) {
  const { site, products, announcements, forms, discussions, mcData } = extras;
  const { type, content, styles, backgroundImage, backgroundStyle } = section;

  // Shared container styles from primary frontend
  const s = styles || {};
  const bgUrl = typeof backgroundImage === 'string' 
    ? backgroundImage 
    : (backgroundImage as any)?.fullUrl || (backgroundImage as any)?.url || '';

  const bgStyle = bgUrl ? {
    backgroundImage: `url(${bgUrl})`,
    backgroundSize: backgroundStyle === 'contain' ? 'contain' : backgroundStyle === 'repeat' ? 'auto' : 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: backgroundStyle === 'fixed' ? 'fixed' : 'scroll',
    backgroundRepeat: backgroundStyle === 'repeat' ? 'repeat' : 'no-repeat',
  } : {};

  const sectionContainerStyle: React.CSSProperties = {
    paddingTop: s.paddingTop || (type === 'Hero' ? '0' : '100px'),
    paddingBottom: s.paddingBottom || (type === 'Hero' ? '0' : '100px'),
    textAlign: (s.textAlign as any) || 'left',
    backgroundColor: s.backgroundColor || 'transparent',
    color: s.textColor || '#fff',
    position: 'relative',
    overflow: 'hidden',
    fontSize: s.fontSize || '16px',
    ...bgStyle
  };

  const overlayOpacity = s.overlayOpacity ?? (backgroundImage ? 0.45 : 0);

  const renderContent = () => {
    switch (type) {
      case 'Hero':
        return <HeroSection site={site} accent={accent} mcStatus={mcData} content={content} styles={styles} />;
      case 'ServerStats':
        return <ServerStatus site={site} mcStatus={mcData} accent={accent} content={content} styles={styles} />;
      case 'OnlinePlayers':
        return <OnlinePlayers site={site} mcStatus={mcData} accent={accent} content={content} />;
      case 'Store':
        return <StorePreview site={site} products={products} accent={accent} content={content} styles={styles} />;
      case 'Announcements':
        return <NewsSection site={site} announcements={announcements} accent={accent} content={content} styles={styles} />;
      case 'Gallery':
        return <GallerySection site={site} images={content?.images || []} accent={accent} content={content} styles={styles} />;
      case 'Discussions':
        return <DiscussionsSection site={site} discussions={discussions} accent={accent} content={content} styles={styles} />;
      case 'Leaderboard':
        return <LeaderboardSection site={site} accent={accent} content={content} styles={styles} />;
      case 'FAQ':
        return <FAQSection site={site} faqItems={content?.items || []} accent={accent} content={content} styles={styles} />;
      case 'Forms':
        return <FormsSection site={site} forms={forms} accent={accent} content={content} styles={styles} />;
      case 'Team':
        return <TeamSection site={site} members={content?.members || []} accent={accent} content={content} styles={styles} />;
      case 'Text':
        return <TextSection site={site} heading={content?.heading} body={content?.body} accent={accent} content={content} styles={styles} />;
      case 'Features':
        return <FeaturesSection site={site} accent={accent} content={content} styles={styles} />;
      case 'Custom':
        if (content?.formId) {
          const form = forms.find((f: any) => f._id === content.formId);
          if (form) return <div style={{ maxWidth: '800px', margin: '0 auto' }}><FormRenderer form={form} accent={accent} /></div>;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <section style={sectionContainerStyle}>
       {/* Overlay for background images */}
       {bgUrl && (
         <div style={{ 
           position: 'absolute', 
           inset: 0, 
           backgroundColor: `rgba(5, 5, 8, ${overlayOpacity})`, 
           zIndex: 1 
         }} />
       )}
       
       {/* Content layer */}
       <div style={{ position: 'relative', zIndex: 2 }}>
         {renderContent()}
       </div>
    </section>
  );
}
