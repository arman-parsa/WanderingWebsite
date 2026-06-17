'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavLink } from '@/components/layout/NavLink';

const DARK_PAGE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography', '/earth'];

// Article detail pages open with a full-bleed hero; the nav floats
// transparently over it (like the homepage) until the reader scrolls.
const HERO_PAGE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography'];

// Matches the fixed header height (h-16 = 4rem = 64px); the nav solidifies the
// instant the hero's bottom edge crosses below the bar.
const NAV_HEIGHT_PX = 64;

function isDarkPagePath(path: string): boolean {
  return DARK_PAGE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

function isHeroPagePath(path: string): boolean {
  return HERO_PAGE_PREFIXES.some((prefix) => path.startsWith(`${prefix}/`));
}

const SYMBOL_SCALE_MAX = 2.0;
const SYMBOL_SCALE_END = 220;

export function NavInner() {
  const pathname   = usePathname();
  const isHomepage = pathname === '/';
  const isDarkPage = isDarkPagePath(pathname);

  const [bodyBgActive, setBodyBgActive] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [pastHero, setPastHero]         = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);

  const isMapPage = pathname === '/earth';
  const heroPage  = isHomepage || isHeroPagePath(pathname);

  // Detect article-hover body class (set by HomepageClient)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBodyBgActive(document.body.classList.contains('bg-active'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Reset transparency to its default and close the menu on route change.
  // Done during render (React's "adjust state when props change" pattern) so the
  // nav can't paint a stale opaque background from the previous page for a frame.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setPastHero(false);
    setMenuOpen(false);
  }

  // Whether the hero has scrolled up past the nav bar. Driven by an
  // IntersectionObserver on the hero element itself rather than a scroll/
  // viewport-height threshold: the browser reports the geometry directly, so
  // the nav can't get stuck opaque from a stale scrollY on load, scroll
  // restoration, or mobile svh/lvh drift. Defaults transparent (pastHero=false)
  // so SSR and the first client paint match — the observer only ever flips it
  // to opaque once the hero is genuinely gone.
  useEffect(() => {
    if (!heroPage) return;
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px`, threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname, heroPage]);

  // Smooth symbol scale via direct DOM update — bypasses React batching for 60fps
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    if (!isHomepage) {
      logo.style.transform = 'scale(1)';
      return;
    }

    const updateScale = () => {
      const t = Math.min(1, window.scrollY / SYMBOL_SCALE_END);
      const scale = SYMBOL_SCALE_MAX - t * (SYMBOL_SCALE_MAX - 1);
      logo.style.transform = `scale(${scale})`;
    };
    updateScale();
    window.addEventListener('scroll', updateScale, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScale);
      logo.style.transform = 'scale(1)';
    };
  }, [isHomepage]);

  // Detect mobile breakpoint for the dropdown layout
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const onHero    = heroPage && !pastHero;
  const isLight   = isDarkPage || bodyBgActive || onHero;
  const textColour = isLight ? '#f8f4ef' : '#1c1814';

  const bgValue = bodyBgActive || onHero || isMapPage
    ? 'transparent'
    : isDarkPage
    ? 'rgba(28, 24, 20, 0.92)'
    : 'rgba(248, 244, 239, 0.92)';

  const showBlur = !bodyBgActive && !onHero && !isMapPage;

  return (
    <div className="nav-shell" style={{ overflow: 'visible' }}>
      <div
        aria-hidden="true"
        className={`nav-bg${showBlur ? ' nav-bg--blur' : ''}`}
        style={{
          background: bgValue,
          transition: 'background 250ms ease, backdrop-filter 250ms ease, -webkit-backdrop-filter 250ms ease',
        }}
      />
      <nav
        className="nav-inner nav-grid"
        style={{ '--nav-text': textColour } as React.CSSProperties}
      >
        {/* Left — EARTH */}
        <div className="nav-grid-left">
          <NavLink href="/earth">EARTH</NavLink>
        </div>

        {/* Center — alchemical symbol, scale driven via ref for smooth animation */}
        <div className="nav-grid-center">
          <Link
            href="/"
            ref={logoRef}
            aria-label="Arman Parsa - Dispatches — home"
            className="logo-link"
            style={{ transformOrigin: 'center center' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <polygon
                points="14,4 26,25 2,25"
                fill="none"
                strokeWidth="1.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ stroke: textColour, transition: 'stroke 250ms ease' }}
              />
              <line
                x1="2" y1="11" x2="26" y2="11"
                strokeWidth="1.2"
                strokeLinecap="round"
                style={{ stroke: textColour, transition: 'stroke 250ms ease' }}
              />
            </svg>
          </Link>
        </div>

        {/* Right — hamburger / expanded links */}
        <div className="nav-grid-right">
          {menuOpen && !isMobile && (
            <div className="nav-menu-expanded">
              <NavLink href="/library">LIBRARY</NavLink>
              <NavLink href="/about">ABOUT</NavLink>
              <NavLink href="/contact">CONTACT</NavLink>
            </div>
          )}
          <button
            className="nav-hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <span className="nav-close-x" style={{ color: textColour }}>✕</span>
            ) : (
              <span className="nav-hamburger-bars" aria-hidden="true">
                <span style={{ background: textColour }} />
                <span style={{ background: textColour }} />
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile full-width dropdown (below nav bar) */}
      {menuOpen && isMobile && (
        <div
          className="nav-menu-mobile"
          style={{
            background: isLight ? 'rgba(18, 14, 10, 0.97)' : 'rgba(248, 244, 239, 0.97)',
            ['--nav-text' as string]: isLight ? '#f8f4ef' : '#1c1814',
          } as React.CSSProperties}
        >
          <NavLink href="/library">LIBRARY</NavLink>
          <NavLink href="/about">ABOUT</NavLink>
          <NavLink href="/contact">CONTACT</NavLink>
        </div>
      )}
    </div>
  );
}
