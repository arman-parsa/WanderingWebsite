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

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // On the homepage the nav stays transparent until the hero has largely
    // scrolled past. On all other pages the translucent bar is immediate.
    const threshold = isHome ? window.innerHeight * 0.9 : 1;
    const check = () => setScrolled(window.scrollY > threshold);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-[400ms] ease-in-out',
        transparent
          ? 'bg-transparent backdrop-blur-none'
          : 'bg-paper/85 backdrop-blur'
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:uppercase focus:tracking-widest focus:text-paper"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-14 max-w-[var(--content-full-width)] items-center justify-between px-[var(--content-padding-x)]">
        {/* Left: navigation links */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-6 md:gap-8" role="list">
            {NAV_LEFT.map(({ label, href, medium }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'font-sans text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)]',
                      medium ? 'font-medium' : 'font-normal',
                      transparent
                        ? 'text-white/90 hover:text-white'
                        : active
                          ? 'text-ink'
                          : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: wordmark links home */}
        <Link
          href="/"
          aria-label="ARMAN'S WANDERINGS — home"
          className={cn(
            'font-sans text-xs font-normal uppercase tracking-widest transition-colors duration-[var(--duration-fast)]',
            transparent
              ? 'text-white/90 hover:text-white'
              : 'text-ink hover:text-accent'
          )}
        >
          ARMAN&apos;S WANDERINGS
        </Link>
      </div>
    </header>
  );
}
