import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity';
import { PHOTO_SERIES_QUERY, PHOTO_SERIES_SLUGS_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';
import { PLACEHOLDER_ITEMS, PLACEHOLDER_PHOTO_SERIES } from '@/lib/placeholders';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const placeholderSlugs = PLACEHOLDER_ITEMS
    .filter((i) => i._type === 'photoSeries')
    .map((i) => ({ slug: i.slug }));
  try {
    const slugs = await client.fetch(PHOTO_SERIES_SLUGS_QUERY);
    return [...slugs.map((s: { slug: string }) => ({ slug: s.slug })), ...placeholderSlugs];
  } catch {
    return placeholderSlugs;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const series = await client.fetch(PHOTO_SERIES_QUERY, { slug });
    if (!series) return {};
    return {
      title: series.seo?.metaTitle ?? series.title,
      description: series.seo?.metaDescription ?? series.description,
    };
  } catch {
    return {};
  }
}

type SanityImage = {
  _key: string;
  asset?: object;
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
};

export default async function PhotographyPage({ params }: Props) {
  const { slug } = await params;
  let series = null;
  try { series = await client.fetch(PHOTO_SERIES_QUERY, { slug }); } catch { /* CORS */ }
  if (!series && slug.startsWith('_placeholder')) {
    const match = PLACEHOLDER_ITEMS.find((i) => i.slug === slug && i._type === 'photoSeries');
    if (match) series = { ...PLACEHOLDER_PHOTO_SERIES, title: match.title, description: match.description, location: match.location, publishedAt: match.publishedAt };
  }
  if (!series) notFound();

  return (
    <>
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
              {series.location && (
                <p className="mb-2 font-sans text-xs uppercase tracking-widest text-white/70">
                  {series.location}
                  {series.publishedAt && ` — ${formatDate(series.publishedAt)}`}
                </p>
              )}
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

      {/* Photo grid */}
      {series.images?.length > 0 && (
        <section className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] py-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {series.images.map((image: SanityImage, i: number) => {
              if (!image.asset) return null;
              return (
                <figure key={image._key} className="group overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                    <Image
                      src={urlFor(image).width(900).format('webp').quality(85).url()}
                      alt={image.alt ?? ''}
                      fill
                      priority={i < 3}
                      placeholder="blur"
                      blurDataURL={urlFor(image).width(20).format('webp').quality(30).url()}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.03]"
                    />
                  </div>
                  {image.caption && (
                    <figcaption className="mt-2 text-caption">{image.caption}</figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
