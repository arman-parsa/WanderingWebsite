import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[var(--content-max-width)] px-[var(--content-padding-x)] py-24">

      <header className="mb-16">
        <p className="mb-4 font-sans text-xs uppercase tracking-widest text-ink-muted">Contact</p>
        <h1 className="font-serif text-[var(--text-4xl)] font-light tracking-tight text-ink">
          Get in touch
        </h1>
      </header>

      <div className="article-body">
        <p>
          For commissions, editorial enquiries, or just to say hello —
          reach out by email.
        </p>
      </div>

      <div className="mt-12">
        <a
          href="mailto:hello@yourdomain.com"
          className="font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-accent hover:underline"
        >
          hello@yourdomain.com
        </a>
      </div>

      <div className="mt-16 h-px w-16 bg-ink-faint" aria-hidden="true" />

    </main>
  );
}
