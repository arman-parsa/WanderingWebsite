'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { urlFor } from '@/lib/sanityImage';

type ContentItem = {
  _type: 'writing' | 'mixedMedia' | 'photography' | 'videography';
  title: string;
  slug: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

const TYPE_HREF: Record<string, string> = {
  writing:     '/writing',
  mixedMedia:  '/mixed-media',
  photography: '/photography',
  videography: '/videography',
};

const TYPE_LABEL: Record<string, string> = {
  writing:     'Writing',
  mixedMedia:  'Mixed Media',
  photography: 'Photography',
  videography: 'Videography',
};

type Filter = 'all' | 'writing' | 'photography' | 'mixedMedia' | 'videography';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Writing',     value: 'writing' },
  { label: 'Photography', value: 'photography' },
  { label: 'Mixed Media', value: 'mixedMedia' },
  { label: 'Videography', value: 'videography' },
];

export function ExploreClient({ items }: { items: ContentItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = filter === 'all' ? items : items.filter(i => i._type === filter);

  return (
    <div style={{ backgroundColor: '#f8f4ef', color: '#1c1814', minHeight: '100vh', paddingTop: '6rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', paddingBottom: '2.5rem' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(28,24,20,0.45)', marginBottom: '2rem' }}>
          Explore
        </p>

        {/* Filter pills */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                background: 'none',
                border: `0.5px solid ${filter === value ? '#1c1814' : 'rgba(28,24,20,0.25)'}`,
                color: filter === value ? '#1c1814' : 'rgba(28,24,20,0.45)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.62rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '0.4rem 1rem',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '0 clamp(1rem, 4vw, 3rem) 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem 1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
          {visible.map(item => {
            const href = `${TYPE_HREF[item._type]}/${item.slug}`;
            const hotspot = item.coverImage?.hotspot;
            const objectPosition = hotspot ? `${hotspot.x * 100}% ${hotspot.y * 100}%` : 'center';

            return (
              <div key={item.slug}>
                <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', overflow: 'hidden', backgroundColor: 'rgba(28,24,20,0.08)' }}>
                    {item.coverImage?.asset && (
                      <Image
                        src={urlFor(item.coverImage).width(900).height(600).fit('crop').format('webp').quality(80).url()}
                        alt={(item.coverImage as { alt?: string }).alt ?? item.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 639px) 100vw, 50vw"
                        style={{ objectFit: 'cover', objectPosition }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ paddingTop: '1rem' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(28,24,20,0.45)', marginBottom: '0.5rem' }}>
                      {TYPE_LABEL[item._type]}
                    </p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1rem, 1.4vw, 1.25rem)', fontWeight: 300, lineHeight: 1.35, color: '#1c1814' }}>
                      {item.title}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {visible.length === 0 && (
          <p style={{ fontFamily: 'var(--font-serif)', color: 'rgba(248,244,239,0.4)', textAlign: 'center' }}>
            Nothing here yet.
          </p>
        )}
      </div>
    </div>
  );
}
