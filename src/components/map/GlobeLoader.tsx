'use client';

import dynamic from 'next/dynamic';
import type { GlobeItem } from './GlobeView';

const GlobeView = dynamic(() => import('./GlobeView'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        // Transparent over the page's night-sky background — a cream
        // placeholder flashed before the globe appeared.
        backgroundColor: 'transparent',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'rgba(248, 244, 239, 0.6)',
        }}
      >
        Loading
      </p>
    </div>
  ),
});

export function GlobeLoader({ items }: { items: GlobeItem[] }) {
  return <GlobeView items={items} />;
}
