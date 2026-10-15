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
