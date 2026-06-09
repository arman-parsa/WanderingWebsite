import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Arman.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className="mx-auto flex flex-1 w-full max-w-[var(--content-max-width)] flex-col items-center justify-center px-[var(--content-padding-x)] pt-16 pb-8 text-center">
      <p className="font-serif text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
        For partnerships, editorial enquiries, or just to say hello — reach out by email.
      </p>

      <a
        href="mailto:armanparsa03@gmail.com"
        className="mt-8 font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 opacity-60 transition-opacity duration-[var(--duration-fast)] hover:opacity-100"
      >
        armanparsa03@gmail.com
      </a>

      <div className="mt-10 flex items-center gap-7">
        <a
          href="https://www.instagram.com/armanparsa_/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-ink opacity-40 transition-opacity duration-[var(--duration-fast)] hover:opacity-80"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
          </svg>
        </a>

        <a
          href="https://www.tiktok.com/@armanparsa_"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="text-ink opacity-40 transition-opacity duration-[var(--duration-fast)] hover:opacity-80"
        >
          <svg width="18" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.09 8.09 0 0 0 4.73 1.52V6.77a4.85 4.85 0 0 1-.96-.08z" />
          </svg>
        </a>

        <a
          href="https://www.linkedin.com/in/armanparsa-/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-ink opacity-40 transition-opacity duration-[var(--duration-fast)] hover:opacity-80"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
      </div>
    </main>
  );
}
