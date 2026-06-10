import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

/**
 * Root 404 boundary — catches URLs that match no route segment at all
 * (e.g. /foo). notFound() thrown inside (site) pages is handled by
 * src/app/(site)/not-found.tsx, which already has the site chrome from the
 * group layout; this file recreates the same chrome for unmatched URLs.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <p className="font-sans text-sm uppercase tracking-widest text-ink-muted">404</p>
        <h1 className="mt-4 font-serif text-[var(--text-4xl)] font-light tracking-tight text-ink">Page not found</h1>
        <Link
          href="/"
          className="mt-8 inline-block py-3 px-2 font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 hover:underline"
        >
          Return home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
