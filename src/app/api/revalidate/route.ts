import { revalidatePath } from 'next/cache';
import { type NextRequest } from 'next/server';

/*
 * Sanity webhook → POST /api/revalidate
 *
 * Configure in Sanity: API → Webhooks → Create webhook
 *   URL: https://yourdomain.com/api/revalidate
 *   Dataset: production
 *   Trigger on: Create, Update, Delete
 *   Projections: { _type, slug }
 *   HTTP method: POST
 *   HTTP Headers: Authorization: Bearer <SANITY_WEBHOOK_SECRET>
 */

const TYPE_PATH: Record<string, string> = {
  essay:       '/writing',
  editorial:   '/mixed-media',
  photoSeries: '/photography',
};

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '');

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { _type, slug } = body;
  const basePath = _type ? TYPE_PATH[_type] : null;

  if (basePath && slug?.current) {
    revalidatePath(`${basePath}/${slug.current}`);
  }

  // Always revalidate index pages
  revalidatePath('/articles');
  revalidatePath('/');

  return Response.json({
    revalidated: true,
    path: basePath && slug?.current ? `${basePath}/${slug.current}` : null,
    timestamp: new Date().toISOString(),
  });
}
