'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type ContentItem = {
  _type: 'writing' | 'mixedMedia' | 'photography' | 'videography';
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  description?: string;
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

type Filter = 'ALL' | 'writing' | 'photography' | 'mixedMedia' | 'videography';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Writing',     value: 'writing' },
  { label: 'Photography', value: 'photography' },
  { label: 'Mixed Media', value: 'mixedMedia' },
  { label: 'Videography', value: 'videography' },
];

export function ArticlesClient({ items }: { items: ContentItem[] }) {
  const [active, setActive] = useState<Filter>('ALL');
  const [fading, setFading] = useState(false);
  const [displayed, setDisplayed] = useState<ContentItem[]>(items);

  function handleFilter(value: Filter) {
    if (value === active) return;
    setFading(true);
    setTimeout(() => {
      setDisplayed(value === 'ALL' ? items : items.filter((i) => i._type === value));
      setActive(value);
      setFading(false);
    }, 200);
  }

  const featured = displayed[0];
  const rest = displayed.slice(1);

  return (
    <main
      id="main-content"
      className="min-h-screen w-full"
      style={{ backgroundColor: '#1c1814', color: '#f8f4ef' }}
    >
      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div
        className="sticky top-14 z-40 flex items-center gap-6 px-[var(--content-padding-x)] py-4"
        style={{ backgroundColor: '#1c1814', borderBottom: '1px solid rgba(248,244,239,0.12)' }}
      >
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleFilter(value)}
            className={cn(
              'font-sans text-[0.7rem] uppercase tracking-widest transition-colors duration-[200ms] focus-visible:outline-none',
              active === value
                ? 'border-b border-[#f8f4ef] pb-px text-[#f8f4ef]'
                : 'text-[#a09890] hover:text-[#f8f4ef]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] pt-12 pb-24 transition-opacity duration-[300ms]"
        style={{ opacity: fading ? 0 : 1 }}
      >

        {/* ── Featured card ──────────────────────────────────────── */}
        {featured && (
          <Link
            href={`${TYPE_HREF[featured._type]}/${featured.slug}`}
            className="group mb-12 flex min-h-[480px] w-full flex-col overflow-hidden md:flex-row"
            style={{ borderBottom: '1px solid rgba(248,244,239,0.12)' }}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-auto md:h-auto md:w-[60%]">
              {featured.coverImage?.asset ? (
                <Image
                  src={urlFor(featured.coverImage).width(1400).height(900).fit('crop').format('webp').quality(85).url()}
                  alt={featured.coverImage.alt ?? featured.title}
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, 60vw"
                  className="object-cover opacity-0 transition-[opacity,filter] duration-[600ms] group-hover:brightness-90 [&[data-loaded]]:opacity-100"
                  onLoad={(e) => (e.currentTarget.dataset.loaded = 'true')}
                />
              ) : (
                <div className="h-full w-full" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
              )}
            </div>

            <div
              className="flex w-full flex-col justify-center px-8 py-10 md:w-[40%]"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <p className="mb-4 font-sans text-[0.7rem] uppercase tracking-widest" style={{ color: '#a09890' }}>
                {TYPE_LABEL[featured._type]}
                {featured.location && ` · ${featured.location}`}
                {featured.publishedAt && ` · ${formatDate(featured.publishedAt)}`}
              </p>
              <h2
                className="font-serif font-light leading-[1.2]"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '-0.03em', color: '#f8f4ef' }}
              >
                {featured.title}
              </h2>
              {featured.description && (
                <p
                  className="mt-4 font-serif font-normal leading-[1.8]"
                  style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1rem)', color: 'rgba(248,244,239,0.75)' }}
                >
                  {featured.description}
                </p>
              )}
              <span
                className="mt-8 inline-block self-start border px-[1.4rem] py-[0.55rem] font-sans text-[0.7rem] uppercase tracking-[0.1em] transition-colors duration-[300ms] group-hover:bg-[#f8f4ef] group-hover:text-[#1c1814]"
                style={{ borderColor: 'rgba(248,244,239,0.4)', color: '#f8f4ef' }}
              >
                View
              </span>
            </div>
          </Link>
        )}

        {/* ── 2-column grid ──────────────────────────────────────── */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {rest.map((item) => {
              const href = `${TYPE_HREF[item._type]}/${item.slug}`;
              return (
                <article key={item.slug} className="group overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-video overflow-hidden">
                    {item.coverImage?.asset ? (
                      <Image
                        src={urlFor(item.coverImage).width(800).height(450).fit('crop').format('webp').quality(80).url()}
                        alt={item.coverImage.alt ?? item.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 639px) 100vw, 50vw"
                        className="object-cover brightness-100 transition-[filter] duration-[400ms] group-hover:brightness-[0.85] opacity-0 [&[data-loaded]]:opacity-100"
                        onLoad={(e) => (e.currentTarget.dataset.loaded = 'true')}
                      />
                    ) : (
                      <div className="h-full w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                    )}
                  </Link>

                  <div className="px-5 py-5">
                    <p
                      className="mb-2 font-sans text-[0.7rem] uppercase tracking-widest"
                      style={{ color: '#a09890' }}
                    >
                      {TYPE_LABEL[item._type]}
                      {item.location && ` · ${item.location}`}
                      {item.publishedAt && ` · ${formatDate(item.publishedAt)}`}
                    </p>
                    <h3 className="font-serif font-light leading-[1.35]" style={{ fontSize: '1.35rem', color: '#f8f4ef' }}>
                      <Link
                        href={href}
                        className="transition-opacity duration-[200ms] hover:opacity-70 focus-visible:outline-none focus-visible:opacity-70"
                      >
                        {item.title}
                      </Link>
                    </h3>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {displayed.length === 0 && (
          <p className="font-serif text-[var(--text-lg)]" style={{ color: '#a09890' }}>
            No content in this category yet.
          </p>
        )}
      </div>
    </main>
  );
}
