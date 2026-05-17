import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import { notFound } from 'next/navigation';
import ThemedSectionRenderer from '../ThemedSectionRenderer';
import { Navbar, Footer } from '../components';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, 'leaderboard'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  if (!pageData) notFound();

  const accent = site.theme.primaryColor || '#00ff88';
  const sections = (pageData.sections || []).filter((s: any) => s.visible).sort((a: any, b: any) => a.order - b.order);
  const extras = { site, products, announcements, forms, discussions, mcData: mcStatus };

  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      <Navbar site={site} pages={pages} accent={accent} mcStatus={mcStatus} />
      <main style={{ paddingTop: '100px' }}>
        {sections.map((section: any, i: number) => (
          <ThemedSectionRenderer key={i} section={section} theme={site.theme} extras={extras} accent={accent} />
        ))}
      </main>
      <Footer site={site} accent={accent} />
    </div>
  );
}
