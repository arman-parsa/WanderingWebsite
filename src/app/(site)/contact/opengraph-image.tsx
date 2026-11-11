import { OG_SIZE, OG_CONTENT_TYPE, SITE_OG_ALT, siteOgImage } from '@/lib/ogCard';

export const alt = SITE_OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Picks up a new Default share image from Site Settings.
export const revalidate = 3600;

export default function Image() {
  return siteOgImage();
}
