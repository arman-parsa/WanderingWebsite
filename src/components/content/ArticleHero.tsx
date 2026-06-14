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
  /** Content-type label shown as a kicker above the title (e.g. "Photography"). */
  category?: string;
  coverImage?: {
    asset?: object;
    alt?: string;
    hotspot?: { x: number; y: number };
  };
};

// Larger, grounded introductory title — one serif voice shared by every type.
const TITLE_CLASS =
  'font-serif font-light tracking-tight leading-[1.04] text-[clamp(2.75rem,1.9rem+4.2vw,5.25rem)]';
const META_CLASS = 'font-sans text-[var(--text-xs)] uppercase tracking-wider';
const EYEBROW_CLASS = 'mb-4 font-sans text-[var(--text-xs)] uppercase tracking-[0.22em]';
const DESC_CLASS = 'mt-6 max-w-2xl font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]';

function MetaRow({
  location,
  publishedAt,
  tags,
}: {
  location?: string;
  publishedAt?: string;
  tags?: string[];
}) {
  const stamp = [location, publishedAt && formatDate(publishedAt)].filter(Boolean).join(' — ');
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${META_CLASS}`}>
      {stamp && <span>{stamp}</span>}
      {tags?.map((tag) => (
        <span key={tag} className="opacity-75">#{tag}</span>
      ))}
      <OpenGalleryButton />
    </div>
  );
}

/**
 * Standardised hero for every article type: a full-bleed cover image with the
 * title, description and meta overlaid at the foot, beneath a gradient scrim.
 * The fixed site nav floats transparently over the top of it. Falls back to a
 * centred text header when a piece has no cover image.
 */
export function ArticleHero({ title, description, publishedAt, location, tags, category, coverImage }: Props) {
  const hasImage = !!coverImage?.asset;
  const src = hasImage ? urlFor(coverImage!).width(2560).format('webp').quality(85).url() : null;
  const blurSrc = hasImage ? urlFor(coverImage!).width(20).format('webp').quality(30).url() : undefined;
  const objectPosition = coverImage?.hotspot
    ? `${coverImage.hotspot.x * 100}% ${coverImage.hotspot.y * 100}%`
    : 'center';

  // No cover image — quiet text header (still sits clear of the nav).
  if (!hasImage) {
    return (
      <header className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] pb-4 pt-[clamp(7rem,20vh,12rem)]">
        {category && <p className={`${EYEBROW_CLASS} opacity-70`}>{category}</p>}
        <h1 className={TITLE_CLASS}>{title}</h1>
        {description && <p className={`${DESC_CLASS} opacity-70`}>{description}</p>}
        <div className="mt-7 opacity-60">
          <MetaRow location={location} publishedAt={publishedAt} tags={tags} />
        </div>
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
            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0) 62%), linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 16%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 text-[#f8f4ef]">
        <div className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] pb-[clamp(2.5rem,7vh,5rem)]">
          {category && <p className={`${EYEBROW_CLASS} opacity-85`}>{category}</p>}
          <h1 className={TITLE_CLASS}>{title}</h1>
          {description && <p className={`${DESC_CLASS} opacity-90`}>{description}</p>}
          <div className="mt-7 opacity-85">
            <MetaRow location={location} publishedAt={publishedAt} tags={tags} />
          </div>
        </div>
      </div>
    </header>
  );
}
