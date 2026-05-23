import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Sidebar, Footer, ServerStatusSection } from '../components';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pages, mcStatus] = await Promise.all([
    getPages(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  const primary = site.theme.primaryColor || '#e74c3c';

  return (
    <>
      <Navbar site={site} pages={pages} primary={primary} />
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage="/stats" />
        <main className="bc-main">
          <div style={{ padding: '20px 0' }}>
            <ServerStatusSection site={site} mcStatus={mcStatus} primary={primary} />
          </div>
        </main>
      </div>
      <Footer site={site} primary={primary} />
    </>
  );
}
