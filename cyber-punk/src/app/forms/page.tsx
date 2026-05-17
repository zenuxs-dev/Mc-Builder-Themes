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

  const accent = site.theme.primaryColor || '#00ff88';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <Navbar site={site} pages={pages} accent={accent} />
      <FormsSection site={site} forms={forms} accent={accent} />
      <Footer site={site} accent={accent} />
    </div>
  );
}
