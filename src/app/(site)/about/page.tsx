import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Wandering Website — a personal editorial archive of travel writing, photography, and mixed media.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[var(--content-max-width)] px-[var(--content-padding-x)] py-24">

      <header className="mb-16">
        <p className="mb-4 font-sans text-xs uppercase tracking-widest text-ink-muted">About</p>
        <h1 className="font-serif text-[var(--text-4xl)] font-light tracking-tight text-ink">
          Wandering Website
        </h1>
      </header>

      <div className="article-body">
        <p>
          This is a personal archive — a place to collect writing, photography, and
          editorial work made in transit. It sits somewhere between a literary
          travel journal, an editorial magazine, and a creative portfolio.
        </p>
        <p>
          The work spans essays written in hotel rooms, photography from early
          mornings before the light changes, and mixed-media pieces that resist
          being one thing or another.
        </p>
        <p>
          Everything here is made slowly, with attention to form as much as content.
        </p>
      </div>

      <div className="mt-16 h-px w-16 bg-ink-faint" aria-hidden="true" />

    </main>
  );
}
