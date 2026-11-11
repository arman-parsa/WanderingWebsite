/** Pure string constants — no external imports, safe to use anywhere including manifest/robots. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://armanparsa.earth';
/** Short name: og:site_name, the page-title suffix, the web-app name. */
export const SITE_NAME = 'Arman Parsa';
/** Homepage / browser-tab title (Site Settings → Search & sharing can override). */
export const SITE_TITLE = 'Arman Parsa — Travel & Documentary Photographer, Filmmaker and Writer';
/** The site-wide description (Site Settings can override). */
export const SITE_DESCRIPTION =
  'Travel, documentary and lifestyle photography, film and writing by Arman Parsa. UK based, working worldwide — commissions for hotels, travel experiences, outdoor brands, conservation and editorial.';
/** One line for the default share card. */
export const SITE_CARD_LINE = 'Photography · Film · Writing';
/** What Arman makes, for structured data (Person.knowsAbout). */
export const SITE_SUBJECTS = [
  'Travel photography',
  'Documentary photography',
  'Lifestyle photography',
  'Hospitality photography',
  'Filmmaking',
  'Travel writing',
];
/** Social links — shown until Site Settings has its own (and used for JSON-LD). */
export const SOCIAL_LINKS: { platform: string; url: string }[] = [
  { platform: 'Instagram', url: 'https://www.instagram.com/armanparsa_/' },
  { platform: 'TikTok', url: 'https://www.tiktok.com/@armanparsa_' },
  { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/armanparsa-/' },
  { platform: 'Substack', url: 'https://armanparsa.substack.com' },
];
export const SOCIAL_PROFILES = SOCIAL_LINKS.map(({ url }) => url);
/**
 * Picfair print store (custom domain). /store redirects here (see
 * next.config.ts), so this is the one place to change if the store moves.
 */
export const STORE_URL = 'https://store.armanparsa.earth';
