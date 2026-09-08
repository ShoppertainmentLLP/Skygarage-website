import { getCollection } from 'astro:content';
import { ARTICLE_CATEGORIES } from '../content.config';

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

/** URL segment for a category, e.g. "Cost Guides" -> "cost-guides". */
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

export function categoryFromSlug(slug: string): ArticleCategory | undefined {
  return ARTICLE_CATEGORIES.find((c) => categorySlug(c) === slug);
}

/** Every article, newest first. */
export async function getArticles(category?: string) {
  const all = await getCollection('articles');
  return all
    .filter((a) => !category || a.data.category === category)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export const CATEGORY_BLURBS: Record<ArticleCategory, string> = {
  'Maintenance Guides': 'Service intervals, warning lights and what your car actually needs, written for UAE heat and dust.',
  'Cost Guides': 'What jobs cost in the UAE, why quotes differ so much, and how to compare them fairly.',
  'Buying Guides': 'Choosing, checking and buying a car here — including what only an inspection will find.',
  'Seasonal Car Care': 'Getting ahead of summer, sandstorms and the school-run months.',
};

export { ARTICLE_CATEGORIES };
