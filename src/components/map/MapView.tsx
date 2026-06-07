'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

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

const TYPE_FILTERS = ['All', 'Writing', 'Mixed Media', 'Photography', 'Videography'] as const;
type Filter = typeof TYPE_FILTERS[number];

export type MapItem = {
  _type: string;
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  coordinates: { lat: number; lng: number };
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

type Props = { items: MapItem[] };

export function MapView({ items }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [popup, setPopup] = useState<MapItem | null>(null);

  const filtered = items.filter((item) => {
    if (activeFilter === 'All') return true;
    return TYPE_LABEL[item._type] === activeFilter;
  });

  const handleMarkerClick = useCallback((item: MapItem) => {
    setPopup((prev) => (prev?.slug === item.slug ? null : item));
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Filter controls */}
      <div className="absolute left-1/2 top-6 z-10 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-paper/95 px-2 py-1.5 shadow-sm backdrop-blur-sm">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'rounded-full px-4 py-1 font-sans text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)]',
                activeFilter === filter
                  ? 'bg-ink text-paper'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <Map
        initialViewState={{ longitude: 20, latitude: 20, zoom: 1.8 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        attributionControl={false}
        onClick={() => setPopup(null)}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {filtered.map((item) => (
          <Marker
            key={item.slug}
            longitude={item.coordinates.lng}
            latitude={item.coordinates.lat}
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); handleMarkerClick(item); }}
          >
            <div
              className={cn(
                'h-2.5 w-2.5 cursor-pointer rounded-full border-2 border-paper shadow transition-transform duration-[var(--duration-fast)] hover:scale-150',
                item._type === 'writing'     ? 'bg-ink' :
                item._type === 'mixedMedia'  ? 'bg-ink-muted' :
                item._type === 'videography' ? 'bg-accent' :
                                               'bg-ink-faint'
              )}
              aria-label={item.title}
            />
          </Marker>
        ))}

        {popup && (
          <Popup
            longitude={popup.coordinates.lng}
            latitude={popup.coordinates.lat}
            anchor="bottom"
            offset={16}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setPopup(null)}
            className="map-popup"
            maxWidth="280px"
          >
            <MapCard item={popup} onClose={() => setPopup(null)} />
          </Popup>
        )}
      </Map>

      {/* Piece count */}
      <div className="absolute bottom-8 left-6 z-10">
        <p className="font-sans text-xs uppercase tracking-widest text-ink-muted">
          {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>
    </div>
  );
}

function MapCard({ item, onClose }: { item: MapItem; onClose: () => void }) {
  const href = `${TYPE_HREF[item._type]}/${item.slug}`;
  return (
    <div className="w-[260px] overflow-hidden rounded-sm bg-paper shadow-lg">
      {item.coverImage?.asset && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
          <Image
            src={urlFor(item.coverImage).width(520).height(293).fit('crop').format('webp').quality(80).url()}
            alt={item.coverImage.alt ?? item.title}
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-sans text-[10px] uppercase tracking-widest text-ink-muted">
            {TYPE_LABEL[item._type]}
            {item.location && ` · ${item.location}`}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="font-sans text-xs text-ink-faint transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>
        <Link
          href={href}
          className="block font-serif text-sm font-light leading-snug text-ink transition-colors hover:text-accent"
        >
          {item.title}
        </Link>
        {item.publishedAt && (
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-ink-faint">
            {formatDate(item.publishedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
