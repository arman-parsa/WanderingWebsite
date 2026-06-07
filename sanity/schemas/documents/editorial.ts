import { defineField, defineType } from 'sanity';

export const mixedMedia = defineType({
  name: 'mixedMedia',
  title: 'Mixed Media',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4, description: 'Short intro shown on index cards and at the top of the piece.' }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })] }),
    defineField({ name: 'body', title: 'Body', type: 'portableText' }),
    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'imageBlock' }] }),
    defineField({ name: 'videos', title: 'Videos', type: 'array', of: [{ type: 'videoBlock' }] }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'coordinates', title: 'Coordinates', type: 'geopoint' }),
    defineField({ name: 'readingTime', title: 'Reading Time (minutes)', type: 'number' }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'photographyCredit', title: 'Photography Credit', type: 'string' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seoFields' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'coverImage' },
  },
});
