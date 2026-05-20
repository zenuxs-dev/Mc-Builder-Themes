import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import { notFound } from 'next/navigation';
import ThemedSectionRenderer from '../ThemedSectionRenderer';
import { Navbar, Footer } from '../components';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, 'gallery'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  if (!pageData) notFound();

  const primary = site.theme.primaryColor || '#1a1a2e';
  const sections = (pageData.sections || []).filter((s: any) => s.visible).sort((a: any, b: any) => a.order - b.order);
  const extras = { site, products, announcements, forms, discussions, mcData: mcStatus };

  return (
    <div className="outfit" style={{ minHeight: '100vh', background: '#fff' }}>
      <main style={{ paddingBottom: '120px' }}>
        {sections.map((section: any, i: number) => (
          <ThemedSectionRenderer key={i} section={section} theme={site.theme} extras={extras} primary={primary} />
        ))}
        <Footer site={site} primary={primary} />
      </main>
      <Navbar site={site} pages={pages} primary={primary} mcStatus={mcStatus} />
    </div>
  );
}
