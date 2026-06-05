import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ESSAY_QUERY, ESSAY_SLUGS_QUERY } from '@/lib/sanity';
import { EssayHero } from '@/components/content/EssayHero';
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(ESSAY_SLUGS_QUERY);
    return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const essay = await client.fetch(ESSAY_QUERY, { slug });
  if (!essay) return {};
  return {
    title: essay.seo?.metaTitle ?? essay.title,
    description: essay.seo?.metaDescription ?? essay.excerpt,
  };
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  const essay = await client.fetch(ESSAY_QUERY, { slug });
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
