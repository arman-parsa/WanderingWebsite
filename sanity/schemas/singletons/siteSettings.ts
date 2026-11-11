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
    { name: 'meta', title: 'Search & sharing' },
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
      description: 'Shown on the Contact page, in this order. Instagram, TikTok, LinkedIn and Substack appear as icons; any other platform appears by name.',
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
              description: 'e.g. Instagram, TikTok, LinkedIn, Substack — these four get their icon.',
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
    defineField({
      name: 'title',
      title: 'Homepage title',
      type: 'string',
      group: 'meta',
      description:
        'The title Google and the browser tab show for the homepage. Leave empty for: “Arman Parsa — Travel & Documentary Photographer, Filmmaker and Writer”.',
      validation: (Rule) => Rule.max(70).warning('Google shows about 60–70 characters.'),
    }),
    defineField({
      name: 'description',
      title: 'Site description',
      type: 'text',
      rows: 3,
      group: 'meta',
      description:
        'The summary Google and link previews show for the homepage (and pages without their own). Leave empty to use the built-in one.',
      validation: (Rule) => Rule.max(170).warning('Google shows about 155–160 characters.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Default share image',
      type: 'image',
      group: 'meta',
      options: { hotspot: true },
      description:
        'The photo behind the card shown when the homepage, Personal, Gallery, Earth or Contact is shared (pieces and commissions use their own cover). Landscape works best.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
