'use client';
import { 
  HeroSection, ServerStatusSection, StoreSection, NewsSection, 
  GallerySection, DiscussionsSection, FormsSection, 
  FAQSection, LeaderboardSection, TeamSection, TextSection,
  FeaturesSection, FormRenderer, OnlinePlayersSection 
} from './components';

export default function ThemedSectionRenderer({ section, theme, extras, primary }: any) {
  const { site, products, announcements, forms, discussions, mcData } = extras;
  const { type, content, styles, backgroundImage, backgroundStyle } = section;

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
    color: s.textColor || '#1a1a2e',
    position: 'relative',
    overflow: 'hidden',
    ...bgStyle
  };

  const overlayOpacity = s.overlayOpacity ?? (backgroundImage ? 0.45 : 0);

  const renderContent = () => {
    switch (type) {
      case 'Hero':
        return <HeroSection site={site} primary={primary} mcStatus={mcData} content={content} styles={styles} />;
      case 'ServerStats':
        return <ServerStatusSection site={site} mcStatus={mcData} primary={primary} content={content} styles={styles} />;
      case 'OnlinePlayers':
        return <OnlinePlayersSection site={site} mcStatus={mcData} primary={primary} content={content} />;
      case 'Store':
        return <StoreSection site={site} products={products} primary={primary} content={content} styles={styles} />;
      case 'Announcements':
        return <NewsSection site={site} announcements={announcements} primary={primary} content={content} styles={styles} />;
      case 'Gallery':
        return <GallerySection site={site} images={content?.images || []} primary={primary} content={content} styles={styles} />;
      case 'Discussions':
        return <DiscussionsSection site={site} discussions={discussions} primary={primary} content={content} styles={styles} />;
      case 'Leaderboard':
        return <LeaderboardSection site={site} primary={primary} content={content} styles={styles} />;
      case 'FAQ':
        return <FAQSection site={site} faqItems={content?.items || []} primary={primary} content={content} styles={styles} />;
      case 'Forms':
        return <FormsSection site={site} forms={forms} primary={primary} content={content} styles={styles} />;
      case 'Team':
        return <TeamSection site={site} members={content?.members || []} primary={primary} content={content} styles={styles} />;
      case 'Text':
        return <TextSection site={site} heading={content?.heading} body={content?.body} primary={primary} content={content} styles={styles} />;
      case 'Features':
        return <FeaturesSection site={site} primary={primary} content={content} styles={styles} />;
      case 'Custom':
        if (content?.formId) {
          const form = forms.find((f: any) => f._id === content.formId);
          if (form) return <div style={{ maxWidth: '800px', margin: '0 auto' }}><FormRenderer form={form} primary={primary} /></div>;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <section style={sectionContainerStyle}>
       {bgUrl && (
         <div style={{ 
           position: 'absolute', 
           inset: 0, 
           backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`, 
           zIndex: 1 
         }} />
       )}
       <div style={{ position: 'relative', zIndex: 2 }}>
         {renderContent()}
       </div>
    </section>
  );
}
