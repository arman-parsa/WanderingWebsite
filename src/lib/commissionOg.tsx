/**
 * Open Graph card for a commission: the same photo-led card as the pieces
 * (ogCard.tsx), with "Sector · Location" as the eyebrow and the commission's
 * title. Falls back to the site photo when there's no cover or Sanity is
 * unreachable.
 */
import { client } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { renderOgCard, fetchPhoto, fallbackPhoto } from '@/lib/ogCard';
import { commissionTitle, sectorLabel } from '@/lib/commissions';

const OG_COMMISSION_QUERY = `
  *[_type == "commission" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    clientName, projectTitle, location, sector, coverImage
  }
`;

type Row = {
  clientName?: string;
  projectTitle?: string;
  location?: string;
  sector?: string;
  coverImage?: { asset?: unknown };
};

export async function commissionOgImage(slug: string) {
  let c: Row | null = null;
  try {
    c = await client.fetch(OG_COMMISSION_QUERY, { slug });
  } catch {
    // Sanity unreachable — fallbacks below.
  }

  let photo: string | null = null;
  if (c?.coverImage?.asset) {
    try {
      const url = urlFor(c.coverImage as Parameters<typeof urlFor>[0])
        .width(1200).height(630).fit('crop').format('jpg').quality(80).url();
      photo = await fetchPhoto(url);
    } catch {
      // fall through to the site photo
    }
  }
  if (!photo) photo = await fallbackPhoto();

  const title = c?.clientName ? commissionTitle({ clientName: c.clientName, projectTitle: c.projectTitle }) : 'Commissions';
  const eyebrow = [sectorLabel(c?.sector) ?? 'Commission', c?.location].filter(Boolean).join(' · ');
  return renderOgCard({ photo, mode: 'article', eyebrow, title });
}
