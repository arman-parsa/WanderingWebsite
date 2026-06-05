import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="font-sans text-sm uppercase tracking-widest text-ink-muted">404</p>
      <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-ink">Page not found</h1>
      <Link
        href="/"
        className="mt-8 font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 hover:underline"
      >
        Return home
      </Link>
    </main>
  );
}
