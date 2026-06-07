import { defineField, defineType } from 'sanity';

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'caption', title: 'Caption', type: 'string', description: 'Short label displayed beneath the image.' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2, description: 'Optional longer description for this image.' }),
  ],
  preview: {
    select: { title: 'alt', media: 'asset' },
  },
});
