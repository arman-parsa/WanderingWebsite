import { defineField, defineType } from 'sanity';

export const videography = defineType({
  name: 'videography',
  title: 'Videography',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, description: 'Short intro shown on index cards and above the video.' }),
    defineField({ name: 'coverImage', title: 'Cover Image / Thumbnail', type: 'image', options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })] }),
    defineField({ name: 'videos', title: 'Videos', type: 'array', of: [{ type: 'videoBlock' }] }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'coordinates', title: 'Coordinates', type: 'geopoint' }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'seo', title: 'SEO', type: 'seoFields' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'coverImage' },
  },
});
