import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { sanityFetch } from '@/lib/sanityFetch';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { TYPE_HREF } from '@/lib/contentTypes';

export type AdjacentPiece = { href: string; title: string; location?: string };

type Row = { _type: string; slug: string; title: string; location?: string };

/**
 * The pieces either side of this one in the archive's newest-first order:
 * `newer` (previous) and `older` (next). Uses the same list as the library,
 * falling back to the placeholder set while the CMS is empty.
 */
export async function getAdjacentPieces(type: string, slug: string): Promise<{
  newer: AdjacentPiece | null;
  older: AdjacentPiece | null;
}> {
  let rows = (await sanityFetch<Row[]>(ALL_CONTENT_QUERY)) ?? [];
  if (rows.length === 0) rows = PLACEHOLDER_ITEMS as Row[];

  const i = rows.findIndex((r) => r._type === type && r.slug === slug);
  if (i === -1) return { newer: null, older: null };

  const toPiece = (r: Row | undefined): AdjacentPiece | null =>
    r && TYPE_HREF[r._type]
      ? { href: `${TYPE_HREF[r._type]}/${r.slug}`, title: r.title, location: r.location }
      : null;

  return { newer: toPiece(rows[i - 1]), older: toPiece(rows[i + 1]) };
}
