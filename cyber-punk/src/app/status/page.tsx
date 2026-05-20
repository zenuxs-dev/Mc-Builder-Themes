import { getSite, getPage, getPages, getProducts, getAnnouncements, getServerStatus, getForms, getDiscussions } from '@/lib/api';
import { notFound } from 'next/navigation';
import { StatusClient } from './client';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const site = await getSite();
  if (!site) notFound();

  const [pageData, pages, products, announcements, forms, discussions, mcStatus] = await Promise.all([
    getPage(site._id, 'status'),
    getPages(site._id),
    getProducts(site._id),
    getAnnouncements(site._id),
    getForms(site._id),
    getDiscussions(site._id),
    site.serverIp ? getServerStatus(site.serverIp) : Promise.resolve({ online: false }),
  ]);

  if (!pageData) notFound();

  return (
    <StatusClient site={site} pages={pages} mcStatus={mcStatus} />
  );
}