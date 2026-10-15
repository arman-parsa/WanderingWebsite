import { defineQuery } from 'next-sanity';

// ─── Writing (Plain Writing) ───────────────────────────────────────────────

export const WRITING_QUERY = defineQuery(`
  *[_type == "writing" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot, "lqip": asset->metadata.lqip },
    body[] {
      ...,
      _type == "imageBlock" => { asset { ..., "lqip": asset->metadata.lqip } },
      _type == "imagePair" => { images[] { ..., "lqip": asset->metadata.lqip } }
    },
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

export const MIXED_MEDIA_QUERY = defineQuery(`
  *[_type == "mixedMedia" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot, "lqip": asset->metadata.lqip },
    body[] {
      ...,
      _type == "imageBlock" => { asset { ..., "lqip": asset->metadata.lqip } },
      _type == "imagePair" => { images[] { ..., "lqip": asset->metadata.lqip } }
    },
    images[] {
      ..., "alt": coalesce(alt, ""), hotspot,
      _type == "imageBlock" => { asset { ..., "lqip": asset->metadata.lqip } },
      _type == "imagePair" => { images[] { ..., "lqip": asset->metadata.lqip } }
    },
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

export const PHOTOGRAPHY_QUERY = defineQuery(`
  *[_type == "photography" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot, "lqip": asset->metadata.lqip },
    location,
    images[] { ..., "alt": coalesce(alt, ""), hotspot, description, asset { ..., "lqip": asset->metadata.lqip } },
    tags,
    displayMode,
    printsUrl,
    seo
  }
`);

export const PHOTOGRAPHY_SLUGS_QUERY = defineQuery(`
  *[_type == "photography" && !(_id in path("drafts.**"))] { "slug": slug.current }
`);

// ─── Videography (Videos, minimal text) ───────────────────────────────────

export const VIDEOGRAPHY_QUERY = defineQuery(`
  *[_type == "videography" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    description,
    coverImage { ..., "alt": coalesce(alt, ""), hotspot, "lqip": asset->metadata.lqip },
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
  *[_type in ["writing", "mixedMedia", "photography", "videography"] && !(_id in path("drafts.**"))] | order(coalesce(publishedAt, _createdAt) desc) {
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
// The photographs shown IN each piece — NOT the cover. Every type stores
// them as imageBlock / imagePair objects, but in different fields:
//
//   • photography → images[]            (imageBlock only)
//   • mixedMedia  → body[] + images[]   (imageBlock + imagePair)
//   • writing     → body[]              (imageBlock + imagePair)
//   • videography → (no still photos)
//
// An imageBlock keeps its picture at `.asset`; an imagePair keeps two or
// three pictures at `.images[]`. We unwrap both into a uniform { img, alt }
// so the page can flatten them without knowing the container. Missing
// fields (e.g. photography has no `body`) simply project to null and are
// skipped downstream.

export const GALLERY_CONTENT_QUERY = defineQuery(`
  *[_type in ["writing", "mixedMedia", "photography", "videography"] && !(_id in path("drafts.**"))] | order(coalesce(publishedAt, _createdAt) desc) {
    _type,
    title,
    "slug": slug.current,
    location,
    "bodyBlocks":    body[_type == "imageBlock"]   { "img": asset, "alt": coalesce(alt, "") },
    "bodyPairs":     body[_type == "imagePair"]     { "imgs": images[] { "img": @, "alt": coalesce(alt, "") } },
    "galleryBlocks": images[_type == "imageBlock"]  { "img": asset, "alt": coalesce(alt, "") },
    "galleryPairs":  images[_type == "imagePair"]   { "imgs": images[] { "img": @, "alt": coalesce(alt, "") } },
    "cover":         coverImage { "img": @, "alt": coalesce(alt, "") }
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

// ─── Is there any real content yet? ───────────────────────────────────────
// Placeholders are shown only while this is 0 (see src/lib/sanityFetch.ts).

export const REAL_CONTENT_COUNT_QUERY = defineQuery(`
  count(*[_type in ["writing", "mixedMedia", "photography", "videography"] && !(_id in path("drafts.**"))])
`);
