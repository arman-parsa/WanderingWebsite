import { defineField, defineType } from 'sanity';

export const photography = defineType({
  name: 'photography',
  title: 'Photography',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, description: 'Short intro shown on index cards and above the image grid.' }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })] }),
    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'imageBlock' }] }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'coordinates', title: 'Coordinates', type: 'geopoint' }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'displayMode',
      title: 'Display Mode',
      type: 'string',
      options: { list: ['grid', 'slideshow', 'vertical-scroll'], layout: 'radio' },
      initialValue: 'grid',
    }),
    defineField({
      name: 'printsUrl',
      title: 'Prints Link (Picfair)',
      type: 'url',
      description: 'Optional. Paste the Picfair link for this series or photo — a "Buy a Print" button appears at the end of the story. Leave blank for no button.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seoFields' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'coverImage' },
  },
});
