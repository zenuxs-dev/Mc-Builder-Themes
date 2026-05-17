import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import SectionRenderer from '@/components/SectionRenderer';
import { Navbar, Footer } from '@/components/NavFooter';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  if (!site) return { title: 'Minecraft Server' };
  return {
    title: site.seo?.title || `${site.name} — Minecraft Server`,
    description: site.seo?.description || `Join ${site.name}, the best Minecraft server experience.`,
  };
}

export default async function PublicHome() {
  const site = await getSite();

  if (!site) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        <div>
          <div style={{ width: '64px', height: '64px', background: '#1a1a1f', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>🌐</div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>Site Not Configured</h1>
          <p style={{ color: '#71717a', maxWidth: '400px', lineHeight: 1.7 }}>
            Set <code style={{ color: '#60a5fa', background: '#1a1a2e', padding: '2px 8px', borderRadius: '6px' }}>NEXT_PUBLIC_SITE_KEY</code> in your frontend environment.
          </p>
        </div>
      </div>
    );
  }

  const { theme, plan } = site;

  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, 'home'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  const sections = (pageData?.sections || [])
    .filter((s: any) => s.visible)
    .sort((a: any, b: any) => a.order - b.order);

  const extras = { products, announcements, forms, discussions, mcData: mcStatus };

  return (
    <div style={{ minHeight: '100vh', background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.font }}>
      <Navbar site={site} pages={pages} />

      {sections.map((section: any) => (
        <SectionRenderer key={section._id} section={section} theme={theme} extras={extras} />
      ))}

      <Footer site={site} />
    </div>
  );
}
