import type { Metadata } from 'next';

const DEFAULT_OG_IMAGE = '/og-default.jpg';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

type MetaInput = {
  title: string;
  description?: string;
  ogImage?: string;
  path?: string;
};

export function buildMetadata({ title, description, ogImage, path }: MetaInput): Metadata {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}
