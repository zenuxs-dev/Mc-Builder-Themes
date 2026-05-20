import { cache } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');
const SITE_KEY = (process.env.NEXT_PUBLIC_SITE_KEY || '').trim();

function normalizeUploads(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeUploads);
  const out: any = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      if (v.startsWith('/uploads/') || v.startsWith('uploads/')) out[k] = API_BASE + (v.startsWith('/') ? v : '/' + v);
      else out[k] = v;
    } else if (v && typeof v === 'object') {
      if (v.url && !v.fullUrl && typeof v.url === 'string' && (v.url.startsWith('/uploads/') || v.url.startsWith('uploads/'))) {
        out[k] = { ...v, fullUrl: API_BASE + (v.url.startsWith('/') ? v.url : '/' + v.url) };
      } else {
        out[k] = normalizeUploads(v);
      }
    } else { out[k] = v; }
  }
  return out;
}

export const getSite = cache(async function getSite() {
  const trimmedKey = SITE_KEY.trim();
  if (!trimmedKey) {
    console.warn('getSite: SITE_KEY is missing');
    return null;
  }
  try {
    const url = `${API_URL}/sites/key/${trimmedKey}`;
    console.log('getSite: Fetching from', url);
    const res = await fetch(url, { next: { revalidate: 10 } });
    if (!res.ok) {
      console.error(`getSite: Fetch failed with status ${res.status} for key ${trimmedKey}`);
      return null;
    }
    const j = await res.json();
    return normalizeUploads(j);
  } catch (err) {
    console.error('getSite: Error fetching site:', err);
    return null;
  }
});

export async function getPage(siteId: string, slug: string) {
  try {
    const res = await fetch(`${API_URL}/pages/${siteId}/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const j = await res.json();
    return normalizeUploads(j);
  } catch { return null; }
}

export async function getPages(siteId: string) {
  try {
    const res = await fetch(`${API_URL}/pages/site/${siteId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return normalizeUploads(j);
  } catch { return []; }
}

export async function getProducts(siteId: string) {
  try {
    const res = await fetch(`${API_URL}/store/products?siteId=${siteId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return normalizeUploads(j);
  } catch { return []; }
}

export async function getAnnouncements(siteId: string) {
  try {
    const res = await fetch(`${API_URL}/announcements/${siteId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return normalizeUploads(j);
  } catch { return []; }
}

export async function getForms(siteId: string) {
  try {
    const res = await fetch(`${API_URL}/forms/${siteId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return normalizeUploads(j);
  } catch { return []; }
}

export async function getDiscussions(siteId: string) {
  try {
    const res = await fetch(`${API_URL}/discussions/${siteId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return normalizeUploads(j);
  } catch { return []; }
}

export async function getServerStatus(serverIp: string) {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`, { cache: 'no-store' });
    return res.json();
  } catch { return { online: false }; }
}

export async function submitForm(formId: string, data: any) {
  try {
    const res = await fetch(`${API_URL}/forms/${formId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return res;
  } catch { return { ok: false, status: 500 } as any; }
}

export async function createPaymentOrder(
  siteId: string, productId: string,
  buyerInfo: { payerName: string; payerEmail: string; payerContact?: string; note?: string; buyerUsername?: string }
) {
  try {
    const res = await fetch(`${API_URL}/payments/zenuxs/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, productId, ...buyerInfo }),
    });
    return res.json();
  } catch { return { success: false, error: 'Network error' }; }
}

export async function verifyPayment(data: {
  paymentId: string; razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string;
}) {
  try {
    const res = await fetch(`${API_URL}/payments/zenuxs/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch { return { success: false, error: 'Network error' }; }
}