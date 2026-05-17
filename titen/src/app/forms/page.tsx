import { getSite, getPages, getForms } from '@/lib/api';
import { Navbar, Footer, FormsSection } from '../components';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pages, forms] = await Promise.all([
    getPages(site._id),
    getForms(site._id),
  ]);

  const primary = site.theme.primaryColor || '#3b82f6';

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a2e', fontFamily: "'Inter', sans-serif" }}>
      <Navbar site={site} pages={pages} primary={primary} />
      <FormsSection site={site} forms={forms} primary={primary} />
      <Footer site={site} primary={primary} />
    </div>
  );
}
