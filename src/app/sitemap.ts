import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

type SlugRow = { slug: string };

const SECTIONS = [
  { prefix: '/writing',     queryKey: 'WRITING_SLUGS_QUERY' },
  { prefix: '/mixed-media', queryKey: 'MIXED_MEDIA_SLUGS_QUERY' },
  { prefix: '/photography', queryKey: 'PHOTOGRAPHY_SLUGS_QUERY' },
  { prefix: '/videography', queryKey: 'VIDEOGRAPHY_SLUGS_QUERY' },
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/map`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const contentRoutes: MetadataRoute.Sitemap = [];
  for (const { prefix, queryKey } of SECTIONS) {
    const rows = await fetchSlugs(queryKey);
    for (const { slug } of rows) {
      if (!slug || slug.startsWith('_placeholder')) continue;
      contentRoutes.push({
        url: `${SITE_URL}${prefix}/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return [...staticRoutes, ...contentRoutes];
}
