import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { ContentCard } from '@/components/navigation/ContentCard';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Essays, editorials, and photography series.',
};

type ContentItem = {
  _type: 'essay' | 'editorial' | 'photoSeries';
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

export default async function ArticlesPage() {
  let items: ContentItem[] = [];
  try {
    items = await client.fetch(ALL_CONTENT_QUERY);
  } catch {
    // Returns empty list when Sanity CORS is not yet configured
  }
  if (items.length === 0) items = PLACEHOLDER_ITEMS as ContentItem[];

  return (
    <main id="main-content" className="mx-auto w-full max-w-[var(--content-full-width)] px-[var(--content-padding-x)] py-24">
      <header className="mb-16">
        <h1 className="font-serif text-[var(--text-4xl)] font-light tracking-tight text-ink">
          Articles
        </h1>
        <p className="mt-3 font-sans text-sm uppercase tracking-widest text-ink-muted">
          {items.length} {items.length === 1 ? 'piece' : 'pieces'}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="font-serif text-[var(--text-lg)] text-ink-muted">No content published yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard key={item.slug} {...item} />
          ))}
        </div>
      )}
    </main>
  );
}
