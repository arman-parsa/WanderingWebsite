import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';

type SanityImageObject = {
  asset?: { _ref?: string };
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type ImageBlockValue = {
  asset?: SanityImageObject;
  alt?: string;
  caption?: string;
};

// The asset _ref encodes the original pixel size: image-{id}-{width}x{height}-{format}
function croppedDimensions(image: SanityImageObject): { width: number; height: number } | null {
  const match = image.asset?._ref?.match(/-(\d+)x(\d+)-/);
  if (!match) return null;
  let width = Number(match[1]);
  let height = Number(match[2]);
  if (image.crop) {
    width *= 1 - image.crop.left - image.crop.right;
    height *= 1 - image.crop.top - image.crop.bottom;
  }
  return width > 0 && height > 0 ? { width, height } : null;
}

export function ImageBlock({ value }: { value: ImageBlockValue }) {
  const image = value?.asset;
  if (!image?.asset) return null;

  const dims = croppedDimensions(image);
  const ratio = dims ? dims.width / dims.height : 3 / 2;
  // Portraits render narrower and centred so they don't tower over the column
  const isPortrait = ratio < 0.9;

  const src = urlFor(image).width(1600).format('webp').quality(85).url();
  const blurSrc = urlFor(image).width(20).format('webp').quality(30).url();
  const objectPosition = image.hotspot
    ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
    : 'center';
  const constrain = isPortrait ? { maxWidth: '32rem', marginInline: 'auto' } : undefined;

  return (
    <figure className={isPortrait ? 'my-12' : 'my-12 -mx-[var(--content-padding-x)]'}>
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
          sizes={isPortrait ? '(max-width: 640px) 100vw, 512px' : '(max-width: 880px) 100vw, 840px'}
          className="object-cover"
          style={{ objectPosition }}
        />
      </div>
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
