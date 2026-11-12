import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';
import { TYPE_HREF } from '@/lib/contentTypes';
import { COMMISSIONS_PATH } from '@/lib/commissions';
import { collectPhotos, photoContentUrl } from '@/lib/seoImages';

// Rebuilt at most hourly (and on every publish via /api/revalidate), so new
// pieces reach the sitemap without a redeploy.
export const revalidate = 3600;

type SlugRow = { slug: string; updatedAt?: string };

const SECTIONS = [
  { prefix: '/writing',     queryKey: 'WRITING_SLUGS_QUERY' },
  { prefix: '/mixed-media', queryKey: 'MIXED_MEDIA_SLUGS_QUERY' },
  { prefix: '/photography', queryKey: 'PHOTOGRAPHY_SLUGS_QUERY' },
  { prefix: '/videography', queryKey: 'VIDEOGRAPHY_SLUGS_QUERY' },
  { prefix: '/commissions', queryKey: 'COMMISSION_SLUGS_QUERY' },
] as const;

async function fetchSlugs(queryKey: string): Promise<SlugRow[]> {
  try {
    // Dynamic import defers Sanity client initialization; if projectId is
    // missing the catch returns an empty array rather than crashing the build.
    const mod = await import('@/lib/sanity');
    const { client } = mod;
    const query = (mod as unknown as Record<string, string>)[queryKey];
    if (!query) return [];
    return await client.fetch<SlugRow[]>(query);
  } catch {
    return [];
  }
}

type PhotoRow = Parameters<typeof collectPhotos>[0] & { _type: string; slug: string };

/**
 * Photographs per page path, for the image sitemap: every photo each piece
 * and commission shows, at the same descriptively named URL as its
 * structured data. Empty on failure — the sitemap still lists the pages.
 */
async function fetchPhotosByPath(): Promise<Map<string, string[]>> {
  const byPath = new Map<string, string[]>();
  try {
    const { client, SITEMAP_PHOTOS_QUERY } = await import('@/lib/sanity');
    const rows = await client.fetch<PhotoRow[]>(SITEMAP_PHOTOS_QUERY);
    for (const row of rows ?? []) {
      const prefix = row._type === 'commission' ? COMMISSIONS_PATH : TYPE_HREF[row._type];
      if (!prefix || !row.slug) continue;
      byPath.set(`${prefix}/${row.slug}`, collectPhotos(row).map(photoContentUrl));
    }
  } catch {
    // no photo lists — pages are still listed
  }
  return byPath;
}

/** The homepage's hero photographs (Site Settings, or the built-in ones). */
async function heroPhotos(): Promise<string[]> {
  try {
    const { getSiteSettings } = await import('@/lib/siteSettings');
    const { heroSlides } = await getSiteSettings();
    return heroSlides.map((slide) => (slide.isSanity ? slide.src : `${SITE_URL}${slide.src}`));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [photosByPath, hero] = await Promise.all([fetchPhotosByPath(), heroPhotos()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1, ...(hero.length > 0 && { images: hero }) },
    { url: `${SITE_URL}/library`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/gallery`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/commissions`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/earth`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const contentRoutes: MetadataRoute.Sitemap = [];
  for (const { prefix, queryKey } of SECTIONS) {
    const rows = await fetchSlugs(queryKey);
    for (const { slug, updatedAt } of rows) {
      if (!slug || slug.startsWith('_placeholder')) continue;
      contentRoutes.push({
        url: `${SITE_URL}${prefix}/${slug}`,
        // When the piece was last edited, so search engines re-crawl changes.
        ...(updatedAt && { lastModified: updatedAt }),
        // Its photographs, so they're found for Google Images.
        ...((photosByPath.get(`${prefix}/${slug}`)?.length ?? 0) > 0 && { images: photosByPath.get(`${prefix}/${slug}`) }),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return [...staticRoutes, ...contentRoutes];
}
