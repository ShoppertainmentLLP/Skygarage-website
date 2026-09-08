import { defineMiddleware } from 'astro:middleware';
import { ADMIN_COOKIE, isValidSession } from './lib/admin';
import { db } from './db/client';
import { serviceLocationUrl, serviceUrl } from './lib/urls';

/*
  Legacy URLs from before the restructure. Service pages used to sit under a category tier
  (/services/car-repair/brake-repair/) and crossed with a location a level below that. Both
  shapes 301 straight to their new home — never via a second redirect, which is why the
  trailing slash is normalised in memory first and only one Location header is ever sent
  (audit §11.8).
*/
async function legacyTarget(pathname: string): Promise<string | null> {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'services' || parts.length < 3 || parts.length > 4) return null;

  const [, , svcSlug, locSlug] = parts;
  const service = await db.query.services.findFirst({ where: (s, { eq }) => eq(s.slug, svcSlug) });
  if (!service) return null;
  if (!locSlug) return serviceUrl(service);

  const location = await db.query.locations.findFirst({ where: (l, { eq }) => eq(l.slug, locSlug) });
  return location ? serviceLocationUrl(service, location) : serviceUrl(service);
}

/** Static files, the health check and Astro's own assets keep their exact paths. */
const isFile = (pathname: string) => pathname.split('/').pop()!.includes('.');
const PASSTHROUGH = ['/_astro/', '/_actions/', '/_image', '/health'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  if (!PASSTHROUGH.some((p) => pathname.startsWith(p)) && !isFile(pathname)) {
    const slashed = pathname.endsWith('/') ? pathname : `${pathname}/`;
    const target = (await legacyTarget(slashed)) ?? (slashed === pathname ? null : slashed);
    if (target) return context.redirect(`${target}${search}`, 301);
  }

  if (pathname.startsWith('/admin/') && pathname !== '/admin/login/') {
    if (!isValidSession(context.cookies.get(ADMIN_COOKIE)?.value)) {
      return context.redirect('/admin/login/');
    }
  }

  return next();
});
