'use client';

import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

type FilterValue = 'writing' | 'photography' | 'mixedMedia' | 'videography';

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: 'Writing',     value: 'writing' },
  { label: 'Photography', value: 'photography' },
  { label: 'Mixed Media', value: 'mixedMedia' },
  { label: 'Videography', value: 'videography' },
];

function useIntersectionReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function ExploreCard({
  item,
  dimmed,
  onMouseEnter,
  onMouseLeave,
}: {
  item: ContentItem;
  dimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const href = `${TYPE_HREF[item._type]}/${item.slug}`;
  const { ref, visible } = useIntersectionReveal();
  const [imgLoaded, setImgLoaded] = useState(false);

  const hotspot = (item.coverImage as { hotspot?: { x: number; y: number } } | undefined)?.hotspot;
  const objectPosition = hotspot ? `${hotspot.x * 100}% ${hotspot.y * 100}%` : 'center';

  return (
    <article
      ref={ref as RefObject<HTMLElement>}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        opacity: dimmed ? 0.15 : 1,
        transition: 'opacity 250ms ease',
      }}
      className="min-w-0"
    >
      <Link href={href} className="block">
        {/* 3:2 image */}
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          {item.coverImage?.asset ? (
            <Image
              src={urlFor(item.coverImage).width(900).height(600).fit('crop').format('webp').quality(80).url()}
              alt={(item.coverImage as { alt?: string }).alt ?? item.title}
              fill
              loading="lazy"
              sizes="(max-width: 639px) 100vw, 50vw"
              style={{ objectFit: 'cover', objectPosition }}
              className={`transition-opacity duration-500${imgLoaded && visible ? ' opacity-100' : ' opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          )}
        </div>

        {/* Type label + title */}
        <div className="pt-4">
          <p
            className="mb-2 font-sans uppercase"
            style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: 'rgba(248,244,239,0.45)' }}
          >
            {TYPE_LABEL[item._type]}
          </p>
          <h2
            className="font-serif font-light leading-snug"
            style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)', color: '#f8f4ef' }}
          >
            {item.title}
          </h2>
        </div>
      </Link>
    </article>
  );
}

export function ExploreClient({ items }: { items: ContentItem[] }) {
  const [activeFilters, setActiveFilters] = useState<Set<FilterValue>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function toggleFilter(value: FilterValue) {
    setActiveFilters((prev: Set<FilterValue>) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function clearFilters() {
    setActiveFilters(new Set());
  }

  const isAllActive = activeFilters.size === 0;

  const displayed = isAllActive
    ? items
    : items.filter((i) => activeFilters.has(i._type as FilterValue));

  const handleMouseEnter = useCallback((idx: number) => {
    setHoveredIndex(idx);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  return (
    <main
      id="main-content"
      className="min-h-screen w-full"
      style={{ backgroundColor: '#1c1814', color: '#f8f4ef' }}
    >
      {/* ── Page header ──────────────────────────────────────────── */}
      <div
        className="mx-auto flex flex-col items-center px-[var(--content-padding-x)] pb-10 text-center"
        style={{ paddingTop: 'clamp(7rem, 14vh, 10rem)' }}
      >
        <h1
          className="animate-fade-in font-sans uppercase"
          style={{
            fontSize: 'clamp(0.65rem, 0.8vw, 0.75rem)',
            letterSpacing: '0.25em',
            color: 'rgba(248,244,239,0.5)',
            animationDuration: '700ms',
          }}
        >
          Explore
        </h1>

        {/* ── Filter row ───────────────────────────────────────── */}
        <div
          className="animate-fade-in mt-8 flex flex-wrap justify-center gap-3"
          style={{ animationDelay: '300ms', animationDuration: '700ms' }}
        >
          {/* ALL pill */}
          <button
            onClick={clearFilters}
            className="rounded-[2px] border-[0.5px] px-4 py-[0.4rem] font-sans uppercase transition-colors duration-200 focus-visible:outline-none"
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              borderColor: isAllActive ? '#f8f4ef' : 'rgba(248,244,239,0.2)',
              color: isAllActive ? '#f8f4ef' : 'rgba(248,244,239,0.45)',
            }}
          >
            All
          </button>

          {FILTER_OPTIONS.map(({ label, value }) => {
            const isActive = activeFilters.has(value);
            return (
              <button
                key={value}
                onClick={() => toggleFilter(value)}
                className="rounded-[2px] border-[0.5px] px-4 py-[0.4rem] font-sans uppercase transition-colors duration-200 focus-visible:outline-none"
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.15em',
                  borderColor: isActive ? '#f8f4ef' : 'rgba(248,244,239,0.2)',
                  color: isActive ? '#f8f4ef' : 'rgba(248,244,239,0.45)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <div
        className="animate-fade-up-24 mx-auto w-full max-w-[var(--content-full-width)] px-[var(--content-padding-x)] pb-24"
        style={{ animationDelay: '600ms', animationDuration: '700ms' }}
      >
        {displayed.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
            {displayed.map((item, idx) => (
              <ExploreCard
                key={`${item._type}-${item.slug}`}
                item={item}
                dimmed={!isMobile && hoveredIndex !== null && hoveredIndex !== idx}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>
        ) : (
          <p
            className="text-center font-serif"
            style={{ fontSize: 'var(--text-lg)', color: 'rgba(248,244,239,0.4)' }}
          >
            Nothing here yet.
          </p>
        )}
      </div>
    </main>
  );
}
