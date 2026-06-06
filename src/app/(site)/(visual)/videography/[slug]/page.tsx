import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity';
import { PHOTO_SERIES_QUERY, PHOTO_SERIES_SLUGS_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { VideoBlock } from '@/components/content/VideoBlock';
import { formatDate } from '@/lib/utils';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(PHOTO_SERIES_SLUGS_QUERY);
    return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await client.fetch(PHOTO_SERIES_QUERY, { slug });
  if (!series) return {};
  return {
    title: series.seo?.metaTitle ?? series.title,
    description: series.seo?.metaDescription ?? series.description,
  };
}

export default async function VideographyPage({ params }: Props) {
  const { slug } = await params;
  const series = await client.fetch(PHOTO_SERIES_QUERY, { slug });
  if (!series) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1c1814', color: '#f8f4ef', paddingTop: 'clamp(5rem, 10vh, 8rem)' }}>
      {/* Full-bleed hero */}
      {series.coverImage?.asset && (
        <div className="relative h-screen w-full overflow-hidden">
          <Image
            src={urlFor(series.coverImage).width(2400).format('webp').quality(85).url()}
            alt={series.coverImage.alt ?? series.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-[var(--content-padding-x)] pb-16">
            <div className="mx-auto max-w-[var(--content-full-width)]">
              <p className="mb-2 font-sans text-xs uppercase tracking-widest text-white/70">
                Videography
                {series.location && ` · ${series.location}`}
                {series.publishedAt && ` — ${formatDate(series.publishedAt)}`}
              </p>
              <h1 className="font-serif text-[var(--text-4xl)] font-light tracking-tight text-white">
                {series.title}
              </h1>
              {series.description && (
                <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-white/80">
                  {series.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary film */}
      {series.film?.vimeoId && (
        <section className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] py-16">
          <VideoBlock videoId={series.film.vimeoId} title={series.film.title ?? series.title} />
        </section>
      )}

      {/* Still frames grid (optional) */}
      {series.images?.length > 0 && (
        <section className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] pb-24">
          <p className="mb-8 font-sans text-xs uppercase tracking-widest text-ink-muted">
            Stills
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {series.images.map((image: { _key: string; asset?: object; alt?: string }, i: number) => {
              if (!image.asset) return null;
              return (
                <div key={image._key} className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image
                    src={urlFor(image).width(600).format('webp').quality(80).url()}
                    alt={image.alt ?? ''}
                    fill
                    priority={i < 4}
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
