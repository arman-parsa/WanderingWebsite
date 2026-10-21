'use client';

/* eslint-disable @next/next/no-img-element -- Vimeo's CDN already serves the
   poster at the right size; routing it through the image optimiser would only
   spend the Vercel image quota. */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { preconnect } from 'react-dom';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { parseVimeo } from '@/lib/articleMedia';

type Props = {
  videoId?: string;
  title: string;
  /** Still frame shown instantly, until the film is actually playing. */
  poster?: string;
  /** When set, clicking the film surface triggers this (e.g. open lightbox). */
  enlarge?: { label: string; onClick: () => void };
  /**
   * Load and play immediately, ahead of every in-page film (the lightbox).
   * Otherwise a film loads only as it nears the viewport.
   */
  eager?: boolean;
};

/* ── Which film plays ───────────────────────────────────────────────────────
   Every film on the page reports how much of it is on screen. Only the most
   visible one plays (an eager one — the lightbox — always wins); the rest sit
   paused, and nothing plays while the tab is hidden. Keeps one stream running
   instead of one per film. */
const visibility = new Map<string, number>();
const listeners = new Set<() => void>();
let leader: string | null = null;

function recomputeLeader() {
  let best: string | null = null;
  let bestRatio = 0.25; // must be at least a quarter on screen to play
  if (typeof document === 'undefined' || document.visibilityState === 'visible') {
    for (const [id, ratio] of visibility) {
      if (ratio > bestRatio) { best = id; bestRatio = ratio; }
    }
  }
  if (best !== leader) {
    leader = best;
    listeners.forEach((l) => l());
  }
}
function report(id: string, ratio: number) {
  if (ratio > 0) visibility.set(id, ratio); else visibility.delete(id);
  recomputeLeader();
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', recomputeLeader);
}
const subscribeLeader = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const getLeader = () => leader;
const getServerLeader = () => null;

let nextId = 0;

/**
 * Chromeless Vimeo film: a silent looping "moving photograph" with a corner
 * sound toggle, filling its (positioned) parent.
 *
 * Loads lazily: the poster shows at once; the Vimeo player (a heavy iframe) is
 * only created as the film nears the viewport, and fades in over the poster
 * once it is really playing. Films off screen are paused.
 *
 * A transparent surface over the iframe lets touch swipes and page scrolls
 * pass through. Reduced-motion users get the standard player (no autoplay,
 * native controls), still loaded lazily.
 */
export function AmbientVimeo({ videoId, title, poster, enlarge, eager = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [id] = useState(() => `vimeo-${nextId++}`);
  const [near, setNear] = useState(eager);       // close enough to load the player
  const [ready, setReady] = useState(false);     // player reported "ready"
  const [playing, setPlaying] = useState(false); // first frames have played
  const [muted, setMuted] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const currentLeader = useSyncExternalStore(subscribeLeader, getLeader, getServerLeader);
  const shouldPlay = !reducedMotion && (eager || currentLeader === id);

  // Open connections to Vimeo early so the player boots faster when needed.
  preconnect('https://player.vimeo.com');
  preconnect('https://i.vimeocdn.com');
  preconnect('https://f.vimeocdn.com');

  const video = parseVimeo(videoId);

  // Load the player once the film is within ~one screen of the viewport, and
  // keep reporting how visible it is (drives which film plays).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (eager) {
      report(id, 2); // always outranks in-page films
      return () => report(id, 0);
    }
    const nearObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNear(true); },
      { rootMargin: '100% 0px' },
    );
    const visObs = new IntersectionObserver(
      ([entry]) => report(id, entry.isIntersecting ? entry.intersectionRatio : 0),
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    nearObs.observe(el);
    visObs.observe(el);
    return () => { nearObs.disconnect(); visObs.disconnect(); report(id, 0); };
  }, [id, eager]);

  const post = (method: string, value?: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify(value === undefined ? { method } : { method, value }),
      'https://player.vimeo.com',
    );
  };

  // Player events: "ready", then progress once frames are actually playing.
  useEffect(() => {
    if (!near) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://player.vimeo.com') return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      let data: { event?: string } | null = null;
      try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
      if (data?.event === 'ready') {
        setReady(true);
        post('addEventListener', 'playProgress');
        post('addEventListener', 'timeupdate');
        post('addEventListener', 'play');
      } else if (data?.event === 'playProgress' || data?.event === 'timeupdate' || data?.event === 'play') {
        setPlaying(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [near]);

  // Play / pause as this film gains or loses the lead.
  useEffect(() => {
    if (!ready || reducedMotion) return;
    post(shouldPlay ? 'play' : 'pause');
  }, [ready, shouldPlay, reducedMotion]);

  // If progress events never arrive, don't leave the poster up forever — but
  // only for the film that should be playing (paused films keep their poster).
  // Reduced motion: the standard player shows its own thumbnail once ready.
  useEffect(() => {
    if (!ready || playing || (!shouldPlay && !reducedMotion)) return;
    const t = setTimeout(() => setPlaying(true), reducedMotion ? 0 : 2500);
    return () => clearTimeout(t);
  }, [ready, playing, shouldPlay, reducedMotion]);

  if (!video) return null;

  const hashParam = video.hash ? `&h=${video.hash}` : '';
  // The src never changes once the iframe exists (a new src would reload the
  // player): it boots paused and the leader effect above plays / pauses it
  // through the player API as soon as it reports ready.
  const src = reducedMotion
    ? `https://player.vimeo.com/video/${video.id}?dnt=1&color=ffffff${hashParam}`
    : `https://player.vimeo.com/video/${video.id}?background=1&autoplay=0&loop=1&muted=1&autopause=0&playsinline=1&controls=0&title=0&byline=0&portrait=0&dnt=1${hashParam}`;

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    post('setMuted', next);
    post('setVolume', next ? 0 : 1);
    if (!next) post('play'); // resume in case the browser paused the loop
  };

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {near && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          className="absolute inset-0 h-full w-full"
          style={{ opacity: playing ? 1 : 0, transition: 'opacity 500ms ease' }}
        />
      )}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: playing ? 0 : 1, transition: 'opacity 500ms ease' }}
        />
      )}
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
    </div>
  );
}
