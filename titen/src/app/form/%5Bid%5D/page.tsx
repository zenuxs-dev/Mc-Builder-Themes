import { getSite, getPages, getForms } from '@/lib/api';
import { Navbar, Footer, FormRenderer } from '../../components';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ id: string }> }

export default async function FormDetailPage({ params }: Props) {
  const { id } = await params;
  const site = await getSite();
  if (!site) notFound();

  const [pages, forms] = await Promise.all([
    getPages(site._id),
    getForms(site._id),
  ]);

  const form = forms.find((f: any) => f._id === id);
  if (!form) notFound();

  const primary = site.theme.primaryColor || '#3b82f6';

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1a1a2e', fontFamily: "'Inter', sans-serif" }}>
      <Navbar site={site} pages={pages} primary={primary} />
      <div style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <FormRenderer form={form} primary={primary} />
      </div>
      <Footer site={site} primary={primary} />
    </div>
  );
}
