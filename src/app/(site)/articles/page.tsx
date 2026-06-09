import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { ExploreClient } from '@/components/explore/ExploreClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Library',
  description: 'Writing, photography, mixed media, and videography.',
};

type ContentItem = {
  _type: 'writing' | 'mixedMedia' | 'photography' | 'videography';
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  description?: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

export default async function ArticlesPage() {
  let items: ContentItem[] = [];
  try {
    items = await client.fetch(ALL_CONTENT_QUERY);
  } catch {
    // Returns empty list when Sanity CORS is not yet configured
  }
  if (items.length === 0) items = PLACEHOLDER_ITEMS as ContentItem[];

  return <ExploreClient items={items} />;
}
