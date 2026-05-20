import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import { HeroSection, StorePreview, ServerStatus, NewsSection, Navbar, Footer } from './components';
import ThemedSectionRenderer from './ThemedSectionRenderer';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const site = await getSite();
  if (!site) return <div>Config Error</div>;

  const { theme } = site;
  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, 'home'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  const accent = theme.primaryColor || '#00ff88';
  const sections = (pageData?.sections || []).filter((s: any) => s.visible).sort((a: any, b: any) => a.order - b.order);
  const extras = { site, products, announcements, forms, discussions, mcData: mcStatus };

  return (
    <>
      <Navbar site={site} pages={pages} accent={accent} mcStatus={mcStatus} />
      <main>
        {sections.length > 0 ? (
          sections.map((s: any, i: number) => (
            <ThemedSectionRenderer key={i} section={s} theme={theme} extras={extras} accent={accent} />
          ))
        ) : (
          <>
            <HeroSection site={site} accent={accent} mcStatus={mcStatus} />
            <ServerStatus site={site} mcStatus={mcStatus} accent={accent} />
            <StorePreview site={site} products={products} accent={accent} />
            <NewsSection site={site} announcements={announcements} accent={accent} />
          </>
        )}
        <Footer site={site} accent={accent} />
      </main>
    </>
  );
}