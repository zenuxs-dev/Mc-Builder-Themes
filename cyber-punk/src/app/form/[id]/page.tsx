import { getSite, getPages, getForms } from '@/lib/api';
import { Navbar, Footer, FormRenderer } from '../../components';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ id: string }> }

export default async function FormDetailPage({ params }: Props) {
  const { id } = await params;
  console.log('FormDetailPage: Entering for ID:', id);
  const site = await getSite();
  console.log('FormDetailPage: getSite returned:', site ? { name: site.name, _id: site._id } : 'null');
  if (!site) notFound();

  const [pages, forms] = await Promise.all([
    getPages(site._id),
    getForms(site._id),
  ]);
  console.log('FormDetailPage: forms fetched count:', forms.length);
  console.log('FormDetailPage: forms ids:', forms.map((f: any) => f._id));

  const form = forms.find((f: any) => f._id === id);
  console.log('FormDetailPage: found form:', form ? form.name : 'null');
  if (!form) notFound();

  const accent = site.theme.primaryColor || '#00ff88';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <Navbar site={site} pages={pages} accent={accent} />
      <div style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <FormRenderer form={form} accent={accent} />
      </div>
      <Footer site={site} accent={accent} />
    </div>
  );
}
