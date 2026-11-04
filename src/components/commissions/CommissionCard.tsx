import Link from 'next/link';
import { ResolveImage } from '@/components/content/ResolveImage';
import { urlFor } from '@/lib/sanityImage';
import {
  commissionClientLine,
  commissionHref,
  commissionTitle,
  deliverableLabels,
  placeAndYear,
  sectorLabel,
  type CommissionSummary,
} from '@/lib/commissions';

type Props = {
  commission: CommissionSummary;
  /** A single large feature (one commission, or the lead of an odd count). */
  feature?: boolean;
  /** The first card on the page — its image is the LCP candidate. */
  priority?: boolean;
};

/**
 * One commission on the index: cover, client name (and project title when it
 * differs), place and year, then sector and deliverables as small labels.
 * Hover: a slow brightness shift on the cover, no scale.
 */
export function CommissionCard({ commission: c, feature = false, priority = false }: Props) {
  const title = c.clientName;
  const project = commissionClientLine(c) ? commissionTitle(c) : null;
  const labels = [sectorLabel(c.sector), ...deliverableLabels(c.deliverables)].filter(
    (l): l is string => !!l,
  );
  const cover = c.coverImage?.asset ? c.coverImage : null;
  const [w, h] = feature ? [2200, 1238] : [1200, 800]; // 16:9 feature, 3:2 card
  const hotspot = cover?.hotspot;

  return (
    <article className={`commission-card${feature ? ' commission-card--feature' : ''}`}>
      <Link href={commissionHref(c.slug)} className="commission-card__link">
        <div className="commission-card__frame">
          {cover && (
            <ResolveImage
              src={urlFor(cover).width(w).height(h).fit('crop').url()}
              alt={cover.alt ?? ''}
              fill
              {...(priority ? { preload: true } : {})}
              sizes={feature ? '(max-width: 1148px) 100vw, 1100px' : '(max-width: 719px) 100vw, 550px'}
              className="commission-card__img"
              style={hotspot ? { objectPosition: `${hotspot.x * 100}% ${hotspot.y * 100}%` } : undefined}
            />
          )}
        </div>
        <div className="commission-card__text">
          <h2 className="commission-card__title">{title}</h2>
          {project && <p className="commission-card__project">{project}</p>}
          {placeAndYear(c) && <p className="commission-card__meta">{placeAndYear(c)}</p>}
          {labels.length > 0 && (
            <ul className="commission-labels" aria-label="Sector and deliverables">
              {labels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </article>
  );
}
