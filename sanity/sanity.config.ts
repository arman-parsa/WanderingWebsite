import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { structure } from './structure';

// Singletons: edited in place from the sidebar, never created, duplicated or
// deleted, so there is always exactly one.
const SINGLETON_TYPES = new Set(['siteSettings']);
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'default',
  title: 'Wandering Website',
  projectId: '8p5lsu79',
  dataset: 'production',
  // Embedded at /studio (src/app/studio) — lets deep links and reloads resolve.
  basePath: '/studio',
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // No "new Site Settings" template anywhere in the Studio.
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({ action }) => !!action && SINGLETON_ACTIONS.has(action))
        : actions,
    newDocumentOptions: (options, { creationContext }) =>
      creationContext.type === 'global'
        ? options.filter(({ templateId }) => !SINGLETON_TYPES.has(templateId))
        : options,
  },
});
