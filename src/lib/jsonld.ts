/** JSON-LD schema builders — no Sanity/image dependencies, safe to import anywhere. */
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_SUBJECTS, SOCIAL_PROFILES } from '@/lib/siteConfig';

export const PERSON_JSON_LD = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Arman Parsa',
  alternateName: 'Amir Arman Ghanbari Parsa',
  url: SITE_URL,
  jobTitle: 'Travel and documentary photographer, filmmaker and writer',
  description: SITE_DESCRIPTION,
  image: `${SITE_URL}/images/about-portrait.jpg`,
  homeLocation: { '@type': 'Country', name: 'United Kingdom' },
  knowsAbout: SITE_SUBJECTS,
  sameAs: SOCIAL_PROFILES,
};

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_TITLE,
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#person` },
      inLanguage: 'en-GB',
    },
    PERSON_JSON_LD,
  ],
};

type ContentJsonLdInput = {
  type: 'Article' | 'ImageGallery' | 'VideoObject';
  title: string;
  description?: string;
  path: string;
  publishedAt?: string;
  tags?: string[];
  imageUrl?: string;
  /** VideoObject only — Vimeo embed URL */
  embedUrl?: string;
  /** Any further schema.org properties (e.g. a commission's client and place). */
  extra?: Record<string, unknown>;
};

export function buildContentJsonLd(input: ContentJsonLdInput) {
  const url = `${SITE_URL}${input.path}`;
  const title = input.title.trim();
  return {
    '@context': 'https://schema.org',
    '@type': input.type,
    ...(input.type === 'Article'
      ? { headline: title, mainEntityOfPage: { '@type': 'WebPage', '@id': url } }
      : { name: title }),
    ...(input.description && { description: input.description }),
    url,
    ...(input.publishedAt && {
      datePublished: input.publishedAt,
      ...(input.type === 'VideoObject' && { uploadDate: input.publishedAt }),
    }),
    ...(input.tags?.length && { keywords: input.tags.join(', ') }),
    ...(input.imageUrl && {
      [input.type === 'VideoObject' ? 'thumbnailUrl' : 'image']: input.imageUrl,
    }),
    ...(input.embedUrl && { embedUrl: input.embedUrl }),
    ...input.extra,
    // Inline name/url as well as the @id so validators that read one block
    // at a time still see a complete author.
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'Arman Parsa', url: SITE_URL },
    inLanguage: 'en-GB',
  };
}
