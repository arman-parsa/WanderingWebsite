'use client';

import Image from 'next/image';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { urlFor } from '@/lib/sanityImage';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { LightboxEntry } from '@/lib/articleMedia';
import { AmbientVimeo } from './AmbientVimeo';

type LightboxContextValue = {
  entries: LightboxEntry[];
  openAt: (target: string | number) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox() {
  return useContext(LightboxContext);
}

/**
 * Wraps a piece's content; collects nothing itself — the page passes the
 * ordered list of visuals. Any descendant (inline image or film, grid cell,
 * "view" button) can open the lightbox at a given entry.
 */
export function ArticleMediaProvider({
  entries,
  label,
  credit,
  children,
}: {
  entries: LightboxEntry[];
  label: string;
  credit?: string;
  children: ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const openAt = useCallback(
    (target: string | number) => {
      if (typeof target === 'number') {
        if (target >= 0 && target < entries.length) setOpenIndex(target);
        return;
      }
      const idx = entries.findIndex((e) => e.key === target);
      if (idx >= 0) setOpenIndex(idx);
    },
    [entries],
  );

  return (
    <LightboxContext.Provider value={{ entries, openAt }}>
      {children}
      {openIndex !== null && entries.length > 0 && (
        <Lightbox
          entries={entries}
          initialIndex={openIndex}
          label={label}
          credit={credit}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </LightboxContext.Provider>
  );
}

/**
 * Wrap any element to make it open the lightbox at a given entry — used by
 * the photography grid. Renders a plain wrapper if the entry isn't known.
 */
export function LightboxTrigger({
  imageKey,
  label,
  className,
  children,
}: {
  imageKey?: string;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useLightbox();
  const interactive = !!imageKey && !!ctx && ctx.entries.some((e) => e.key === imageKey);

  if (!interactive) return <div className={className}>{children}</div>;

  return (
    <button
      type="button"
      onClick={() => ctx.openAt(imageKey)}
      aria-label={label ?? 'Enlarge photograph'}
      className={`block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

/** Quiet label-style affordance: "14 photographs · 2 films — view". */
export function OpenGalleryButton() {
  const ctx = useLightbox();
  if (!ctx || ctx.entries.length === 0) return null;

  const photos = ctx.entries.filter((e) => e.kind === 'image').length;
  const films = ctx.entries.length - photos;
  const parts = [
    photos > 0 && `${photos} photograph${photos === 1 ? '' : 's'}`,
    films > 0 && `${films} film${films === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={() => ctx.openAt(0)}
      className="font-sans text-[var(--text-xs)] uppercase tracking-wide opacity-55 underline-offset-4 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 hover:underline focus-visible:opacity-100"
    >
      {parts} — view
    </button>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

function Lightbox({
  entries,
  initialIndex,
  label,
  credit,
  onClose,
}: {
  entries: LightboxEntry[];
  initialIndex: number;
  label: string;
  credit?: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(initialIndex);
  const reducedMotion = usePrefersReducedMotion();

  // Open the dialog and jump to the clicked entry before first paint.
  useLayoutEffect(() => {
    dialogRef.current?.showModal();
    const track = trackRef.current;
    if (track) track.scrollLeft = initialIndex * track.clientWidth;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [initialIndex]);

  const requestClose = () => dialogRef.current?.close();

  const goTo = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(entries.length - 1, idx));
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const idx = Math.max(
      0,
      Math.min(entries.length - 1, Math.round(track.scrollLeft / track.clientWidth)),
    );
    if (idx !== active) setActive(idx);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') goTo(active + 1);
    if (e.key === 'ArrowLeft') goTo(active - 1);
  };

  const current = entries[active];
  const captionText = [current?.caption, credit].filter(Boolean).join(' · ');

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={label}
      onClose={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="lightbox-track flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-contain"
      >
        {entries.map((entry, i) => (
          <div
            key={entry.key}
            className="relative flex h-full w-full flex-none snap-center items-center justify-center"
            style={{ padding: 'clamp(3.5rem, 9vh, 6rem) clamp(1rem, 5vw, 4rem) clamp(4.5rem, 11vh, 7rem)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) requestClose();
            }}
          >
            {entry.kind === 'image' && Math.abs(i - active) <= 1 && (
              <div className="relative h-full w-full">
                <Image
                  src={urlFor(entry.image).width(2048).format('webp').quality(85).url()}
                  alt={entry.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            )}
            {/* Films mount only while active, so exactly one plays at a time
                and playback stops the moment the reader flicks away. */}
            {entry.kind === 'video' && i === active && (
              <div
                className="relative w-full overflow-hidden bg-black"
                style={{ aspectRatio: '16 / 9', maxWidth: 'calc((100dvh - 13rem) * 16 / 9)' }}
              >
                <AmbientVimeo videoId={entry.videoId} title={entry.title} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Counter */}
      <p
        aria-live="polite"
        className="absolute left-5 top-5 font-sans text-[var(--text-xs)] uppercase tracking-widest opacity-60"
      >
        {pad(active + 1)} — {pad(entries.length)}
      </p>

      {/* Close */}
      <button
        type="button"
        onClick={requestClose}
        aria-label="Close"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center opacity-60 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      {/* Edge chevrons — desktop pointers only */}
      {active > 0 && (
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Previous"
          className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center opacity-50 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current pointer-fine:flex"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 4 7 12 15 20" />
          </svg>
        </button>
      )}
      {active < entries.length - 1 && (
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Next"
          className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center opacity-50 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current pointer-fine:flex"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 4 17 12 9 20" />
          </svg>
        </button>
      )}

      {/* Caption bar */}
      {captionText && (
        <p className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto max-w-2xl px-6 text-center font-sans text-[var(--text-xs)] uppercase tracking-wide opacity-60">
          {captionText}
        </p>
      )}
    </dialog>
  );
}
