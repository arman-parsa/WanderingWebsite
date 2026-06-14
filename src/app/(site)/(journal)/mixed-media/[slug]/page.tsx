import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { MIXED_MEDIA_QUERY, MIXED_MEDIA_SLUGS_QUERY } from '@/lib/sanity';
import { ArticleHero } from '@/components/content/ArticleHero';
import { ArticleEndNav } from '@/components/content/ArticleEndNav';
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer';
import { ImageBlock } from '@/components/content/ImageBlock';
import { ImagePair } from '@/components/content/ImagePair';
import { VideoBlock } from '@/components/content/VideoBlock';
import { ArticleMediaProvider, OpenGalleryButton } from '@/components/content/MediaLightbox';
import { collectArticleMedia, type ImageBlockValue, type ImagePairValue, type MediaWidth } from '@/lib/articleMedia';
import { JsonLd } from '@/components/seo/JsonLd';
import { PLACEHOLDER_ITEMS, PLACEHOLDER_WRITING } from '@/lib/placeholders';
import { buildContentMetadata, contentImageUrl } from '@/lib/metadata';
import { buildContentJsonLd } from '@/lib/jsonld';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const placeholderSlugs = PLACEHOLDER_ITEMS
    .filter((i) => i._type === 'mixedMedia')
    .map((i) => ({ slug: i.slug }));
  try {
    const slugs = await client.fetch(MIXED_MEDIA_SLUGS_QUERY);
    return [...slugs.map((s: { slug: string }) => ({ slug: s.slug })), ...placeholderSlugs];
  } catch {
    return placeholderSlugs;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug.startsWith('_placeholder')) return { robots: { index: false } };
  try {
    const piece = await client.fetch(MIXED_MEDIA_QUERY, { slug });
    if (!piece) return {};
    return buildContentMetadata({
      title: piece.title,
      description: piece.description,
      path: `/mixed-media/${slug}`,
      publishedAt: piece.publishedAt,
      tags: piece.tags,
      coverImage: piece.coverImage,
      seo: piece.seo,
    });
  } catch {
    return {};
  }
}

export default async function MixedMediaPage({ params }: Props) {
  const { slug } = await params;
  let piece = null;
  try { piece = await client.fetch(MIXED_MEDIA_QUERY, { slug }); } catch { /* CORS */ }
  if (!piece && slug.startsWith('_placeholder')) {
    const match = PLACEHOLDER_ITEMS.find((i) => i.slug === slug && i._type === 'mixedMedia');
    if (match) piece = { ...PLACEHOLDER_WRITING, title: match.title, description: match.description, location: match.location, publishedAt: match.publishedAt };
  }
  if (!piece) notFound();

  // Media in the dedicated Images/Videos fields renders as a gallery after
  // the body. Media inserted inline in the Body interleaves with the text.
  const galleryBlocks = (piece.images ?? []) as ((ImageBlockValue | ImagePairValue) & {
    _key: string;
    _type: string;
  })[];
  const galleryVideos = (piece.videos ?? []) as {
    _key: string;
    vimeoId?: string;
    title: string;
    description?: string;
    width?: MediaWidth;
  }[];
  const hasGallery = galleryBlocks.length > 0 || galleryVideos.length > 0;
  // Every visual in the piece, in narrative order, for the lightbox.
  const lightboxEntries = collectArticleMedia(piece.body, galleryBlocks, galleryVideos);

  const jsonLd = buildContentJsonLd({
    type: 'Article',
    title: piece.title,
    description: piece.description,
    path: `/mixed-media/${slug}`,
    publishedAt: piece.publishedAt,
    tags: piece.tags,
    imageUrl: contentImageUrl(piece.coverImage),
  });

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#1c1814', color: '#f8f4ef' }}>
      <JsonLd data={jsonLd} />
      <ArticleMediaProvider
        entries={lightboxEntries}
        label={`Visuals — ${piece.title}`}
        credit={piece.photographyCredit ? `Photography — ${piece.photographyCredit}` : undefined}
      >
        <ArticleHero
          title={piece.title}
          description={piece.description}
          publishedAt={piece.publishedAt}
          location={piece.location}
          tags={piece.tags}
          coverImage={piece.coverImage}
        />
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding-x)] py-20">
            <article className="article-body" style={{ color: '#f8f4ef' }}>
              {piece.body && <PortableTextRenderer value={piece.body} />}
            </article>

            {hasGallery && (
              <section aria-label="Photographs and films">
                {piece.body && (
                  <div className="mt-16 h-px w-16 bg-current opacity-20" aria-hidden="true" />
                )}
                {galleryBlocks.map((block) =>
                  block._type === 'imagePair' ? (
                    <ImagePair key={block._key} value={block as ImagePairValue} />
                  ) : (
                    <ImageBlock key={block._key} value={block as ImageBlockValue} />
                  ),
                )}
                {galleryVideos.map((video) => (
                  <VideoBlock
                    key={video._key}
                    videoId={video.vimeoId}
                    title={video.title}
                    caption={video.description}
                    width={video.width}
                    lightboxKey={video._key}
                  />
                ))}
              </section>
            )}

            <div className="mt-16 flex flex-wrap items-center gap-4">
              <OpenGalleryButton />
              {piece.photographyCredit && (
                <p className="font-sans text-xs uppercase tracking-widest opacity-50">
                  Photography — {piece.photographyCredit}
                </p>
              )}
            </div>
          </div>
      </ArticleMediaProvider>
      <ArticleEndNav />
    </main>
  );
}
