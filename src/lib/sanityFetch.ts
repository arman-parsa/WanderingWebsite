import { client, REAL_CONTENT_COUNT_QUERY } from '@/lib/sanity';

const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Fetch from Sanity, distinguishing "the fetch failed" from "nothing found".
 *
 * - During `next build` a failure resolves to null, so pages fall back to
 *   placeholders / empty states and the build never breaks.
 * - At runtime (ISR revalidation, on-demand pages) a failure throws. Next then
 *   keeps serving the last good version of the page instead of caching
 *   placeholder content or a 404 for a brief Sanity outage.
 */
// Results are untyped until Sanity typegen is set up — the default mirrors
// client.fetch, which also returns `any` for these queries.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sanityFetch<T = any>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  try {
    return await client.fetch<T>(query, params);
  } catch (err) {
    if (IS_BUILD) return null;
    throw err;
  }
}

/**
 * Whether any real (published) piece exists. Placeholder content is only for
 * an empty CMS — once one real piece is published, pages show real content or
 * an empty state, never the placeholder set. A failed fetch during the build
 * counts as "no real content", as before.
 */
export async function hasRealContent(): Promise<boolean> {
  const count = await sanityFetch<number>(REAL_CONTENT_COUNT_QUERY);
  return (count ?? 0) > 0;
}
