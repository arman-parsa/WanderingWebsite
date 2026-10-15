'use client';

import Image, { type ImageLoader, type ImageProps } from 'next/image';

const SANITY_QUALITY = 85;

/**
 * Ask the Sanity CDN for each srcset width directly, instead of letting the
 * Next optimiser re-compress an already-compressed, fixed-width Sanity file.
 * One encode per image, at the exact width the screen needs.
 *
 * `src` is a urlFor() URL; its w/h only set the shape (a cropped 900×600
 * thumbnail keeps its 3:2 ratio at every width). fit=max never upscales past
 * the original; auto=format serves AVIF/WebP to browsers that support them.
 */
export const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  const w0 = Number(url.searchParams.get('w'));
  const h0 = Number(url.searchParams.get('h'));
  if (w0 && h0) url.searchParams.set('h', String(Math.round((width * h0) / w0)));
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? SANITY_QUALITY));
  url.searchParams.delete('fm');
  url.searchParams.set('auto', 'format');
  if (!url.searchParams.has('fit')) url.searchParams.set('fit', 'max');
  return url.toString();
};

/** next/image for Sanity-hosted pictures. */
export function SanityImage({ alt, ...props }: Omit<ImageProps, 'loader'>) {
  return <Image alt={alt} {...props} loader={sanityLoader} />;
}
