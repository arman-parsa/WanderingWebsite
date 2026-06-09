import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { HomepageClient, type HomeItem } from '@/components/home/HomepageClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: "ARMAN'S WANDERINGS",
  description: "A personal archive of travel writing, photography, and editorial work from the field.",
};

type ContentItem = {
  _type: 'writing' | 'mixedMedia' | 'photography' | 'videography';
  title: string;
  slug: string;
  location?: string;
  description?: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

export default async function HomePage() {
  let items: ContentItem[] = [];
  try {
    const all = await client.fetch(ALL_CONTENT_QUERY);
    items = (all as ContentItem[]).slice(0, 3);
  } catch {
    // Sanity unavailable — fall through to placeholders
  }
  if (items.length === 0) items = PLACEHOLDER_ITEMS.slice(0, 3) as ContentItem[];

  const homeItems: HomeItem[] = items.map(item => ({
    _type:         item._type,
    title:         item.title,
    slug:          item.slug,
    location:      item.location,
    description:   item.description,
    coverImageUrl: item.coverImage?.asset
      ? urlFor(item.coverImage).width(1920).height(1080).fit('crop').format('webp').quality(85).url()
      : undefined,
  }));

  // Use article cover images as hero backgrounds; user can supply dedicated hero images later
  const heroImages = homeItems
    .map(i => i.coverImageUrl)
    .filter((u): u is string => Boolean(u));

  return <HomepageClient items={homeItems} heroImages={heroImages} />;
}
