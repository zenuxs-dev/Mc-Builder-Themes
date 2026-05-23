import {
  Navbar,
  Sidebar,
  HeroSection,
  ServerStatusSection,
  StoreSection,
  Footer,
  NewsSection,
} from './components';

import {
  getSite,
  getPage,
  getPages,
  getProducts,
  getAnnouncements,
  getServerStatus,
  getForms,
  getDiscussions,
} from '@/lib/api';

import ThemedSectionRenderer from './ThemedSectionRenderer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const site = await getSite();

  if (!site) {
    return <div>Config Error</div>;
  }

  const { theme } = site;

  const [
    pageData,
    pages,
    products,
    announcements,
    forms,
    discussions,
    mcStatus,
  ] = await Promise.all([
    getPage(site._id, 'home'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp
      ? getServerStatus(site.serverIp)
      : Promise.resolve({ online: false }),
  ]);

  const primary = theme.primaryColor || '#1a1a2e';

  const sections = (pageData?.sections || [])
    .filter((s: any) => s.visible)
    .sort((a: any, b: any) => a.order - b.order);

  const extras = {
    site,
    products,
    announcements,
    forms,
    discussions,
    mcData: mcStatus,
  };

  return (
    <>
      <Navbar
        site={site}
        pages={pages}
        primary={primary}
        mcStatus={mcStatus}
      />

      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/" />

        <main className="bc-main">
          {sections.length > 0 ? (
            sections.map((section: any, index: number) => (
              <ThemedSectionRenderer
                key={section._id || index}
                section={section}
                theme={site.theme}
                extras={extras}
                primary={primary}
              />
            ))
          ) : (
            <>
              <HeroSection
                site={site}
                mcStatus={mcStatus}
                primary={primary}
              />

              <ServerStatusSection
                site={site}
                mcStatus={mcStatus}
                primary={primary}
              />

              <StoreSection
                site={site}
                products={products}
                primary={primary}
              />

              <NewsSection
                site={site}
                announcements={announcements}
                primary={primary}
              />
            </>
          )}
        </main>
      </div>

      <Footer site={site} primary={primary} />
    </>
  );
}