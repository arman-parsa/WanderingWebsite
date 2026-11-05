import { defineField, defineType } from 'sanity';

export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: { list: ['vimeo'], layout: 'radio' },
      initialValue: 'vimeo',
      // Only Vimeo is supported by the site's player — hidden so editors
      // can't pick an option that would render nothing.
      hidden: true,
    }),
    // Both checks only apply once something is filled in, so an optional,
    // empty video (e.g. a commission's Film) never blocks publishing.
    defineField({ name: 'vimeoId', title: 'Vimeo Video ID', type: 'string',
      description: 'Paste the full Vimeo link (e.g. vimeo.com/123456789) or just the numeric ID — both work, including unlisted links.',
      validation: (Rule) =>
        Rule.custom((vimeoId, { parent }) => {
          const p = parent as { title?: string; description?: string } | undefined;
          return !vimeoId && (p?.title || p?.description)
            ? 'Without a Vimeo link this video won’t appear on the site.'
            : true;
        }).warning() }),
    defineField({ name: 'title', title: 'Title', type: 'string',
      description: 'Required when there’s a Vimeo link.',
      validation: (Rule) =>
        Rule.custom((title, { parent }) =>
          (parent as { vimeoId?: string } | undefined)?.vimeoId && !title ? 'Add a title for this video.' : true,
        ) }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2, description: 'Optional description shown beneath the video.' }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      initialValue: 'column',
      options: {
        layout: 'radio',
        list: [
          { title: 'Column — sits quietly with the text', value: 'column' },
          { title: 'Wide — breaks out of the text column', value: 'wide' },
          { title: 'Full bleed — edge to edge of the window', value: 'full' },
        ],
      },
    }),
  ],
});
