import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Site Title', type: 'string' }),
    defineField({ name: 'description', title: 'Site Description', type: 'text', rows: 3 }),
    defineField({ name: 'ogImage', title: 'Default OG Image', type: 'image' }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: () => ({ title: 'Site Settings' }),
  },
});
