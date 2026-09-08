import type { APIRoute } from 'astro';
import { SITEMAP_SEGMENTS, collectSegment, urlsetXml, xmlResponse, type SitemapSegment } from '../lib/sitemap';

export const GET: APIRoute = async ({ params }) => {
  const segment = params.segment as SitemapSegment;
  if (!SITEMAP_SEGMENTS.includes(segment)) return new Response('Not found', { status: 404 });
  return xmlResponse(urlsetXml(await collectSegment(segment)));
};
