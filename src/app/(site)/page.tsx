import type { Metadata } from 'next';
import { sanityFetch } from '@/lib/sanityFetch';
import { ALL_CONTENT_QUERY } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';
import { PLACEHOLDER_ITEMS } from '@/lib/placeholders';
import { HomepageClient, type HomeItem } from '@/components/home/HomepageClient';
import { SITE_URL, SITE_NAME } from '@/lib/metadata';
import { getSiteSettings } from '@/lib/siteSettings';
import { shuffled } from '@/lib/shuffle';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { seoTitle, seoDescription } = await getSiteSettings();
  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: 'en_GB',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: seoTitle, description: seoDescription },
  };
}

type ContentItem = {
  _type: 'writing' | 'mixedMedia' | 'photography' | 'videography';
  title: string;
  slug: string;
  location?: string;
  description?: string;
  coverImage?: { asset?: object; alt?: string; hotspot?: { x: number; y: number } };
};

export default async function HomePage() {
  // An empty result means no published content yet → placeholders.
  const [content, settings] = await Promise.all([
    sanityFetch<ContentItem[]>(ALL_CONTENT_QUERY),
    getSiteSettings(),
  ]);
  let items = (content ?? []).slice(0, 3);
  if (items.length === 0) items = PLACEHOLDER_ITEMS.slice(0, 3) as ContentItem[];

  const homeItems: HomeItem[] = items.map(item => ({
    _type:         item._type,
    title:         item.title,
    slug:          item.slug,
    location:      item.location,
    description:   item.description,
    coverImageUrl: item.coverImage?.asset
      ? urlFor(item.coverImage).width(1920).height(1080).fit('crop').format('webp').quality(85).url()
      : undefined,
  }));

  // Shuffled each time the page is generated (every few minutes, and on
  // each publish), so the opening photo varies; the browser then draws the
  // rest at random for each visitor (HomeHero).
  const heroSlides = shuffled(settings.heroSlides);

  return <HomepageClient items={homeItems} heroSlides={heroSlides} />;
}
