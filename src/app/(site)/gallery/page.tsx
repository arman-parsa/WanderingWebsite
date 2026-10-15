import type { Metadata } from 'next';
import { GALLERY_CONTENT_QUERY } from '@/lib/sanity';
import { sanityFetch } from '@/lib/sanityFetch';
import { urlFor } from '@/lib/sanityImage';
import { GalleryClient, type GalleryItem } from '@/components/gallery/GalleryClient';
import { pageMetadata } from '@/lib/metadata';
import { TYPE_HREF } from '@/lib/contentTypes';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Gallery',
  description:
    'A floating collage of photographs drawn from the pieces on armanparsa.earth — click any work to explore the story it belongs to.',
  path: '/gallery',
});

// Safety ceiling only — the gallery shows every photo it can get.
const MAX_ITEMS = 90;

type SanityImage = { asset?: { _ref?: string }; alt?: string };
type ImgEntry = { img?: SanityImage; alt?: string };
type PairEntry = { imgs?: ImgEntry[] };
type GalleryPiece = {
  _type: string;
  title: string;
  slug: string;
  location?: string;
  bodyBlocks?: ImgEntry[];
  bodyPairs?: PairEntry[];
  galleryBlocks?: ImgEntry[];
  galleryPairs?: PairEntry[];
  cover?: ImgEntry | null;
};

/**
 * The photographs shown IN a piece, in narrative order: body imageBlocks and
 * imagePairs first, then the end-gallery imageBlocks and imagePairs. The GROQ
 * has already unwrapped each container to { img, alt }; here we flatten pairs
 * and drop anything without an asset. The cover is deliberately excluded.
 */
function innerImages(p: GalleryPiece): SanityImage[] {
  const out: SanityImage[] = [];
  const addBlocks = (blocks?: ImgEntry[]) =>
    blocks?.forEach(b => { if (b.img?.asset?._ref) out.push({ ...b.img, alt: b.alt }); });
  const addPairs = (pairs?: PairEntry[]) =>
    pairs?.forEach(pr => addBlocks(pr.imgs));
  addBlocks(p.bodyBlocks);
  addPairs(p.bodyPairs);
  addBlocks(p.galleryBlocks);
  addPairs(p.galleryPairs);
  return out;
}

// Collage thumbnails render at most ~330px wide, so 800px stays sharp on
// retina screens while keeping a wall of many photos light. The enlarged view
// (~960px wide, so ~1920px on sharp screens) swaps in the FULL size once it
// has loaded.
const THUMB = { width: 800, quality: 75 };
const FULL = { width: 2000, quality: 85 };

function imageUrl(img: SanityImage, { width, quality } = THUMB): string | null {
  try {
    return urlFor(img).width(width).fit('max').auto('format').quality(quality).url();
  } catch {
    return null;
  }
}

/**
 * Flatten pieces into gallery entries: the photographs shown IN each piece,
 * interleaved round-robin across pieces so adjacent prints come from
 * different pieces and no single series dominates the collage. Covers are
 * never used. Every asset appears at most once.
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
      fullSrc: imageUrl(img, FULL) ?? undefined,
      alt: img.alt || piece.title,
    });
  };

  const pools = pieces.map(piece => ({ piece, imgs: innerImages(piece) }));
  const deepest = Math.max(0, ...pools.map(pool => pool.imgs.length));
  for (let round = 0; round < deepest && items.length < MAX_ITEMS; round++) {
    pools.forEach(({ piece, imgs }) => push(piece, imgs[round]));
  }
  return items;
}

/**
 * Fallback when no piece has inline photographs yet (e.g. only writing with
 * covers): use each piece's cover so the gallery isn't empty.
 */
function buildCoverItems(pieces: GalleryPiece[]): GalleryItem[] {
  return buildItems(pieces.map(p => ({
    ...p, bodyBlocks: [], bodyPairs: [], galleryPairs: [], galleryBlocks: p.cover ? [p.cover] : [],
  })));
}

/**
 * Local photos are 2560px originals; serve them through the Next image
 * optimiser at thumbnail / enlarged sizes instead (widths must be in the
 * default deviceSizes, quality in images.qualities). One fixed URL each keeps
 * the enlarge morph seamless.
 */
const nextImage = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
const optimisedLocal = (item: GalleryItem): GalleryItem => ({
  ...item,
  src: nextImage(item.src, 828),
  fullSrc: nextImage(item.src, 1920),
});

/** Local fallback so the gallery works before Sanity content exists. */
const PLACEHOLDER_GALLERY: GalleryItem[] = [
  { key: 'ph-1',  title: 'Light and Distance in the Atlas Mountains', location: 'Marrakech, Morocco',  href: '/writing/_placeholder-atlas',        src: '/images/DSC06456.jpg', alt: 'A hiker on a forested mountain path' },
  { key: 'ph-2',  title: 'Harbour Town at the End of Season',         location: 'Essaouira, Morocco',  href: '/photography/_placeholder-harbour',  src: '/images/DSC07782.JPG', alt: 'A souk interior crowded with silverware' },
  { key: 'ph-3',  title: 'Interiors: Riad Architecture',              location: 'Fès el-Bali, Morocco', href: '/photography/_placeholder-riads',   src: '/images/DSC07742.JPG', alt: 'A carved wooden door in a stone wall' },
  { key: 'ph-4',  title: 'On Travelling Without a Camera',            location: 'Lisbon, Portugal',    href: '/mixed-media/_placeholder-nocamera', src: '/images/DSC06207.jpg', alt: 'A temple gate with paper lanterns' },
  { key: 'ph-5',  title: 'The Slow Train from Tangier',               location: 'Fès, Morocco',        href: '/writing/_placeholder-train',        src: '/images/DSC06705.JPG', alt: 'A waterfall behind a shrine rope' },
  { key: 'ph-6',  title: 'Field Notes on the Medina',                 location: 'Meknès, Morocco',     href: '/mixed-media/_placeholder-medina',   src: '/images/DSC09132.JPG', alt: 'Hikers descending a foggy ridge' },
  { key: 'ph-8',  title: 'Harbour Town at the End of Season',         location: 'Essaouira, Morocco',  href: '/photography/_placeholder-harbour',  src: '/images/DSC07607.JPG', alt: 'Coastal town scenery' },
  { key: 'ph-9',  title: 'Interiors: Riad Architecture',              location: 'Fès el-Bali, Morocco', href: '/photography/_placeholder-riads',   src: '/images/DSC07876.JPG', alt: 'Architectural detail' },
  { key: 'ph-10', title: 'Field Notes on the Medina',                 location: 'Meknès, Morocco',     href: '/mixed-media/_placeholder-medina',   src: '/images/DSC08034.JPG', alt: 'Street scenery' },
];

export default async function GalleryPage() {
  const pieces = (await sanityFetch<GalleryPiece[]>(GALLERY_CONTENT_QUERY)) ?? [];

  let items = buildItems(pieces);
  // Pieces with no inline photographs yet: fall back to their covers.
  if (items.length === 0) items = buildCoverItems(pieces);
  // Placeholder collage only while the CMS is empty.
  if (items.length === 0 && pieces.length === 0) items = PLACEHOLDER_GALLERY.map(optimisedLocal);

  return (
    <main id="main-content" className="gallery-stage">
      <h1 className="sr-only">Gallery — photographs from the pieces on this site</h1>
      {items.length > 0 ? (
        <GalleryClient items={items} />
      ) : (
        <p className="gallery-empty">Nothing here yet.</p>
      )}
    </main>
  );
}
