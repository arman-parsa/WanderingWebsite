import { createClient } from 'next-sanity';

// Project ID is public by design (NEXT_PUBLIC_ prefix) and already hardcoded
// in sanity.config.ts — the fallback keeps builds working without .env.local.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8p5lsu79';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});
