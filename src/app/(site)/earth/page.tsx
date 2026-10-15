import type { Metadata } from 'next';
import { preload } from 'react-dom';
import { sanityFetch, hasRealContent } from '@/lib/sanityFetch';
import { MAP_CONTENT_QUERY } from '@/lib/sanity';
import { GlobeLoader } from '@/components/map';
import { PLACEHOLDER_GLOBE_ITEMS } from '@/lib/placeholders';
import type { GlobeItem } from '@/components/map';
import { pageMetadata } from '@/lib/metadata';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Earth',
  description:
    'An interactive globe showing the geographic locations of all published work — stories collected across the world by Arman Parsa.',
  path: '/earth',
});

export default async function MapPage() {
  // Start fetching the land outlines with the page, not after the globe's
  // three.js chunk has loaded and run.
  preload('/data/ne_110m_land.json', { as: 'fetch', crossOrigin: 'anonymous' });
  let items = (await sanityFetch<GlobeItem[]>(MAP_CONTENT_QUERY)) ?? [];
  // Placeholder pins only while the CMS is empty — once real pieces exist,
  // the globe shows exactly the ones that have coordinates (even if none).
  if (items.length === 0 && !(await hasRealContent())) {
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
