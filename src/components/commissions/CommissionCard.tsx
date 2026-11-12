import Link from 'next/link';
import { ResolveImage } from '@/components/content/ResolveImage';
import { photoUrl } from '@/lib/sanityImage';
import { commissionHref, type CommissionSummary } from '@/lib/commissions';

type Props = {
  commission: CommissionSummary;
  /** Cards in the first screen — their covers are LCP candidates. */
  priority?: boolean;
};

/**
 * One commission on the index: the cover, and the client's name beneath it,
 * nothing else. The whole card opens the commission. Hover: a slow
 * brightness shift on the cover, no scale.
 */
export function CommissionCard({ commission: c, priority = false }: Props) {
  const cover = c.coverImage?.asset ? c.coverImage : null;
  const hotspot = cover?.hotspot;

  return (
    <article className="commission-card">
      <Link href={commissionHref(c.slug)} className="commission-card__link">
        <div className="commission-card__frame">
          {cover && (
            <ResolveImage
              src={photoUrl(cover, cover.alt).width(1500).height(1000).fit('crop').url()}
              alt={cover.alt ?? ''}
              fill
              {...(priority ? { preload: true } : {})}
              sizes="(max-width: 719px) 100vw, 50vw"
              className="commission-card__img"
              style={hotspot ? { objectPosition: `${hotspot.x * 100}% ${hotspot.y * 100}%` } : undefined}
            />
          )}
        </div>
        <h2 className="commission-card__title">{c.clientName}</h2>
      </Link>
    </article>
  );
}
