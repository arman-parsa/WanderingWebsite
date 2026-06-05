'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Articles', href: '/articles' },
  { label: 'Map',      href: '/map' },
  { label: 'About',    href: '/about' },
  { label: 'Contact',  href: '/contact' },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-6 md:gap-8" role="list">
        {NAV_ITEMS.map(({ label, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative font-sans text-xs uppercase tracking-widest transition-colors duration-[var(--duration-fast)]',
                  'after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-[var(--duration-fast)]',
                  'hover:text-accent hover:after:scale-x-100',
                  isActive
                    ? 'text-accent after:scale-x-100'
                    : 'text-ink-muted'
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
