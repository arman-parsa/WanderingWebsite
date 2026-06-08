import { NavInner } from '@/components/layout/NavInner';

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16">
      <NavInner />
    </header>
  );
}
