'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavLink } from '@/components/layout/NavLink';

const DARK_PAGE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography'];

function isDarkPagePath(path: string): boolean {
  return DARK_PAGE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export function NavInner() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const isDarkPage = isDarkPagePath(pathname);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    if (!isHomepage) return;
    const handleScroll = () => {
      setHeroVisible(window.scrollY < window.innerHeight * 0.6);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  const onHeroOverlay = isHomepage && heroVisible;

  const textColour = isDarkPage || onHeroOverlay ? '#f8f4ef' : '#1c1814';

  let bgValue: string;
  if (onHeroOverlay) {
    bgValue = 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)';
  } else if (isDarkPage) {
    bgValue = 'rgba(28, 24, 20, 0.92)';
  } else {
    bgValue = 'rgba(248, 244, 239, 0.92)';
  }

  return (
    <div className="nav-shell">
      <div
        aria-hidden="true"
        className={`nav-bg${onHeroOverlay ? '' : ' nav-bg--blur'}`}
        style={{ background: bgValue }}
      />
      <nav
        className="nav-inner"
        style={{ '--nav-text': textColour } as React.CSSProperties}
      >
        <ul className="nav-links" role="list">
          <li><NavLink href="/articles">EXPLORE</NavLink></li>
          <li><NavLink href="/map">MAP</NavLink></li>
          <li><NavLink href="/about">ABOUT</NavLink></li>
          <li><NavLink href="/contact">CONTACT</NavLink></li>
        </ul>
        <Link href="/" aria-label="ARMAN'S WANDERINGS — home" className="nav-wordmark">
          ARMAN&apos;S WANDERINGS
        </Link>
      </nav>
    </div>
  );
}
