import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'default',
  title: 'Wandering Website',
  projectId: '8p5lsu79',
  dataset: 'production',
  // Embedded at /studio (src/app/studio) — lets deep links and reloads resolve.
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
