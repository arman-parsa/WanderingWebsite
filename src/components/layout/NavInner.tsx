'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavLink } from '@/components/layout/NavLink';

const DARK_PAGE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography', '/map'];

function isDarkPagePath(path: string): boolean {
  return DARK_PAGE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

const SYMBOL_SCALE_MAX = 2.0;
const SYMBOL_SCALE_END = 220;

export function NavInner() {
  const pathname   = usePathname();
  const isHomepage = pathname === '/';
  const isDarkPage = isDarkPagePath(pathname);

  const [bodyBgActive, setBodyBgActive] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [scrollY, setScrollY]           = useState(0);
  const [isMobile, setIsMobile]         = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Detect article-hover body class (set by HomepageClient)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBodyBgActive(document.body.classList.contains('bg-active'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Track scroll — useLayoutEffect fires before paint, eliminating flash on load/navigation
  useLayoutEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Re-sync scrollY on route change.
  // When navigating TO the homepage Next.js scrolls to top — assume 0 immediately
  // so the nav doesn't briefly show opaque from a stale previous-page position.
  useLayoutEffect(() => {
    setScrollY(pathname === '/' ? 0 : window.scrollY);
  }, [pathname]);

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
      if (logoRef.current) logoRef.current.style.transform = 'scale(1)';
    };
  }, [isHomepage]);

  // Detect mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close menu on navigation
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isMapPage = pathname === '/map';
  const scrolled  = scrollY > 60;
  const onHero    = isHomepage && !scrolled;
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
          <NavLink href="/map">EARTH</NavLink>
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
              <NavLink href="/articles">LIBRARY</NavLink>
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
          <NavLink href="/articles">LIBRARY</NavLink>
          <NavLink href="/about">ABOUT</NavLink>
          <NavLink href="/contact">CONTACT</NavLink>
        </div>
      )}
    </div>
  );
}
