import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ESSAY_QUERY, ESSAY_SLUGS_QUERY } from '@/lib/sanity';
import { EssayHero } from '@/components/content/EssayHero';
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer';
import { PLACEHOLDER_ITEMS, PLACEHOLDER_ESSAY } from '@/lib/placeholders';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const placeholderSlugs = PLACEHOLDER_ITEMS
    .filter((i) => i._type === 'essay')
    .map((i) => ({ slug: i.slug }));
  try {
    const slugs = await client.fetch(ESSAY_SLUGS_QUERY);
    return [...slugs.map((s: { slug: string }) => ({ slug: s.slug })), ...placeholderSlugs];
  } catch {
    return placeholderSlugs;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const essay = await client.fetch(ESSAY_QUERY, { slug });
    if (!essay) return {};
    return {
      title: essay.seo?.metaTitle ?? essay.title,
      description: essay.seo?.metaDescription ?? essay.excerpt,
    };
  } catch {
    return {};
  }
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  let essay = null;
  try { essay = await client.fetch(ESSAY_QUERY, { slug }); } catch { /* CORS */ }
  if (!essay && slug.startsWith('_placeholder')) {
    const match = PLACEHOLDER_ITEMS.find((i) => i.slug === slug && i._type === 'essay');
    if (match) essay = { ...PLACEHOLDER_ESSAY, title: match.title, excerpt: match.excerpt, location: match.location, publishedAt: match.publishedAt };
  }
  if (!essay) notFound();

  return (
    <>
      <EssayHero
        title={essay.title}
        excerpt={essay.excerpt}
        publishedAt={essay.publishedAt}
        location={essay.location}
        tags={essay.tags}
        coverImage={essay.coverImage}
      />
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding-x)] pb-24">
        <article className="article-body">
          {essay.body && <PortableTextRenderer value={essay.body} />}
        </article>
      </div>
    </>
  );
}
