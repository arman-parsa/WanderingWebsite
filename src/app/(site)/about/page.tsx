import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Arman — a personal editorial archive of travel writing, photography, and mixed media.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[var(--content-max-width)] items-center px-[var(--content-padding-x)] py-24">
      <div className="article-body">
        <p>
          Stories long to be caught on pen and paper, or through the lens of a camera.
        </p>
        <p>
          This project hopes to slow the breath, and offer a glimpse through the fog of
          modernity to real, grounded, intimate stories collected across the world.
        </p>
        <p>
          Amir Arman Ghanbari Parsa is a London-born, 23 years-old, Oxford-educated
          Iranian journalist and photographer/videographer.
        </p>
      </div>
    </main>
  );
}
