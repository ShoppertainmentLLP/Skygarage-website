import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /_actions/

Sitemap: ${new URL('/sitemap.xml', SITE.url).href}
`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
