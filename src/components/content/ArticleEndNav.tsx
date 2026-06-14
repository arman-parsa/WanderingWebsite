import Link from 'next/link';

const LINK_CLASS =
  'font-serif text-[var(--text-3xl)] font-light tracking-tight underline-offset-[6px] transition-opacity duration-[var(--duration-fast)] hover:opacity-60 hover:underline focus-visible:underline';

/**
 * Closes every piece with a quiet invitation to keep exploring. Labels match
 * the destinations' own names (Library → /articles, Earth → /map).
 */
export function ArticleEndNav() {
  return (
    <nav aria-label="Continue exploring" className="border-t border-[#f8f4ef]/12">
      <div className="mx-auto max-w-[var(--content-wide-width)] px-[var(--content-padding-x)] py-[clamp(4rem,9vh,7rem)] text-center">
        <p className="font-sans text-[var(--text-xs)] uppercase tracking-widest opacity-50">
          Explore more
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <Link href="/articles" className={LINK_CLASS}>Library</Link>
          <Link href="/map" className={LINK_CLASS}>Earth</Link>
        </div>
      </div>
    </nav>
  );
}
