import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { VIDEOGRAPHY_QUERY, VIDEOGRAPHY_SLUGS_QUERY } from '@/lib/sanity';
import { ArticleHero } from '@/components/content/ArticleHero';
import { ArticleEndNav } from '@/components/content/ArticleEndNav';
import { JsonLd } from '@/components/seo/JsonLd';
import { VideoBlock } from '@/components/content/VideoBlock';
import { buildContentMetadata, contentImageUrl } from '@/lib/metadata';
import { buildContentJsonLd } from '@/lib/jsonld';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(VIDEOGRAPHY_SLUGS_QUERY);
    return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug.startsWith('_placeholder')) return { robots: { index: false } };
  try {
    const piece = await client.fetch(VIDEOGRAPHY_QUERY, { slug });
    if (!piece) return {};
    return buildContentMetadata({
      title: piece.title,
      description: piece.description,
      path: `/videography/${slug}`,
      publishedAt: piece.publishedAt,
      tags: piece.tags,
      coverImage: piece.coverImage,
      seo: piece.seo,
    });
  } catch {
    return {};
  }
}

type SanityVideo = {
  _key: string;
  vimeoId?: string;
  title: string;
  description?: string;
};

export default async function VideographyPage({ params }: Props) {
  const { slug } = await params;
  let piece = null;
  try { piece = await client.fetch(VIDEOGRAPHY_QUERY, { slug }); } catch { /* CORS */ }
  if (!piece) notFound();

  const firstVimeoId = piece.videos?.find((v: SanityVideo) => v.vimeoId)?.vimeoId;
  const jsonLd = buildContentJsonLd({
    type: 'VideoObject',
    title: piece.title,
    description: piece.description,
    path: `/videography/${slug}`,
    publishedAt: piece.publishedAt,
    tags: piece.tags,
    imageUrl: contentImageUrl(piece.coverImage),
    ...(firstVimeoId && { embedUrl: `https://player.vimeo.com/video/${firstVimeoId}` }),
  });

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#1c1814', color: '#f8f4ef' }}>
      <JsonLd data={jsonLd} />
      <ArticleHero
        title={piece.title}
        description={piece.description}
        publishedAt={piece.publishedAt}
        location={piece.location}
        tags={piece.tags}
        category="Videography"
        coverImage={piece.coverImage}
      />

      {/* Videos */}
      {piece.videos?.length > 0 && (
        <section
          className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] py-20 space-y-16"
          aria-label="Videos"
        >
          {piece.videos.map((video: SanityVideo) => (
            video.vimeoId ? (
              <div key={video._key}>
                <VideoBlock videoId={video.vimeoId} title={video.title} width="wide" />
                {video.description && (
                  <p className="mt-4 font-sans text-sm leading-relaxed" style={{ color: '#a09890' }}>
                    {video.description}
                  </p>
                )}
              </div>
            ) : null
          ))}
        </section>
      )}
      <ArticleEndNav />
    </main>
  );
}
