import { revalidatePath } from 'next/cache';
import { type NextRequest } from 'next/server';
import { TYPE_HREF as TYPE_PATH } from '@/lib/contentTypes';

/*
 * Sanity webhook → POST /api/revalidate
 *
 * Configure in Sanity: API → Webhooks → Create webhook
 *   URL: https://armanparsa.earth/api/revalidate
 *   Dataset: production
 *   Trigger on: Create, Update, Delete
 *   Projections: { _type, slug }
 *   HTTP method: POST
 *   HTTP Headers: Authorization: Bearer <SANITY_WEBHOOK_SECRET>
 */

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '');

  // Reject everything when the secret is unconfigured — otherwise a request
  // with no Authorization header would compare undefined === undefined and pass.
  if (!process.env.SANITY_WEBHOOK_SECRET || secret !== process.env.SANITY_WEBHOOK_SECRET) {
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

  // One publish can touch many pages — the piece itself, every list it
  // appears in (home, library, earth, gallery), its social card, the
  // sitemap, and the old path if a slug was renamed or a piece deleted.
  // At this size, refreshing everything is cheap and never misses one.
  revalidatePath('/', 'layout');

  return Response.json({
    revalidated: true,
    path: basePath && slug?.current ? `${basePath}/${slug.current}` : null,
    timestamp: new Date().toISOString(),
  });
}
