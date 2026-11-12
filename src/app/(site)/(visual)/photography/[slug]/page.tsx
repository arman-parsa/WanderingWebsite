import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { sanityFetch, hasRealContent } from '@/lib/sanityFetch';
import { PHOTOGRAPHY_QUERY, PHOTOGRAPHY_SLUGS_QUERY } from '@/lib/sanity';
import { ArticleHero } from '@/components/content/ArticleHero';
import { ArticleEndNav } from '@/components/content/ArticleEndNav';
import { getAdjacentPieces } from '@/lib/adjacentPieces';
import { ArticleMediaProvider } from '@/components/content/MediaLightbox';
import { PhotoSequence } from '@/components/content/PhotoSequence';
import type { SequenceImage } from '@/lib/photoSequence';
import { collectArticleMedia } from '@/lib/articleMedia';
import { JsonLd } from '@/components/seo/JsonLd';
import { PLACEHOLDER_ITEMS, PLACEHOLDER_PHOTO_SERIES } from '@/lib/placeholders';
import { buildContentMetadata, contentImageUrl } from '@/lib/metadata';
import { buildContentJsonLd } from '@/lib/jsonld';
import { breadcrumbJsonLd, collectPhotos, photoObjectsJsonLd } from '@/lib/seoImages';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const placeholderSlugs = PLACEHOLDER_ITEMS
    .filter((i) => i._type === 'photography')
    .map((i) => ({ slug: i.slug }));
  try {
    const slugs: { slug: string }[] = await client.fetch(PHOTOGRAPHY_SLUGS_QUERY);
    // Placeholder pages are only built while the CMS has no real content.
    if (slugs.length > 0 || (await hasRealContent())) return slugs.map((s) => ({ slug: s.slug }));
    return placeholderSlugs;
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

type SeriesImage = {
  _key: string;
  // imageBlock: the picture itself lives in the nested `asset` image field
  asset?: { asset?: { _ref?: string }; hotspot?: { x: number; y: number }; lqip?: string };
  alt?: string;
  caption?: string;
  description?: string;
  aspectRatio?: number | null;
};

export default async function PhotographyPage({ params }: Props) {
  const { slug } = await params;
  let series = null;
  series = await sanityFetch(PHOTOGRAPHY_QUERY, { slug });
  if (!series && slug.startsWith('_placeholder')) {
    const match = PLACEHOLDER_ITEMS.find((i) => i.slug === slug && i._type === 'photography');
    if (match) series = { ...PLACEHOLDER_PHOTO_SERIES, title: match.title, description: match.description, location: match.location, publishedAt: match.publishedAt };
  }
  if (!series) notFound();

  const { newer, older } = await getAdjacentPieces('photography', slug);

  const jsonLd = buildContentJsonLd({
    type: 'ImageGallery',
    title: series.title,
    // The SEO description when one is set — the same text as the meta tag.
    description: series.seo?.metaDescription ?? series.description,
    path: `/photography/${slug}`,
    publishedAt: series.publishedAt,
    tags: series.tags,
    imageUrl: contentImageUrl(series.coverImage),
    // Every photograph on the page, credited to Arman and licensable.
    extra: { image: photoObjectsJsonLd(collectPhotos(series), { licenseUrl: series.printsUrl ?? undefined }) },
  });

  const lightboxEntries = collectArticleMedia(null, series.images ?? []);
  // imageBlock → sequence image: the picture's own fields, with the block's
  // key (the lightbox matches on it), alt text and caption.
  const sequence: SequenceImage[] = ((series.images ?? []) as SeriesImage[])
    .filter((image) => image.asset?.asset)
    .map((image) => ({
      ...image.asset,
      _key: image._key,
      alt: image.alt || image.caption || image.description || series.title,
      caption: image.caption ?? image.description,
      aspectRatio: image.aspectRatio,
    }));

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#0D0D0D', color: '#f8f4ef' }}>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Personal', path: '/library' }, { name: series.title, path: `/photography/${slug}` }])} />
      <ArticleMediaProvider entries={lightboxEntries} label={`Photographs — ${series.title}`}>
        <ArticleHero
          title={series.title}
          description={series.description}
          publishedAt={series.publishedAt}
          location={series.location}
          tags={series.tags}
          category="Photography"
          coverImage={series.coverImage}
        />

        {/* The series as an editorial sequence (same layout as commissions):
            nothing cropped, every photograph opens the lightbox. */}
        {sequence.length > 0 && (
          <div className="py-20">
            <PhotoSequence
              images={sequence}
              label="Photo series"
              firstRow={series.coverImage?.asset ? 'eager' : 'preload'}
            />
          </div>
        )}
      </ArticleMediaProvider>
      <ArticleEndNav printsUrl={series.printsUrl ?? undefined} newer={newer} older={older} />
    </main>
  );
}
