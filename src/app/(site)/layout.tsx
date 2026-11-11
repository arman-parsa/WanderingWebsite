import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { IntroLoader } from '@/components/layout/IntroLoader';
import { getSiteSettings, FALLBACK_SOCIAL_LINKS, type SocialLink } from '@/lib/siteSettings';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // The footer's social links come from Site Settings. A failed fetch must
  // never take every page down with it, so it falls back instead.
  let socialLinks: SocialLink[] = FALLBACK_SOCIAL_LINKS;
  try {
    socialLinks = (await getSiteSettings()).socialLinks;
  } catch {
    // keep the fallback links
  }

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
      <IntroLoader />
      <SiteHeader />
      {children}
      <SiteFooter socialLinks={socialLinks} />
    </div>
  );
}
