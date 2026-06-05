import { defineQuery } from 'groq';

// ─── Essays (Pure Writing) ─────────────────────────────────────────────────

export const ALL_ESSAYS_QUERY = defineQuery(`
  *[_type == "essay" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    tags,
    readingTime
  }
`);

export const ESSAY_QUERY = defineQuery(`
  *[_type == "essay" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    body,
    location,
    tags,
    readingTime,
    seo
  }
`);

export const ESSAY_SLUGS_QUERY = defineQuery(`
  *[_type == "essay" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── Editorials (Writing + Visual) ────────────────────────────────────────

export const ALL_EDITORIALS_QUERY = defineQuery(`
  *[_type == "editorial" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    tags,
    layout
  }
`);

export const EDITORIAL_QUERY = defineQuery(`
  *[_type == "editorial" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    body,
    location,
    tags,
    readingTime,
    photographyCredit,
    heroVideo,
    gallery,
    layout,
    seo
  }
`);

export const EDITORIAL_SLUGS_QUERY = defineQuery(`
  *[_type == "editorial" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── Photo Series (Pure Visual) ───────────────────────────────────────────

export const ALL_PHOTO_SERIES_QUERY = defineQuery(`
  *[_type == "photoSeries" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    displayMode
  }
`);

export const PHOTO_SERIES_QUERY = defineQuery(`
  *[_type == "photoSeries" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    images[] { ..., "alt": coalesce(alt, ""), hotspot, "metadata": asset->metadata },
    film,
    displayMode,
    seo
  }
`);

export const PHOTO_SERIES_SLUGS_QUERY = defineQuery(`
  *[_type == "photoSeries" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── All content (for index + map pages) ──────────────────────────────────

export const ALL_CONTENT_QUERY = defineQuery(`
  *[_type in ["essay", "editorial", "photoSeries"] && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _type,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot },
    location,
    tags
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
