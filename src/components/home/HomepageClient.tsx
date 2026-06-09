'use client';

import { useState, useEffect } from 'react';
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

export function HomepageClient({ items }: { items: HomeItem[] }) {
  const [hovered, setHovered]   = useState<HomeItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const bgActive = hovered !== null;
  const bgUrl    = hovered?.coverImageUrl;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Preload cover images so first hover is instant
  useEffect(() => {
    items.forEach(item => {
      if (item.coverImageUrl) {
        const img = new window.Image();
        img.src = item.coverImageUrl;
      }
    });
  }, [items]);

  // Sync body class → NavInner reads it via MutationObserver
  useEffect(() => {
    document.body.classList.toggle('bg-active', bgActive);
  }, [bgActive]);

  useEffect(() => {
    return () => { document.body.classList.remove('bg-active'); };
  }, []);

  const px = 'clamp(1.5rem, 4vw, 3.75rem)';

  return (
    <>
      {/* Fixed full-bleed background layer */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: bgActive ? 1 : 0,
          transition: 'opacity 100ms ease',
          willChange: 'opacity',
        }}
      >
        {bgUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${bgUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
        {/* Dark tint overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,20,0.38)' }} />
      </div>

      <main id="main-content" style={{ position: 'relative', zIndex: 2 }}>

        {/* Opening — tagline left / title right */}
        <section
          className="home-opening"
          aria-label="Site introduction"
          style={{ paddingLeft: px, paddingRight: px }}
        >
          <p
            className="home-tagline"
            style={{
              color: bgActive ? 'rgba(248,244,239,0.55)' : 'var(--color-ink-muted)',
              transition: 'color 100ms ease',
            }}
          >
            Writing and visual media<br />collected across the world
          </p>
          <h1
            className="home-title"
            style={{
              color: bgActive ? 'rgba(248,244,239,0.90)' : 'var(--color-ink)',
              transition: 'color 100ms ease',
            }}
          >
            Arman&apos;s Wanderings
          </h1>
        </section>

        {/* Article list */}
        <section
          aria-label="Recent work"
          style={{ paddingLeft: px, paddingRight: px }}
        >
          {items.map(item => {
            const href   = `${TYPE_HREF[item._type] ?? '/articles'}/${item.slug}`;
            const isHov  = hovered?.slug === item.slug;
            const showMeta = isMobile || isHov;

            return (
              <article
                key={item.slug}
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
                      aria-hidden="true"
                      style={{ opacity: showMeta ? 1 : 0, transition: 'opacity 100ms ease' }}
                    >
                      {item.location && (
                        <span style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '12px',
                          fontWeight: 400,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isMobile ? 'var(--color-ink-muted)' : '#f8f4ef',
                        }}>
                          {item.location}
                        </span>
                      )}
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 300,
                        letterSpacing: '0.04em',
                        color: isMobile ? 'rgba(122,112,103,0.7)' : 'rgba(248,244,239,0.60)',
                        marginTop: '1px',
                      }}>
                        {TYPE_LABEL[item._type] ?? ''}
                      </span>
                      {item.description && (
                        <p style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '12px',
                          fontWeight: 300,
                          fontStyle: 'italic',
                          lineHeight: 1.7,
                          color: isMobile ? 'rgba(122,112,103,0.80)' : 'rgba(248,244,239,0.70)',
                          marginTop: '9px',
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

        {/* All articles link */}
        <div style={{
          paddingTop: '52px',
          paddingBottom: '148px',
          paddingLeft: px,
          paddingRight: px,
        }}>
          <Link href="/articles" className="home-read-more">
            All articles
          </Link>
        </div>

      </main>
    </>
  );
}
