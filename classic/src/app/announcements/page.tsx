import { getSite, getPages, getAnnouncements } from '@/lib/api';
import { Navbar, Footer } from '@/components/NavFooter';

export default async function AnnouncementsPage() {
  const site = await getSite();
  if (!site) return null;

  const [pages, announcements] = await Promise.all([
    getPages(site._id),
    getAnnouncements(site._id),
  ]);
  const { theme } = site;

  return (
    <div style={{ minHeight: '100vh', background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.font }}>
      <Navbar site={site} pages={pages} />
      <div style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '48px' }}>Announcements</h1>

          {announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', opacity: 0.3 }}>
              <p style={{ fontSize: '20px', fontWeight: 700 }}>No announcements yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {announcements.map((a: any, i: number) => (
                <div key={a._id || i} style={{ padding: '28px', borderRadius: '18px', background: theme.primaryColor + '08', border: `1px solid ${theme.primaryColor}20` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{a.title}</h2>
                    <span style={{ fontSize: '11px', opacity: 0.4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', opacity: 0.65, lineHeight: 1.7 }}>{a.content}</p>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', opacity: 0.4 }}>
                    <span>👁 {a.views || 0}</span>
                    <span>👍 {a.likes || 0}</span>
                    <span>👎 {a.dislikes || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer site={site} />
    </div>
  );
}
