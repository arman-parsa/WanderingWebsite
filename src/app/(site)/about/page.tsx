import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_URL } from '@/lib/metadata';

export const metadata: Metadata = {
  title: 'About',
  description: 'Arman Parsa is a London-born, Oxford-educated Iranian journalist, photographer and videographer — collecting intimate stories from around the world.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About · Arman Parsa',
    description: 'Arman Parsa is a London-born, Oxford-educated Iranian journalist, photographer and videographer — collecting intimate stories from around the world.',
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col justify-center py-24"
    >
      <h1 className="sr-only">About Arman Parsa</h1>
      <div className="about-layout">
        <div className="about-portrait">
          <Image
            src="/images/about-portrait.jpg"
            alt="Arman Parsa hiking in the Dolomites, carrying a camera pack and tripod"
            fill
            priority
            sizes="(max-width: 767px) 78vw, 26vw"
            className="object-cover"
            style={{ objectPosition: '45% center' }}
          />
        </div>
        <div className="about-text">
          <p className="font-serif font-bold text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
            Amir Arman Ghanbari Parsa is a London-born, 23 year-old, Oxford-educated
            Iranian journalist and photographer/videographer.
          </p>
          <p className="mt-6 font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
            Arman&apos;s work opens an unhurried, grounded and intimate window onto the places he travels — and tries to do justice to what those places have made of him. Across writing, photography and film, he is drawn to culture, spirit and our place in the natural world. His work aims to kindle wonder about the earth and its people, and to inspire the drive to go and see the world for oneself.
          </p>
          <p className="mt-6 font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
            For projects and collaborations, please reach out via the{' '}
            <Link href="/contact" className="underline underline-offset-4 opacity-80 transition-opacity duration-[var(--duration-fast)] hover:opacity-100">
              contact
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </main>
  );
}
