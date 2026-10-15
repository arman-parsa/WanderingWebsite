import type { Metadata } from 'next';
import { sanityFetch } from '@/lib/sanityFetch';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { ExploreClient } from '@/components/explore/ExploreClient';
import { pageMetadata } from '@/lib/metadata';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Library',
  description:
    'Browse all writing, photography, mixed media, and videography by Arman Parsa — a personal archive of stories from around the world.',
  path: '/library',
});

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
  // An empty result means no published content yet → placeholders.
  let items = (await sanityFetch<ContentItem[]>(ALL_CONTENT_QUERY)) ?? [];
  if (items.length === 0) items = PLACEHOLDER_ITEMS as ContentItem[];

  return (
    <main id="main-content">
      <h1 className="sr-only">Library — all work by Arman Parsa</h1>
      <ExploreClient items={items} />
    </main>
  );
}
