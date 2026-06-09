'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const seen = sessionStorage.getItem('introSeen');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Returning visitors / reduced-motion users skip: the overlay is already
    // hidden by the pre-hydration script + CSS, so we just unmount it promptly.
    const skip = seen || reduced;

    // Lock scroll only while the animation actually plays.
    if (!skip) document.documentElement.classList.add('intro-active');

    // Delay = symbol in + tagline in + hold + overlay fade out (see globals.css).
    const timer = setTimeout(() => {
      sessionStorage.setItem('introSeen', '1');
      document.documentElement.classList.remove('intro-active');
      setVisible(false);
    }, skip ? 0 : 4200);

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('intro-active');
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="intro-loader" aria-hidden="true">
      <div className="intro-loader__inner">
        <svg
          className="intro-loader__symbol"
          width="64"
          height="64"
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
        >
          <polygon
            points="14,4 26,25 2,25"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1.1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="11"
            x2="26"
            y2="11"
            stroke="var(--color-ink)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
        <p className="intro-loader__tagline">Stories collected around the world</p>
      </div>
    </div>
  );
}
