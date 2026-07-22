/**
 * Shared renderer for the site's photo-led Open Graph / Twitter cards.
 *
 * A full-bleed photograph with a dark scrim, the alchemical mark + ARMAN PARSA
 * wordmark, and — for articles — the category · location eyebrow above the
 * title in Lyon serif. Used by the `opengraph-image` file-convention routes so
 * every shared link (iMessage, WhatsApp, X, Facebook, LinkedIn, Slack,
 * Instagram DMs …) renders one consistent editorial card.
 *
 * Runs on the Node runtime (default) so fonts and the local fallback photo can
 * be read from disk; the cover photo is fetched at request time and inlined as
 * a data URI, which keeps it out of the ImageResponse bundle budget.
 */
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const PAPER = '#f8f4ef';
const INK = '#0d0d0d';

// ── Assets, read once and memoised across invocations ──────────────────────
let fontsPromise: Promise<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[]> | null = null;
export function ogFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(join(process.cwd(), 'public/fonts/Lyon_Regular.ttf')),
      readFile(join(process.cwd(), 'public/fonts/SuisseIntl_Light.ttf')),
    ]).then(([lyon, suisse]) => [
      { name: 'Lyon Text', data: Uint8Array.from(lyon).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
      { name: 'Suisse', data: Uint8Array.from(suisse).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
    ]);
  }
  return fontsPromise;
}

let fallbackPromise: Promise<string> | null = null;
/** The site's default photograph (public/og.jpg), inlined as a data URI. */
export function fallbackPhoto() {
  if (!fallbackPromise) {
    fallbackPromise = readFile(join(process.cwd(), 'public/og.jpg'), 'base64')
      .then((b64) => `data:image/jpeg;base64,${b64}`)
      .catch(() => '');
  }
  return fallbackPromise;
}

/** Fetch a (Sanity) image URL and inline it as a data URI; null on failure. */
export async function fetchPhoto(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const type = res.headers.get('content-type') || 'image/jpeg';
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

function Mark({ size = 34, color = PAPER }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <polygon points="14,4 26,25 2,25" fill="none" stroke={color} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={2} y1={11} x2={26} y2={11} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

type CardInput = {
  photo: string;                 // data URI or absolute URL
  mode?: 'article' | 'site';
  eyebrow?: string;              // "Photography · Essaouira, Morocco" / tagline
  title: string;
};

/** Build the ImageResponse for a card. `fonts` is passed in so callers memoise. */
export async function renderOgCard({ photo, mode = 'article', eyebrow, title }: CardInput) {
  const fonts = await ogFonts();
  const isSite = mode === 'site';
  // Ease the title down a notch for long headlines so it never overruns.
  const titleSize = isSite ? 104 : title.length > 46 ? 56 : title.length > 30 ? 66 : 76;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', backgroundColor: INK }}>
        {/* Full-bleed photograph. next/og rasterises with Satori, so a plain
            <img> is required here — next/image does not apply. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Scrim — darker toward the text so type stays legible on any photo */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex',
            backgroundImage: isSite
              ? 'linear-gradient(180deg, rgba(13,13,13,0.34) 0%, rgba(13,13,13,0.30) 45%, rgba(13,13,13,0.62) 100%)'
              : 'linear-gradient(180deg, rgba(13,13,13,0.22) 0%, rgba(13,13,13,0.12) 38%, rgba(13,13,13,0.82) 100%)',
          }}
        />

        {/* Content — a distinct container per mode; no Fragments, since Satori
            only lays out real elements as flex children. */}
        {isSite ? (
          <div
            style={{
              position: 'relative', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', textAlign: 'center',
              width: '100%', height: '100%', padding: 64,
            }}
          >
            <Mark size={52} />
            <div style={{ display: 'flex', marginTop: 26, fontFamily: 'Lyon Text', fontSize: titleSize, letterSpacing: 4, color: PAPER, textTransform: 'uppercase' }}>
              {title}
            </div>
            {eyebrow && (
              <div style={{ display: 'flex', marginTop: 24, maxWidth: 820, fontFamily: 'Suisse', fontSize: 24, letterSpacing: 4, color: 'rgba(248,244,239,0.82)', textTransform: 'uppercase' }}>
                {eyebrow}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              position: 'relative', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', alignItems: 'flex-start',
              width: '100%', height: '100%', padding: 64,
            }}
          >
            {/* Masthead */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Mark size={34} />
              <div style={{ display: 'flex', marginLeft: 16, fontFamily: 'Suisse', fontSize: 22, letterSpacing: 6, color: PAPER, textTransform: 'uppercase' }}>
                Arman Parsa
              </div>
            </div>
            {/* Title block */}
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
              {eyebrow && (
                <div style={{ display: 'flex', marginBottom: 20, fontFamily: 'Suisse', fontSize: 24, letterSpacing: 5, color: 'rgba(248,244,239,0.9)', textTransform: 'uppercase' }}>
                  {eyebrow}
                </div>
              )}
              <div style={{ display: 'flex', fontFamily: 'Lyon Text', fontSize: titleSize, lineHeight: 1.04, color: PAPER }}>
                {title}
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

/** The site-wide default card (homepage and every non-article page). */
export async function siteOgImage() {
  const photo = await fallbackPhoto();
  return renderOgCard({
    photo,
    mode: 'site',
    title: 'Arman Parsa',
    eyebrow: 'A portfolio of writing, photography and videography',
  });
}

export const SITE_OG_ALT = 'Arman Parsa — a portfolio of writing, photography and videography';

const TYPE_LABEL: Record<string, string> = {
  writing: 'Writing',
  mixedMedia: 'Mixed Media',
  photography: 'Photography',
  videography: 'Videography',
};

/** category · location eyebrow from a piece. */
export function eyebrowFor(type: string, location?: string) {
  const label = TYPE_LABEL[type] ?? '';
  return location ? `${label} · ${location}` : label;
}
