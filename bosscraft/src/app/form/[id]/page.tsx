import { getSite, getPages, getForms } from '@/lib/api';
import { Navbar, Sidebar, Footer, FormRenderer } from '../../components';
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

  const primary = site.theme.primaryColor || '#e74c3c';

  return (
    <>
      <Navbar site={site} pages={pages} primary={primary} />
      <div className="bc-layout">
        <Sidebar site={site} pages={pages} activePage={`/form/${id}`} />
        <main className="bc-main">
          <div style={{ padding: '40px 0', maxWidth: '800px', margin: '0 auto' }}>
            <FormRenderer form={form} primary={primary} />
          </div>
        </main>
      </div>
      <Footer site={site} primary={primary} />
    </>
  );
}
