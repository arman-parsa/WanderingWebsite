import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';
import { OpenGalleryButton } from './MediaLightbox';

type Props = {
  title: string;
  description?: string;
  publishedAt?: string;
  location?: string;
  tags?: string[];
  /** Small label above the meta line, e.g. the content type ("Videography"). */
  eyebrow?: string;
  coverImage?: {
    asset?: object;
    alt?: string;
    hotspot?: { x: number; y: number };
  };
};

const META_CLASS =
  'font-sans text-[var(--text-xs)] uppercase tracking-wider';

/**
 * Standardised hero for every article type: a full-bleed cover image with the
 * title, description and meta overlaid at the foot, beneath a gradient scrim.
 * The fixed site nav floats transparently over the top of it. Falls back to a
 * centred text header when a piece has no cover image.
 */
export function ArticleHero({ title, description, publishedAt, location, tags, eyebrow, coverImage }: Props) {
  const hasImage = !!coverImage?.asset;
  const src = hasImage ? urlFor(coverImage!).width(2560).format('webp').quality(85).url() : null;
  const blurSrc = hasImage ? urlFor(coverImage!).width(20).format('webp').quality(30).url() : undefined;
  const objectPosition = coverImage?.hotspot
    ? `${coverImage.hotspot.x * 100}% ${coverImage.hotspot.y * 100}%`
    : 'center';

  const metaBits = (
    <>
      {eyebrow && <span>{eyebrow}</span>}
      {location && <span>{location}</span>}
      {publishedAt && <span>{eyebrow || location ? `— ${formatDate(publishedAt)}` : formatDate(publishedAt)}</span>}
      {tags?.map((tag) => (
        <span key={tag}>#{tag}</span>
      ))}
    </>
  );

  // No cover image — quiet centred text header (still sits clear of the nav).
  if (!hasImage) {
    return (
      <header className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] pb-4 pt-[clamp(7rem,20vh,12rem)]">
        <div className={`mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 opacity-60 ${META_CLASS}`}>
          {metaBits}
          <OpenGalleryButton />
        </div>
        <h1 className="text-display font-light tracking-tight">{title}</h1>
        {description && (
          <p className="mt-6 max-w-2xl font-serif text-[var(--text-xl)] italic leading-[var(--leading-relaxed)] opacity-70">
            {description}
          </p>
        )}
      </header>
    );
  }

  return (
    <header className="relative w-full overflow-hidden" style={{ height: '100svh' }}>
      <Image
        src={src!}
        alt={coverImage?.alt ?? title}
        fill
        priority
        placeholder={blurSrc ? 'blur' : 'empty'}
        blurDataURL={blurSrc}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />
      {/* Scrim: darker foot for the title, faint crown for nav legibility. */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0) 60%), linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 16%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 text-[#f8f4ef]">
        <div className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] pb-[clamp(2.5rem,7vh,5rem)]">
          <div className={`mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 opacity-80 ${META_CLASS}`}>
            {metaBits}
            <OpenGalleryButton />
          </div>
          <h1 className="font-serif text-[var(--text-4xl)] font-light leading-[var(--leading-tight)] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl font-serif text-[var(--text-lg)] italic leading-[var(--leading-relaxed)] text-[#f8f4ef]/85">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
