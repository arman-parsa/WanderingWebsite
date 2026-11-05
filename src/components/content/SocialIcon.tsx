/**
 * Line icons for the social links on the Contact page, matched to the
 * platform name from Site Settings (case-insensitive). Returns null for a
 * platform without an icon, so the caller can show its name instead.
 */
const WITH_ICON = new Set(['instagram', 'tiktok', 'linkedin', 'substack']);
export const hasSocialIcon = (platform: string) => WITH_ICON.has(platform.trim().toLowerCase());

export function SocialIcon({ platform }: { platform: string }) {
  switch (platform.trim().toLowerCase()) {
    case 'instagram':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width="18" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="block">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.09 8.09 0 0 0 4.73 1.52V6.77a4.85 4.85 0 0 1-.96-.08z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'substack':
      // The Substack mark, drawn in outline to match the line icons.
      return (
        <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true" className="block">
          <path d="M3 3h18M3 7.5h18" strokeLinecap="round" />
          <path d="M3 11.5h18V22l-9-5-9 5z" />
        </svg>
      );
    default:
      return null;
  }
}
