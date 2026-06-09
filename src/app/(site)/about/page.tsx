import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Arman — a personal editorial archive of travel writing, photography, and mixed media.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="mx-auto flex flex-1 w-full max-w-[var(--content-max-width)] flex-col items-center justify-center px-[var(--content-padding-x)] pt-16 pb-8 text-center">
      <p className="w-full font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
        Stories long to be caught on pen and paper, or through the lens of a camera.
      </p>
      <p className="mt-6 w-full font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
        This project hopes to slow the breath, and offer a glimpse through the fog of
        modernity to real, grounded, intimate stories collected across the world.
      </p>
      <p className="mt-6 w-full font-normal font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
        Amir Arman Ghanbari Parsa is a London-born, 23 year-old, Oxford-educated
        Iranian journalist and photographer/videographer.
      </p>
    </main>
  );
}
