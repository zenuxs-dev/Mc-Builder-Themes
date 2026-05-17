import { getSite, getPages, getServerStatus } from '@/lib/api';
import { Navbar, Footer } from '@/components/NavFooter';

export default async function StatsPage() {
  const site = await getSite();
  if (!site) return null;

  const [pages, mcStatus] = await Promise.all([
    getPages(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);
  const { theme } = site;
  const players: string[] = (mcStatus as any)?.players?.list || [];

  return (
    <div style={{ minHeight: '100vh', background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.font }}>
      <Navbar site={site} pages={pages} />
      <div style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>Server Stats</h1>
          <p style={{ opacity: 0.5, marginBottom: '48px', fontSize: '14px', fontFamily: 'monospace' }}>{site.serverIp}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '48px' }}>
            {[
              { label: 'Status', value: (mcStatus as any).online ? '✓ Online' : '✗ Offline', color: (mcStatus as any).online ? '#22c55e' : '#ef4444' },
              { label: 'Players', value: (mcStatus as any).online ? `${(mcStatus as any).players?.online ?? 0}/${(mcStatus as any).players?.max ?? 0}` : '—', color: theme.textColor },
              { label: 'Version', value: (mcStatus as any).version?.name || '—', color: theme.textColor },
              { label: 'Ping', value: (mcStatus as any).ping ? `${(mcStatus as any).ping}ms` : '—', color: theme.textColor },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '24px', borderRadius: '16px', background: theme.primaryColor + '10', border: `1px solid ${theme.primaryColor}20` }}>
                <p style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{stat.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 900, color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {players.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Currently Online ({players.length})</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {players.map((name: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: theme.primaryColor + '12', border: `1px solid ${theme.primaryColor}25`, fontSize: '13px', fontWeight: 600 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer site={site} />
    </div>
  );
}
