import { defineArrayMember, defineField, defineType } from 'sanity';
import { COMMISSION_DELIVERABLES, COMMISSION_SECTORS } from '../../lib/commissionOptions';

/**
 * Commissioned work for clients. A separate type from the editorial pieces
 * (writing / mixedMedia / photography / videography), so it never appears in
 * the Library, Gallery, Earth globe or homepage — those queries list their
 * types explicitly. Shown at /commissions and /commissions/<slug>.
 */
export const commission = defineType({
  name: 'commission',
  title: 'Commission',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'Client name',
      type: 'string',
      description: 'Who the work was for, e.g. the hotel’s name. Used as the title when “Project title” is empty.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'projectTitle',
      title: 'Project title',
      type: 'string',
      description: 'Optional. A name for the project if it differs from the client name.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The web address: armanparsa.earth/commissions/<slug>. Press Generate to make it from the title.',
      options: {
        source: (doc) => {
          const d = doc as { projectTitle?: string; clientName?: string };
          return d.projectTitle || d.clientName || '';
        },
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Where the work was made, e.g. “Jebel Akhdar, Oman”.',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'The year the work was made, e.g. 2026.',
      validation: (Rule) => Rule.integer().min(2000).max(2100),
    }),
    defineField({
      name: 'sector',
      title: 'Sector',
      type: 'string',
      description: 'The kind of client. Shown as a small label.',
      options: { list: COMMISSION_SECTORS, layout: 'radio' },
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'array',
      description: 'What you delivered. Tick all that apply.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: COMMISSION_DELIVERABLES, layout: 'grid' },
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      description: 'Shown on the Commissions page and when the link is shared. Set the hotspot to keep the subject in frame.',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brief',
      title: 'Brief',
      type: 'text',
      rows: 4,
      description: 'One to three sentences: what the client needed and what you delivered.',
      validation: (Rule) => Rule.max(600).warning('Keep the brief short — one to three sentences.'),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description:
        'The commission’s photographs, in the order they should appear (drag to reorder). Around 12–15 works best. Portrait and landscape images are arranged automatically.',
      of: [
        defineArrayMember({
          name: 'commissionImage',
          title: 'Image',
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
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional. A short line shown beneath the image.',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'film',
      title: 'Film',
      type: 'videoBlock',
      description: 'Optional. A Vimeo film shown after the images.',
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'object',
      description: 'Optional. A few words from the client, shown as a quote near the end.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
        defineField({ name: 'name', title: 'Name', type: 'string', description: 'Who said it.' }),
        defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. General Manager, Alila Jabal Akhdar.' }),
      ],
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Position on the Commissions page: 1 comes first. Commissions with the same number (or none) are ordered by year, newest first.',
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [
        { field: 'displayOrder', direction: 'asc' },
        { field: 'year', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: { client: 'clientName', project: 'projectTitle', location: 'location', year: 'year', media: 'coverImage' },
    prepare({ client, project, location, year, media }) {
      return {
        title: project || client || 'Untitled commission',
        subtitle: [project ? client : null, location, year].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
