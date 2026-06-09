'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavLink } from '@/components/layout/NavLink';

const DARK_PAGE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography', '/map'];

function isDarkPagePath(path: string): boolean {
  return DARK_PAGE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

const SYMBOL_SCALE_MAX = 3.0;
const SYMBOL_SCALE_END = 180; // px of scroll until scale = 1

export function NavInner() {
  const pathname   = usePathname();
  const isHomepage = pathname === '/';
  const isDarkPage = isDarkPagePath(pathname);

  const [bodyBgActive, setBodyBgActive] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [scrollY, setScrollY]           = useState(0);

  // Detect article-hover body class (set by HomepageClient)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBodyBgActive(document.body.classList.contains('bg-active'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Track scroll position
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const scrolled  = scrollY > 60;
  const onHero    = isHomepage && !scrolled;
  const isLight   = isDarkPage || bodyBgActive || onHero;
  const textColour = isLight ? '#f8f4ef' : '#1c1814';

  const bgValue = bodyBgActive || onHero
    ? 'transparent'
    : isDarkPage
    ? 'rgba(28, 24, 20, 0.92)'
    : 'rgba(248, 244, 239, 0.92)';

  const showBlur = !bodyBgActive && !onHero;

  // Symbol scales up on homepage hero, shrinks on scroll
  const t = Math.min(1, scrollY / SYMBOL_SCALE_END);
  const symbolScale = isHomepage
    ? SYMBOL_SCALE_MAX - t * (SYMBOL_SCALE_MAX - 1)
    : 1;

  return (
    <div className="nav-shell" style={{ overflow: 'visible' }}>
      <div
        aria-hidden="true"
        className={`nav-bg${showBlur ? ' nav-bg--blur' : ''}`}
        style={{ background: bgValue, transition: 'background 300ms ease' }}
      />
      <nav
        className="nav-inner nav-grid"
        style={{ '--nav-text': textColour } as React.CSSProperties}
      >
        {/* Left — EARTH */}
        <div className="nav-grid-left">
          <NavLink href="/map">EARTH</NavLink>
        </div>

        {/* Center — alchemical symbol, scales on homepage */}
        <div className="nav-grid-center">
          <Link href="/" aria-label="Arman's Wanderings — home" className="logo-link"
            style={{
              transform: `scale(${symbolScale})`,
              transformOrigin: 'center center',
              transition: 'transform 60ms linear',
            }}
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
                x1="10" y1="11" x2="18" y2="11"
                strokeWidth="1.2"
                strokeLinecap="round"
                style={{ stroke: textColour, transition: 'stroke 250ms ease' }}
              />
            </svg>
          </Link>
        </div>

        {/* Right — hamburger / expanded links */}
        <div className="nav-grid-right">
          {menuOpen && (
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
    </div>
  );
}
