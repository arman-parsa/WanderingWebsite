import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Wandering Website',
  description: 'A personal editorial website: travel writing, photography, and mixed media.',
};

type ContentItem = {
  _type: 'essay' | 'editorial' | 'photoSeries';
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

const TYPE_HREF: Record<string, string> = {
  essay:       '/writing',
  editorial:   '/mixed-media',
  photoSeries: '/photography',
};

const TYPE_LABEL: Record<string, string> = {
  essay:       'Writing',
  editorial:   'Mixed Media',
  photoSeries: 'Photography',
};

export default async function HomePage() {
  let featured: ContentItem[] = [];
  try {
    const all = await client.fetch(ALL_CONTENT_QUERY);
    featured = all.slice(0, 6);
  } catch {
    // Renders gracefully before CORS / content is configured
  }

  return (
    <main id="main-content">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="flex min-h-[80vh] flex-col items-start justify-end px-[var(--content-padding-x)] pb-20 pt-40">
        <div className="mx-auto w-full max-w-[var(--content-full-width)]">
          <p className="mb-6 font-sans text-xs uppercase tracking-widest text-ink-muted">
            Writing · Photography · Mixed Media
          </p>
          <h1 className="text-display font-light tracking-tight text-ink">
            Wandering<br />Website
          </h1>
          <p className="mt-8 max-w-lg font-serif text-[var(--text-lg)] italic leading-[var(--leading-relaxed)] text-ink-muted">
            A personal archive of travel writing, photography, and editorial work from the field.
          </p>
          <Link
            href="/articles"
            className="mt-10 inline-block font-sans text-xs uppercase tracking-widest text-ink underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-accent hover:underline"
          >
            Browse all work
          </Link>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)]">
        <div className="h-px bg-border" />
      </div>

      {/* ── Recent work ───────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] py-24">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-sans text-xs uppercase tracking-widest text-ink-muted">
              Recent Work
            </h2>
            <Link
              href="/articles"
              className="font-sans text-xs uppercase tracking-widest text-ink-muted transition-colors duration-[var(--duration-fast)] hover:text-accent"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => {
              const href = `${TYPE_HREF[item._type]}/${item.slug}`;
              return (
                <article key={item.slug} className="group flex flex-col">
                  <Link href={href} className="block overflow-hidden" tabIndex={-1} aria-hidden="true">
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                      {item.coverImage?.asset ? (
                        <Image
                          src={urlFor(item.coverImage).width(800).height(600).fit('crop').format('webp').quality(80).url()}
                          alt={item.coverImage.alt ?? item.title}
                          fill
                          placeholder="blur"
                          blurDataURL={urlFor(item.coverImage).width(20).format('webp').quality(30).url()}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-all duration-[var(--duration-slow)] group-hover:scale-[1.02] group-hover:brightness-95"
                        />
                      ) : (
                        <div className="h-full w-full bg-surface" />
                      )}
                    </div>
                  </Link>

                  <div className="mt-4 flex flex-1 flex-col">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="text-caption">{TYPE_LABEL[item._type]}</span>
                      {item.location && <span className="text-caption">{item.location}</span>}
                      {item.publishedAt && <span className="text-caption">{formatDate(item.publishedAt)}</span>}
                    </div>
                    <h3 className="font-serif text-[var(--text-xl)] font-light leading-snug tracking-tight text-ink">
                      <Link
                        href={href}
                        className="transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                      >
                        {item.title}
                      </Link>
                    </h3>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Empty state (no content yet) ──────────────────────────────── */}
      {featured.length === 0 && (
        <section className="mx-auto max-w-[var(--content-full-width)] px-[var(--content-padding-x)] py-24">
          <p className="font-serif text-[var(--text-lg)] italic text-ink-muted">
            No pieces published yet.
          </p>
        </section>
      )}

    </main>
  );
}
