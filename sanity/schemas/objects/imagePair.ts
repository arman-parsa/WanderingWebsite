import { defineArrayMember, defineField, defineType } from 'sanity';

export const imagePair = defineType({
  name: 'imagePair',
  title: 'Image pair',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description:
        'Two or three images shown side-by-side at equal height, each at its natural ratio. Two portraits stay side-by-side on phones; other combinations stack.',
      of: [
        defineArrayMember({
          name: 'pairImage',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'caption', title: 'Caption', type: 'string', description: 'Short label displayed beneath this image.' }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(2).max(3),
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      initialValue: 'wide',
      options: {
        layout: 'radio',
        list: [
          { title: 'Wide — breaks out of the text column', value: 'wide' },
          { title: 'Full bleed — edge to edge of the window', value: 'full' },
        ],
      },
    }),
  ],
  preview: {
    select: { images: 'images', media: 'images.0' },
    prepare({ images, media }) {
      const count = Array.isArray(images) ? images.length : 0;
      return { title: `Image pair (${count})`, media };
    },
  },
});
