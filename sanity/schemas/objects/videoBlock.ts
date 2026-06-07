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
    defineField({ name: 'vimeoId', title: 'Vimeo Video ID', type: 'string' }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2, description: 'Optional description shown beneath the video.' }),
  ],
});
