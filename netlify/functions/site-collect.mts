import { createHmac } from 'node:crypto';
import { dbRequest } from './_lib/db.mjs';
import { buildVisit } from './_lib/site/visit.mjs';

// Records one page visit. Called by /analytics.js on public pages, and by a 1x1 image
// for clients that do not run scripts. It never returns data, never sets a cookie, and
// never lets a failure reach the page: if the table is missing or the database is down,
// the visit is dropped and the visitor notices nothing.
export const config = { path: '/api/collect' };
const MAX_BYTES = 2048;
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

type Context = { ip?: string; geo?: { city?: string; country?: { code?: string }; subdivision?: { name?: string } } };

export default async function handler(request: Request, context: Context = {}): Promise<Response> {
  const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'x-content-type-options': 'nosniff' };
  const done = () => request.method === 'GET' ? new Response(PIXEL, { status: 200, headers: { ...headers, 'content-type': 'image/gif' } }) : new Response(null, { status: 204, headers });
  if (!['GET', 'POST'].includes(request.method)) return new Response(null, { status: 405, headers: { ...headers, allow: 'GET, POST' } });
  try {
    const url = new URL(request.url);
    let input: Record<string, unknown>, scriptRan: boolean;
    if (request.method === 'POST') {
      // Only this site's own pages may report a visit.
      const origin = request.headers.get('origin');
      if (origin && origin !== url.origin) return done();
      const text = await request.text();
      if (text.length > MAX_BYTES) return done();
      input = JSON.parse(text); scriptRan = true;
      if (!input || typeof input !== 'object' || Array.isArray(input)) return done();
    } else { input = { p: url.searchParams.get('p'), r: request.headers.get('referer') }; scriptRan = false; }

    const database = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    if (!database) return done();
    const visit = buildVisit(input, {
      userAgent: request.headers.get('user-agent') || '', ip: context.ip || '', geo: context.geo, siteHost: url.hostname.replace(/^www\./, ''), scriptRan,
      globalPrivacyControl: request.headers.get('sec-gpc') === '1',
      // Derived from a key the site already holds, so no new secret is needed and the daily
      // marks cannot be recomputed by anyone without it.
      secret: createHmac('sha256', database).update('site-visit-day-hash').digest('hex'),
    });
    if (visit) await dbRequest('site_visits', { method: 'POST', prefer: 'return=minimal', body: visit });
  } catch { /* counting visits must never break a page */ }
  return done();
}
