'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroNameSVG } from '@/components/home/HeroNameSVG';

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

export type HomeItem = {
  _type: string;
  title: string;
  slug: string;
  location?: string;
  description?: string;
  coverImageUrl?: string;
};

export function HomepageClient({
  items,
  heroImages = [],
}: {
  items: HomeItem[];
  heroImages?: string[];
}) {
  const [hovered, setHovered]   = useState<HomeItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [bgIdx, setBgIdx]       = useState(0);
  // Slides 0..maxMounted render an <Image>; the rest stay empty until the
  // rotation approaches them, so the browser never downloads all heroes at once.
  const [maxMounted, setMaxMounted] = useState(() => Math.min(1, heroImages.length - 1));

  const bgActive = hovered !== null;
  const bgUrl    = hovered?.coverImageUrl;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Rotate hero background images
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const id = setInterval(() => {
      setBgIdx(i => {
        const next = (i + 1) % heroImages.length;
        // Mount one slide ahead so the upcoming image has the full 5s to load
        setMaxMounted(m => Math.max(m, Math.min(next + 1, heroImages.length - 1)));
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [heroImages]);

  // Preload article cover images
  useEffect(() => {
    items.forEach(item => {
      if (item.coverImageUrl) {
        const img = new window.Image();
        img.src = item.coverImageUrl;
      }
    });
  }, [items]);

  // Sync body class for NavInner bg-active detection
  useEffect(() => {
    document.body.classList.toggle('bg-active', bgActive);
  }, [bgActive]);

  useEffect(() => {
    return () => { document.body.classList.remove('bg-active'); };
  }, []);

  const px = 'clamp(1.5rem, 4vw, 3.75rem)';

  return (
    <>
      {/* Fixed full-bleed background layer — article hover effect */}
      {/* z-index 2: sits above hero section (z=1) but below article content (z=3) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          opacity: bgActive ? 1 : 0,
          transition: 'opacity 100ms ease',
          willChange: 'opacity',
        }}
      >
        {bgUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${bgUrl}')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,20,0.38)' }} />
      </div>

      {/* main has no z-index so children can stack against root context independently */}
      <main id="main-content" style={{ position: 'relative' }}>

        {/* ── Hero ─────────────────────────────────────────── */}
        {/* z-index 1: below hover bg (z=2), so article hover covers it when partially visible */}
        <section
          className="hero-section"
          aria-label="Site introduction"
          data-hero
          style={{ background: '#070b12', position: 'relative', zIndex: 1 }}
        >
          {heroImages.map((url, i) => (
            <div
              key={url}
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                opacity: i === bgIdx ? 1 : 0,
                transition: 'opacity 1500ms ease',
              }}
            >
              {i <= maxMounted && (
                <Image
                  src={url}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </div>
          ))}
          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,20,0.48)', zIndex: 1 }} />
          {/* Bottom text block */}
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: `0 ${px} clamp(1.25rem, 3vw, 2.5rem)`,
            }}
          >
            {/* Info band above the name: serif lead left, small-caps meta right —
                the two lines frame the name instead of stacking over it. */}
            <div className="hero-intro-row">
              <p className="hero-lead">Stories collected around the world.</p>
              <p className="hero-meta">
                A portfolio of writing, photography and videography
                on nature, culture and spirit.
              </p>
            </div>
            <Link href="/about" className="hero-name-link">
              <h1 className="sr-only">Arman Parsa</h1>
              <HeroNameSVG className="hero-name-svg" />
            </Link>
          </div>
        </section>

        {/* ── Article list + footer link ────────────────────── */}
        {/* z-index 3: above hover bg (z=2) so titles stay readable while bg image shows */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <section
            aria-label="Recent work"
            style={{ paddingLeft: px, paddingRight: px, paddingTop: '4rem' }}
          >
            <p className="home-section-label" aria-hidden="true">Explore</p>
            {items.map(item => {
              const href     = `${TYPE_HREF[item._type] ?? '/library'}/${item.slug}`;
              const isHov    = hovered?.slug === item.slug;
              const showMeta = isMobile || isHov;

              return (
                <article
                  key={`${item._type}-${item.slug}`}
                  className="home-article-item"
                  onMouseEnter={() => { if (!isMobile) setHovered(item); }}
                  onMouseLeave={() => { if (!isMobile) setHovered(null); }}
                >
                  <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="home-article-row">
                      <div className="home-article-titleblock">
                        {/* Category + place anchor the title. */}
                        <p
                          className="home-article-tag"
                          style={{
                            color: isHov && !isMobile ? 'rgba(248,244,239,0.78)' : 'var(--color-ink-muted)',
                            transition: 'color 100ms ease',
                          }}
                        >
                          {TYPE_LABEL[item._type] ?? ''}
                          {item.location ? ` · ${item.location}` : ''}
                        </p>
                        <h2
                          className="home-article-title"
                          style={{
                            color: isHov ? '#f8f4ef' : 'var(--color-ink)',
                            transition: 'color 100ms ease',
                          }}
                        >
                          {item.title}
                        </h2>
                      </div>
                      {/* On hover only the description joins the cover image —
                          category and place already live on the title. */}
                      <div
                        className="home-article-meta"
                        aria-hidden={!showMeta}
                        style={{ opacity: showMeta ? 1 : 0, transition: 'opacity 100ms ease' }}
                      >
                        {item.description && (
                          <p style={{
                            fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 300,
                            fontStyle: 'italic', lineHeight: 1.7, margin: 0,
                            color: isMobile ? 'rgba(122,112,103,0.80)' : 'rgba(248,244,239,0.70)',
                          }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </section>

          {/* ── All articles link ─────────────────────────────── */}
          <div className="home-articles-footer" style={{ paddingLeft: px, paddingRight: px }}>
            <Link href="/library" className="home-read-more">
              All work
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}
