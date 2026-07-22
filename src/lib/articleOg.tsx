/**
 * Shared logic for the four article `opengraph-image` routes: fetch the piece's
 * title, location and cover photo, and render the photo-led card. Falls back to
 * placeholder metadata and the site photo so the card still reads well before
 * Sanity content exists (and in local builds).
 */
import { client } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { renderOgCard, eyebrowFor, fetchPhoto, fallbackPhoto } from '@/lib/ogCard';

const OG_PIECE_QUERY = `
  *[_type == $type && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    title, location, coverImage
  }
`;

type Piece = { title?: string; location?: string; coverImage?: unknown };

export async function articleOgImage(type: string, slug: string) {
  let piece: Piece | null = null;
  try {
    piece = await client.fetch(OG_PIECE_QUERY, { type, slug });
  } catch {
    // Sanity unreachable — placeholder fallback below.
  }

  const placeholder = PLACEHOLDER_ITEMS.find((i) => i.slug === slug);
  const title = piece?.title ?? placeholder?.title ?? 'Arman Parsa';
  const location = piece?.location ?? placeholder?.location;

  let photo: string | null = null;
  if (piece?.coverImage) {
    try {
      const url = urlFor(piece.coverImage as Parameters<typeof urlFor>[0])
        .width(1200).height(630).fit('crop').format('jpg').quality(80).url();
      photo = await fetchPhoto(url);
    } catch {
      // fall through to the site photo
    }
  }
  if (!photo) photo = await fallbackPhoto();

  return renderOgCard({ photo, mode: 'article', eyebrow: eyebrowFor(type, location), title });
}
