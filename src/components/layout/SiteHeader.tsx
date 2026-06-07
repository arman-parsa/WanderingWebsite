'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const NAV_LEFT = [
  { label: 'EXPLORE', href: '/articles', medium: true  },
  { label: 'MAP',     href: '/map',      medium: false },
  { label: 'ABOUT',  href: '/about',    medium: false },
  { label: 'CONTACT',href: '/contact',  medium: false },
] as const;

// Pages with dark (#1c1814) background — nav should use light text when scrolled
const DARK_BG_PREFIXES = ['/articles', '/writing', '/photography', '/mixed-media', '/videography'];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isDarkPage = DARK_BG_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const threshold = isHome ? window.innerHeight * 0.9 : 1;
    const check = () => setScrolled(window.scrollY > threshold);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [isHome]);

  const transparent = (isHome || isDarkPage) && !scrolled;
  const onDark = transparent || isDarkPage;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full max-w-[100vw] overflow-hidden transition-[background-color,backdrop-filter] duration-[400ms] ease-in-out',
        transparent
          ? 'bg-transparent backdrop-blur-none'
          : isDarkPage
            ? 'bg-[rgba(28,24,20,0.88)] backdrop-blur'
            : 'bg-paper/85 backdrop-blur'
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:uppercase focus:tracking-widest focus:text-paper"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-16 max-w-[var(--content-full-width)] items-center justify-between px-[var(--content-padding-x)]">
        {/* Left: navigation links */}
        <nav aria-label="Main navigation" className="[animation-delay:900ms] [animation-duration:700ms] animate-fade-in">
          <ul className="flex items-center gap-[clamp(1.5rem,3vw,2.5rem)]" role="list">
            {NAV_LEFT.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-block font-sans text-[0.7rem] font-normal uppercase tracking-[0.12em]',
                      'after:block after:h-[0.5px] after:w-full after:mt-[3px] after:bg-current after:transition-transform after:duration-300 after:ease-out',
                      onDark ? 'text-white/70' : 'text-ink-muted',
                      active
                        ? 'after:scale-x-100 after:origin-left'
                        : 'after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: wordmark links home — Lyon Text, fluid size */}
        <Link
          href="/"
          aria-label="ARMAN'S WANDERINGS — home"
          className={cn(
            'animate-fade-in [animation-duration:800ms] shrink-0 whitespace-nowrap font-serif text-[clamp(0.85rem,1.5vw,1.1rem)] font-normal uppercase tracking-widest transition-opacity duration-[250ms] ease-out hover:opacity-[0.65]',
            onDark ? 'text-white/90' : 'text-ink'
          )}
        >
          ARMAN&apos;S WANDERINGS
        </Link>
      </div>
    </header>
  );
}
