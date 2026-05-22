import { getSite, getPages, getForms } from '@/lib/api';
import { Navbar, Sidebar, Footer, FormsSection } from '../components';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pages, forms] = await Promise.all([
    getPages(site._id),
    getForms(site._id),
  ]);

  const primary = site.theme.primaryColor || '#e74c3c';

  return (
    <>
      <Navbar site={site} pages={pages} primary={primary} />
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/forms" />
        <main className="bc-main">
          <FormsSection site={site} forms={forms} primary={primary} />
        </main>
      </div>
      <Footer site={site} primary={primary} />
    </>
  );
}
