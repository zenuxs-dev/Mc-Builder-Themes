import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import { notFound } from 'next/navigation';
import SectionRenderer from '@/components/SectionRenderer';
import { Navbar, Footer } from '@/components/NavFooter';
import FormRenderer from '@/components/FormRenderer';

interface Props { params: Promise<{ id: string }> }

export default async function FormDetail({ params }: Props) {
  const { id } = await params;
  const site = await getSite();
  if (!site) notFound();

  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, 'forms'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  if (!pageData) notFound();

  const form = (forms || []).find((f: any) => f._id === id);
  if (!form) notFound();

  const extras = { products, announcements, forms, discussions, mcData: mcStatus };

  return (
    <div style={{ minHeight: '100vh', background: site.theme.backgroundColor, color: site.theme.textColor, fontFamily: site.theme.font }}>
      <Navbar site={site} pages={pages} />
      <div style={{ padding: '80px 20px', maxWidth: 960, margin: '0 auto' }}>
        <FormRenderer form={form} />
      </div>
      <Footer site={site} />
    </div>
  );
}
