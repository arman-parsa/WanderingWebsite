/** Pure string constants — no external imports, safe to use anywhere including manifest/robots. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://armanparsa.earth';
export const SITE_NAME = 'Arman Parsa - Portfolio';
export const SITE_DESCRIPTION =
  'A portfolio of writing, photography and videography on nature, culture and spirit — stories collected around the world.';
export const SOCIAL_PROFILES = [
  'https://www.instagram.com/armanparsa_/',
  'https://www.tiktok.com/@armanparsa_',
  'https://www.linkedin.com/in/armanparsa-/',
];
/**
 * Picfair print store. /store redirects here (see next.config.ts), so this is
 * the one place to change if the store moves. Switch to
 * 'https://store.armanparsa.earth' once the custom domain is live in Picfair.
 */
export const STORE_URL = 'https://armanwanders.picfair.com';
/** Site-wide social share image (resolved against metadataBase). */
export const OG_IMAGE = { url: '/og.jpg', width: 1200, height: 630 };
