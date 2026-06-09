import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { IntroLoader } from '@/components/layout/IntroLoader';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
      <IntroLoader />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
