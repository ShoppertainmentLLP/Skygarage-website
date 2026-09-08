import type { APIRoute } from 'astro';
import { db } from '../db/client';
import { SITE, phoneDisplay } from '../lib/site';
import { getArticles } from '../lib/articles';
import { brandUrl, locationUrl, serviceUrl } from '../lib/urls';

/*
  A plain-language brief for answer engines (audit §11.4). Generated from the same database
  the pages render from, so it cannot drift out of date. The physical address is still
  outstanding — add it here alongside the phone number as soon as it is confirmed, because
  NAP consistency is what these answers get graded on.
*/
export const GET: APIRoute = async () => {
  const [services, locations, brands, articles] = await Promise.all([
    db.query.services.findMany({ orderBy: (s, { asc }) => asc(s.sort), with: { category: true } }),
    db.query.locations.findMany({ orderBy: (l, { asc }) => asc(l.sort) }),
    db.query.brands.findMany({ orderBy: (b, { asc }) => asc(b.sort) }),
    getArticles(),
  ]);

  const abs = (path: string) => new URL(path, SITE.url).href;
  const line = (name: string, path: string, note?: string) =>
    `- [${name}](${abs(path)})${note ? `: ${note}` : ''}`;

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is a car service aggregator in the United Arab Emirates. A car owner describes the
job once; verified garages and mobile mechanics reply with written prices; the owner compares
and books. Booking is free and carries no obligation. Workmanship warranties are held by the
garage and listed on each garage profile.

## Contact

- Phone: ${phoneDisplay()}
- WhatsApp: https://wa.me/${SITE.whatsapp}
- Book a car service: ${abs('/book-a-service/')}
- Roadside assistance (24/7): ${abs('/rsa/')}

## Service area

Dubai and every other emirate: ${locations
    .filter((l) => l.type === 'emirate')
    .map((l) => l.name)
    .join(', ')}. Dubai coverage is broken down by district: ${locations
    .filter((l) => l.type === 'area')
    .map((l) => l.name)
    .join(', ')}.

## Services

${services
    .slice()
    .sort((a, b) => a.category.sort - b.category.sort || a.sort - b.sort)
    .map((s) => line(`${s.category.name} — ${s.name}`, serviceUrl(s), s.excerpt))
    .join('\n')}

## Brands served

${brands.map((b) => line(b.name, brandUrl(b), b.tagline)).join('\n')}

## Areas

${locations.map((l) => line(l.name, locationUrl(l))).join('\n')}

## Guides

${articles.slice(0, 12).map((a) => line(a.data.title, `/blog/${a.id}/`, a.data.description)).join('\n')}
`;

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
