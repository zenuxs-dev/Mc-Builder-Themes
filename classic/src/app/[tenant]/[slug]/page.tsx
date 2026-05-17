import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { Navbar, Footer } from '@/components/NavFooter';

interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

export default async function TenantSubPage({ params }: Props) {
  const { tenant, slug } = await params;
  const site = await getSite();

  if (!site) notFound();

  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, slug),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  if (!pageData) notFound();

  const sections = (pageData.sections || [])
    .filter((s: any) => s.visible)
    .sort((a: any, b: any) => a.order - b.order);

  const extras = { products, announcements, forms, discussions, mcData: mcStatus };

  return (
    <div style={{ minHeight: '100vh', background: site.theme.backgroundColor, color: site.theme.textColor, fontFamily: site.theme.font }}>
      <Navbar site={site} pages={pages} />
      {sections.map((section: any) => (
        <SectionRenderer key={section._id} section={section} theme={site.theme} extras={extras} />
      ))}
      <Footer site={site} />
    </div>
  );
}
