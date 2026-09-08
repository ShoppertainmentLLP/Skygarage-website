import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** The four blog sections in the site architecture. */
export const ARTICLE_CATEGORIES = [
  'Maintenance Guides',
  'Cost Guides',
  'Buying Guides',
  'Seasonal Car Care',
] as const;

/*
  Long-form page copy lives in markdown, joined to the database row by slug: prices, garages and
  availability stay in Postgres where they change, while the prose the audit asks for (§10.3:
  600–900 words on a service page) becomes a reviewable file a Git-based CMS can edit later
  without a schema change. A service with no file still renders — it just renders short.
*/
const pageCopy = {
  /** Overrides the H1 so it can carry the exact keyword; falls back to the database name. */
  heading: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
};

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      category: z.enum(ARTICLE_CATEGORIES),
      /* Optional lead image, served from public/blog/. */
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      /*
        E-E-A-T (audit §8.4). The desk is the default author because that is what is true —
        name a real person in `author` and their credentials in `authorBio` when one is
        attributable, rather than inventing a byline.
      */
      author: z.string().default('The Cars911 editorial desk'),
      authorBio: z.string().optional(),
      updatedAt: z.coerce.date().optional(),
      /* §8.4: every post links at least one service page and one location page. */
      services: z.array(z.string()).default([]),
      locations: z.array(z.string()).default([]),
    }),
  }),
  /* One file per row in `services`; the file's id is the service slug. */
  serviceCopy: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
    schema: z.object({
      ...pageCopy,
      /** What the job actually covers, as the spec's "What's Included" list. */
      included: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
      /** Priced options, in the order they should read. `from` marks an open-ended price. */
      pricing: z
        .array(
          z.object({
            name: z.string(),
            priceAed: z.number(),
            from: z.boolean().default(false),
            note: z.string().optional(),
            includes: z.array(z.string()).default([]),
          }),
        )
        .default([]),
      /** The steps between booking and driving away. */
      process: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
      /** Why this job is worth doing through Cars911 rather than the first garage on the map. */
      why: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
      /** Slugs of two or three services to cross-link. */
      related: z.array(z.string()).default([]),
    }),
  }),

  /* One file per row in `brands`; the file's id is the brand slug. */
  brandCopy: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/brands' }),
    schema: z.object({
      ...pageCopy,
      /** The models people actually bring in, and what each one needs. */
      models: z
        .array(z.object({ name: z.string(), years: z.string().optional(), detail: z.string() }))
        .default([]),
      /** Indicative prices for this make, which is the question a brand page exists to answer. */
      pricing: z
        .array(z.object({ job: z.string(), fromAed: z.number(), toAed: z.number().optional(), note: z.string().optional() }))
        .default([]),
      why: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
    }),
  }),

  /* One file per row in `locations`; the file's id is the location slug. */
  locationCopy: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/locations' }),
    schema: z.object({
      ...pageCopy,
      /** Free-text place query for the map embed, e.g. "Dubai Marina, Dubai". */
      mapQuery: z.string().optional(),
      /** What is specific about servicing a car here, as short points. */
      local: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
      /** Slugs of the services worth surfacing first in this area. */
      popularServices: z.array(z.string()).default([]),
    }),
  }),

  policies: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/policies' }),
    schema: z.object({
      title: z.string(),
      updatedAt: z.coerce.date(),
    }),
  }),
};
