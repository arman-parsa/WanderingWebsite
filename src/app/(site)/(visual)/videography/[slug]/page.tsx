import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { client } from '@/lib/sanity';
import { VIDEOGRAPHY_QUERY, VIDEOGRAPHY_SLUGS_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';
import { VideoBlock } from '@/components/content/VideoBlock';

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
  try {
    const piece = await client.fetch(VIDEOGRAPHY_QUERY, { slug });
    if (!piece) return {};
    return {
      title: piece.seo?.metaTitle ?? piece.title,
      description: piece.seo?.metaDescription ?? piece.description,
    };
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18181b', color: '#f8f4ef', paddingTop: 'clamp(5rem, 10vh, 8rem)' }}>
      {/* Full-bleed cover thumbnail */}
      {piece.coverImage?.asset && (
        <div className="relative h-[60vh] w-full overflow-hidden">
          <Image
            src={urlFor(piece.coverImage).width(2400).format('webp').quality(85).url()}
            alt={piece.coverImage.alt ?? piece.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-[var(--content-padding-x)] pb-12">
            <div className="mx-auto max-w-[var(--content-wide-width)]">
              <p className="mb-2 font-sans text-xs uppercase tracking-widest text-white/70">
                Videography
                {piece.location && ` · ${piece.location}`}
                {piece.publishedAt && ` — ${formatDate(piece.publishedAt)}`}
              </p>
              <h1 className="font-serif text-[var(--text-4xl)] font-light tracking-tight text-white">
                {piece.title}
              </h1>
              {piece.description && (
                <p className="mt-3 max-w-lg font-serif text-base italic leading-relaxed text-white/80">
                  {piece.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No cover image — text header */}
      {!piece.coverImage?.asset && (
        <div className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] py-16">
          <p className="mb-4 font-sans text-xs uppercase tracking-widest" style={{ color: '#a09890' }}>
            Videography
            {piece.location && ` · ${piece.location}`}
            {piece.publishedAt && ` — ${formatDate(piece.publishedAt)}`}
          </p>
          <h1 className="font-serif text-[var(--text-4xl)] font-light tracking-tight" style={{ color: '#f8f4ef' }}>
            {piece.title}
          </h1>
          {piece.description && (
            <p className="mt-4 font-serif text-[var(--text-xl)] italic leading-relaxed" style={{ color: '#a09890' }}>
              {piece.description}
            </p>
          )}
        </div>
      )}

      {/* Videos */}
      {piece.videos?.length > 0 && (
        <section className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] py-16 space-y-16">
          {piece.videos.map((video: SanityVideo) => (
            video.vimeoId ? (
              <div key={video._key}>
                <VideoBlock videoId={video.vimeoId} title={video.title} />
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
    </div>
  );
}
