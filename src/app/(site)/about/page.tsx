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
        <p className="font-serif font-bold text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
          Amir Arman Ghanbari Parsa is a London-born, 23 year-old, Oxford-educated
          Iranian journalist and photographer/videographer.
        </p>
        <p className="mt-6 font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
          Arman&apos;s work opens an unhurried, grounded and intimate window onto the places he travels — and tries to do justice to what those places have made of him. Across writing, photography and film, he is drawn to culture, spirit and our place in the natural world. His work aims to kindle wonder about the earth and its people, and to inspire the drive to go and see the world for oneself.
        </p>
      </div>
    </main>
  );
}
