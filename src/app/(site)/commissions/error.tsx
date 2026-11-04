'use client'; // Error boundaries must be Client Components

import Link from 'next/link';

/**
 * Fallback for an unexpected error while rendering /commissions or a
 * commission (e.g. Sanity briefly unreachable on a fresh render). Covers
 * both routes; `retry` re-fetches and re-renders the segment.
 */
export default function CommissionsError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="main-content" className="commissions-page commissions-error">
      <h1 className="commissions-title">Something went wrong</h1>
      <p className="commissions-intro">This page couldn’t be loaded just now.</p>
      <div className="commissions-error__actions">
        <button type="button" onClick={() => retry()} className="home-read-more">
          Try again
        </button>
        <Link href="/contact" className="quiet-link">
          Get in touch
        </Link>
      </div>
    </main>
  );
}
