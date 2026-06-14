import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity';
import { PHOTOGRAPHY_QUERY, PHOTOGRAPHY_SLUGS_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { ArticleHero } from '@/components/content/ArticleHero';
import { ArticleMediaProvider, LightboxTrigger } from '@/components/content/MediaLightbox';
import { collectArticleMedia } from '@/lib/articleMedia';
import { JsonLd } from '@/components/seo/JsonLd';
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

  const lightboxEntries = collectArticleMedia(null, series.images ?? []);

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#1c1814', color: '#f8f4ef' }}>
      <JsonLd data={jsonLd} />
      <ArticleMediaProvider entries={lightboxEntries} label={`Photographs — ${series.title}`}>
        <ArticleHero
          title={series.title}
          description={series.description}
          publishedAt={series.publishedAt}
          location={series.location}
          tags={series.tags}
          coverImage={series.coverImage}
        />

        {/* Photo grid */}
        {series.images?.length > 0 && (
          <section
            className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] py-20"
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
        )}
      </ArticleMediaProvider>
    </main>
  );
}
