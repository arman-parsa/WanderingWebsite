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
        backgroundColor: '#f8f4ef',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#a09890',
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
