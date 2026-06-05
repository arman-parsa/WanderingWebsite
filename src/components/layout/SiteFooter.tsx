import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Articles', href: '/articles' },
  { label: 'Map',      href: '/map' },
  { label: 'About',    href: '/about' },
  { label: 'Contact',  href: '/contact' },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border py-12">
      <div className="mx-auto flex max-w-[var(--content-full-width)] flex-col items-center gap-6 px-[var(--content-padding-x)] sm:flex-row sm:justify-between">
        <p className="font-sans text-xs uppercase tracking-widest text-ink-faint">
          © {year} Wandering Website
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6" role="list">
            {FOOTER_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-sans text-xs uppercase tracking-widest text-ink-muted transition-colors duration-[var(--duration-fast)] hover:text-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
