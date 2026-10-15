import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="font-sans text-sm uppercase tracking-widest text-ink-muted">404</p>
      <h1 className="mt-4 font-serif text-[length:var(--text-4xl)] font-light tracking-tight text-ink">Page not found</h1>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8">
        <Link href="/" className="inline-block py-3 px-2 font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 hover:underline">
          Return home
        </Link>
        <Link href="/library" className="inline-block py-3 px-2 font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 hover:underline">
          Browse the library
        </Link>
      </div>
    </main>
  );
}
