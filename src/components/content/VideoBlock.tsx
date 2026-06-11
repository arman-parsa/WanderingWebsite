'use client';

import { useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { MediaWidth } from '@/lib/articleMedia';

type Props = { videoId?: string; title: string; caption?: string; width?: MediaWidth };

const FIGURE_CLASS: Record<MediaWidth, string> = {
  column: 'my-12 -mx-[var(--content-padding-x)]',
  wide: 'my-12 media-wide',
  full: 'my-14 media-full',
};

// Accepts a bare numeric ID ("123456789") or any pasted Vimeo URL,
// including unlisted links with a privacy hash.
function parseVimeo(input?: string): { id: string; hash?: string } | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  const fromUrl = raw.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  const id = fromUrl?.[1] ?? (/^\d+$/.test(raw) ? raw : null);
  if (!id) return null;
  const hash = fromUrl?.[2] ?? raw.match(/[?&]h=([a-zA-Z0-9]+)/)?.[1];
  return { id, hash };
}

export function VideoBlock({ videoId, title, caption, width = 'column' }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  const video = parseVimeo(videoId);
  if (!video) return null;

  const hashParam = video.hash ? `&h=${video.hash}` : '';
  // Ambient mode: chromeless, autoplaying, looping, silent — a moving photograph.
  // Reduced-motion users get the standard player instead: no autoplay, visible controls.
  const src = reducedMotion
    ? `https://player.vimeo.com/video/${video.id}?dnt=1&color=ffffff${hashParam}`
    : `https://player.vimeo.com/video/${video.id}?background=1&autoplay=1&loop=1&muted=1&autopause=0&playsinline=1&controls=0&title=0&byline=0&portrait=0&dnt=1${hashParam}`;

  const post = (method: string, value?: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ method, value }),
      'https://player.vimeo.com',
    );
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    post('setMuted', next);
    post('setVolume', next ? 0 : 1);
    if (!next) post('play'); // resume in case the browser paused the loop
  };

  return (
    <figure className={FIGURE_CLASS[width]}>
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
        {!reducedMotion && (
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full text-[#f8f4ef] opacity-70 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            style={{ backgroundColor: 'rgba(28, 24, 20, 0.55)', backdropFilter: 'blur(4px)' }}
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                <line x1="22" y1="9" x2="16" y2="15" />
                <line x1="16" y1="9" x2="22" y2="15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 px-[var(--content-padding-x)] text-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
