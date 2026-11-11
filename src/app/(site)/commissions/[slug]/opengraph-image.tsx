import { OG_SIZE, OG_CONTENT_TYPE } from '@/lib/ogCard';
import { commissionOgImage, commissionOgAlt } from '@/lib/commissionOg';

export const revalidate = 3600;

type Params = { slug: string };

// One card per commission, described by its own title (og:image:alt).
export async function generateImageMetadata({ params }: { params: Params | Promise<Params> }) {
  const { slug } = await params;
  return [{ id: 'card', alt: await commissionOgAlt(slug), size: OG_SIZE, contentType: OG_CONTENT_TYPE }];
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return commissionOgImage(slug);
}
