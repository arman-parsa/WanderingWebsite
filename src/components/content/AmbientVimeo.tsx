'use client';

import { useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { parseVimeo } from '@/lib/articleMedia';

type Props = {
  videoId?: string;
  title: string;
  /** When set, clicking the film surface triggers this (e.g. open lightbox). */
  enlarge?: { label: string; onClick: () => void };
};

/**
 * Chromeless Vimeo embed: silent autoplaying loop with a corner sound
 * toggle, like a moving photograph. Fills its (positioned) parent.
 *
 * A transparent surface sits over the iframe so touch swipes and page
 * scrolls pass through to the parent instead of being captured by the
 * player. Reduced-motion users get the standard non-autoplaying player
 * (with native controls, so no surface and no toggle).
 */
export function AmbientVimeo({ videoId, title, enlarge }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  const video = parseVimeo(videoId);
  if (!video) return null;

  const hashParam = video.hash ? `&h=${video.hash}` : '';
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
    <>
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        className="absolute inset-0 h-full w-full"
        loading="lazy"
      />
      {!reducedMotion &&
        (enlarge ? (
          <button
            type="button"
            onClick={enlarge.onClick}
            aria-label={enlarge.label}
            className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current"
          />
        ) : (
          <div className="absolute inset-0" aria-hidden="true" />
        ))}
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
    </>
  );
}
