import { OG_SIZE, OG_CONTENT_TYPE } from '@/lib/ogCard';
import { articleOgImage } from '@/lib/articleOg';

export const alt = 'Arman Parsa';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleOgImage('videography', slug);
}
