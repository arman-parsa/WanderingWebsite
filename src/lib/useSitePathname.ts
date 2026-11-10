'use client';

import { usePathname } from 'next/navigation';

/**
 * usePathname(), with the homepage always reported as "/".
 *
 * When Vercel regenerates the prerendered homepage in the background (ISR —
 * every few minutes, and on every Sanity publish via /api/revalidate), Next
 * renders it as "/index". The router state baked into that HTML then makes
 * usePathname() return "/index" on the server AND in the browser after
 * hydration, so `pathname === '/'` was false and the nav painted dark over
 * the dark hero. Use this hook anywhere the site compares paths.
 */
export function useSitePathname(): string {
  const pathname = usePathname() ?? '/';
  if (pathname === '/index' || pathname === '/index/') return '/';
  // Any nested "/foo/index" the same way, and no trailing slash.
  const normalised = pathname.replace(/\/index\/?$/, '').replace(/(.)\/$/, '$1');
  return normalised || '/';
}
