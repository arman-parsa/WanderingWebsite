/** One photograph in a sequence: a Sanity image plus its alt, caption and ratio. */
export type SequenceImage = {
  _key: string;
  asset?: { _ref?: string };
  hotspot?: { x: number; y: number };
  alt?: string | null;
  caption?: string | null;
  /** width / height, from the asset's metadata */
  aspectRatio?: number | null;
  lqip?: string;
};

/**
 * Plans a set of photographs (a commission, a photography series) as an editorial sequence: varied in size and
 * placement like the Gallery, but in reading order and never overlapping,
 * so a client can take in the whole set in a minute.
 *
 * Rows:
 *   wide   — a landscape across the wide measure
 *   offset — a landscape at a narrower width, set to one side
 *   pair   — two images side by side at equal height, each at its natural
 *            ratio (portraits pair up; a lone portrait pairs with a landscape)
 *   single — a lone portrait, set to one side
 *
 * Landscapes cycle wide → offset → pair (with the next landscape) so the
 * rhythm varies; offsets and singles alternate sides. Images whose ratio is
 * unknown are treated as landscapes (3:2).
 */

export type SequenceRow =
  | { kind: 'wide'; images: [SequenceImage] }
  | { kind: 'offset'; side: 'left' | 'right'; images: [SequenceImage] }
  | { kind: 'single'; side: 'left' | 'right'; images: [SequenceImage] }
  | { kind: 'pair'; images: [SequenceImage, SequenceImage] };

const DEFAULT_RATIO = 3 / 2;
export const ratioOf = (img: SequenceImage) =>
  img.aspectRatio && img.aspectRatio > 0 ? img.aspectRatio : DEFAULT_RATIO;
const isPortrait = (img: SequenceImage) => ratioOf(img) < 0.95;

export function planSequence(images: SequenceImage[]): SequenceRow[] {
  const rows: SequenceRow[] = [];
  let landscapeTurn = 0;
  let side: 'left' | 'right' = 'right';
  const nextSide = () => (side = side === 'left' ? 'right' : 'left');

  for (let i = 0; i < images.length; ) {
    const cur = images[i];
    const nxt = images[i + 1];

    if (isPortrait(cur)) {
      if (nxt) {
        rows.push({ kind: 'pair', images: [cur, nxt] });
        i += 2;
      } else {
        rows.push({ kind: 'single', side: nextSide(), images: [cur] });
        i += 1;
      }
      continue;
    }

    // Landscape. The opening image always gets the full wide measure.
    const turn = rows.length === 0 ? 0 : landscapeTurn % 3;
    landscapeTurn++;
    if (turn === 2 && nxt && !isPortrait(nxt)) {
      rows.push({ kind: 'pair', images: [cur, nxt] });
      i += 2;
    } else if (turn === 1) {
      rows.push({ kind: 'offset', side: nextSide(), images: [cur] });
      i += 1;
    } else {
      rows.push({ kind: 'wide', images: [cur] });
      i += 1;
    }
  }
  return rows;
}
