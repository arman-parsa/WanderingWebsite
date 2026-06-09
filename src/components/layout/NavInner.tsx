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

export function NavInner() {
  const pathname    = usePathname();
  const isDarkPage  = isDarkPagePath(pathname);
  const [bodyBgActive, setBodyBgActive] = useState(false);

  // Listen for homepage article-hover body class
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setBodyBgActive(document.body.classList.contains('bg-active'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isLight = isDarkPage || bodyBgActive;
  const textColour = isLight ? '#f8f4ef' : '#1c1814';

  const bgValue = bodyBgActive
    ? 'transparent'
    : isDarkPage
    ? 'rgba(28, 24, 20, 0.92)'
    : 'rgba(248, 244, 239, 0.92)';

  return (
    <div className="nav-shell">
      <div
        aria-hidden="true"
        className={`nav-bg${bodyBgActive ? '' : ' nav-bg--blur'}`}
        style={{ background: bgValue }}
      />
      <nav
        className="nav-inner"
        style={{ '--nav-text': textColour } as React.CSSProperties}
      >
        {/* Logo — alchemical air symbol */}
        <Link href="/" aria-label="Arman's Wanderings — home" className="logo-link">
          <svg
            width="28" height="28" viewBox="0 0 28 28" fill="none"
            xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          >
            <polygon
              points="14,4 26,25 2,25"
              stroke={textColour}
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            <line
              x1="10" y1="11" x2="18" y2="11"
              stroke={textColour}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        {/* Nav links */}
        <ul className="nav-links" role="list">
          <li><NavLink href="/map">EARTH</NavLink></li>
          <li><NavLink href="/articles">LIBRARY</NavLink></li>
          <li><NavLink href="/about">ABOUT</NavLink></li>
          <li><NavLink href="/contact">CONTACT</NavLink></li>
        </ul>
      </nav>
    </div>
  );
}
