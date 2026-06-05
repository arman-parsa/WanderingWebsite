import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';

type ContentType = 'essay' | 'editorial' | 'photoSeries';

type Props = {
  _type: ContentType;
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  excerpt?: string;
  description?: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

const TYPE_LABEL: Record<ContentType, string> = {
  essay:       'Writing',
  editorial:   'Mixed Media',
  photoSeries: 'Photography',
};

const TYPE_HREF: Record<ContentType, string> = {
  essay:       '/writing',
  editorial:   '/mixed-media',
  photoSeries: '/photography',
};

export function ContentCard({ _type, title, slug, publishedAt, location, excerpt, description, coverImage }: Props) {
  const href = `${TYPE_HREF[_type]}/${slug}`;
  const blurb = excerpt ?? description;

  return (
    <article className="group flex flex-col">
      <Link href={href} className="block overflow-hidden" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          {coverImage?.asset ? (
            <Image
              src={urlFor(coverImage).width(800).height(600).fit('crop').format('webp').quality(80).url()}
              alt={coverImage.alt ?? title}
              fill
              placeholder="blur"
              blurDataURL={urlFor(coverImage).width(20).format('webp').quality(30).url()}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-all duration-[var(--duration-slow)] group-hover:scale-[1.02] group-hover:brightness-95"
            />
          ) : (
            <div className="h-full w-full bg-surface" />
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-caption">{TYPE_LABEL[_type]}</span>
          {location && <span className="text-caption">{location}</span>}
          {publishedAt && <span className="text-caption">{formatDate(publishedAt)}</span>}
        </div>

        <h2 className="font-serif text-[var(--text-xl)] font-light leading-snug tracking-tight text-ink">
          <Link
            href={href}
            className="transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:text-accent focus-visible:outline-none"
          >
            {title}
          </Link>
        </h2>

        {blurb && (
          <p className="mt-2 font-serif text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-ink-muted line-clamp-3">
            {blurb}
          </p>
        )}
      </div>
    </article>
  );
}
