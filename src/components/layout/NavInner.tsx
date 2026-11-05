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

// Dark detail pages: the four piece types, and individual commissions.
const ARTICLE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography', '/commissions'];
const isArticlePath = (path: string) =>
  ARTICLE_PREFIXES.some((p) => path.startsWith(`${p}/`));

// Palette (kept in step with globals.css).
const INK = '#1c1814';
const PAPER = '#f8f4ef';
const BAR_PAPER = 'rgba(248, 244, 239, 0.82)'; // translucent white — light pages on scroll
const BAR_INK = 'rgba(13, 13, 13, 0.82)';      // translucent dark  — article past hero

// Header height (h-16 = 64px): the article bar appears the instant the hero's
// bottom edge passes below the bar.
const NAV_HEIGHT_PX = 64;
// A little travel before the library bar fades in, so it reads as a deliberate
// "on scroll" rather than flickering at the very top.
const SCROLL_THRESHOLD_PX = 24;

const SYMBOL_SCALE_MAX = 2.0;
const SYMBOL_SCALE_END = 220;

// Below this width PERSONAL / COMMISSIONS / CONTACT fold behind the menu
// button (globals.css uses the same value: .nav-links-right / .nav-menu-btn).
// Narrower than 720px the row would touch the homepage's enlarged symbol.
const COLLAPSE_QUERY = '(max-width: 719px)';
// Phones — the gallery switches to its single-column layout (globals.css).
const PHONE_QUERY = '(max-width: 639px)';

const LEFT_LINKS = [
  { href: '/earth', label: 'EARTH' },
  { href: '/gallery', label: 'GALLERY' },
] as const;
const RIGHT_LINKS = [
  { href: '/library', label: 'PERSONAL' },
  { href: '/commissions', label: 'COMMISSIONS', matchPrefix: true },
  { href: '/contact', label: 'CONTACT' },
] as const;

