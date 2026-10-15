import Link from 'next/link';
import type { AdjacentPiece } from '@/lib/adjacentPieces';

/**
 * Closes every piece: the neighbouring pieces in the archive (newer on the
 * left, older on the right), then a single minimal call to action styled
 * like the homepage's "All work" link (inverted for the dark background).
 * When the piece has a Picfair link, a "Buy a Print" link sits above it.
 */
export function ArticleEndNav({
  printsUrl,
  newer,
  older,
}: {
  printsUrl?: string;
  newer?: AdjacentPiece | null;
  older?: AdjacentPiece | null;
}) {
  return (
    <nav aria-label="Continue exploring" className="border-t border-[#f8f4ef]/12">
      {(newer || older) && (
        <div className="mx-auto grid max-w-[var(--content-wide-width)] grid-cols-1 gap-10 border-b border-[#f8f4ef]/12 px-[var(--content-padding-x)] py-[clamp(2.5rem,6vh,4rem)] sm:grid-cols-2">
          {newer ? <AdjacentLink piece={newer} label="Previous" /> : <span className="hidden sm:block" aria-hidden="true" />}
          {older && <AdjacentLink piece={older} label="Next" alignEnd />}
        </div>
      )}
      <div className="mx-auto flex max-w-[var(--content-wide-width)] flex-col items-center gap-8 px-[var(--content-padding-x)] py-[clamp(3.5rem,8vh,6rem)]">
        {printsUrl && (
          <a href={printsUrl} className="home-read-more home-read-more--invert">
            Buy a Print
          </a>
        )}
        <Link href="/library" className="home-read-more home-read-more--invert">
          Explore More
        </Link>
      </div>
    </nav>
  );
}

function AdjacentLink({ piece, label, alignEnd }: { piece: AdjacentPiece; label: string; alignEnd?: boolean }) {
  return (
    <Link
      href={piece.href}
      className={`group block ${alignEnd ? 'sm:text-right' : ''}`}
      style={{ color: '#f8f4ef', textDecoration: 'none' }}
    >
      <span className="block font-sans text-[length:var(--text-xs)] uppercase tracking-[0.18em]" style={{ color: '#a09890' }}>
        {alignEnd ? `${label} →` : `← ${label}`}
      </span>
      <span className="mt-3 block font-serif text-[length:var(--text-xl)] font-light leading-snug transition-opacity duration-[var(--duration-fast)] group-hover:opacity-75">
        {piece.title}
      </span>
      {piece.location && (
        <span className="mt-1 block font-sans text-[length:var(--text-xs)] uppercase tracking-wider" style={{ color: '#a09890' }}>
          {piece.location}
        </span>
      )}
    </Link>
  );
}
