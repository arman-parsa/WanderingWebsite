'use client';

import { useSitePathname } from '@/lib/useSitePathname';
import { SOCIAL_LINKS } from '@/lib/siteConfig';
import { SocialIcon, hasSocialIcon } from '@/components/content/SocialIcon';

// Dark detail pages (the four piece types and individual commissions).
const ARTICLE_PREFIXES = ['/writing/', '/photography/', '/mixed-media/', '/videography/', '/commissions/'];

/**
 * The colophon: the mark, the social links (as on the Contact page), and the
 * copyright. Social links come from Site Settings via the layout; pages
 * rendered outside it (the root 404) get the built-in ones.
 */
export function SiteFooter({ socialLinks = SOCIAL_LINKS }: { socialLinks?: { platform: string; url: string }[] }) {
  // Client-side so the year is the visitor's current year, not the build's.
  const year = new Date().getFullYear();
  const pathname = useSitePathname();
  // Dark under the dark article pages, so the page doesn't end in a cream band.
  const dark = ARTICLE_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <footer className={`site-footer${dark ? ' site-footer--dark' : ''}`}>
      <div className="site-footer__mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="14,4 26,25 2,25"
            stroke="currentColor" strokeWidth="1.2"
            strokeLinejoin="round" strokeLinecap="round"
            fill="none"
          />
          <line x1="2" y1="11" x2="26" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {socialLinks.length > 0 && (
        <ul className="site-footer__social" aria-label="Arman Parsa elsewhere">
          {socialLinks.map(({ platform, url }) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Arman Parsa on ${platform}`}
                className="site-footer__social-link"
              >
                {hasSocialIcon(platform) ? <SocialIcon platform={platform} /> : platform}
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="site-footer__copy">© {year} armanparsa.earth</p>
    </footer>
  );
}
