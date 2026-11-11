import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { client } from '@/lib/sanity';
import { sanityFetch } from '@/lib/sanityFetch';
import { COMMISSION_QUERY, COMMISSION_SLUGS_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { buildContentMetadata, contentImageUrl } from '@/lib/metadata';
import { buildContentJsonLd } from '@/lib/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import { ResolveImage } from '@/components/content/ResolveImage';
import { VideoBlock } from '@/components/content/VideoBlock';
import { PullQuote } from '@/components/content/PullQuote';
import { PhotoSequence } from '@/components/content/PhotoSequence';
import {
  commissionClientLine,
  commissionHref,
  commissionTitle,
  deliverableLabels,
  placeAndYear,
  sectorLabel,
  type Commission,
} from '@/lib/commissions';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs: { slug: string }[] = await client.fetch(COMMISSION_SLUGS_QUERY);
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

const labelsOf = (c: Commission) =>
  [sectorLabel(c.sector), ...deliverableLabels(c.deliverables)].filter((l): l is string => !!l);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const c: Commission | null = await client.fetch(COMMISSION_QUERY, { slug });
    if (!c) return {};
    return buildContentMetadata({
      title: commissionTitle(c),
      description: c.brief ?? undefined,
      path: commissionHref(slug),
      tags: labelsOf(c),
      coverImage: c.coverImage ?? undefined,
    });
  } catch {
    return {};
  }
}

export default async function CommissionPage({ params }: Props) {
  const { slug } = await params;
  const c = await sanityFetch<Commission>(COMMISSION_QUERY, { slug });
  if (!c) notFound();

  const title = commissionTitle(c);
  const clientLine = commissionClientLine(c);
  const labels = labelsOf(c);
  const images = c.images ?? [];
  const cover = c.coverImage?.asset ? c.coverImage : null;
  const quote = c.testimonial?.quote?.trim();
  const attribution = [c.testimonial?.name, c.testimonial?.role].filter(Boolean).join(', ');

  const jsonLd = buildContentJsonLd({
    type: 'ImageGallery',
    title,
    description: c.brief ?? undefined,
    path: commissionHref(slug),
    tags: labels,
    imageUrl: contentImageUrl(cover ?? undefined),
    // Who it was for, where and when — so the work turns up for the client's name.
    extra: {
      funder: { '@type': 'Organization', name: c.clientName },
      ...(c.location && { contentLocation: { '@type': 'Place', name: c.location } }),
      ...(c.year && { dateCreated: String(c.year) }),
      ...(sectorLabel(c.sector) && { genre: sectorLabel(c.sector) }),
    },
  });

  return (
    <main id="main-content" className="commission-page">
      <JsonLd data={jsonLd} />

      <header className="commission-header">
        {clientLine && <p className="commission-header__client">{clientLine}</p>}
        <h1 className="commission-header__title">{title}</h1>
        {(placeAndYear(c) || labels.length > 0) && (
          <div className="commission-header__meta">
            {placeAndYear(c) && <p>{placeAndYear(c)}</p>}
            {labels.length > 0 && (
              <ul className="commission-labels" aria-label="Sector and deliverables">
                {labels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {c.brief && <p className="commission-header__brief">{c.brief}</p>}
      </header>

      {images.length > 0 ? (
        <PhotoSequence images={images} />
      ) : (
        cover && (
          // No images yet — the cover stands in for the sequence.
          <section className="photo-sequence" aria-label="Photographs">
            <div className="photo-row photo-row--wide">
              <figure className="photo-plate photo-plate--cover">
                <div className="photo-plate__frame">
                  <ResolveImage
                    src={urlFor(cover).width(2200).height(1238).fit('crop').url()}
                    alt={cover.alt ?? ''}
                    fill
                    preload
                    sizes="(max-width: 1148px) 100vw, 1100px"
                    className="photo-plate__img"
                  />
                </div>
              </figure>
            </div>
          </section>
        )
      )}

      {c.film?.vimeoId && (
        <section className="commission-film" aria-label="Film">
          <VideoBlock videoId={c.film.vimeoId} title={c.film.title ?? title} caption={c.film.description} width="wide" />
        </section>
      )}

      {quote && (
        <section className="commission-testimonial" aria-label="Testimonial">
          <PullQuote quote={quote} attribution={attribution || undefined} />
        </section>
      )}

      <div className="commission-end">
        <Link href="/contact" className="home-read-more home-read-more--invert">
          Enquire
        </Link>
      </div>
    </main>
  );
}
