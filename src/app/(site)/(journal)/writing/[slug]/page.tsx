import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { WRITING_QUERY, WRITING_SLUGS_QUERY } from '@/lib/sanity';
import { EssayHero } from '@/components/content/EssayHero';
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer';
import { PLACEHOLDER_ITEMS, PLACEHOLDER_WRITING } from '@/lib/placeholders';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const placeholderSlugs = PLACEHOLDER_ITEMS
    .filter((i) => i._type === 'writing')
    .map((i) => ({ slug: i.slug }));
  try {
    const slugs = await client.fetch(WRITING_SLUGS_QUERY);
    return [...slugs.map((s: { slug: string }) => ({ slug: s.slug })), ...placeholderSlugs];
  } catch {
    return placeholderSlugs;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const piece = await client.fetch(WRITING_QUERY, { slug });
    if (!piece) return {};
    return {
      title: piece.seo?.metaTitle ?? piece.title,
      description: piece.seo?.metaDescription ?? piece.description,
    };
  } catch {
    return {};
  }
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  let piece = null;
  try { piece = await client.fetch(WRITING_QUERY, { slug }); } catch { /* CORS */ }
  if (!piece && slug.startsWith('_placeholder')) {
    const match = PLACEHOLDER_ITEMS.find((i) => i.slug === slug && i._type === 'writing');
    if (match) piece = { ...PLACEHOLDER_WRITING, title: match.title, description: match.description, location: match.location, publishedAt: match.publishedAt };
  }
  if (!piece) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1c1814', color: '#f8f4ef' }}>
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
        </div>
      </div>
    </div>
  );
}
