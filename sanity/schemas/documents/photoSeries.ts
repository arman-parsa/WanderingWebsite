import { defineField, defineType } from 'sanity';

export const photoSeries = defineType({
  name: 'photoSeries',
  title: 'Photo Series',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })] }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'coordinates', title: 'Coordinates', type: 'geopoint' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'imageBlock' }] }),
    defineField({ name: 'film', title: 'Film', type: 'videoBlock' }),
    defineField({
      name: 'displayMode',
      title: 'Display Mode',
      type: 'string',
      options: { list: ['grid', 'slideshow', 'vertical-scroll'], layout: 'radio' },
      initialValue: 'grid',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seoFields' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'coverImage' },
  },
});
