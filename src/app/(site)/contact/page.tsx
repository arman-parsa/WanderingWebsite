import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Arman.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[var(--content-max-width)] flex-col items-center justify-center px-[var(--content-padding-x)] py-24 text-center">
      <p className="font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
        For partnerships, editorial enquiries, or just to say hello — reach out by email.
      </p>

      <a
        href="mailto:armanparsa03@gmail.com"
        className="mt-8 font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 opacity-60 transition-opacity duration-[var(--duration-fast)] hover:opacity-100"
      >
        armanparsa03@gmail.com
      </a>
    </main>
  );
}
