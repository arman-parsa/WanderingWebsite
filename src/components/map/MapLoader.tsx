'use client';

import dynamic from 'next/dynamic';
import type { MapItem } from './MapView';

const MapView = dynamic(
  () => import('./MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-surface">
        <p className="font-sans text-xs uppercase tracking-widest text-ink-muted">
          Loading map…
        </p>
      </div>
    ),
  }
);

export function MapLoader({ items }: { items: MapItem[] }) {
  return <MapView items={items} />;
}