export function NavInner() {
  const pathname   = usePathname();
  const isHomepage = pathname === '/';
  const isEarth    = pathname === '/earth';
  const isGallery  = pathname === '/gallery';
  const isArticle  = isArticlePath(pathname);

  const [bodyBgActive, setBodyBgActive] = useState(false);
  const [globePanelOpen, setGlobePanelOpen] = useState(false);
  const [hasHero, setHasHero]           = useState(true);
  const [isPhone, setIsPhone]           = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [pastHero, setPastHero]         = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

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

  // Homepage article-hover overlay (set on <body> by HomepageClient), and
  // the globe's cream side panel (set by GlobeView on desktop).
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBodyBgActive(document.body.classList.contains('bg-active'));
      setGlobePanelOpen(document.body.classList.contains('globe-panel-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // "Past the hero" — measured from the hero's real position, never assumed.
  // The default (false) keeps the nav light, which is right over every hero;
  // it only turns dark once the hero's bottom edge is measured above the bar,
  // i.e. the bar really sits over the cream page below it. (An
  // IntersectionObserver used to decide this, but Safari can deliver its first
  // report before layout settles — especially when restoring a scroll
  // position — which painted the nav dark over the dark hero.) Re-measured on
  // scroll, resize, back/forward restores and whenever the hero changes size.
  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { bottom, height } = hero.getBoundingClientRect();
        // height 0 = not laid out yet: stay light.
        setPastHero(height > 0 && bottom <= NAV_HEIGHT_PX);
      });
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('pageshow', measure);
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pageshow', measure);
      ro.disconnect();
    };
  }, [pathname]);

  // "On scroll" for the library bar — a plain top-or-not flag, mirrored from the
  // resize listener pattern below.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
      // Articles without a cover have no hero to observe — their dark bar
      // falls back to this plain "scrolled" flag.
      setHasHero(!!document.querySelector('[data-hero]'));
    };
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

  // While the phone menu is open: Escape closes it and returns focus to the
  // button; a tap outside the nav, or widening past the breakpoint (where the
  // links are inline again), closes it too.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      menuBtnRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!shellRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const mq = window.matchMedia(COLLAPSE_QUERY);
    const onWiden = () => { if (!mq.matches) setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    mq.addEventListener('change', onWiden);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
      mq.removeEventListener('change', onWiden);
    };
  }, [menuOpen]);

  // Phones: the gallery's prints float right under the nav (see below).
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const check = () => setIsPhone(mq.matches);
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  // Nav contents are light when the surface behind the transparent bar is dark:
  // the globe, any article, the homepage hover overlay, or the home hero before
  // it gives way to the cream list below it.
  const darkSurface = isEarth || isArticle || bodyBgActive || (isHomepage && !pastHero);
  const textColour  = darkSurface ? PAPER : INK;

  // The translucent bar, so scrolled content never runs under the nav:
  //   • articles — dark, once past the cover (or on scroll, if no cover)
  //   • light pages (home below the hero, library, about, contact…) — white,
  //     on scroll
  //   • gallery on phones — white always: prints float right under the nav
  // The homepage hover overlay keeps the bar fully transparent.
  let barBackground = 'transparent';
  if (!bodyBgActive) {
    if (isArticle) {
      if (pastHero || (!hasHero && scrolled)) barBackground = BAR_INK;
    } else if (!darkSurface && (scrolled || (isGallery && isPhone))) {
      barBackground = BAR_PAPER;
    }
  }
  const showBar = barBackground !== 'transparent';
  // The right-hand links sit over the globe's cream side panel when it's
  // open (desktop only — on phones the panel is a bottom sheet).
  const rightColour = isEarth && globePanelOpen && !isPhone ? INK : textColour;

  return (
    <div ref={shellRef} className="nav-shell" style={{ overflow: 'visible' }}>
      <div
        aria-hidden="true"
        className={`nav-bg${showBar ? ' nav-bg--blur' : ''}`}
        style={{
          background: barBackground,
          transition: 'background 250ms ease, backdrop-filter 250ms ease, -webkit-backdrop-filter 250ms ease',
        }}
      />
      <nav
        aria-label="Main"
        className="nav-inner nav-grid"
        style={{ '--nav-text': textColour } as React.CSSProperties}
      >
        {/* Left — EARTH, GALLERY */}
        <div className="nav-grid-left">
          {LEFT_LINKS.map(({ href, label }) => (
            <NavLink key={href} href={href}>{label}</NavLink>
          ))}
        </div>

        {/* Center — alchemical symbol, scale driven via ref for smooth animation */}
        <div className="nav-grid-center">
          <Link
            href="/"
            ref={logoRef}
            aria-label="Arman Parsa - Portfolio — home"
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

        {/* Right — PERSONAL, COMMISSIONS, CONTACT inline; on phones they fold
            behind the menu button (CSS decides which shows, so the first
            paint is already right). */}
        <div className="nav-grid-right" style={{ '--nav-text': rightColour } as React.CSSProperties}>
          <div className="nav-links-right">
            {RIGHT_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} matchPrefix={'matchPrefix' in link}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <button
            ref={menuBtnRef}
            type="button"
            className="nav-hamburger-btn nav-menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            {menuOpen ? (
              <span className="nav-close-x" aria-hidden="true">✕</span>
            ) : (
              <span className="nav-hamburger-bars" aria-hidden="true">
                <span />
                <span />
              </span>
            )}
          </button>
        </div>

        {/* Phone dropdown (below the bar). Rendered after the button, so Tab
            moves from the button straight into the links. */}
        <div
          id="site-menu"
          className="nav-menu-mobile"
          hidden={!menuOpen}
          style={{
            background: darkSurface ? 'rgba(13, 13, 13, 0.97)' : 'rgba(248, 244, 239, 0.97)',
            ['--nav-text' as string]: darkSurface ? PAPER : INK,
          } as React.CSSProperties}
        >
          {RIGHT_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} matchPrefix={'matchPrefix' in link}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
