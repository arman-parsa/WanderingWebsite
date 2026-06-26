'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavLink } from '@/components/layout/NavLink';

/* ───────────────────────────────────────────────────────────────────────────
   Nav transparency model
   ----------------------
   The bar is transparent on every page by default — above all the homepage,
   where it must read transparent over the hero from the very first paint. A
   translucent bar fades in on exactly two surfaces, and only once the reader
   has scrolled:

     • the library list   → translucent paper  (white)
     • an opened article  → translucent ink     (dark), once past its cover hero

   Nothing reads window.scrollY to decide the homepage background — it is simply
   always transparent — so a stale scroll position, browser scroll restoration,
   or mobile svh/lvh drift can never latch it opaque. "Past the hero" is read
   from an IntersectionObserver on the hero element itself (the browser reports
   the geometry directly); the library's "on scroll" is a plain top-or-not flag
   that is false whenever the page sits at the top.

   The nav contents (symbol, EARTH, hamburger) switch between light and dark to
   stay legible against whatever shows through the transparent bar.
   ─────────────────────────────────────────────────────────────────────────── */

const ARTICLE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography'];
const isArticlePath = (path: string) =>
  ARTICLE_PREFIXES.some((p) => path.startsWith(`${p}/`));

// Palette (kept in step with globals.css).
const INK = '#1c1814';
const PAPER = '#f8f4ef';
const BAR_PAPER = 'rgba(248, 244, 239, 0.82)'; // translucent white — library on scroll
const BAR_INK = 'rgba(13, 13, 13, 0.82)';      // translucent dark  — article past hero

// Header height (h-16 = 64px): the article bar appears the instant the hero's
// bottom edge passes below the bar.
const NAV_HEIGHT_PX = 64;
// A little travel before the library bar fades in, so it reads as a deliberate
// "on scroll" rather than flickering at the very top.
const SCROLL_THRESHOLD_PX = 24;

const SYMBOL_SCALE_MAX = 2.0;
const SYMBOL_SCALE_END = 220;

export function NavInner() {
  const pathname   = usePathname();
  const isHomepage = pathname === '/';
  const isLibrary  = pathname === '/library';
  const isEarth    = pathname === '/earth';
  const isArticle  = isArticlePath(pathname);

  const [bodyBgActive, setBodyBgActive] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [pastHero, setPastHero]         = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Reset scroll-derived state and close the menu on route change — during
  // render (React's "adjust state when props change" pattern) so the bar can
  // never paint a previous page's background for a frame.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setPastHero(false);
    setScrolled(false);
    setMenuOpen(false);
  }

  // Homepage article-hover overlay (set on <body> by HomepageClient).
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBodyBgActive(document.body.classList.contains('bg-active'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // "Past the hero" — observe the hero element directly. Pages without a hero
  // (library, about, contact, earth) leave pastHero false, and the default
  // (transparent) holds.
  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px`, threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  // "On scroll" for the library bar — a plain top-or-not flag, mirrored from the
  // resize listener pattern below.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth symbol scale via direct DOM update — bypasses React batching for 60fps.
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    if (!isHomepage) {
      logo.style.transform = 'scale(1)';
      return;
    }

    const updateScale = () => {
      const t = Math.min(1, window.scrollY / SYMBOL_SCALE_END);
      logo.style.transform = `scale(${SYMBOL_SCALE_MAX - t * (SYMBOL_SCALE_MAX - 1)})`;
    };
    updateScale();
    window.addEventListener('scroll', updateScale, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScale);
      logo.style.transform = 'scale(1)';
    };
  }, [isHomepage]);

  // Mobile breakpoint for the dropdown layout.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Nav contents are light when the surface behind the transparent bar is dark:
  // the globe, any article, the homepage hover overlay, or the home hero before
  // it gives way to the cream list below it.
  const darkSurface = isEarth || isArticle || bodyBgActive || (isHomepage && !pastHero);
  const textColour  = darkSurface ? PAPER : INK;

  // The translucent bar — white on the library list, dark on an opened article.
  // The homepage hover overlay keeps the bar fully transparent.
  let barBackground = 'transparent';
  if (!bodyBgActive) {
    if (isLibrary && scrolled)      barBackground = BAR_PAPER;
    else if (isArticle && pastHero) barBackground = BAR_INK;
  }
  const showBar = barBackground !== 'transparent';

  return (
    <div className="nav-shell" style={{ overflow: 'visible' }}>
      <div
        aria-hidden="true"
        className={`nav-bg${showBar ? ' nav-bg--blur' : ''}`}
        style={{
          background: barBackground,
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
            background: darkSurface ? 'rgba(13, 13, 13, 0.97)' : 'rgba(248, 244, 239, 0.97)',
            ['--nav-text' as string]: darkSurface ? PAPER : INK,
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
