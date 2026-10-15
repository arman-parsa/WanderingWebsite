'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export type GalleryItem = {
  key: string;
  title: string;
  location?: string;
  href: string;
  src: string;
  /** Larger version for the enlarged view; fades in over `src` once loaded. */
  fullSrc?: string;
  alt: string;
};

/* ───────────────────────────────────────────────────────────────────────────
   Floating collage
   ----------------
   Each image occupies a hand-placed slot (percent positions, clamped vw
   sizes, varied aspects and stacking order) so the composition reads as an
   editorial scatter rather than a grid. Three long drift keyframe variants
   with negative delays desynchronise the motion; overlapping slots make
   images slide across one another. The enlarge interaction measures the
   clicked thumbnail and morphs a fixed-position clone to centre stage
   (left/top/width/height transition), so the crop appears to open up into
   the full photograph.
   ─────────────────────────────────────────────────────────────────────────── */

type Slot = {
  l: number;        // left, % of stage
  t: number;        // top, % of stage
  w: number;        // width, vw (clamped in render)
  ar: string;       // aspect-ratio
  z: number;
  drift: 1 | 2 | 3;
  dur: number;      // drift duration, s
  delay: number;    // drift delay, s (negative desyncs the loop)
};

const SLOTS: Slot[] = [
  { l: 4,    t: 13, w: 16,   ar: '3 / 4', z: 3, drift: 1, dur: 13,   delay: -2 },
  { l: 27,   t: 8,  w: 11.5, ar: '4 / 5', z: 2, drift: 2, dur: 16,   delay: -7 },
  { l: 36.5, t: 15, w: 23,   ar: '3 / 2', z: 4, drift: 3, dur: 18,   delay: -4 },
  { l: 69.5, t: 9,  w: 13,   ar: '3 / 4', z: 3, drift: 2, dur: 14,   delay: -10 },
  { l: 87.5, t: 24, w: 9.5,  ar: '4 / 5', z: 2, drift: 1, dur: 15.5, delay: -1 },
  { l: 7.5,  t: 56, w: 12.5, ar: '4 / 5', z: 2, drift: 3, dur: 13.5, delay: -8 },
  { l: 22.5, t: 64, w: 16.5, ar: '3 / 2', z: 3, drift: 2, dur: 17,   delay: -3 },
  { l: 55,   t: 58, w: 11.5, ar: '3 / 4', z: 4, drift: 1, dur: 14.5, delay: -11 },
  { l: 64.5, t: 50, w: 18.5, ar: '4 / 3', z: 3, drift: 3, dur: 16.5, delay: -6 },
  { l: 86,   t: 60, w: 10.5, ar: '3 / 4', z: 2, drift: 2, dur: 13,   delay: -9 },
  { l: 17.5, t: 33, w: 9,    ar: '1 / 1', z: 5, drift: 1, dur: 19,   delay: -5 },
  { l: 59.5, t: 31, w: 9.5,  ar: '4 / 5', z: 5, drift: 2, dur: 20,   delay: -12 },
  { l: 78.5, t: 38, w: 11,   ar: '3 / 2', z: 4, drift: 3, dur: 15,   delay: -2.5 },
  { l: 3,    t: 79, w: 11,   ar: '3 / 2', z: 2, drift: 1, dur: 16,   delay: -7.5 },
  { l: 14,   t: 3,  w: 8.5,  ar: '3 / 2', z: 1, drift: 3, dur: 17.5, delay: -6.5 },
  { l: 52,   t: 5,  w: 9,    ar: '4 / 5', z: 2, drift: 1, dur: 18.5, delay: -3.5 },
  { l: 62,   t: 18, w: 10,   ar: '1 / 1', z: 2, drift: 2, dur: 15.5, delay: -8.5 },
  { l: 80,   t: 7,  w: 8,    ar: '4 / 5', z: 1, drift: 3, dur: 16.5, delay: -0.5 },
  { l: 91.5, t: 10, w: 7,    ar: '3 / 4', z: 3, drift: 1, dur: 14,   delay: -5.5 },
  { l: 1.5,  t: 36, w: 8,    ar: '4 / 3', z: 1, drift: 2, dur: 17,   delay: -9.5 },
  { l: 10,   t: 42, w: 10.5, ar: '3 / 2', z: 4, drift: 3, dur: 14.5, delay: -1.5 },
  { l: 30,   t: 38, w: 12,   ar: '4 / 3', z: 2, drift: 1, dur: 16,   delay: -10.5 },
  { l: 47,   t: 34, w: 8.5,  ar: '3 / 4', z: 3, drift: 2, dur: 19.5, delay: -4.5 },
  { l: 72,   t: 30, w: 8,    ar: '3 / 4', z: 6, drift: 1, dur: 21,   delay: -2 },
  { l: 40,   t: 54, w: 10,   ar: '4 / 5', z: 2, drift: 3, dur: 15,   delay: -7 },
  { l: 33,   t: 76, w: 9.5,  ar: '1 / 1', z: 4, drift: 1, dur: 13.5, delay: -12.5 },
  { l: 49,   t: 78, w: 12,   ar: '3 / 2', z: 3, drift: 2, dur: 18,   delay: -5 },
  { l: 70,   t: 72, w: 13,   ar: '4 / 3', z: 2, drift: 3, dur: 16,   delay: -8 },
];

