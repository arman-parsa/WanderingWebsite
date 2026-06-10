import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';

type Props = {
  value: {
    asset?: object;
    alt?: string;
    caption?: string;
    hotspot?: { x: number; y: number };
  };
};

export function ImageBlock({ value }: Props) {
  if (!value?.asset) return null;

  const src = urlFor(value).width(1400).format('webp').quality(85).url();
  const blurSrc = urlFor(value).width(20).format('webp').quality(30).url();
  const objectPosition = value.hotspot
    ? `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`
    : 'center';

  return (
    <figure className="my-10 -mx-[var(--content-padding-x)]">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={src}
          alt={value.alt || value.caption || ''}
          fill
          placeholder="blur"
          blurDataURL={blurSrc}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition }}
        />
      </div>
      {value.caption && (
        <figcaption className="mt-3 px-[var(--content-padding-x)] text-caption">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
