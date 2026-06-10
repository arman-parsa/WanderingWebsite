/** Pure string constants — no external imports, safe to use anywhere including manifest/robots. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://armanparsa.earth';
export const SITE_NAME = 'Arman Parsa - Dispatches';
export const SITE_DESCRIPTION =
  'A personal archive of written and visual media capturing stories around the earth';
export const SOCIAL_PROFILES = [
  'https://www.instagram.com/armanparsa_/',
  'https://www.tiktok.com/@armanparsa_',
  'https://www.linkedin.com/in/armanparsa-/',
];
/** Site-wide social share image (resolved against metadataBase). */
export const OG_IMAGE = { url: '/og.jpg', width: 1200, height: 630 };
