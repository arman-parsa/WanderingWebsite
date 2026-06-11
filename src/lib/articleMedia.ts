/**
 * Shared shapes and helpers for article media: inline images, image pairs,
 * and the lightbox ("plates") that lets readers flick through every
 * photograph in a piece.
 */

export type SanityImageObject = {
  asset?: { _ref?: string };
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type MediaWidth = 'column' | 'wide' | 'full';

export type ImageBlockValue = {
  _key?: string;
  asset?: SanityImageObject;
  alt?: string;
  caption?: string;
  width?: MediaWidth;
};

/** Pair members are plain Sanity images with alt/caption fields. */
export type PairImage = SanityImageObject & {
  _key?: string;
  alt?: string;
  caption?: string;
};

export type ImagePairValue = {
  _key?: string;
  images?: PairImage[];
  width?: 'wide' | 'full';
};

export type LightboxEntry =
  | { kind: 'image'; key: string; image: SanityImageObject; alt: string; caption?: string }
  | { kind: 'video'; key: string; videoId: string; title: string; caption?: string };

/**
 * Accepts a bare numeric Vimeo ID ("123456789") or any pasted Vimeo URL,
 * including unlisted links with a privacy hash.
 */
export function parseVimeo(input?: string): { id: string; hash?: string } | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  const fromUrl = raw.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  const id = fromUrl?.[1] ?? (/^\d+$/.test(raw) ? raw : null);
  if (!id) return null;
  const hash = fromUrl?.[2] ?? raw.match(/[?&]h=([a-zA-Z0-9]+)/)?.[1];
  return { id, hash };
}

type VideoLike = { _key?: string; vimeoId?: string; title?: string; description?: string };

/**
 * Collects every visual in a piece, in narrative order: portable-text body
 * blocks first, then the end-gallery arrays (images, then films). Returns
 * the flat list the lightbox flicks through.
 */
export function collectArticleMedia(
  body: unknown,
  galleryImages?: unknown[],
  galleryVideos?: VideoLike[],
): LightboxEntry[] {
  const out: LightboxEntry[] = [];

  const pushImage = (image: SanityImageObject, key: string | undefined, fallbackKey: string, alt?: string, caption?: string) => {
    if (!image.asset?._ref) return;
    out.push({ kind: 'image', key: key ?? fallbackKey, image, alt: alt ?? '', caption });
  };

  const pushVideo = (video: VideoLike, fallbackKey: string) => {
    if (!parseVimeo(video.vimeoId)) return;
    out.push({
      kind: 'video',
      key: video._key ?? fallbackKey,
      videoId: video.vimeoId!,
      title: video.title ?? 'Film',
      caption: video.description,
    });
  };

  const blocks = [...(Array.isArray(body) ? body : []), ...(galleryImages ?? [])];
  blocks.forEach((block, i) => {
    if (!block || typeof block !== 'object') return;
    const b = block as { _type?: string; _key?: string } & ImageBlockValue & ImagePairValue & VideoLike;
    if (b._type === 'imageBlock' && b.asset) {
      pushImage(b.asset, b._key, `block-${i}`, b.alt, b.caption);
    }
    if (b._type === 'imagePair') {
      (b.images ?? []).forEach((img, j) => {
        pushImage(img, img._key, `block-${i}-${j}`, img.alt, img.caption);
      });
    }
    if (b._type === 'videoBlock') {
      pushVideo(b, `block-${i}`);
    }
  });

  (galleryVideos ?? []).forEach((video, i) => pushVideo(video, `gallery-video-${i}`));

  return out;
}

/**
 * Display aspect ratio of a Sanity image. The asset _ref encodes the original
 * pixel size (image-{id}-{width}x{height}-{format}); the Studio crop, which
 * the CDN applies when serving, is folded in.
 */
export function imageRatio(image: SanityImageObject | undefined): number | null {
  const match = image?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  if (!match) return null;
  let width = Number(match[1]);
  let height = Number(match[2]);
  if (image?.crop) {
    width *= 1 - image.crop.left - image.crop.right;
    height *= 1 - image.crop.top - image.crop.bottom;
  }
  return width > 0 && height > 0 ? width / height : null;
}

