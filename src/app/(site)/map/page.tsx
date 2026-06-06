import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { MAP_CONTENT_QUERY } from '@/lib/sanity';
import { MapLoader } from '@/components/map/MapLoader';
import type { MapItem } from '@/components/map/MapView';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Map',
  description: 'A geographic archive of all published work.',
};

export default async function MapPage() {
  let items: MapItem[] = [];
  try {
    items = await client.fetch(MAP_CONTENT_QUERY);
  } catch {
    // Renders empty map before CORS / content is configured
  }

  return (
    <main
      id="main-content"
      className="fixed inset-0 top-14"
      aria-label="Geographic archive map"
    >
      <MapLoader items={items} />
    </main>
  );
}
