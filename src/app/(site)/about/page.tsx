import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Arman — a personal editorial archive of travel writing, photography, and mixed media.',
};

export default function AboutPage() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center px-[var(--content-padding-x)] py-24 text-center"
    >
      <div className="w-full max-w-[var(--content-max-width)]">
        <p className="font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)] text-pretty">
          Stories long to be caught on pen and paper, or through the lens of a camera.
        </p>
        <p className="mt-6 font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)] text-pretty">
          This project hopes to slow the breath, and offer a glimpse through the fog of
          modernity to real, grounded, intimate stories collected across the world.
        </p>
        <p className="mt-6 font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)] text-pretty">
          Amir Arman Ghanbari Parsa is a London-born, 23 year-old, Oxford-educated
          Iranian journalist and photographer/videographer.
        </p>
      </div>
    </main>
  );
}
