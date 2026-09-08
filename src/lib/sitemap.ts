import { db } from '../db/client';
import { getArticles, categorySlug, ARTICLE_CATEGORIES } from './articles';
import { getServedBrandPairs, getServedPairs } from './queries';
import { getCollection } from 'astro:content';
import { SITE } from './site';
import { brandServiceUrl, brandUrl, locationUrl, serviceLocationUrl, serviceUrl } from './urls';

/*
  A sitemap index with one child per content type (audit §11.3). Only canonical, indexable
  URLs go in: no category tier (noindex), no admin, no query strings. `lastmod` is emitted
  only where a real date exists — the blog — rather than stamping today's date on pages that
  have not changed, which is what makes lastmod worthless to a crawler.
*/
export type SitemapEntry = { loc: string; lastmod?: Date };

export const SITEMAP_SEGMENTS = ['pages', 'services', 'locations', 'brands', 'blog'] as const;
export type SitemapSegment = (typeof SITEMAP_SEGMENTS)[number];

const STATIC_PAGES = [
  '/',
  '/services/',
  '/book-a-service/',
  '/book/appointment/',
  '/book/packages/',
  '/book/compare/',
  '/book/emergency/',
  '/book/corporate/',
  '/brands/',
  '/locations/',
  '/garages/',
  '/blog/',
  '/rsa/',
  '/about/',
  '/about/how-it-works/',
  '/about/faq/',
  '/about/warranty/',
  '/about/contact/',
  '/partners/join/',
];

export async function collectSegment(segment: SitemapSegment): Promise<SitemapEntry[]> {
  if (segment === 'pages') {
    const policies = await getCollection('policies');
    return [
      ...STATIC_PAGES.map((loc) => ({ loc })),
      ...policies.map((p) => ({ loc: `/policies/${p.id}/`, lastmod: p.data.updatedAt })),
    ];
  }

  if (segment === 'services') {
    const [services, locations, served] = await Promise.all([
      db.query.services.findMany({ orderBy: (s, { asc }) => asc(s.sort) }),
      db.query.locations.findMany({ orderBy: (l, { asc }) => asc(l.sort) }),
      getServedPairs(),
    ]);
    return [
      ...services.map((s) => ({ loc: serviceUrl(s) })),
      ...services.flatMap((s) =>
        locations
          .filter((l) => served.has(`${s.id}:${l.id}`))
          .map((l) => ({ loc: serviceLocationUrl(s, l) })),
      ),
    ];
  }

  if (segment === 'locations') {
    const [locations, garages] = await Promise.all([
      db.query.locations.findMany({ orderBy: (l, { asc }) => asc(l.sort) }),
      db.query.garages.findMany({ where: (g, { eq }) => eq(g.active, true) }),
    ]);
    return [...locations.map((l) => ({ loc: locationUrl(l) })), ...garages.map((g) => ({ loc: `/garages/${g.slug}/` }))];
  }

  if (segment === 'brands') {
    const [brands, services, served] = await Promise.all([
      db.query.brands.findMany({ orderBy: (b, { asc }) => asc(b.sort) }),
      db.query.services.findMany({ with: { category: true } }),
      getServedBrandPairs(),
    ]);
    // Only servicing and repair get brand crossovers — the same rule the page itself enforces.
    const brandJobs = services.filter(
      (s) => s.category.slug === 'car-service' || s.category.slug === 'car-repair',
    );
    return [
      ...brands.map((b) => ({ loc: brandUrl(b) })),
      ...brands.flatMap((b) =>
        brandJobs.filter((s) => served.has(`${b.id}:${s.id}`)).map((s) => ({ loc: brandServiceUrl(b, s) })),
      ),
    ];
  }

  const articles = await getArticles();
  return [
    ...ARTICLE_CATEGORIES.map((c) => ({ loc: `/blog/category/${categorySlug(c)}/` })),
    ...articles.map((a) => ({ loc: `/blog/${a.id}/`, lastmod: a.data.publishedAt })),
  ];
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      ({ loc, lastmod }) =>
        `  <url><loc>${new URL(loc, SITE.url).href}</loc>${lastmod ? `<lastmod>${iso(lastmod)}</lastmod>` : ''}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
