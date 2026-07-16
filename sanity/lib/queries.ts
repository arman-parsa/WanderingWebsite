import { defineQuery } from 'groq';

// ─── Writing (Plain Writing) ───────────────────────────────────────────────

export const ALL_WRITING_QUERY = defineQuery(`
  *[_type == "writing" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    tags,
    readingTime
  }
`);

export const WRITING_QUERY = defineQuery(`
  *[_type == "writing" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    body,
    location,
    tags,
    readingTime,
    seo
  }
`);

export const WRITING_SLUGS_QUERY = defineQuery(`
  *[_type == "writing" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── Mixed Media (Writing + Photos/Videos) ────────────────────────────────

export const ALL_MIXED_MEDIA_QUERY = defineQuery(`
  *[_type == "mixedMedia" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    tags
  }
`);

export const MIXED_MEDIA_QUERY = defineQuery(`
  *[_type == "mixedMedia" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    body,
    images[] { ..., "alt": coalesce(alt, ""), hotspot },
    videos[],
    location,
    tags,
    readingTime,
    photographyCredit,
    seo
  }
`);

export const MIXED_MEDIA_SLUGS_QUERY = defineQuery(`
  *[_type == "mixedMedia" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── Photography (Photos, minimal text) ───────────────────────────────────

export const ALL_PHOTOGRAPHY_QUERY = defineQuery(`
  *[_type == "photography" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    displayMode
  }
`);

export const PHOTOGRAPHY_QUERY = defineQuery(`
  *[_type == "photography" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    images[] { ..., "alt": coalesce(alt, ""), hotspot, description, "metadata": asset->metadata },
    tags,
    displayMode,
    seo
  }
`);

export const PHOTOGRAPHY_SLUGS_QUERY = defineQuery(`
  *[_type == "photography" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── Videography (Videos, minimal text) ───────────────────────────────────

export const ALL_VIDEOGRAPHY_QUERY = defineQuery(`
  *[_type == "videography" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    tags
  }
`);

export const VIDEOGRAPHY_QUERY = defineQuery(`
  *[_type == "videography" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    videos[],
    location,
    tags,
    seo
  }
`);

export const VIDEOGRAPHY_SLUGS_QUERY = defineQuery(`
  *[_type == "videography" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── All content (for index + map pages) ──────────────────────────────────

export const ALL_CONTENT_QUERY = defineQuery(`
  *[_type in ["writing", "mixedMedia", "photography", "videography"] && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _type,
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    tags
  }
`);

// ─── Gallery (a visual mix of photos drawn from all pieces) ───────────────
// Mirrors collectArticleMedia(): a piece's photographs live in its images[]
// end-gallery plus the imageBlock / imagePair blocks of its portable-text
// body. The cover is fetched only as a fallback for pieces with no inner
// photos (e.g. videography).

export const GALLERY_CONTENT_QUERY = defineQuery(`
  *[_type in ["writing", "mixedMedia", "photography", "videography"] && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _type,
    title,
    "slug": slug.current,
    location,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    "galleryImages": images[] { ..., "alt": coalesce(alt, ""), hotspot },
    "bodyImages": body[_type == "imageBlock"] { "image": asset, "alt": coalesce(alt, "") },
    "pairImages": body[_type == "imagePair"].images[] { ..., "alt": coalesce(alt, "") }
  }
`);

// ─── Map view (content with coordinates) ──────────────────────────────────

export const MAP_CONTENT_QUERY = defineQuery(`
  *[_type in ["writing", "mixedMedia", "photography", "videography"]
    && !(_id in path("drafts.**"))
    && defined(coordinates)
  ] {
    _type,
    title,
    "slug": slug.current,
    publishedAt,
    description,
    location,
    coordinates
  }
`);

// ─── Site settings ────────────────────────────────────────────────────────

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    title,
    description,
    ogImage
  }
`);
