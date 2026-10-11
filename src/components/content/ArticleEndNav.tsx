import Link from 'next/link';

/**
 * Closes every piece with a single minimal call to action, styled like the
 * homepage's "All work" link (inverted for the dark article background).
 * When the piece has a Picfair link, a "Buy a Print" link sits above it.
 */
export function ArticleEndNav({ printsUrl }: { printsUrl?: string }) {
  return (
    <nav aria-label="Continue exploring" className="border-t border-[#f8f4ef]/12">
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
