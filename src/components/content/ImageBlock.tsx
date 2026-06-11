'use client';

import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';
import { imageRatio, type ImageBlockValue, type MediaWidth } from '@/lib/articleMedia';
import { useLightbox } from './MediaLightbox';

export type { ImageBlockValue };

const FIGURE_CLASS: Record<MediaWidth, string> = {
  column: 'my-12 -mx-[var(--content-padding-x)]',
  wide: 'my-12 media-wide',
  full: 'my-14 media-full',
};

const SIZES: Record<MediaWidth, string> = {
  column: '(max-width: 880px) 100vw, 840px',
  wide: '(max-width: 1140px) 100vw, 1100px',
  full: '100vw',
};

const FETCH_WIDTH: Record<MediaWidth, number> = {
  column: 1600,
  wide: 2048,
  full: 2560,
};

export function ImageBlock({ value }: { value: ImageBlockValue }) {
  const lightbox = useLightbox();
  const image = value?.asset;
  if (!image?.asset) return null;

  const ratio = imageRatio(image) ?? 3 / 2;
  const width: MediaWidth = value.width ?? 'column';
  // In the text column, portraits render narrower and centred so they don't
  // tower over the prose. Wide/full registers use the image as given.
  const isPortrait = width === 'column' && ratio < 0.9;
  const constrain = isPortrait ? { maxWidth: '32rem', marginInline: 'auto' } : undefined;

  const src = urlFor(image).width(FETCH_WIDTH[width]).format('webp').quality(85).url();
  const blurSrc = urlFor(image).width(20).format('webp').quality(30).url();
  const objectPosition = image.hotspot
    ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
    : 'center';

  const clickable =
    !!value._key && !!lightbox && lightbox.entries.some((e) => e.key === value._key);

  const frame = (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${ratio}`, ...constrain }}
    >
      <Image
        src={src}
        alt={value.alt || value.caption || ''}
        fill
        placeholder="blur"
        blurDataURL={blurSrc}
        sizes={isPortrait ? '(max-width: 640px) 100vw, 512px' : SIZES[width]}
        className="object-cover"
        style={{ objectPosition }}
      />
    </div>
  );

  return (
    <figure className={isPortrait ? 'my-12' : FIGURE_CLASS[width]}>
      {clickable ? (
        <button
          type="button"
          onClick={() => lightbox.openAt(value._key!)}
          aria-label={`Enlarge photograph${value.alt ? `: ${value.alt}` : ''}`}
          className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          {frame}
        </button>
      ) : (
        frame
      )}
      {value.caption && (
        <figcaption
          className={isPortrait ? 'mt-3 text-caption' : 'mt-3 px-[var(--content-padding-x)] text-caption'}
          style={constrain}
        >
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
