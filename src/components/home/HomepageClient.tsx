'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
          {/* Tagline — h1 is visually styled as a tagline but semantically the page title */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <h1 className="hero-tagline">Stories collected around the world.</h1>
          </div>
        </section>

        {/* ── Article list + footer link ────────────────────── */}
        {/* z-index 3: above hover bg (z=2) so titles stay readable while bg image shows */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <section
            aria-label="Recent work"
            style={{ paddingLeft: px, paddingRight: px, paddingTop: '4rem' }}
          >
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
                      <h2
                        className="home-article-title"
                        style={{
                          color: isHov ? '#f8f4ef' : 'var(--color-ink)',
                          transition: 'color 100ms ease',
                        }}
                      >
                        {item.title}
                      </h2>
                      <div
                        className="home-article-meta"
                        aria-hidden={!showMeta}
                        style={{ opacity: showMeta ? 1 : 0, transition: 'opacity 100ms ease' }}
                      >
                        {item.location && (
                          <span style={{
                            fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 400,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: isMobile ? 'var(--color-ink-muted)' : '#f8f4ef',
                          }}>
                            {item.location}
                          </span>
                        )}
                        <span style={{
                          fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 300,
                          letterSpacing: '0.04em', marginTop: '1px',
                          color: isMobile ? 'rgba(122,112,103,0.7)' : 'rgba(248,244,239,0.60)',
                        }}>
                          {TYPE_LABEL[item._type] ?? ''}
                        </span>
                        {item.description && (
                          <p style={{
                            fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 300,
                            fontStyle: 'italic', lineHeight: 1.7, marginTop: '9px',
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
