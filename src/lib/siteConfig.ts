/** Pure string constants — no external imports, safe to use anywhere including manifest/robots. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://armanparsa.earth';
export const SITE_NAME = 'Arman Parsa - Portfolio';
export const SITE_DESCRIPTION =
  'A portfolio of writing, photography and videography on nature, culture and spirit — stories collected around the world.';
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
