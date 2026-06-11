import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity';
import { PHOTOGRAPHY_QUERY, PHOTOGRAPHY_SLUGS_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { ArticleMediaProvider, LightboxTrigger } from '@/components/content/MediaLightbox';
import { collectArticleImages } from '@/lib/articleMedia';
import { JsonLd } from '@/components/seo/JsonLd';
import { formatDate } from '@/lib/utils';
import { PLACEHOLDER_ITEMS, PLACEHOLDER_PHOTO_SERIES } from '@/lib/placeholders';
import { buildContentMetadata, contentImageUrl } from '@/lib/metadata';
import { buildContentJsonLd } from '@/lib/jsonld';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const placeholderSlugs = PLACEHOLDER_ITEMS
    .filter((i) => i._type === 'photography')
    .map((i) => ({ slug: i.slug }));
  try {
    const slugs = await client.fetch(PHOTOGRAPHY_SLUGS_QUERY);
    return [...slugs.map((s: { slug: string }) => ({ slug: s.slug })), ...placeholderSlugs];
  } catch {
    return placeholderSlugs;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug.startsWith('_placeholder')) return { robots: { index: false } };
  try {
    const series = await client.fetch(PHOTOGRAPHY_QUERY, { slug });
    if (!series) return {};
    return buildContentMetadata({
      title: series.title,
      description: series.description,
      path: `/photography/${slug}`,
      publishedAt: series.publishedAt,
      tags: series.tags,
      coverImage: series.coverImage,
      seo: series.seo,
    });
  } catch {
    return {};
  }
}

type SanityImage = {
  _key: string;
  // imageBlock: the picture itself lives in the nested `asset` image field
  asset?: { asset?: object };
  alt?: string;
  caption?: string;
  description?: string;
};

export default async function PhotographyPage({ params }: Props) {
  const { slug } = await params;
  let series = null;
  try { series = await client.fetch(PHOTOGRAPHY_QUERY, { slug }); } catch { /* CORS */ }
  if (!series && slug.startsWith('_placeholder')) {
    const match = PLACEHOLDER_ITEMS.find((i) => i.slug === slug && i._type === 'photography');
    if (match) series = { ...PLACEHOLDER_PHOTO_SERIES, title: match.title, description: match.description, location: match.location, publishedAt: match.publishedAt };
  }
  if (!series) notFound();

  const jsonLd = buildContentJsonLd({
    type: 'ImageGallery',
    title: series.title,
    description: series.description,
    path: `/photography/${slug}`,
    publishedAt: series.publishedAt,
    tags: series.tags,
    imageUrl: contentImageUrl(series.coverImage),
  });

  const lightboxImages = collectArticleImages(null, series.images ?? []);

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#1c1814', color: '#f8f4ef', paddingTop: 'clamp(5rem, 10vh, 8rem)' }}>
      <JsonLd data={jsonLd} />
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

      {/* Text-only header when no cover image */}
      {!series.coverImage?.asset && (
        <div className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] py-16">
          {series.location && (
            <p className="mb-2 font-sans text-xs uppercase tracking-widest" style={{ color: '#a09890' }}>
              {series.location}
              {series.publishedAt && ` — ${formatDate(series.publishedAt)}`}
            </p>
          )}
          <h1 className="font-serif text-[var(--text-4xl)] font-light tracking-tight" style={{ color: '#f8f4ef' }}>
            {series.title}
          </h1>
          {series.description && (
            <p className="mt-3 max-w-md font-sans text-sm leading-relaxed" style={{ color: '#a09890' }}>
              {series.description}
            </p>
          )}
        </div>
      )}

      {/* Photo grid */}
      {series.images?.length > 0 && (
        <ArticleMediaProvider images={lightboxImages} label={`Photographs — ${series.title}`}>
          <section
            className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] py-16"
            aria-label="Photo series"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {series.images.map((image: SanityImage, i: number) => {
                if (!image.asset?.asset) return null;
                const altText = image.alt || image.caption || image.description || series.title;
                return (
                  <figure key={image._key} className="group overflow-hidden">
                    <LightboxTrigger imageKey={image._key} label={`Enlarge photograph: ${altText}`}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                        <Image
                          src={urlFor(image.asset).width(900).height(675).fit('crop').format('webp').quality(85).url()}
                          alt={altText}
                          fill
                          priority={i < 3}
                          placeholder="blur"
                          blurDataURL={urlFor(image.asset).width(20).height(15).fit('crop').format('webp').quality(30).url()}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.03]"
                        />
                      </div>
                    </LightboxTrigger>
                    {(image.caption || image.description) && (
                      <figcaption className="mt-2 font-sans text-xs leading-relaxed" style={{ color: '#a09890' }}>
                        {image.caption ?? image.description}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          </section>
        </ArticleMediaProvider>
      )}
    </main>
  );
}
