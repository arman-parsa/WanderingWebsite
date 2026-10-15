'use client';

import { usePathname } from 'next/navigation';

const ARTICLE_PREFIXES = ['/writing/', '/photography/', '/mixed-media/', '/videography/'];

export function SiteFooter() {
  // Client-side so the year is the visitor's current year, not the build's.
  const year = new Date().getFullYear();
  const pathname = usePathname();
  // Dark under the dark article pages, so the page doesn't end in a cream band.
  const dark = ARTICLE_PREFIXES.some((p) => pathname.startsWith(p));
  const muted = dark ? '#a09890' : '#736960';

  return (
    <footer
      className={`mt-auto border-t ${dark ? 'border-[#f8f4ef]/12' : 'border-border'}`}
      style={{
        padding: '30px clamp(1.5rem, 4vw, 3rem)',
        backgroundColor: dark ? '#0D0D0D' : undefined,
      }}
    >
      <div className="flex items-center justify-between">

        <div aria-hidden="true">
          <svg
            width="22" height="22" viewBox="0 0 28 28" fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="14,4 26,25 2,25"
              stroke={muted} strokeWidth="1.2"
              strokeLinejoin="round" strokeLinecap="round"
              fill="none"
            />
            <line
              x1="2" y1="11" x2="26" y2="11"
              stroke={muted} strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="font-sans text-xs uppercase tracking-widest" style={{ color: muted }}>
          © {year} armanparsa.earth
        </p>

      </div>
    </footer>
  );
}
