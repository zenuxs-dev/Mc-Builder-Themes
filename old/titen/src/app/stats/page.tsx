import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Footer, ServerStatusSection } from '../components';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pages, mcStatus] = await Promise.all([
    getPages(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  const primary = site.theme.primaryColor || '#3b82f6';

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a2e', fontFamily: "'Inter', sans-serif" }}>
      <Navbar site={site} pages={pages} primary={primary} />
      <div style={{ padding: '40px 0' }}>
        <ServerStatusSection site={site} mcStatus={mcStatus} primary={primary} />
      </div>
      <Footer site={site} primary={primary} />
    </div>
  );
}
