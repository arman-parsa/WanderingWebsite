import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * One document only (id "siteSettings") — pinned at the top of the Studio by
 * sanity/structure.ts, and sanity.config.ts stops duplicates being created.
 * Every field here is optional on the site: when one is empty, the site falls
 * back to the values in src/lib/siteSettings.ts.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'home', title: 'Homepage', default: true },
    { name: 'contact', title: 'Bio & contact' },
    { name: 'meta', title: 'Metadata' },
  ],
  fields: [
    defineField({
      name: 'heroImages',
      title: 'Hero images',
      type: 'array',
      group: 'home',
      description:
        'The homepage slideshow, in this order (drag to reorder). Each image holds for a few seconds, then slowly crossfades to the next. Set the hotspot so the important part of each photo stays in frame on narrow phone screens.',
      of: [
        defineArrayMember({
          name: 'heroImage',
          title: 'Hero image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Describe the photograph for people using screen readers.',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1).error('Add at least one hero image.'),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 10,
      group: 'contact',
      description:
        'Shown on the Contact page beside the portrait. Start each paragraph on a new line.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      group: 'contact',
      description: 'Shown on the Contact page as a link that opens a new email.',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      description: 'Shown on the Contact page by platform name (e.g. Instagram), in this order.',
      of: [
        defineArrayMember({
          name: 'socialLink',
          title: 'Social link',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              description: 'The name shown on the site, e.g. Instagram, TikTok, LinkedIn.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'The full link to your profile, starting with https://',
              validation: (Rule) => Rule.required().uri({ scheme: ['https', 'http'] }),
            }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    // Not used by the site yet; kept so existing values are preserved.
    defineField({ name: 'title', title: 'Site Title', type: 'string', group: 'meta' }),
    defineField({ name: 'description', title: 'Site Description', type: 'text', rows: 3, group: 'meta' }),
    defineField({ name: 'ogImage', title: 'Default OG Image', type: 'image', group: 'meta' }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
