'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HomeHero } from '@/components/home/HomeHero';
import { TYPE_HREF, TYPE_LABEL } from '@/lib/contentTypes';
import type { HeroSlide } from '@/lib/siteSettings';

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
  heroSlides,
}: {
  items: HomeItem[];
  heroSlides: HeroSlide[];
}) {
  const [hovered, setHovered]   = useState<HomeItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  // Only pieces with a cover darken the page on hover — without one the
  // overlay was just a flat grey wash.
  const bgActive = !!hovered?.coverImageUrl;
  const bgUrl    = hovered?.coverImageUrl;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Preload article cover images for the hover background — only on devices
  // that can hover (touch screens never show it), and only once the page has
  // settled so they don't compete with the hero.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const id = setTimeout(() => {
      items.forEach(item => {
        if (item.coverImageUrl) {
          const img = new window.Image();
          img.src = item.coverImageUrl;
        }
      });
    }, 2000);
    return () => clearTimeout(id);
  }, [items]);

  // Sync body class for NavInner bg-active detection
  useEffect(() => {
    document.body.classList.toggle('bg-active', bgActive);
  }, [bgActive]);

  useEffect(() => {
    return () => { document.body.classList.remove('bg-active'); };
  }, []);

  const px = 'clamp(1.5rem, 4vw, 3rem)'; // same side margin as the nav

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
        {/* z-index 1 (globals.css): below the hover bg (z=2), so an article
            hover covers it when it's partly in view. */}
        <HomeHero slides={heroSlides} />

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
                        style={{ opacity: showMeta ? 1 : 0, transition: 'opacity 100ms ease' }}
                      >
                        {item.description && (
                          <p style={{
                            fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 300,
                            fontStyle: 'italic', lineHeight: 1.7, margin: 0,
                            color: isMobile ? 'var(--color-ink-muted)' : 'rgba(248,244,239,0.70)',
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
              All personal work
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}
