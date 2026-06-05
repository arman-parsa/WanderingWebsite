import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { EDITORIAL_QUERY, EDITORIAL_SLUGS_QUERY } from '@/lib/sanity';
import { EssayHero } from '@/components/content/EssayHero';
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(EDITORIAL_SLUGS_QUERY);
    return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const editorial = await client.fetch(EDITORIAL_QUERY, { slug });
  if (!editorial) return {};
  return {
    title: editorial.seo?.metaTitle ?? editorial.title,
    description: editorial.seo?.metaDescription ?? editorial.excerpt,
  };
}

export default async function MixedMediaPage({ params }: Props) {
  const { slug } = await params;
  const editorial = await client.fetch(EDITORIAL_QUERY, { slug });
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
