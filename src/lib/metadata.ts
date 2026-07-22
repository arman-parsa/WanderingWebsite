import type { Metadata } from 'next';
import { urlFor } from '@/lib/sanityImage';
import { SITE_NAME } from '@/lib/siteConfig';

// Re-export constants so callers can import from one place
export { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SOCIAL_PROFILES, OG_IMAGE } from '@/lib/siteConfig';

type SanityImageRef = { asset?: object; alt?: string };

type ContentMetaInput = {
  title: string;
  description?: string;
  path: string;
  publishedAt?: string;
  tags?: string[];
  coverImage?: SanityImageRef;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: SanityImageRef };
};

function ogImageUrl(image: SanityImageRef | undefined): string | undefined {
  if (!image?.asset) return undefined;
  try {
    return urlFor(image).width(1200).height(630).fit('crop').format('jpg').quality(85).url();
  } catch {
    return undefined;
  }
}

/** Shared metadata builder for the four content detail pages. */
export function buildContentMetadata(input: ContentMetaInput): Metadata {
  const title = input.seo?.metaTitle ?? input.title;
  const description = input.seo?.metaDescription ?? input.description;

  // og:image / twitter:image come from the per-article `opengraph-image` route
  // (the photo-led card), so they are intentionally not set here.
  return {
    title,
    description,
    alternates: { canonical: input.path },
    openGraph: {
      title,
      description,
      url: input.path,
      siteName: SITE_NAME,
      type: 'article',
      ...(input.publishedAt && { publishedTime: input.publishedAt }),
      ...(input.tags?.length && { tags: input.tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function contentImageUrl(image: SanityImageRef | undefined): string | undefined {
  return ogImageUrl(image);
}
