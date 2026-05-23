import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import { notFound } from 'next/navigation';
import ThemedSectionRenderer from '../ThemedSectionRenderer';
import { Navbar, Sidebar, Footer } from '../components';

export const dynamic = 'force-dynamic';

export default async function AnnouncementsPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, 'announcements'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  if (!pageData) notFound();

  const primary = site.theme.primaryColor || '#e74c3c';
  const sections = (pageData.sections || []).filter((s: any) => s.visible).sort((a: any, b: any) => a.order - b.order);
  const extras = { site, products, announcements, forms, discussions, mcData: mcStatus };

  return (
    <>
      <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/announcements" />
        <main className="bc-main">
          {sections.map((section: any, i: number) => (
            <ThemedSectionRenderer key={i} section={section} theme={site.theme} extras={extras} primary={primary} />
          ))}
        </main>
      </div>
      <Footer site={site} primary={primary} />
    </>
  );
}
