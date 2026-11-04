'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink({
  href,
  children,
  prefetch,
  matchPrefix = false,
}: {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  /** Also active on pages below this one (e.g. /commissions/<slug>). */
  matchPrefix?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (matchPrefix && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      prefetch={prefetch}
      // "page" only on the page itself; a sub-page marks its section.
      aria-current={pathname === href ? 'page' : isActive ? 'true' : undefined}
      className={isActive ? 'nav-link nav-link--active' : 'nav-link'}
    >
      {children}
    </Link>
  );
}
