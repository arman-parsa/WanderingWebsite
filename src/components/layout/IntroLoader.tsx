'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * First-visit intro animation.
 *
 * Sequence: the alchemical symbol fades in slowly, then the tagline, a short
 * pause, then the overlay dissolves to reveal the site. Plays once per tab
 * session (sessionStorage), so client-side navigation and same-session
 * refreshes don't replay it. Returning visitors / reduced-motion users skip
 * straight through — the overlay shares the paper background colour so the
 * single pre-unmount frame is invisible.
 */
export function IntroLoader() {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Storage can throw (blocked site data); treat that as "not seen".
    let seen: string | null = null;
    try { seen = sessionStorage.getItem('introSeen'); } catch { /* ignore */ }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Returning visitors / reduced-motion users skip: the overlay is already
    // hidden by the pre-hydration script + CSS, so we just unmount it promptly.
    const skip = seen || reduced;

    // Lock scroll only while the animation actually plays, and keep keyboard
    // focus off the page hidden behind the overlay (its siblings) until then.
    const behind = skip ? [] : Array.from(ref.current?.parentElement?.children ?? [])
      .filter((el): el is HTMLElement => el !== ref.current && el instanceof HTMLElement);
    if (!skip) document.documentElement.classList.add('intro-active');
    behind.forEach((el) => { el.inert = true; });

    // Delay = symbol in + hold + rise to the nav + overlay fade (globals.css).
    const timer = setTimeout(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch { /* ignore */ }
      document.documentElement.classList.remove('intro-active');
      behind.forEach((el) => { el.inert = false; });
      setVisible(false);
    }, skip ? 0 : 3800);

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('intro-active');
      behind.forEach((el) => { el.inert = false; });
    };
  }, []);

  if (!visible) return null;

  return (
    <div ref={ref} className="intro-loader" aria-hidden="true">
      {/* 56px = the nav symbol's 28px glyph at its 2× homepage rest scale. */}
      <svg
        className="intro-loader__symbol"
        width="56"
        height="56"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="14,4 26,25 2,25"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line
          x1="2"
          y1="11"
          x2="26"
          y2="11"
          stroke="var(--color-ink)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
