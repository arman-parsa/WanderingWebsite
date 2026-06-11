'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { urlFor } from '@/lib/sanityImage';
import { imageRatio, type ImagePairValue } from '@/lib/articleMedia';
import { useLightbox } from './MediaLightbox';

/**
 * Two or three images in one row at equal height without cropping: each
 * image's horizontal share is proportional to its aspect ratio (the
 * justified-row technique). Pairs of portraits stay side-by-side on phones;
 * any other combination stacks.
 */
export function ImagePair({ value }: { value: ImagePairValue }) {
  const lightbox = useLightbox();
  const items = (value.images ?? []).filter((img) => img.asset?._ref);
  if (items.length === 0) return null;

  const ratios = items.map((img) => imageRatio(img) ?? 3 / 2);
  const allPortrait = ratios.every((r) => r < 0.9);
  const breakout = value.width === 'full' ? 'media-full' : 'media-wide';
  const rowClass = allPortrait
    ? 'flex flex-row gap-3'
    : 'flex flex-col gap-6 sm:flex-row sm:gap-3';
  const cellClass = allPortrait
    ? 'min-w-0 [flex:var(--ratio)_1_0%]'
    : 'min-w-0 sm:[flex:var(--ratio)_1_0%]';
  const share = (i: number) =>
    Math.max(20, Math.round((ratios[i] / ratios.reduce((a, b) => a + b, 0)) * 100));

  return (
    <div className={`my-12 ${breakout}`}>
      <div className={rowClass}>
        {items.map((img, i) => {
          const key = img._key;
          const clickable = !!key && !!lightbox && lightbox.entries.some((e) => e.key === key);
          const frame = (
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${ratios[i]}` }}>
              <Image
                src={urlFor(img).width(1400).format('webp').quality(85).url()}
                alt={img.alt || img.caption || ''}
                fill
                placeholder="blur"
                blurDataURL={urlFor(img).width(20).format('webp').quality(30).url()}
                sizes={
                  allPortrait
                    ? `${share(i)}vw`
                    : `(max-width: 640px) 100vw, ${share(i)}vw`
                }
                className="object-cover"
              />
            </div>
          );
          return (
            <figure
              key={key ?? i}
              className={cellClass}
              style={{ '--ratio': String(ratios[i]) } as CSSProperties}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => lightbox.openAt(key!)}
                  aria-label={`Enlarge photograph${img.alt ? `: ${img.alt}` : ''}`}
                  className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  {frame}
                </button>
              ) : (
                frame
              )}
              {img.caption && <figcaption className="mt-2 text-caption">{img.caption}</figcaption>}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
