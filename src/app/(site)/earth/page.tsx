import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { MAP_CONTENT_QUERY } from '@/lib/sanity';
import { GlobeLoader } from '@/components/map';
import { PLACEHOLDER_GLOBE_ITEMS } from '@/lib/placeholders';
import type { GlobeItem } from '@/components/map';
import { SITE_URL, OG_IMAGE } from '@/lib/metadata';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Earth',
  description: 'An interactive globe showing the geographic locations of all published work — stories collected across the world by Arman Parsa.',
  alternates: { canonical: `${SITE_URL}/earth` },
  openGraph: {
    title: 'Earth · Arman Parsa',
    description: 'An interactive globe showing the geographic locations of all published work — stories collected across the world by Arman Parsa.',
    url: `${SITE_URL}/earth`,
    images: [OG_IMAGE],
  },
};

export default async function MapPage() {
  let items: GlobeItem[] = [];

  try {
    const result = await client.fetch<GlobeItem[]>(MAP_CONTENT_QUERY);
    if (result && result.length > 0) {
      items = result;
    }
  } catch {
    // Sanity unavailable or not yet configured — fall through to placeholders
  }

  if (items.length === 0) {
    items = PLACEHOLDER_GLOBE_ITEMS;
  }

  return (
    <main
      id="main-content"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#070b12',
      }}
      aria-label="Interactive geographic archive globe"
    >
      <h1 className="sr-only">Earth — geographic archive</h1>
      <GlobeLoader items={items} />
    </main>
  );
}
