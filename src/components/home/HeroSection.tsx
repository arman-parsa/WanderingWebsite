'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { urlFor } from '@/lib/sanityImage';
import { cn } from '@/lib/utils';

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

export type HeroItem = {
  _type: string;
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  description?: string;
  coverImage?: { asset?: object; alt?: string };
};

export function HeroSection({ item }: { item: HeroItem }) {
  const heroRef    = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const href     = `${TYPE_HREF[item._type] ?? '/articles'}/${item.slug}`;
  const blurb    = item.description;
  const category = TYPE_LABEL[item._type] ?? '';

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

  const imageSrc = item.coverImage?.asset
    ? urlFor(item.coverImage).width(2400).format('webp').quality(85).url()
    : '/images/hero-placeholder.jpg';

  const imageAlt = item.coverImage?.alt ?? item.title;

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">

      {/* Parallax image layer */}
      <div
        ref={imageWrapRef}
        className="absolute left-0 right-0 -top-[15%] h-[130%] [animation-delay:600ms] [animation-duration:1000ms] animate-fade-in"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className={cn(
            'object-cover transition-opacity duration-[600ms]',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Top gradient so nav text stays readable */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45)_0%,transparent_100%)]"
      />

      {/* Bottom-rise gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0)_60%)]"
      />

      {/* Text stack — lower-left */}
      <div
        className="absolute bottom-0 left-0 max-w-[680px] pl-[clamp(2rem,6vw,5rem)] pb-[clamp(2rem,5vh,4rem)] [animation-delay:1200ms] [animation-duration:800ms] animate-fade-in"
      >
        <p className="mb-3 font-sans text-[0.7rem] font-normal uppercase tracking-widest text-white/70">
          {category}
        </p>

        <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-white">
          {item.title}
        </h2>

        {blurb && (
          <p className="mt-4 max-w-[520px] font-serif text-[clamp(0.9rem,1.2vw,1.05rem)] italic font-light leading-[1.65] text-white/85">
            {blurb}
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
