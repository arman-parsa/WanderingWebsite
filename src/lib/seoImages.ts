/**
 * Search-engine helpers for photographs: collect every photo in a piece or
 * commission, describe them as schema.org ImageObjects (with Arman's credit,
 * copyright and where to license them), and build breadcrumb trails.
 */
import { photoUrl } from '@/lib/sanityImage';
import { SITE_URL } from '@/lib/siteConfig';

type SanityImage = { asset?: { _ref?: string }; alt?: string; caption?: string };
export type SeoPhoto = { image: SanityImage; alt: string; caption?: string };

const refOf = (img?: SanityImage | null) => img?.asset?._ref;

/**
 * Every photograph a piece or commission shows, in page order, without
 * repeats: the cover, body images and image pairs, end-gallery images and
 * pairs, and a commission's own images. Each block type keeps its picture in
 * a different place, so each shape is unwrapped here.
 */
export function collectPhotos(doc: {
  title?: string;
  coverImage?: SanityImage | null;
  body?: unknown;
  images?: unknown;
}): SeoPhoto[] {
  const out: SeoPhoto[] = [];
  const seen = new Set<string>();
  const add = (image: SanityImage | null | undefined, alt?: string | null, caption?: string | null) => {
    const ref = refOf(image);
    if (!image || !ref || seen.has(ref)) return;
    seen.add(ref);
    out.push({ image, alt: (alt || image.alt || doc.title || '').trim(), caption: caption ?? undefined });
  };

  add(doc.coverImage, doc.coverImage?.alt);
  const walk = (blocks: unknown) => {
    if (!Array.isArray(blocks)) return;
    for (const raw of blocks) {
      const b = raw as {
        _type?: string;
        // an image field (imageBlock) or a plain asset reference (image)
        asset?: { _ref?: string; asset?: { _ref?: string } };
        alt?: string;
        caption?: string;
        description?: string;
        images?: SanityImage[];
      };
      if (b._type === 'imagePair') {
        b.images?.forEach((img) => add(img, img.alt, img.caption));
      } else if (b.asset?.asset?._ref) {
        // imageBlock: the picture is the nested `asset` image field
        add(b.asset as SanityImage, b.alt, b.caption ?? b.description);
      } else if (b.asset?._ref) {
        // a plain image (commission images, pair members)
        add(b as SanityImage, b.alt, b.caption);
      }
    }
  };
  walk(doc.body);
  walk(doc.images);
  return out;
}

/** Full-size, descriptively named URL for a photo — the same one the sitemap lists. */
export const photoContentUrl = (p: SeoPhoto) => photoUrl(p.image, p.alt).width(2000).url();

/**
 * ImageObjects for a page's photographs: marked as Arman's, with a credit
 * and copyright notice, and where to license them (the piece's Picfair link
 * when it has one, otherwise the Contact page) — what Google Images uses for
 * its credit line and "Licensable" label.
 */
export function photoObjectsJsonLd(photos: SeoPhoto[], { licenseUrl }: { licenseUrl?: string } = {}) {
  const acquire = licenseUrl || `${SITE_URL}/contact`;
  return photos.slice(0, 40).map((p) => ({
    '@type': 'ImageObject',
    contentUrl: photoContentUrl(p),
    ...(p.alt && { name: p.alt }),
    ...(p.caption && { caption: p.caption }),
    creator: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'Arman Parsa' },
    creditText: 'Arman Parsa',
    copyrightNotice: '© Arman Parsa',
    license: `${SITE_URL}/contact`,
    acquireLicensePage: acquire,
  }));
}

/** BreadcrumbList: Home › Section › Page, shown by Google in place of the bare URL. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name.trim(),
      item: `${SITE_URL}${step.path === '/' ? '' : step.path}`,
    })),
  };
}
