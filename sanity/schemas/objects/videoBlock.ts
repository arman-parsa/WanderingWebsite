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
      options: { list: ['vimeo', 'self-hosted'], layout: 'radio' },
      initialValue: 'vimeo',
    }),
    defineField({ name: 'vimeoId', title: 'Vimeo Video ID', type: 'string',
      description: 'Paste the full Vimeo link (e.g. vimeo.com/123456789) or just the numeric ID — both work, including unlisted links.' }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
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