/** Wrap a percentage into [min, max] so derived slots stay on stage. */
function wrap(v: number, min: number, max: number): number {
  const span = max - min;
  return min + ((((v - min) % span) + span) % span);
}

/**
 * Slot for index i. The first 28 are hand-placed; beyond them, geometry is
 * derived by shifting and shrinking the base composition so any number of
 * photos finds a home without the scatter collapsing into a grid.
 */
function slotFor(i: number): Slot {
  const base = SLOTS[i % SLOTS.length];
  const sheet = Math.floor(i / SLOTS.length);
  if (sheet === 0) return base;
  return {
    ...base,
    l: wrap(base.l + 7.5 * sheet, 1, 86),
    t: wrap(base.t + 11 * sheet, 3, 80),
    w: Math.max(6.5, base.w * Math.pow(0.88, sheet)),
    z: base.z === 6 ? 1 : base.z + 1,
    delay: base.delay - 1.7 * sheet,
  };
}

type Rect = { left: number; top: number; width: number; height: number };

type Lightbox = {
  item: GalleryItem;
  index: number;
  from: Rect;
  target: Rect;
};

const OPEN_MS = 620;

function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/** Centre-stage rect for the enlarged image, leaving room for the caption. */
function targetRect(aspect: number): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.min(vw * 0.86, 960);
  // Leave room below for the caption (title, place, "View the piece" ≈ 142px
  // including its 26px offset) so it never falls off short screens; on taller
  // screens also for the arrows beneath it (~58px). Below 480px tall the
  // arrows move to the screen edges instead (globals.css).
  const reserve = vh < 480 ? 142 : 200;
  const maxH = Math.max(Math.min(vh * 0.62, vh - 84 - reserve), 120);
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return {
    left: (vw - width) / 2,
    top: Math.max(vh * 0.44 - height / 2, 84),
    width,
    height,
  };
}

