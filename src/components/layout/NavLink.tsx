'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink({
  href,
  children,
  prefetch,
}: {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-current={isActive ? 'page' : undefined}
      className={isActive ? 'nav-link nav-link--active' : 'nav-link'}
    >
      {children}
    </Link>
  );
}
