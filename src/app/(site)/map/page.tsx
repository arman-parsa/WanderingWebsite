import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { MAP_CONTENT_QUERY } from '@/lib/sanity';
import { GlobeLoader } from '@/components/map';
import { PLACEHOLDER_GLOBE_ITEMS } from '@/lib/placeholders';
import type { GlobeItem } from '@/components/map';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Map',
  description: 'A geographic archive of all published work.',
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
        top: '3.5rem',
        backgroundColor: '#070b12',
      }}
      aria-label="Geographic archive globe"
    >
      <GlobeLoader items={items} />
    </main>
  );
}
