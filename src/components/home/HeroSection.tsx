'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TYPE_HREF: Record<string, string> = {
  essay:       '/writing',
  editorial:   '/mixed-media',
  photoSeries: '/photography',
};

const TYPE_LABEL: Record<string, string> = {
  essay:       'Writing',
  editorial:   'Mixed Media',
  photoSeries: 'Photography',
};

export type HeroItem = {
  _type: string;
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  excerpt?: string;
  description?: string;
  coverImage?: { asset?: object; alt?: string };
};

export function HeroSection({ item }: { item: HeroItem }) {
  const heroRef    = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const href     = `${TYPE_HREF[item._type] ?? '/articles'}/${item.slug}`;
  const blurb    = item.excerpt ?? item.description;
  const dateStr  = item.publishedAt ? formatDate(item.publishedAt) : null;
  const category = TYPE_LABEL[item._type] ?? '';
  const tags     = [item.location, category, dateStr].filter(Boolean).join(' · ');

  // Parallax: image scrolls at ~30 % of hero scroll speed.
  // ScrollTrigger accesses window, so it must be imported dynamically
  // inside useEffect (client-only), never at the module top-level.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const imageEl = imageWrapRef.current;
    const heroEl  = heroRef.current;
    if (!imageEl || !heroEl) return;

    let cleanup: (() => void) | undefined;

    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      const tween = gsap.to(imageEl, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => cleanup?.();
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">

      {/* Parallax image layer — taller than hero to allow upward travel */}
      <div ref={imageWrapRef} className="absolute left-0 right-0 -top-[15%] h-[130%]">
        {item.coverImage?.asset ? (
          <Image
            src={urlFor(item.coverImage).width(2400).format('webp').quality(85).url()}
            alt={item.coverImage.alt ?? item.title}
            fill
            priority
            sizes="100vw"
            className={cn(
              'object-cover transition-opacity duration-[600ms]',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setLoaded(true)}
          />
        ) : (
          // Fallback when no cover image is available
          <div className="h-full w-full bg-ink" />
        )}
      </div>

      {/* Bottom-rise gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0)_60%)]"
      />

      {/* Text stack — lower-left quadrant */}
      <div className="absolute bottom-0 left-0 max-w-[680px] pb-10 pl-6 md:pb-16 md:pl-16">
        <p className="mb-2 font-sans text-[0.75rem] font-normal uppercase tracking-widest text-white/70">
          Featured:
        </p>

        <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-white">
          {item.title}
        </h2>

        {blurb && (
          <p className="mt-4 max-w-[520px] font-sans text-[clamp(0.85rem,1.2vw,1rem)] font-normal leading-[1.6] text-white/85">
            {blurb}
          </p>
        )}

        {tags && (
          <p className="mt-4 font-sans text-[0.7rem] uppercase tracking-widest text-white/60">
            {tags}
          </p>
        )}

        <Link
          href={href}
          className="mt-6 inline-block border border-white px-[1.6rem] py-[0.6rem] font-sans text-[0.75rem] uppercase tracking-[0.1em] text-white transition-colors duration-[300ms] hover:bg-white hover:text-ink"
        >
          Read More
        </Link>
      </div>

    </section>
  );
}
