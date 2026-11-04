import { ResolveImage } from '@/components/content/ResolveImage';
import { urlFor } from '@/lib/sanityImage';
import { planSequence, ratioOf, type SequenceRow } from '@/lib/commissionLayout';
import type { CommissionImage } from '@/lib/commissions';

/** The commission's photographs as an editorial sequence (see commissionLayout.ts). */
export function CommissionSequence({ images }: { images: CommissionImage[] }) {
  const usable = images.filter((img) => img.asset?._ref);
  if (usable.length === 0) return null;
  const rows = planSequence(usable);

  return (
    <section className="commission-sequence" aria-label="Photographs">
      {rows.map((row, i) => (
        <Row
          key={row.images.map((img) => img._key).join('-')}
          row={row}
          // The first rows are in (or right below) the first screen: preload
          // the opening row, fetch the next straight away.
          load={i === 0 ? 'preload' : i === 1 ? 'eager' : 'lazy'}
        />
      ))}
    </section>
  );
}

const SIZES: Record<SequenceRow['kind'], string> = {
  wide: '(max-width: 1148px) 100vw, 1100px',
  offset: '(max-width: 719px) 100vw, 720px',
  single: '(max-width: 719px) 100vw, 520px',
  pair: '(max-width: 719px) 100vw, 550px',
};

type Load = 'preload' | 'eager' | 'lazy';

function Row({ row, load }: { row: SequenceRow; load: Load }) {
  const side = row.kind === 'offset' || row.kind === 'single' ? ` commission-row--${row.side}` : '';
  return (
    <div className={`commission-row commission-row--${row.kind}${side}`}>
      {row.images.map((img) => (
        <Plate key={img._key} image={img} sizes={SIZES[row.kind]} load={load} />
      ))}
    </div>
  );
}

function Plate({ image, sizes, load }: { image: CommissionImage; sizes: string; load: Load }) {
  const ratio = ratioOf(image);
  return (
    // --ratio drives each plate's share of a pair row (equal heights, no crop)
    // and its aspect-ratio box, so nothing shifts while the image loads.
    <figure className="commission-plate" style={{ '--ratio': ratio } as React.CSSProperties}>
      <div className="commission-plate__frame">
        <ResolveImage
          src={urlFor(image).width(2000).url()}
          alt={image.alt ?? ''}
          fill
          sizes={sizes}
          {...(load === 'preload' ? { preload: true } : { loading: load })}
          className="commission-plate__img"
        />
      </div>
      {image.caption && <figcaption className="commission-plate__caption">{image.caption}</figcaption>}
    </figure>
  );
}
