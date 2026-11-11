import { OG_SIZE, OG_CONTENT_TYPE } from '@/lib/ogCard';
import { commissionsIndexOgImage } from '@/lib/commissionOg';

export const alt = 'Commissions by Arman Parsa — photography, film and writing for hotels, travel and outdoor brands';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Picks up a new lead commission's cover.
export const revalidate = 3600;

export default function Image() {
  return commissionsIndexOgImage();
}
