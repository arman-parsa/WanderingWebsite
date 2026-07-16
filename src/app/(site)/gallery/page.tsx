import type { Metadata } from 'next';
import { client, GALLERY_CONTENT_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { GalleryClient, type GalleryItem } from '@/components/gallery/GalleryClient';
import { SITE_URL, OG_IMAGE } from '@/lib/metadata';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'A floating collage of photographs drawn from the pieces on armanparsa.earth — click any work to explore the story it belongs to.',
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: {
    title: 'Gallery · Arman Parsa',
    description: 'A floating collage of photographs drawn from the pieces on armanparsa.earth — click any work to explore the story it belongs to.',
    url: `${SITE_URL}/gallery`,
    images: [OG_IMAGE],
  },
};

const TYPE_HREF: Record<string, string> = {
  writing:     '/writing',
  mixedMedia:  '/mixed-media',
  photography: '/photography',
  videography: '/videography',
};

// Safety ceiling only — the gallery shows every photo it can get.
const MAX_ITEMS = 60;

type SanityImage = { asset?: { _ref?: string }; alt?: string };
type GalleryPiece = {
  _type: string;
  title: string;
  slug: string;
  location?: string;
  coverImage?: SanityImage;
  galleryImages?: SanityImage[];
  bodyImages?: { image?: SanityImage; alt?: string }[];
  pairImages?: SanityImage[];
};

/**
 * The photographs shown IN a piece, in narrative order — mirrors
 * collectArticleMedia(): body imageBlocks carry their image in the block's
 * `asset` field, imagePairs contribute both members, and the images[]
 * end-gallery rounds it out.
 */
function innerImages(p: GalleryPiece): SanityImage[] {
  return [
    ...(p.bodyImages ?? []).flatMap(b => (b.image ? [{ ...b.image, alt: b.alt }] : [])),
    ...(p.pairImages ?? []),
    ...(p.galleryImages ?? []),
  ];
}

function imageUrl(img: SanityImage): string | null {
  try {
    return urlFor(img).width(1200).fit('max').format('webp').quality(75).url();
  } catch {
    return null;
  }
}

/**
 * Flatten pieces into gallery entries: the photographs shown IN each piece,
 * interleaved round-robin across pieces so no single piece dominates the
 * collage. A piece's cover is used only when it has no inner photos at all
 * (e.g. videography). Every asset appears at most once.
 */
function buildItems(pieces: GalleryPiece[]): GalleryItem[] {
  const items: GalleryItem[] = [];
  const seen = new Set<string>();

  const push = (piece: GalleryPiece, img: SanityImage | undefined) => {
    if (items.length >= MAX_ITEMS || !img?.asset?._ref || seen.has(img.asset._ref)) return;
    const src = imageUrl(img);
    if (!src) return;
    seen.add(img.asset._ref);
    items.push({
      key: `${piece._type}-${piece.slug}-${img.asset._ref}`,
      title: piece.title,
      location: piece.location,
      href: `${TYPE_HREF[piece._type] ?? '/library'}/${piece.slug}`,
      src,
      alt: img.alt || piece.title,
    });
  };

  const pools = pieces.map(piece => {
    const inner = innerImages(piece);
    return { piece, imgs: inner.length ? inner : piece.coverImage ? [piece.coverImage] : [] };
  });
  const deepest = Math.max(0, ...pools.map(pool => pool.imgs.length));
  for (let round = 0; round < deepest && items.length < MAX_ITEMS; round++) {
    pools.forEach(({ piece, imgs }) => push(piece, imgs[round]));
  }
  return items;
}

/** Local fallback so the gallery works before Sanity content exists. */
const PLACEHOLDER_GALLERY: GalleryItem[] = [
  { key: 'ph-1',  title: 'Light and Distance in the Atlas Mountains', location: 'Marrakech, Morocco',  href: '/writing/_placeholder-atlas',        src: '/images/DSC07031.JPG', alt: 'Hikers on a mountain path' },
  { key: 'ph-2',  title: 'Harbour Town at the End of Season',         location: 'Essaouira, Morocco',  href: '/photography/_placeholder-harbour',  src: '/images/DSC07782.JPG', alt: 'A souk interior crowded with silverware' },
  { key: 'ph-3',  title: 'Interiors: Riad Architecture',              location: 'Fès el-Bali, Morocco', href: '/photography/_placeholder-riads',   src: '/images/DSC07742.JPG', alt: 'A carved wooden door in a stone wall' },
  { key: 'ph-4',  title: 'On Travelling Without a Camera',            location: 'Lisbon, Portugal',    href: '/mixed-media/_placeholder-nocamera', src: '/images/DSC06207.JPG', alt: 'A temple gate with paper lanterns' },
  { key: 'ph-5',  title: 'The Slow Train from Tangier',               location: 'Fès, Morocco',        href: '/writing/_placeholder-train',        src: '/images/DSC06705.JPG', alt: 'A waterfall behind a shrine rope' },
  { key: 'ph-6',  title: 'Field Notes on the Medina',                 location: 'Meknès, Morocco',     href: '/mixed-media/_placeholder-medina',   src: '/images/DSC09132.JPG', alt: 'Hikers descending a foggy ridge' },
  { key: 'ph-7',  title: 'Light and Distance in the Atlas Mountains', location: 'Marrakech, Morocco',  href: '/writing/_placeholder-atlas',        src: '/images/DSC06969.JPG', alt: 'Mountain scenery' },
  { key: 'ph-8',  title: 'Harbour Town at the End of Season',         location: 'Essaouira, Morocco',  href: '/photography/_placeholder-harbour',  src: '/images/DSC07607.JPG', alt: 'Coastal town scenery' },
  { key: 'ph-9',  title: 'Interiors: Riad Architecture',              location: 'Fès el-Bali, Morocco', href: '/photography/_placeholder-riads',   src: '/images/DSC07876.JPG', alt: 'Architectural detail' },
  { key: 'ph-10', title: 'Field Notes on the Medina',                 location: 'Meknès, Morocco',     href: '/mixed-media/_placeholder-medina',   src: '/images/DSC08034.JPG', alt: 'Street scenery' },
];

export default async function GalleryPage() {
  let pieces: GalleryPiece[] = [];
  try {
    pieces = await client.fetch(GALLERY_CONTENT_QUERY);
  } catch {
    // Sanity unreachable — placeholder collage below.
  }

  let items = buildItems(pieces);
  if (items.length === 0) items = PLACEHOLDER_GALLERY;

  return (
    <main id="main-content" className="gallery-stage">
      <h1 className="sr-only">Gallery — photographs from the pieces on this site</h1>
      <GalleryClient items={items} />
    </main>
  );
}
