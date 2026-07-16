'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export type GalleryItem = {
  key: string;
  title: string;
  location?: string;
  href: string;
  src: string;
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
  w: string;        // CSS width
  ar: string;       // aspect-ratio
  z: number;
  drift: 1 | 2 | 3;
  dur: number;      // drift duration, s
  delay: number;    // drift delay, s (negative desyncs the loop)
};

const SLOTS: Slot[] = [
  { l: 4,    t: 13, w: 'clamp(150px, 16vw, 300px)',   ar: '3 / 4', z: 3, drift: 1, dur: 13,   delay: -2 },
  { l: 27,   t: 8,  w: 'clamp(110px, 11.5vw, 210px)', ar: '4 / 5', z: 2, drift: 2, dur: 16,   delay: -7 },
  { l: 36.5, t: 15, w: 'clamp(210px, 23vw, 430px)',   ar: '3 / 2', z: 4, drift: 3, dur: 18,   delay: -4 },
  { l: 69.5, t: 9,  w: 'clamp(120px, 13vw, 240px)',   ar: '3 / 4', z: 3, drift: 2, dur: 14,   delay: -10 },
  { l: 87.5, t: 24, w: 'clamp(90px, 9.5vw, 180px)',   ar: '4 / 5', z: 2, drift: 1, dur: 15.5, delay: -1 },
  { l: 7.5,  t: 56, w: 'clamp(120px, 12.5vw, 230px)', ar: '4 / 5', z: 2, drift: 3, dur: 13.5, delay: -8 },
  { l: 22.5, t: 64, w: 'clamp(150px, 16.5vw, 310px)', ar: '3 / 2', z: 3, drift: 2, dur: 17,   delay: -3 },
  { l: 55,   t: 58, w: 'clamp(110px, 11.5vw, 215px)', ar: '3 / 4', z: 4, drift: 1, dur: 14.5, delay: -11 },
  { l: 64.5, t: 50, w: 'clamp(170px, 18.5vw, 350px)', ar: '4 / 3', z: 3, drift: 3, dur: 16.5, delay: -6 },
  { l: 86,   t: 60, w: 'clamp(100px, 10.5vw, 195px)', ar: '3 / 4', z: 2, drift: 2, dur: 13,   delay: -9 },
  { l: 17.5, t: 33, w: 'clamp(85px, 9vw, 170px)',     ar: '1 / 1', z: 5, drift: 1, dur: 19,   delay: -5 },
  { l: 59.5, t: 31, w: 'clamp(90px, 9.5vw, 180px)',   ar: '4 / 5', z: 5, drift: 2, dur: 20,   delay: -12 },
  { l: 78.5, t: 38, w: 'clamp(105px, 11vw, 205px)',   ar: '3 / 2', z: 4, drift: 3, dur: 15,   delay: -2.5 },
  { l: 3,    t: 79, w: 'clamp(105px, 11vw, 205px)',   ar: '3 / 2', z: 2, drift: 1, dur: 16,   delay: -7.5 },
];

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
  const maxH = vh * 0.62;
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
      setLightbox(null);
      setPhase('enter');
      closingRef.current = false;
      srcButtonRef.current?.focus();
      srcButtonRef.current = null;
    }, OPEN_MS + 40);
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, close]);

  const shown = phase === 'active';
  const figureRect = lightbox ? (shown ? lightbox.target : lightbox.from) : null;

  return (
    <>
      {/* ── Floating collage ── */}
      <div className="g-stage" aria-label="Photo collage">
        {items.slice(0, SLOTS.length).map((item, i) => {
          const s = SLOTS[i];
          const isSource = lightbox?.index === i;
          return (
            <button
              key={item.key}
              type="button"
              className={`g-item${isSource ? ' g-item--hidden' : ''}`}
              style={{
                left: `${s.l}%`,
                top: `${s.t}%`,
                width: s.w,
                aspectRatio: s.ar,
                ['--g-z' as string]: s.z,
                ['--g-enter-delay' as string]: `${150 + i * 90}ms`,
                ['--g-drift-dur' as string]: `${s.dur}s`,
                ['--g-drift-delay' as string]: `${s.delay}s`,
              } as React.CSSProperties}
              onClick={e => open(item, i, e.currentTarget)}
              aria-label={`${item.title}${item.location ? ` — ${item.location}` : ''} (enlarge)`}
            >
              <span className={`g-drift g-drift--${s.drift}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- single fixed URL keeps the enlarge morph seamless */}
                <img
                  src={item.src}
                  alt={item.alt}
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
      <p className="g-hint" aria-hidden="true">Click any work to explore</p>

      {/* ── Enlarged view ── */}
      {lightbox && (
        <div
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
        </div>
      )}
    </>
  );
}
