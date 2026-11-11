'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { sanityLoader } from '@/components/content/SanityImage';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { HeroSlide } from '@/lib/siteSettings';
import { shuffled } from '@/lib/shuffle';

/** How long each hero image holds, fully shown, before crossfading to the next. */
export const HERO_HOLD_MS = 2000;
/** Crossfade length — keep in step with --duration-hero-fade in globals.css. */
const HERO_FADE_MS = 1500;
/** If the first image's load event is missed (e.g. cached before hydration), show it anyway. */
const FIRST_LOAD_FALLBACK_MS = 2500;

export const HERO_TAGLINE =
  'Travel, documentary and lifestyle photography, film and writing. UK based, working worldwide.';

/**
 * Homepage hero: the Site Settings images in random order, each holding for
 * HERO_HOLD_MS and then crossfading slowly into the next, forever. The first
 * photo is chosen on the server (the page's order is shuffled each time the
 * homepage regenerates); every photo after it is drawn at random in the
 * browser, a fresh order for each visitor.
 *
 * - The first image loads with priority and fades in once it has loaded.
 * - Each next image is mounted (and so downloaded) while the current one is
 *   holding, and the crossfade only starts once it has loaded — never a
 *   blank frame or a half-drawn image.
 * - Rotation pauses while the tab is hidden or the hero is scrolled away.
 * - Reduced motion: the first image only, no rotation.
 */
export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const rotates = slides.length > 1 && !reducedMotion;

  const [current, setCurrent] = useState(0);
  // The photo that follows the current one: drawn at random once the
  // current one is on screen (in the browser only, so the server-rendered
  // first frame never changes).
  const [upcoming, setUpcoming] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
  // Every slide that has been on screen stays mounted (already downloaded).
  const [shown, setShown] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [tabVisible, setTabVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  // Shuffled photos still to show this round: each photo once per round, in
  // a new random order every round, never the same photo twice in a row.
  const bag = useRef<number[]>([]);

  const paused = !tabVisible || !heroVisible;
  const currentLoaded = loaded.has(current);
  // While the current image holds, the upcoming one is mounted so it downloads.
  const isMounted = (i: number) => shown.has(i) || (rotates && i === upcoming);

  const draw = (after: number): number => {
    if (bag.current.length === 0) {
      bag.current = shuffled(slides.map((_, i) => i).filter((i) => i !== after));
    }
    return bag.current.pop() as number;
  };

  // Latest values for the timer / load callbacks below.
  const live = useRef({ current, upcoming, loaded, paused, due: false });
  useEffect(() => {
    live.current = { ...live.current, current, upcoming, loaded, paused };
  });

  const advance = () => {
    const to = live.current.upcoming;
    if (to === null) return;
    live.current.due = false;
    // Drop `to` from this round if it was drawn there, then pick what follows it.
    bag.current = bag.current.filter((i) => i !== to);
    setCurrent(to);
    setShown((prev) => (prev.has(to) ? prev : new Set(prev).add(to)));
    setUpcoming(draw(to));
  };

  const handleLoad = (i: number) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
    // The current photo is up: choose (and start downloading) the next one.
    if (rotates && i === live.current.current && live.current.upcoming === null) {
      setUpcoming(draw(i));
    }
    // The hold already ran out while the upcoming image was still loading.
    if (live.current.due && i === live.current.upcoming && !live.current.paused) advance();
  };

  useEffect(() => {
    const id = setTimeout(() => handleLoad(0), FIRST_LOAD_FALLBACK_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    const hero = heroRef.current;
    const io = hero
      ? new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting))
      : null;
    if (hero) io?.observe(hero);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
    };
  }, []);

  // Hold: the fade-in (or crossfade) plus HERO_HOLD_MS, measured from when the
  // current image is shown. Pausing restarts the hold on return. When it runs
  // out the crossfade starts at once if the next image is ready, otherwise as
  // soon as it finishes loading (handleLoad).
  useEffect(() => {
    if (!rotates || !currentLoaded || paused) return;
    const id = setTimeout(() => {
      const { upcoming: next, loaded: ready } = live.current;
      if (next !== null && ready.has(next)) advance();
      else live.current.due = true;
    }, HERO_FADE_MS + HERO_HOLD_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advance reads the live ref
  }, [rotates, currentLoaded, paused, current]);

  const visibleSlides = rotates ? slides : slides.slice(0, 1);

  return (
    <section ref={heroRef} className="home-hero" aria-label="Introduction" data-hero>
      {visibleSlides.map((slide, i) => {
        const shown = i === current && loaded.has(i);
        return (
          <div
            key={slide.src}
            className={`home-hero__slide${shown ? ' home-hero__slide--shown' : ''}`}
            aria-hidden={i === current ? undefined : true}
          >
            {isMounted(i) && (
              <Image
                src={slide.src}
                loader={slide.isSanity ? sanityLoader : undefined}
                alt={slide.alt}
                fill
                // First image: the LCP element, preloaded from <head>. Later
                // ones are only mounted when wanted, so fetch them at once,
                // but behind anything more urgent.
                {...(i === 0 ? { preload: true } : { loading: 'eager' as const, fetchPriority: 'low' as const })}
                quality={90}
                sizes="100vw"
                className="home-hero__img"
                style={{ objectPosition: slide.objectPosition }}
                onLoad={() => handleLoad(i)}
              />
            )}
          </div>
        );
      })}

      {/* A very soft, wide falloff behind the text and the nav — tone, not a shape. */}
      <div className="home-hero__scrim" aria-hidden="true" />

      <div className="home-hero__text">
        <h1 className="home-hero__name">Arman Parsa</h1>
        <p className="home-hero__tagline">{HERO_TAGLINE}</p>
      </div>
    </section>
  );
}
