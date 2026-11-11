import { SITE_SETTINGS_QUERY } from '@/lib/sanity';
import { sanityFetch } from '@/lib/sanityFetch';
import { urlFor } from '@/lib/sanityImage';
import { SITE_DESCRIPTION, SITE_TITLE, SOCIAL_LINKS } from '@/lib/siteConfig';

/**
 * Site-wide editable settings (Sanity "Site Settings"), with a fallback for
 * every field so the site never shows an empty hero, bio or contact block —
 * neither before the document exists nor if a field is left blank.
 */

export type HeroSlide = {
  src: string;
  alt: string;
  /** CSS object-position from the Sanity hotspot (centre when none). */
  objectPosition: string;
  /** Sanity CDN images are resized by the Sanity loader; local files by Next. */
  isSanity: boolean;
  blurDataURL?: string;
};

export type SocialLink = { platform: string; url: string };

export type SiteSettings = {
  heroSlides: HeroSlide[];
  /** Bio split into paragraphs. */
  bio: string[];
  contactEmail: string;
  socialLinks: SocialLink[];
  /** Homepage title / site description (Search & sharing), with built-in defaults. */
  seoTitle: string;
  seoDescription: string;
  /** Default share-card photo, when one is set in Studio. */
  ogImage: { asset?: { _ref?: string }; hotspot?: { x: number; y: number } } | null;
};

// ── Fallbacks ──────────────────────────────────────────────────────────────

/**
 * The homepage photographs that ship with the site (public/images), shown
 * until hero images are added in Site Settings. Decorative: the hero's name
 * and tagline carry its meaning, so the alt text is empty.
 */
const FALLBACK_HERO_FILES = [
  'DSC05162.jpg',
  'DSC06121.jpg',
  'DSC06207.jpg',
  'DSC06456.jpg',
  'DSC06705.JPG',
  'DSC07607.JPG',
  'DSC07742.JPG',
  'DSC07782.JPG',
  'DSC07876.JPG',
  'DSC08034.JPG',
  'DSC09132.JPG',
];

export const FALLBACK_HERO_SLIDES: HeroSlide[] = FALLBACK_HERO_FILES.map((file) => ({
  src: `/images/${file}`,
  alt: '',
  objectPosition: 'center',
  isSanity: false,
}));

export const FALLBACK_BIO = [
  'Amir Arman Ghanbari Parsa is a London-born, 23-year-old, Oxford-educated Iranian writer, photographer and filmmaker.',
  'Working across commercial and editorial projects, Arman makes unhurried, grounded and intimate work: stories for campaigns and publications, told from close up and given time.',
  'Across writing, photography and film, he is drawn to culture, spirit and our place in the natural world. His work hopes to kindle wonder about the earth and its people, and the urge to go and see it for oneself.',
];

export const FALLBACK_CONTACT_EMAIL = 'armanparsa03@gmail.com';

export const FALLBACK_SOCIAL_LINKS: SocialLink[] = SOCIAL_LINKS;

// ── Fetch ──────────────────────────────────────────────────────────────────

type SanityHeroImage = {
  asset?: { _ref?: string };
  alt?: string;
  hotspot?: { x?: number; y?: number };
  lqip?: string;
};

type RawSettings = {
  heroImages?: SanityHeroImage[] | null;
  bio?: string | null;
  contactEmail?: string | null;
  socialLinks?: SocialLink[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: { asset?: { _ref?: string }; hotspot?: { x: number; y: number } } | null;
} | null;

function toHeroSlide(img: SanityHeroImage): HeroSlide | null {
  if (!img.asset?._ref) return null;
  try {
    const { x, y } = img.hotspot ?? {};
    return {
      // Width only — the hero is full-bleed, so the loader sizes it per screen.
      src: urlFor(img).width(2560).url(),
      alt: img.alt ?? '',
      objectPosition:
        typeof x === 'number' && typeof y === 'number' ? `${x * 100}% ${y * 100}%` : 'center',
      isSanity: true,
      blurDataURL: img.lqip,
    };
  } catch {
    return null;
  }
}

/** Split the bio into paragraphs; every non-empty line is its own paragraph. */
function toParagraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Site Settings merged with fallbacks. A failed fetch behaves like every
 * other Sanity fetch on the site (see sanityFetch): null during the build
 * (→ fallbacks), throw at runtime (→ Next keeps the last good page).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await sanityFetch<RawSettings>(SITE_SETTINGS_QUERY);

  const heroSlides = (raw?.heroImages ?? [])
    .map(toHeroSlide)
    .filter((s): s is HeroSlide => s !== null);
  const bio = toParagraphs(raw?.bio);
  const socialLinks = (raw?.socialLinks ?? []).filter((l) => l.platform && l.url);

  return {
    heroSlides: heroSlides.length > 0 ? heroSlides : FALLBACK_HERO_SLIDES,
    bio: bio.length > 0 ? bio : FALLBACK_BIO,
    contactEmail: raw?.contactEmail?.trim() || FALLBACK_CONTACT_EMAIL,
    socialLinks: socialLinks.length > 0 ? socialLinks : FALLBACK_SOCIAL_LINKS,
    seoTitle: raw?.seoTitle?.trim() || SITE_TITLE,
    seoDescription: raw?.seoDescription?.trim() || SITE_DESCRIPTION,
    ogImage: raw?.ogImage?.asset?._ref ? raw.ogImage : null,
  };
}
