import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { ExploreClient } from '@/components/explore/ExploreClient';
import { SITE_URL, OG_IMAGE } from '@/lib/metadata';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Library',
  description: 'Browse all writing, photography, mixed media, and videography by Arman Parsa — a personal archive of stories from around the world.',
  alternates: { canonical: `${SITE_URL}/library` },
  openGraph: {
    title: 'Library · Arman Parsa',
    description: 'Browse all writing, photography, mixed media, and videography by Arman Parsa — a personal archive of stories from around the world.',
    url: `${SITE_URL}/library`,
    images: [OG_IMAGE],
  },
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

  return (
    <main id="main-content">
      <h1 className="sr-only">Library — all work by Arman Parsa</h1>
      <ExploreClient items={items} />
    </main>
  );
}
