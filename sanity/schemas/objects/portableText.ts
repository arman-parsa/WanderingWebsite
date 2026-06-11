import { defineArrayMember, defineType } from 'sanity';

export const portableText = defineType({
  name: 'portableText',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              { name: 'blank', type: 'boolean', title: 'Open in new tab', initialValue: true },
            ],
          },
        ],
      },
    }),
    defineArrayMember({ type: 'imageBlock' }),
    defineArrayMember({ type: 'imagePair' }),
    defineArrayMember({ type: 'pullQuote' }),
    defineArrayMember({ type: 'videoBlock' }),
  ],
});
