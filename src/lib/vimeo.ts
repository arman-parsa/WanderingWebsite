import { parseVimeo } from '@/lib/articleMedia';

/**
 * Poster (still frame) for a Vimeo video, from Vimeo's free public oEmbed
 * endpoint — no account or API key. Works for public and unlisted videos
 * (the unlisted hash is part of the URL). Cached for a day; any failure
 * (network, private video, timeout) just means no poster.
 */
export async function vimeoPoster(input?: string): Promise<string | undefined> {
  const video = parseVimeo(input);
  if (!video) return undefined;
  const pageUrl = `https://vimeo.com/${video.id}${video.hash ? `/${video.hash}` : ''}`;
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(pageUrl)}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return undefined;
    const data = (await res.json()) as { thumbnail_url?: string };
    if (!data.thumbnail_url) return undefined;
    // oEmbed returns a small thumbnail (e.g. …-d_295x166); the same CDN
    // serves any width, so ask for one wide enough for a full-width film.
    return data.thumbnail_url.replace(/-d_\d+(x\d+)?/, '-d_1920');
  } catch {
    return undefined;
  }
}

type WithVideo = { _type?: string; vimeoId?: string; poster?: string };

/** Adds a `poster` to every Vimeo video in a list of blocks (portable text or a videos[] array). */
export async function withVideoPosters<T>(blocks: T[] | undefined | null): Promise<T[] | undefined> {
  if (!Array.isArray(blocks)) return blocks ?? undefined;
  return Promise.all(
    blocks.map(async (block) => {
      const b = block as WithVideo;
      const isVideo = b && typeof b === 'object' && (b._type === 'videoBlock' || (!b._type && b.vimeoId));
      if (!isVideo || !b.vimeoId) return block;
      const poster = await vimeoPoster(b.vimeoId);
      return poster ? ({ ...b, poster } as T) : block;
    }),
  );
}
