import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/lib/sanity';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { formatDate } from '@/lib/utils';
import { HeroSection } from '@/components/home/HeroSection';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';

export const revalidate = 300;

export const metadata: Metadata = {
  title: "ARMAN'S WANDERINGS",
  description: "A personal archive of travel writing, photography, and editorial work from the field.",
};

type ContentItem = {
  _type: 'writing' | 'mixedMedia' | 'photography' | 'videography';
  title: string;
  slug: string;
  publishedAt?: string;
  location?: string;
  description?: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

const TYPE_HREF: Record<string, string> = {
  writing:     '/writing',
  mixedMedia:  '/mixed-media',
  photography: '/photography',
  videography: '/videography',
};

const TYPE_LABEL: Record<string, string> = {
  writing:     'WRITING',
  mixedMedia:  'MIXED MEDIA',
  photography: 'PHOTOGRAPHY',
  videography: 'VIDEOGRAPHY',
};

export default async function HomePage() {
  let items: ContentItem[] = [];
  try {
    const all = await client.fetch(ALL_CONTENT_QUERY);
    items = all.slice(0, 7);
  } catch {
    // Renders gracefully before CORS / content is configured
  }
  if (items.length === 0) items = PLACEHOLDER_ITEMS.slice(0, 7) as ContentItem[];

  const hero = items[0];
  const grid = items.slice(0, 6);

  return (
    <main id="main-content" className="w-full">

      {/* ── Hero ──────────────────────────────────────────────────────────
          Full-viewport-height, most recent piece, parallax image.
          Nav is fixed and overlays the top of the hero.
      ──────────────────────────────────────────────────────────────────── */}
      {hero && <HeroSection item={hero} />}

      {/* ── Gallery grid ──────────────────────────────────────────────────
          6 most recent pieces. Portrait cards, image-forward.
          Hover: image darkens + meta overlay fades in.
      ──────────────────────────────────────────────────────────────────── */}
      <section
        aria-label="Recent work"
        className="mx-auto w-full max-w-[var(--content-full-width)] px-[var(--content-padding-x)] pt-20 pb-20"
      >
        {grid.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {grid.map((item) => {
              const href  = `${TYPE_HREF[item._type]}/${item.slug}`;
              const label = TYPE_LABEL[item._type];

              return (
                <article key={item.slug} className="group">

                  {/* Image block ─ tabIndex -1 keeps keyboard focus on the title */}
                  <Link
                    href={href}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="relative block aspect-[3/4] overflow-hidden"
                  >
                    {/* Category pill — overlayed top-left */}
                    <span className="absolute left-3 top-3 z-10 rounded-sm bg-paper/85 px-[0.6rem] py-[0.25rem] font-sans text-[0.65rem] uppercase tracking-widest text-ink">
                      {label}
                    </span>

                    {/* Cover image */}
                    {item.coverImage?.asset ? (
                      <Image
                        src={urlFor(item.coverImage)
                          .width(600).height(800)
                          .fit('crop').format('webp').quality(80)
                          .url()}
                        alt={item.coverImage.alt ?? item.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover brightness-100 transition-[filter] duration-500 group-hover:brightness-75"
                      />
                    ) : (
                      <div className="h-full w-full bg-surface" />
                    )}

                    {/* Hover overlay: gradient + location + date */}
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.65)_0%,transparent_60%)] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100">
                      <div className="px-3 pb-4 pt-16">
                        {item.location && (
                          <p className="font-sans text-[0.65rem] uppercase tracking-widest text-white/70">
                            {item.location}
                          </p>
                        )}
                        {item.publishedAt && (
                          <p className="font-sans text-[0.65rem] uppercase tracking-widest text-white/70">
                            {formatDate(item.publishedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Title below image — the accessible, focusable link */}
                  <h3 className="mt-3 font-serif text-[clamp(0.95rem,1.2vw,1.1rem)] leading-[1.3] text-ink">
                    <Link
                      href={href}
                      className="transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                    >
                      {item.title}
                    </Link>
                  </h3>

                </article>
              );
            })}
          </div>
        )}

        {/* VIEW ALL */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/articles"
            className="font-sans text-[0.75rem] uppercase tracking-widest text-ink-muted transition-colors duration-[300ms] hover:text-ink"
          >
            View All
          </Link>
        </div>
      </section>

    </main>
  );
}