export function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);
  const [phase, setPhase] = useState<'enter' | 'active' | 'exit'>('enter');
  const imgRefs = useRef(new Map<number, HTMLImageElement>());
  const srcButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const closingRef = useRef(false);

  // The gallery is a fixed-viewport scene: no page scroll, no site footer.
  useEffect(() => {
    document.body.classList.add('gallery-open');
    return () => document.body.classList.remove('gallery-open');
  }, []);

  const open = (item: GalleryItem, index: number, button: HTMLButtonElement) => {
    if (lightbox) return;
    const img = imgRefs.current.get(index);
    if (!img) return;
    const from = rectOf(img);
    const aspect = img.naturalWidth && img.naturalHeight
      ? img.naturalWidth / img.naturalHeight
      : from.width / from.height;
    srcButtonRef.current = button;
    closingRef.current = false;
    setLightbox({ item, index, from, target: targetRect(aspect) });
    setPhase('enter');
  };

  // Two frames after mount, launch the morph to centre stage.
  useEffect(() => {
    if (!lightbox || phase !== 'enter') return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('active'));
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [lightbox, phase]);

  useEffect(() => {
    if (phase === 'active') closeBtnRef.current?.focus();
  }, [phase]);

  const close = useCallback(() => {
    if (!lightbox || closingRef.current) return;
    closingRef.current = true;
    // The hidden thumbnail's drift is paused while open, so its rect is stable.
    const img = imgRefs.current.get(lightbox.index);
    if (img) setLightbox(lb => (lb ? { ...lb, from: rectOf(img) } : lb));
    setPhase('exit');
    window.setTimeout(() => {
      // Focus returns after React has un-hidden the source print (a
      // visibility:hidden element can't take focus) — see the effect below.
      returnFocusRef.current = srcButtonRef.current;
      setLightbox(null);
      setPhase('enter');
      closingRef.current = false;
      srcButtonRef.current = null;
    }, OPEN_MS + 40);
  }, [lightbox]);

  // Step through the photos without leaving the enlarged view. Slot k shows
  // items[k] for every unique photo, so the new photo's thumbnail is slot k
  // (closing then morphs back to it). Focus stays on the arrow pressed.
  const step = useCallback((delta: number) => {
    if (!lightbox || closingRef.current || items.length < 2) return;
    const k = (((lightbox.index % items.length) + delta) % items.length + items.length) % items.length;
    const img = imgRefs.current.get(k);
    const aspect = img?.naturalWidth && img.naturalHeight
      ? img.naturalWidth / img.naturalHeight
      : lightbox.target.width / lightbox.target.height;
    const button = img?.closest('button') ?? null;
    if (button) srcButtonRef.current = button;
    const target = targetRect(aspect);
    setLightbox({ item: items[k], index: k, from: target, target });
  }, [lightbox, items]);

  useEffect(() => {
    if (lightbox || !returnFocusRef.current) return;
    returnFocusRef.current.focus({ preventScroll: true });
    returnFocusRef.current = null;
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowRight') { step(1); return; }
      if (e.key === 'ArrowLeft') { step(-1); return; }
      // Keep Tab inside the enlarged view (Close ↔ View the piece).
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]')
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const inside = dialogRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault(); first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, close, step]);

  const shown = phase === 'active';
  const figureRect = lightbox ? (shown ? lightbox.target : lightbox.from) : null;

  if (items.length === 0) return null;

  const count = items.length >= 16 ? items.length : SLOTS.length;
  // Entrance stagger scaled to the whole set: the reveal always spans ~2.1s
  // with even spacing (plus a touch of deterministic jitter), so the last
  // prints never pop in as one clump however many photos the wall holds.
  const enterDelay = (i: number) =>
    150 + Math.round((i / Math.max(count - 1, 1)) * 2100 + (((i * 37) % 97) / 97) * 220);

  return (
    <>
      {/* ── Floating collage ── */}
      <div className="g-stage" aria-label="Photo collage" inert={lightbox ? true : undefined}>
        {/* Every photo gets a slot, each photo shown once. With more photos
            than base slots, extra slots are derived; with slightly fewer,
            the prints spread across the composition so gaps distribute
            evenly. Only a genuinely sparse set (< 16) repeats photos to
            keep the wall from looking empty. */}
        {Array.from(
          { length: count },
          (_, i) => {
          const item = items[i % items.length];
          const s = items.length >= SLOTS.length || items.length < 16
            ? slotFor(i)
            : SLOTS[Math.floor((i * SLOTS.length) / items.length)];
          const isSource = lightbox?.index === i;
          // A sparse set repeats photos to fill the wall; the repeats are
          // decorative, so keyboard and screen readers get each photo once.
          const isRepeat = i >= items.length;
          return (
            <button
              key={`${item.key}-slot${i}`}
              type="button"
              className={`g-item${isSource ? ' g-item--hidden' : ''}`}
              style={{
                left: `${s.l}%`,
                top: `${s.t}%`,
                width: `clamp(${Math.round(s.w * 9.5)}px, ${s.w}vw, ${Math.round(s.w * 19)}px)`,
                aspectRatio: s.ar,
                ['--g-z' as string]: s.z,
                ['--g-enter-delay' as string]: `${enterDelay(i)}ms`,
                ['--g-drift-dur' as string]: `${s.dur}s`,
                ['--g-drift-delay' as string]: `${s.delay}s`,
              } as React.CSSProperties}
              onClick={e => open(item, i, e.currentTarget)}
              tabIndex={isRepeat ? -1 : undefined}
              aria-hidden={isRepeat ? true : undefined}
              aria-label={`${item.title}${item.location ? ` — ${item.location}` : ''} (enlarge)`}
            >
              <span className={`g-drift g-drift--${s.drift}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- single fixed URL keeps the enlarge morph seamless */}
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  ref={el => {
                    if (el) imgRefs.current.set(i, el);
                    else imgRefs.current.delete(i);
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Frosted hint ── */}
      <p className="g-hint" aria-hidden="true">
        <span className="g-hint-click">Click</span>
        <span className="g-hint-tap">Tap</span> any work to explore
      </p>

      {/* ── Enlarged view ── */}
      {lightbox && (
        <div
          ref={dialogRef}
          className={`g-lightbox${shown ? ' g-lightbox--shown' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.item.title}
        >
          <div className="g-backdrop" onClick={close} />
          <button
            ref={closeBtnRef}
            type="button"
            className="g-close"
            onClick={close}
            aria-label="Close enlarged view"
          >
            ✕
          </button>
          <figure
            className="g-figure"
            style={figureRect ? {
              left: figureRect.left,
              top: figureRect.top,
              width: figureRect.width,
              height: figureRect.height,
            } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- same URL as the thumbnail, already decoded */}
            <img src={lightbox.item.src} alt={lightbox.item.alt} />
            {lightbox.item.fullSrc && (
              // eslint-disable-next-line @next/next/no-img-element -- layered over the thumbnail, fades in on load
              <img
                key={lightbox.item.fullSrc}
                src={lightbox.item.fullSrc}
                alt=""
                aria-hidden="true"
                decoding="async"
                className="g-figure-full"
                onLoad={e => e.currentTarget.classList.add('is-loaded')}
              />
            )}
          </figure>
          <div
            className="g-caption"
            style={{ top: lightbox.target.top + lightbox.target.height + 26 }}
          >
            <p className="g-caption-title">{lightbox.item.title}</p>
            {lightbox.item.location && (
              <p className="g-caption-loc">{lightbox.item.location}</p>
            )}
            <Link href={lightbox.item.href} className="g-caption-link">
              View the piece
            </Link>
          </div>
          {items.length > 1 && (
            <div className="g-stepper">
              <button type="button" className="g-step" onClick={() => step(-1)} aria-label="Previous photograph">
                ←
              </button>
              <span className="g-count" aria-live="polite">
                {(lightbox.index % items.length) + 1} / {items.length}
              </span>
              <button type="button" className="g-step" onClick={() => step(1)} aria-label="Next photograph">
                →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
