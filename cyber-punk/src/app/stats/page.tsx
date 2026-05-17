import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Footer, ServerStatus } from '../components';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pages, mcStatus] = await Promise.all([
    getPages(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  const accent = site.theme.primaryColor || '#00ff88';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <Navbar site={site} pages={pages} accent={accent} />
      <div style={{ padding: '40px 0' }}>
        <ServerStatus site={site} mcStatus={mcStatus} accent={accent} />
      </div>
      <Footer site={site} accent={accent} />
    </div>
  );
}
