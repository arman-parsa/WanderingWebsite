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
  preview: {
    select: { title: 'alt', media: 'asset' },
  },
});
