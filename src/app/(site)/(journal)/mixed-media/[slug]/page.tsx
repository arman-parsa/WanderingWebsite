import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { MIXED_MEDIA_QUERY, MIXED_MEDIA_SLUGS_QUERY } from '@/lib/sanity';
import { EssayHero } from '@/components/content/EssayHero';
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer';
import { ImageBlock, type ImageBlockValue } from '@/components/content/ImageBlock';
import { VideoBlock } from '@/components/content/VideoBlock';
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
  const galleryImages = (piece.images ?? []) as (ImageBlockValue & { _key: string })[];
  const galleryVideos = (piece.videos ?? []) as {
    _key: string;
    vimeoId?: string;
    title: string;
    description?: string;
  }[];
  const hasGallery = galleryImages.length > 0 || galleryVideos.length > 0;

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
      <div style={{ paddingTop: 'clamp(5rem, 10vh, 8rem)' }}>
        <EssayHero
          title={piece.title}
          description={piece.description}
          publishedAt={piece.publishedAt}
          location={piece.location}
          tags={piece.tags}
          coverImage={piece.coverImage}
        />
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding-x)] pb-24">
          <article className="article-body" style={{ color: '#f8f4ef' }}>
            {piece.body && <PortableTextRenderer value={piece.body} />}
          </article>

          {hasGallery && (
            <section aria-label="Photographs and films">
              {piece.body && (
                <div className="mt-16 h-px w-16 bg-current opacity-20" aria-hidden="true" />
              )}
              {galleryImages.map((image) => (
                <ImageBlock key={image._key} value={image} />
              ))}
              {galleryVideos.map((video) => (
                <VideoBlock
                  key={video._key}
                  videoId={video.vimeoId}
                  title={video.title}
                  caption={video.description}
                />
              ))}
            </section>
          )}

          {piece.photographyCredit && (
            <p className="mt-16 font-sans text-xs uppercase tracking-widest opacity-50">
              Photography — {piece.photographyCredit}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
