/** JSON-LD schema builders — no Sanity/image dependencies, safe to import anywhere. */
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SOCIAL_PROFILES } from '@/lib/siteConfig';

export const PERSON_JSON_LD = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Arman Parsa',
  alternateName: 'Amir Arman Ghanbari Parsa',
  url: SITE_URL,
  jobTitle: 'Journalist, photographer and videographer',
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
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#person` },
      inLanguage: 'en',
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
};

export function buildContentJsonLd(input: ContentJsonLdInput) {
  const url = `${SITE_URL}${input.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': input.type,
    ...(input.type === 'Article'
      ? { headline: input.title, mainEntityOfPage: { '@type': 'WebPage', '@id': url } }
      : { name: input.title }),
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
    author: { '@id': `${SITE_URL}/#person` },
    inLanguage: 'en',
  };
}
