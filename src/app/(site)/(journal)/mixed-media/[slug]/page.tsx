import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { EDITORIAL_QUERY, EDITORIAL_SLUGS_QUERY } from '@/lib/sanity';
import { EssayHero } from '@/components/content/EssayHero';
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer';
import { PLACEHOLDER_ITEMS, PLACEHOLDER_ESSAY } from '@/lib/placeholders';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const placeholderSlugs = PLACEHOLDER_ITEMS
    .filter((i) => i._type === 'editorial')
    .map((i) => ({ slug: i.slug }));
  try {
    const slugs = await client.fetch(EDITORIAL_SLUGS_QUERY);
    return [...slugs.map((s: { slug: string }) => ({ slug: s.slug })), ...placeholderSlugs];
  } catch {
    return placeholderSlugs;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const editorial = await client.fetch(EDITORIAL_QUERY, { slug });
    if (!editorial) return {};
    return {
      title: editorial.seo?.metaTitle ?? editorial.title,
      description: editorial.seo?.metaDescription ?? editorial.excerpt,
    };
  } catch {
    return {};
  }
}

export default async function MixedMediaPage({ params }: Props) {
  const { slug } = await params;
  let editorial = null;
  try { editorial = await client.fetch(EDITORIAL_QUERY, { slug }); } catch { /* CORS */ }
  if (!editorial && slug.startsWith('_placeholder')) {
    const match = PLACEHOLDER_ITEMS.find((i) => i.slug === slug && i._type === 'editorial');
    if (match) editorial = { ...PLACEHOLDER_ESSAY, title: match.title, excerpt: match.excerpt, location: match.location, publishedAt: match.publishedAt };
  }
  if (!editorial) notFound();

  return (
    <>
      <EssayHero
        title={editorial.title}
        excerpt={editorial.excerpt}
        publishedAt={editorial.publishedAt}
        location={editorial.location}
        tags={editorial.tags}
        coverImage={editorial.coverImage}
      />
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding-x)] pb-24">
        <article className="article-body">
          {editorial.body && <PortableTextRenderer value={editorial.body} />}
        </article>
      </div>
    </>
  );
}
