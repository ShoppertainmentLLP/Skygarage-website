import { db } from '../db/client';
import { garageBrands, garageLocations, garageServices, garages, reviews } from '../db/schema';
import { avg, count, eq, inArray, sql } from 'drizzle-orm';

export async function getCategoriesWithServices() {
  return db.query.serviceCategories.findMany({
    orderBy: (c, { asc }) => asc(c.sort),
    with: { services: { orderBy: (s, { asc }) => asc(s.sort) } },
  });
}

export async function getEmirates() {
  return db.query.locations.findMany({
    where: (l, { eq }) => eq(l.type, 'emirate'),
    orderBy: (l, { asc }) => asc(l.sort),
  });
}

export async function getAreasOf(parentId: number) {
  return db.query.locations.findMany({
    where: (l, { eq }) => eq(l.parentId, parentId),
    orderBy: (l, { asc }) => asc(l.sort),
  });
}

export type GarageRating = { avg: number | null; count: number };

/** Approved-review aggregates for a set of garages, keyed by garage id. */
export async function getRatings(garageIds: number[]): Promise<Map<number, GarageRating>> {
  if (garageIds.length === 0) return new Map();
  const rows = await db
    .select({ garageId: reviews.garageId, avg: avg(reviews.rating), count: count() })
    .from(reviews)
    .where(inArray(reviews.garageId, garageIds))
    .groupBy(reviews.garageId);
  const map = new Map<number, GarageRating>();
  for (const r of rows) map.set(r.garageId, { avg: r.avg ? Number(r.avg) : null, count: r.count });
  return map;
}

export async function getBrands() {
  return db.query.brands.findMany({ orderBy: (b, { asc }) => asc(b.sort) });
}

export async function getActiveGarages() {
  return db.query.garages.findMany({
    where: eq(garages.active, true),
    orderBy: (g, { asc }) => asc(g.name),
    with: {
      garageServices: { with: { service: true } },
      garageLocations: { with: { location: true } },
    },
  });
}

/*
  The service × location combinations that actually have a garage behind them. Every other
  combination still renders — someone following a link deserves a page and a request form —
  but it is left out of the sitemap and marked noindex, because a page whose only local
  content is the district blurb is exactly the near-duplicate the audit warns about (§11.2).
*/
export async function getServedPairs(): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ serviceId: garageServices.serviceId, locationId: garageLocations.locationId })
    .from(garageServices)
    .innerJoin(garageLocations, eq(garageServices.garageId, garageLocations.garageId))
    .innerJoin(garages, eq(garages.id, garageServices.garageId))
    .where(eq(garages.active, true));
  return new Set(rows.map((r) => `${r.serviceId}:${r.locationId}`));
}

/** The same rule as getServedPairs, for brand × service pages. */
export async function getServedBrandPairs(): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ brandId: garageBrands.brandId, serviceId: garageServices.serviceId })
    .from(garageBrands)
    .innerJoin(garageServices, eq(garageBrands.garageId, garageServices.garageId))
    .innerJoin(garages, eq(garages.id, garageBrands.garageId))
    .where(eq(garages.active, true));
  return new Set(rows.map((r) => `${r.brandId}:${r.serviceId}`));
}

/*
  Approved reviews for one service, newest first, with the garage that did the work. Only
  reviews a reviewer tied to this job appear here — see the note on reviews.serviceId.
*/
export async function getServiceReviews(serviceId: number) {
  return db.query.reviews.findMany({
    where: (r, { and, eq }) => and(eq(r.serviceId, serviceId), eq(r.approved, true)),
    orderBy: (r, { desc }) => desc(r.createdAt),
    with: { garage: true },
  });
}

export type ReviewSummary = { avg: number; count: number };

export function summariseReviews(rows: { rating: number }[]): ReviewSummary | null {
  if (rows.length === 0) return null;
  const total = rows.reduce((sum, r) => sum + r.rating, 0);
  return { avg: Math.round((total / rows.length) * 10) / 10, count: rows.length };
}

/*
  Approved reviews of the garages that handle a make. They are evidence about those workshops,
  not about the make, so the brand page labels them that way and carries no rating markup.
*/
export async function getBrandReviews(brandId: number) {
  const links = await db
    .select({ garageId: garageBrands.garageId })
    .from(garageBrands)
    .where(eq(garageBrands.brandId, brandId));
  const ids = links.map((l) => l.garageId);
  if (ids.length === 0) return [];
  return db.query.reviews.findMany({
    where: (r, { and, eq: e, inArray: ia }) => and(ia(r.garageId, ids), e(r.approved, true)),
    orderBy: (r, { desc }) => desc(r.createdAt),
    with: { garage: true },
  });
}

/** Approved reviews of the garages that cover a place — the local proof on an area page. */
export async function getLocationReviews(locationId: number) {
  const links = await db
    .select({ garageId: garageLocations.garageId })
    .from(garageLocations)
    .where(eq(garageLocations.locationId, locationId));
  const ids = links.map((l) => l.garageId);
  if (ids.length === 0) return [];
  return db.query.reviews.findMany({
    where: (r, { and, eq: e, inArray: ia }) => and(ia(r.garageId, ids), e(r.approved, true)),
    orderBy: (r, { desc }) => desc(r.createdAt),
    with: { garage: true },
  });
}

/** The best approved reviews across the whole network, for the homepage rail. */
export async function getFeaturedReviews(limit = 8) {
  return db.query.reviews.findMany({
    where: (r, { and, eq: e, gte }) => and(e(r.approved, true), gte(r.rating, 4)),
    orderBy: (r, { desc }) => [desc(r.rating), desc(r.createdAt)],
    limit,
    with: { garage: true },
  });
}

/** Every service with its category, for the homepage grid. */
export async function getAllServices() {
  return db.query.services.findMany({
    orderBy: (s, { asc }) => asc(s.sort),
    with: { category: true },
  });
}
