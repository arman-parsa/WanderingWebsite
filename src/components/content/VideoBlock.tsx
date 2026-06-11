'use client';

type Props = { videoId?: string; title: string; caption?: string };

// Accepts a bare numeric ID ("123456789") or any pasted Vimeo URL,
// including unlisted links with a privacy hash.
function vimeoEmbedSrc(input?: string): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  const fromUrl = raw.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  const id = fromUrl?.[1] ?? (/^\d+$/.test(raw) ? raw : null);
  if (!id) return null;
  const hash = fromUrl?.[2] ?? raw.match(/[?&]h=([a-zA-Z0-9]+)/)?.[1];
  return `https://player.vimeo.com/video/${id}?dnt=1&color=ffffff${hash ? `&h=${hash}` : ''}`;
}

export function VideoBlock({ videoId, title, caption }: Props) {
  const src = vimeoEmbedSrc(videoId);
  if (!src) return null;

  return (
    <figure className="my-12 -mx-[var(--content-padding-x)]">
      <div className="relative aspect-video w-full">
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 px-[var(--content-padding-x)] text-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
