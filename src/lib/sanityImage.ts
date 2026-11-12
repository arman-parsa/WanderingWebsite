import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';

// Only the project ID and dataset are needed to build image URLs — passing
// them directly (instead of the API client) keeps the whole Sanity client out
// of the browser bundle. Same values and fallbacks as sanity/lib/client.ts.
const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8p5lsu79',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** "Cascata das Lombadas, framed by rocks…" → "cascata-das-lombadas-framed-by-rocks". */
function fileSlug(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents (São → Sao)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

function assetRef(source: unknown): string | undefined {
  if (typeof source === 'string') return source;
  const s = source as { _ref?: string; asset?: { _ref?: string } } | null;
  return s?.asset?._ref ?? s?._ref;
}

/**
 * urlFor() with a descriptive file name: the photo's description (its alt
 * text) becomes the end of the URL — …/1cc4c2…-6192x4128.jpg/daikiretto-sunrise.jpg
 * — which search engines read alongside the alt text. Chain .width() etc. as
 * with urlFor; without a description it is plain urlFor.
 */
export function photoUrl(source: SanityImageSource, description?: string | null) {
  const builder = urlFor(source);
  const name = description ? fileSlug(description) : '';
  if (!name) return builder;
  const ext = assetRef(source)?.split('-').pop() || 'jpg';
  return builder.vanityName(`${name}.${ext}`);
}
