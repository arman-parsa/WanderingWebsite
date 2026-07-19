import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { HomepageClient, type HomeItem } from '@/components/home/HomepageClient';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from '@/lib/metadata';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: 'website',
    images: [OG_IMAGE],
  },
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

  // Static hero images from public/images/ — all image files discovered at
  // build time, except portraits that belong to other pages (about-*).
  const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const heroImages = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir)
        .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()) && !f.startsWith('about-'))
        .sort()
        .map(f => `/images/${f}`)
    : [];

  return <HomepageClient items={homeItems} heroImages={heroImages} />;
}
