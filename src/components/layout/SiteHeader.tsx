import Link from 'next/link';
import { SiteNav } from './SiteNav';

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-paper/95 backdrop-blur-sm">
      {/* Skip to main content — visually hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:uppercase focus:tracking-widest focus:text-paper focus:no-underline"
      >
        Skip to main content
      </a>

      <div
        className="mx-auto flex h-14 max-w-[var(--content-full-width)] items-center justify-between px-[var(--content-padding-x)]"
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-sm font-light tracking-wide text-ink transition-colors duration-[var(--duration-fast)] hover:text-accent"
          aria-label="Wandering Website — home"
        >
          Wandering Website
        </Link>

        <SiteNav />
      </div>
    </header>
  );
}
