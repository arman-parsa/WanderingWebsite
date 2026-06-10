import type { Metadata } from 'next';
import { SITE_URL, OG_IMAGE } from '@/lib/metadata';

export const metadata: Metadata = {
  title: 'About',
  description: 'Arman Parsa is a London-born, Oxford-educated Iranian journalist, photographer and videographer — collecting intimate stories from around the world.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About · Arman Parsa',
    description: 'Arman Parsa is a London-born, Oxford-educated Iranian journalist, photographer and videographer — collecting intimate stories from around the world.',
    url: `${SITE_URL}/about`,
    images: [OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col justify-center py-24"
    >
      <div className="mx-auto w-full max-w-[var(--content-max-width)] px-[var(--content-padding-x)] text-center">
        <h1 className="sr-only">About Arman Parsa</h1>
        <p className="font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
          Stories long to be caught on pen and paper, or through the lens of a camera.
        </p>
        <p className="mt-6 font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
          This project hopes to slow the breath, and offer a glimpse through the fog of
          modernity to real, grounded, intimate stories collected across the world.
        </p>
        <p className="mt-6 font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
          Amir Arman Ghanbari Parsa is a London-born, 23 year-old, Oxford-educated
          Iranian journalist and photographer/videographer.
        </p>
      </div>
    </main>
  );
}
