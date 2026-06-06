import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { ArticlesClient } from '@/components/articles/ArticlesClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Essays, editorials, and photography series.',
};

type ContentItem = {
  _type: 'essay' | 'editorial' | 'photoSeries';
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  excerpt?: string;
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

  return <ArticlesClient items={items} />;
}
