import { OG_SIZE, OG_CONTENT_TYPE, SITE_OG_ALT, siteOgImage } from '@/lib/ogCard';

export const alt = SITE_OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return siteOgImage();
}
