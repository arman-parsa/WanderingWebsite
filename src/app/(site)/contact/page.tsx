import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Arman.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[var(--content-max-width)] items-center px-[var(--content-padding-x)] py-24">
      <div className="article-body">
        <p>
          For partnerships, editorial enquiries, or just to say hello — reach out by email.
        </p>
      </div>

      <div className="mt-12">
        <a
          href="mailto:armanparsa03@gmail.com"
          className="font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-accent hover:underline"
        >
          armanparsa03@gmail.com
        </a>
      </div>
    </main>
  );
}
