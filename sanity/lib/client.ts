import { createClient } from 'next-sanity';

// Project ID is public by design (NEXT_PUBLIC_ prefix) and already hardcoded
// in sanity.config.ts — the fallback keeps builds working without .env.local.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8p5lsu79';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  // ISR (revalidate + the /api/revalidate webhook) is our caching layer, so
  // read live from the API. With useCdn:true the CDN serves stale query
  // results after publishing — new docs appear on their own (uncached) detail
  // page but stay missing from cached list queries until the CDN TTL lapses.
  useCdn: false,
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});
