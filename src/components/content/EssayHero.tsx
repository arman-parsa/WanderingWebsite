import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  publishedAt?: string;
  location?: string;
  tags?: string[];
  coverImage?: {
    asset?: object;
    alt?: string;
    hotspot?: { x: number; y: number };
  };
};

export function EssayHero({ title, description, publishedAt, location, tags, coverImage }: Props) {
  const src = coverImage?.asset
    ? urlFor(coverImage).width(2400).format('webp').quality(85).url()
    : null;
  const blurSrc = coverImage?.asset
    ? urlFor(coverImage).width(20).format('webp').quality(30).url()
    : undefined;
  const objectPosition = coverImage?.hotspot
    ? `${coverImage.hotspot.x * 100}% ${coverImage.hotspot.y * 100}%`
    : 'center';

  return (
    <header>
      {src && (
        <div className="relative aspect-hero w-full overflow-hidden">
          <Image
            src={src}
            alt={coverImage?.alt ?? title}
            fill
            priority
            placeholder={blurSrc ? 'blur' : 'empty'}
            blurDataURL={blurSrc}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition }}
          />
        </div>
      )}

      <div className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] py-12">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {location && <span className="font-sans text-[var(--text-xs)] uppercase tracking-wide opacity-55">{location}</span>}
          {publishedAt && <span className="font-sans text-[var(--text-xs)] uppercase tracking-wide opacity-55">{formatDate(publishedAt)}</span>}
          {tags?.map((tag) => (
            <span key={tag} className="font-sans text-[var(--text-xs)] uppercase tracking-wide opacity-55">#{tag}</span>
          ))}
        </div>

        <h1 className="text-display font-light tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-6 font-serif text-[var(--text-xl)] italic leading-[var(--leading-relaxed)] opacity-65">
            {description}
          </p>
        )}

        <div className="mt-10 h-px w-16 bg-current opacity-20" aria-hidden="true" />
      </div>
    </header>
  );
}
