import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';
import { SITEMAP_SEGMENTS, xmlResponse } from '../lib/sitemap';

/** The index. Each child is generated on request, so a new service appears without a deploy. */
export const GET: APIRoute = () => {
  const children = SITEMAP_SEGMENTS.map(
    (s) => `  <sitemap><loc>${new URL(`/sitemap-${s}.xml`, SITE.url).href}</loc></sitemap>`,
  ).join('\n');
  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${children}\n</sitemapindex>\n`,
  );
};
