'use client';

import { Analytics } from '@vercel/analytics/next';

/**
 * Vercel Web Analytics: page views (including client-side navigations),
 * referrers, countries and devices — no cookies, so no consent banner is
 * needed. Visits to the Studio (/studio) are left out of the numbers.
 */
export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => (new URL(event.url).pathname.startsWith('/studio') ? null : event)}
    />
  );
}
