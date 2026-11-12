import { ResolveImage } from '@/components/content/ResolveImage';
import { LightboxTrigger } from '@/components/content/MediaLightbox';
import { photoUrl } from '@/lib/sanityImage';
import { planSequence, ratioOf, type SequenceImage, type SequenceRow } from '@/lib/photoSequence';

type Load = 'preload' | 'eager' | 'lazy';

/**
 * A set of photographs as an editorial sequence (see photoSequence.ts): wide,
 * offset and paired rows chosen from each image's shape, never cropped.
 * Used by commissions and photography series.
 *
 * Inside an ArticleMediaProvider, every photograph opens the lightbox
 * (enlarge, swipe / arrow keys through the set); elsewhere it is a plain
 * image. `firstRow` sets how the opening row loads: "preload" when it is the
 * first thing on screen, "eager" when a cover hero comes before it.
 */
export function PhotoSequence({
  images,
  label = 'Photographs',
  firstRow = 'preload',
}: {
  images: SequenceImage[];
  label?: string;
  firstRow?: 'preload' | 'eager';
}) {
  const usable = images.filter((img) => img.asset?._ref);
  if (usable.length === 0) return null;
  const rows = planSequence(usable);

  return (
    <section className="photo-sequence" aria-label={label}>
      {rows.map((row, i) => (
        <Row
          key={row.images.map((img) => img._key).join('-')}
          row={row}
          // The first rows are in (or right below) the first screen.
          load={i === 0 ? firstRow : i === 1 ? 'eager' : 'lazy'}
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

function Row({ row, load }: { row: SequenceRow; load: Load }) {
  const side = row.kind === 'offset' || row.kind === 'single' ? ` photo-row--${row.side}` : '';
  return (
    <div className={`photo-row photo-row--${row.kind}${side}`}>
      {row.images.map((img) => (
        <Plate key={img._key} image={img} sizes={SIZES[row.kind]} load={load} />
      ))}
    </div>
  );
}

function Plate({ image, sizes, load }: { image: SequenceImage; sizes: string; load: Load }) {
  const ratio = ratioOf(image);
  const alt = image.alt ?? '';
  return (
    // --ratio drives each plate's share of a pair row (equal heights, no crop)
    // and its aspect-ratio box, so nothing shifts while the image loads.
    <figure className="photo-plate" style={{ '--ratio': ratio } as React.CSSProperties}>
      <LightboxTrigger imageKey={image._key} label={alt ? `Enlarge photograph: ${alt}` : undefined}>
        <div className="photo-plate__frame">
          <ResolveImage
            src={photoUrl(image, image.alt).width(2000).url()}
            alt={alt}
            fill
            sizes={sizes}
            {...(load === 'preload' ? { preload: true } : { loading: load })}
            className="photo-plate__img"
          />
        </div>
      </LightboxTrigger>
      {image.caption && <figcaption className="photo-plate__caption">{image.caption}</figcaption>}
    </figure>
  );
}
