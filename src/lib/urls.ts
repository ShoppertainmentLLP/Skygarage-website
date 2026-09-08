/*
  Every indexable URL is built here and nowhere else.

  The shape is fixed by the Action Document (p4) and the audit's §8.2 rules: lowercase,
  hyphenated, the primary keyword early in the path, no query strings, a trailing slash on
  every one, and never more than three folder levels. Service pages use the editable
  `seoSlug` from the database; crossover pages compose the stable internal slugs so a
  keyword edit on a service page never breaks them.
*/

type ServiceRef = { slug: string; seoSlug: string };
type SlugRef = { slug: string };

/** /services/car-detailing-dubai/ */
export const serviceUrl = (service: ServiceRef) => `/services/${service.seoSlug}/`;

/** /services/detailing-in-al-quoz/ — the "service in area" keyword play, kept to two levels. */
export const serviceLocationUrl = (service: SlugRef, location: SlugRef) =>
  `/services/${service.slug}-in-${location.slug}/`;

/** /brands/bmw-service-dubai/ */
export const brandUrl = (brand: SlugRef) => `/brands/${brand.slug}-service-dubai/`;

/** /brands/bmw-service-dubai/brake-repair/ */
export const brandServiceUrl = (brand: SlugRef, service: SlugRef) =>
  `${brandUrl(brand)}${service.slug}/`;

export const locationUrl = (location: SlugRef) => `/locations/${location.slug}/`;
export const garageUrl = (garage: SlugRef) => `/garages/${garage.slug}/`;

/** The one canonical booking entry point. The /book/* pages are its specialised siblings. */
export const BOOK_URL = '/book-a-service/';

/** Prefills a form path. Query strings are confined to the booking pages, which are noindexed. */
export const withQuery = (path: string, params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
  const s = q.toString();
  return s ? `${path}?${s}` : path;
};

export const bookUrl = (params: Record<string, string | number | undefined> = {}) =>
  withQuery(BOOK_URL, params);

export const appointmentUrl = (params: Record<string, string | number | undefined> = {}) =>
  withQuery('/book/appointment/', params);

export const BRAND_URL_SUFFIX = '-service-dubai';

/** Splits "detailing-in-al-quoz" into its two slugs, trying every "-in-" so either half may contain one. */
export function splitServiceLocation(slug: string): [string, string][] {
  const parts: [string, string][] = [];
  let i = slug.indexOf('-in-');
  while (i !== -1) {
    parts.push([slug.slice(0, i), slug.slice(i + 4)]);
    i = slug.indexOf('-in-', i + 1);
  }
  return parts;
}
