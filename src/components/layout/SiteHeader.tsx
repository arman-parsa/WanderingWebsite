import { NavInner } from '@/components/layout/NavInner';

export function SiteHeader() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="fixed inset-x-0 top-0 z-50 h-16" style={{ overflow: 'visible' }}>
        <NavInner />
      </header>
    </>
  );
}
