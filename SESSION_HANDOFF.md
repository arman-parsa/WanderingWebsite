# SESSION HANDOFF — ARMAN'S WANDERINGS

> **Read CLAUDE.md and this file before touching any code.**
> ARCHITECTURE.md and DESIGN_SYSTEM.md do not currently exist in the repository.
> All design system facts below are extracted directly from `src/app/globals.css`
> and the existing component implementations — they are accurate as of the last commit.

---

## 1. WHAT THIS PROJECT IS

ARMAN'S WANDERINGS is a personal editorial archive: travel writing, photography, and mixed-media pieces by Arman Parsa. It is not a blog and not a portfolio. The emotional register is unhurried and print-influenced — the site should feel like a well-edited magazine that happens to exist on the web. Every layout and typographic decision privileges the work over the interface.

Content is organised into four types: writing (pure longform text), mixed media (writing combined with photos and/or video), photography (image-forward, minimal text), and videography (video-forward, minimal text). The site uses a dark ink-on-paper palette for light pages and a deep warm-black (`#18181b`) for all content and article pages. The nav is always present but never intrusive — transparent over hero imagery, semi-opaque once scrolled.

---

## 2. CURRENT STACK

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js App Router | `16.2.7` — **not standard Next.js**; read `node_modules/next/dist/docs/` before writing Next.js code; `params` is `Promise<{ slug: string }>` and must be awaited |
| Language | TypeScript | `^5`, strict mode — no `any` types |
| CMS | Sanity v5 | `^5.30.0` via `next-sanity ^13.0.11`; project ID `8p5lsu79`, dataset `production`; **connected but contains no real content** |
| Hosting | Vercel | Production deploys from `main` |
| Styling | Tailwind CSS v4 | `^4`; configured via `@theme inline {}` in `globals.css` — **no `tailwind.config.ts` exists** |
| Animation | GSAP `^3.15.0` | ScrollTrigger imported dynamically inside `useEffect` only (SSR safety); `prefers-reduced-motion` guard required |
| Animation | CSS keyframes | `fade-up`, `fade-in` defined in `globals.css`; used for homepage entrance sequence |
| Scroll | Lenis `^1.3.23` | Installed; **not yet wired up** |
| Maps | MapLibre GL `^5.24.0` + react-map-gl `^8.1.1` | Used on `/map` page via dynamic import (SSR disabled) |
| Photography lightbox | PhotoSwipe `^5.4.4` | Installed; **not yet wired up** |
| Motion library | Framer Motion `^12.40.0` | Installed; **not yet used** |
| Font loading | CSS `@font-face` in `globals.css` | `Lyon_Regular.ttf` and `SuisseIntl_Light.ttf` present in `public/fonts/`; loaded via `@font-face` declarations at top of `globals.css` |
| Import aliases | `@/` → `./src/*` | Defined in `tsconfig.json` |
| Image optimisation | `next/image` | Required for all images, no exceptions |

---

## 3. LIVE SITE

**https://wandering-website-blush.vercel.app**

Production branch: `main` — Vercel auto-deploys on every push to `main`.

---

## 4. REPOSITORY STRUCTURE

Accurate as of current commit. Files marked `[STUB]` contain only a comment or empty export.

```
WanderingWebsite/
├── AGENTS.md                          # Next.js version warning — read before writing Next.js code
├── CLAUDE.md                          # Re-exports AGENTS.md via @AGENTS.md
├── README.md                          # Default create-next-app readme — not project-specific
├── SESSION_HANDOFF.md                 # This file
├── STUDIO_SETUP_HANDOFF.md            # One-time studio setup notes — historical, not active
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── vercel.json
├── .env.example
├── .nvmrc
│
├── public/
│   └── fonts/
│       ├── .gitkeep
│       ├── Lyon_Regular.ttf           # Lyon Text — serif, weight 400
│       └── SuisseIntl_Light.ttf       # Suisse Int'l — sans, weight 300–400
│                                      # NOTE: public/images/ directory does NOT exist.
│                                      # HeroSection falls back to /images/hero-placeholder.jpg
│                                      # which will 404 until the file is added.
│
├── sanity/                            # Sanity studio — separate from Next.js src
│   ├── sanity.config.ts               # projectId and dataset hardcoded (env vars don't resolve in NextStudio)
│   ├── sanity.cli.ts
│   ├── lib/
│   │   ├── client.ts                  # Sanity client configuration
│   │   └── queries.ts                 # All GROQ queries (see section 7 for names)
│   └── schemas/
│       ├── index.ts                   # Schema registry
│       ├── documents/
│       │   ├── essay.ts               # Exports `writing` type (filename is legacy, type name is correct)
│       │   ├── editorial.ts           # Exports `mixedMedia` type (filename is legacy)
│       │   ├── photoSeries.ts         # Exports `photography` type (filename is legacy)
│       │   ├── videography.ts         # Exports `videography` type
│       │   └── author.ts              # Exports `author` type — not used in frontend yet
│       ├── objects/
│       │   ├── portableText.ts
│       │   ├── imageBlock.ts          # Includes `description` field (text, optional)
│       │   ├── videoBlock.ts          # Includes `description` field (text, optional)
│       │   ├── pullQuote.ts
│       │   └── seoFields.ts
│       └── singletons/
│           └── siteSettings.ts        # Not used in frontend yet
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout — no header/footer here
    │   ├── globals.css                # @font-face + design tokens + Tailwind v4 @theme + base styles
    │   ├── favicon.ico
    │   ├── studio/
    │   │   └── [[...index]]/
    │   │       └── page.tsx           # Sanity Studio embedded at /studio
    │   ├── api/
    │   │   └── revalidate/
    │   │       └── route.ts           # ISR webhook endpoint — not yet configured in Sanity
    │   └── (site)/                    # Route group: shares SiteHeader + SiteFooter layout
    │       ├── layout.tsx             # Renders SiteHeader + SiteFooter around children
    │       ├── page.tsx               # Homepage: hero + 3-col portrait grid + VIEW ALL
    │       ├── not-found.tsx
    │       ├── about/
    │       │   └── page.tsx           # [STUB] Static placeholder copy only
    │       ├── contact/
    │       │   └── page.tsx           # [STUB] Static placeholder copy only
    │       ├── map/
    │       │   └── page.tsx           # Geographic archive — DO NOT TOUCH
    │       ├── articles/
    │       │   └── page.tsx           # All content index — delegates to ArticlesClient
    │       ├── (journal)/
    │       │   ├── writing/
    │       │   │   └── [slug]/
    │       │   │       └── page.tsx   # Writing detail — EssayHero + PortableTextRenderer
    │       │   └── mixed-media/
    │       │       └── [slug]/
    │       │           └── page.tsx   # Mixed media detail — same layout as writing
    │       └── (visual)/
    │           ├── photography/
    │           │   └── [slug]/
    │           │       └── page.tsx   # Photography detail — optional cover hero + image grid
    │           └── videography/
    │               └── [slug]/
    │                   └── page.tsx   # Videography detail — no placeholder data exists
    │
    ├── components/
    │   ├── articles/
    │   │   └── ArticlesClient.tsx     # 'use client'; filter + featured card (grid) + 2-col grid
    │   ├── content/
    │   │   ├── index.ts
    │   │   ├── EssayHero.tsx          # Hero block for writing/mixed-media detail pages
    │   │   ├── ImageBlock.tsx         # Portable Text image renderer
    │   │   ├── PortableTextRenderer.tsx
    │   │   ├── PullQuote.tsx
    │   │   └── VideoBlock.tsx         # 'use client'; Vimeo embed
    │   ├── home/
    │   │   └── HeroSection.tsx        # 'use client'; GSAP parallax hero for homepage
    │   ├── layout/
    │   │   ├── index.ts
    │   │   ├── SiteHeader.tsx         # 'use client'; fixed nav, scroll-aware, dark-page aware
    │   │   ├── SiteNav.tsx            # Legacy nav component — not imported by SiteHeader; verify before deleting
    │   │   ├── SiteFooter.tsx         # Simple footer with nav links
    │   │   └── PageWrapper.tsx        # Generic content width wrapper utility
    │   ├── map/
    │   │   ├── index.ts
    │   │   ├── MapLoader.tsx          # 'use client'; dynamic import wrapper — DO NOT TOUCH
    │   │   └── MapView.tsx            # MapLibre GL — SSR disabled — DO NOT TOUCH
    │   ├── navigation/
    │   │   ├── index.ts               # [STUB]
    │   │   └── ContentCard.tsx        # Card component — not used by ArticlesClient; may be orphaned
    │   ├── photography/
    │   │   └── index.ts               # [STUB]
    │   └── ui/
    │       └── index.ts               # [STUB]
    │
    └── lib/
        ├── sanity.ts                  # Re-exports client + all queries
        ├── sanityImage.ts             # @sanity/image-url builder (default export deprecated; works)
        ├── placeholders.ts            # 6 placeholder items + PLACEHOLDER_WRITING + PLACEHOLDER_PHOTO_SERIES
        ├── metadata.ts                # Shared metadata helpers
        └── utils.ts                   # cn() (clsx + tailwind-merge), formatDate()
```

---

## 5. DESIGN SYSTEM — NON-NEGOTIABLES

DESIGN_SYSTEM.md does not exist. All values below are extracted from `src/app/globals.css` and enforced in code.

### Colour tokens

| Token | Hex | Usage rule |
|---|---|---|
| `--color-paper` | `#f8f4ef` | Default page background (light pages) |
| `--color-ink` | `#18181b` | Default text; also dark-page background |
| `--color-ink-muted` | `#7a7067` | Secondary text, metadata, captions |
| `--color-ink-faint` | `#b8b3ac` | Disabled states, dividers |
| `--color-surface` | `#efece6` | Card backgrounds on light pages |
| `--color-border` | `#ddd9d2` | Borders and dividers on light pages |
| `--color-accent` | `#453e36` | **Interactive states only — hover, active, focus. Never decorative.** |

Dark pages (articles, all detail pages) use these exact values, inline via `style={{}}` or Tailwind arbitrary values:

| Purpose | Value |
|---|---|
| Page background | `#18181b` |
| Primary text | `#f8f4ef` |
| Metadata / secondary text | `#a09890` |
| Borders | `rgba(248, 244, 239, 0.12)` |
| Card surface | `rgba(255, 255, 255, 0.04)` |

### Typefaces

| Face | CSS variable | Fallback stack | Usage domain |
|---|---|---|---|
| Lyon Text | `--font-serif` | `Georgia, serif` | All editorial text: headings, body copy, article titles, nav wordmark |
| Suisse Int'l | `--font-sans` | `'Helvetica Neue', Arial, sans-serif` | All UI chrome: nav links, category labels, metadata, captions, buttons, filter tabs |

Font files (`Lyon_Regular.ttf`, `SuisseIntl_Light.ttf`) are present in `public/fonts/` and declared via `@font-face` at the top of `globals.css`. No `next/font/local` is used — the CSS variables reference the font families by name.

**Rule:** Any text that is part of the content (article descriptions, titles, body) must use `font-serif`. Any text that is navigation, UI chrome, or labelling must use `font-sans`.

### Body text specifications

```
font-family: var(--font-serif)
font-size:   var(--text-lg)  → clamp(1.1rem, 1rem + 0.5vw, 1.25rem)
line-height: var(--leading-relaxed)  → 1.7
max-width:   var(--content-max-width)  → 740px
```

Applied via `.article-body` class. First paragraph gets a drop-cap via `::first-letter` (4.5em, float left, `--color-accent`).

### Fluid type scale

```
--text-xs:      clamp(0.7rem,   0.65rem + 0.25vw, 0.75rem)
--text-sm:      clamp(0.85rem,  0.8rem  + 0.25vw, 0.9rem)
--text-base:    clamp(1rem,     0.95rem + 0.25vw, 1.0625rem)
--text-lg:      clamp(1.1rem,   1rem    + 0.5vw,  1.25rem)
--text-xl:      clamp(1.25rem,  1.1rem  + 0.75vw, 1.5rem)
--text-2xl:     clamp(1.5rem,   1.2rem  + 1.5vw,  2rem)
--text-3xl:     clamp(2rem,     1.5rem  + 2.5vw,  3rem)
--text-4xl:     clamp(2.5rem,   1.8rem  + 3.5vw,  4.5rem)
--text-display: clamp(3rem,     2rem    + 5vw,    7rem)
```

### Animation rules

```
--duration-instant: 100ms
--duration-fast:    200ms   ← hover transitions
--duration-normal:  350ms
--duration-slow:    600ms   ← entrance animations
--duration-slower:  900ms

--ease-default: cubic-bezier(0.4, 0, 0.2, 1)
--ease-in:      cubic-bezier(0.4, 0, 1, 1)
--ease-out:     cubic-bezier(0, 0, 0.2, 1)
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1)
```

Homepage entrance sequence (CSS, no JS timers):
- Nav links: `animation-delay: 600ms`, `animation-duration: 500ms`, `animate-fade-up`
- Hero image: `animation-delay: 400ms`, `animation-duration: 800ms`, `animate-fade-in`
- Hero text stack: `animation-delay: 800ms`, `animation-duration: 600ms`, `animate-fade-up`

All animation must be wrapped in `prefers-reduced-motion: reduce` guard. `globals.css` already disables `.animate-fade-up` and `.animate-fade-in` globally. GSAP checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at the top of its `useEffect`.

### Spacing (8-point grid)

```
--space-1: 0.25rem    --space-12: 3rem
--space-2: 0.5rem     --space-16: 4rem
--space-3: 0.75rem    --space-20: 5rem
--space-4: 1rem       --space-24: 6rem
--space-5: 1.25rem    --space-32: 8rem
--space-6: 1.5rem     --space-40: 10rem
--space-8: 2rem       --space-48: 12rem
--space-10: 2.5rem
```

Content widths:
```
--content-max-width:  740px    ← article body column
--content-wide-width: 1100px   ← video embeds, wide layouts
--content-full-width: 1440px   ← page container cap
--content-padding-x:  clamp(1rem, 4vw, 3rem)
```

### Colophon rule

No colophon convention is documented anywhere in the codebase. Do not invent one.

---

## 6. CONTENT TYPES

Derived from Sanity schemas and page implementations. No DESIGN_SYSTEM.md exists.

### Writing (`writing`) — Pure Writing
URL pattern: `/writing/[slug]`
Sanity file: `sanity/schemas/documents/essay.ts` (exports `writing`)
Fields: `title`, `slug`, `publishedAt`, `description`, `coverImage` (with hotspot + alt), `body` (portableText), `location`, `coordinates`, `readingTime`, `tags`, `seo`
Layout: dark background (`#18181b`), nav clearance `clamp(5rem, 10vh, 8rem)`. `EssayHero` component (title, description, metadata, optional cover image) followed by `PortableTextRenderer` in a `740px` max-width column. Drop-cap on first paragraph via `.article-body::first-letter`.

### Mixed Media (`mixedMedia`) — Writing + Visual
URL pattern: `/mixed-media/[slug]`
Sanity file: `sanity/schemas/documents/editorial.ts` (exports `mixedMedia`)
Fields: superset of writing fields plus `images[]` (imageBlock with `description`), `videos[]` (videoBlock with `description`), `photographyCredit`
Layout: identical to writing — `EssayHero` + `PortableTextRenderer`. Dark background. Same nav clearance.

### Photography (`photography`) — Pure Visual
URL pattern: `/photography/[slug]`
Sanity file: `sanity/schemas/documents/photoSeries.ts` (exports `photography`)
Fields: `title`, `slug`, `publishedAt`, `description`, `coverImage`, `images[]` (imageBlock with `description` + metadata), `location`, `coordinates`, `tags`, `displayMode`, `seo`
Layout: optional full-bleed cover image, followed by image grid. Dark background (`#18181b`). Nav clearance: `clamp(5rem, 10vh, 8rem)`.

### Videography (`videography`) — Pure Video
URL pattern: `/videography/[slug]`
Sanity file: `sanity/schemas/documents/videography.ts` (exports `videography`)
Fields: `title`, `slug`, `publishedAt`, `description`, `coverImage`, `videos[]` (videoBlock with `description`), `location`, `coordinates`, `tags`, `seo`
Layout: dark background. Nav clearance. **No placeholder data exists for this type** — the detail page will 404 for any slug until real Sanity content is published.

---

## 7. SANITY CMS STATUS

- **Connected:** yes. Project ID `8p5lsu79`, dataset `production`.
- **Real content:** none. All articles visible on the site are placeholder data hardcoded in `src/lib/placeholders.ts`.
- **Placeholder strategy:** every page wraps Sanity fetches in `try/catch`. On failure or empty result, falls back to hardcoded placeholders. Placeholder slugs begin with `_placeholder-`.
- **ISR webhook:** not configured. Publishing in Sanity will not automatically update the live site. The endpoint `/api/revalidate` exists but no webhook is set up in Sanity → API → Webhooks, and `SANITY_WEBHOOK_SECRET` is not set in Vercel env vars.
- **Schema changes:** document type names were updated in a recent session. Old file names remain (legacy) but exported type names are now correct.

### Document schemas

| Schema type name | File | Purpose |
|---|---|---|
| `writing` | `sanity/schemas/documents/essay.ts` | Longform travel writing |
| `mixedMedia` | `sanity/schemas/documents/editorial.ts` | Writing + photos/videos |
| `photography` | `sanity/schemas/documents/photoSeries.ts` | Photography series |
| `videography` | `sanity/schemas/documents/videography.ts` | Videography |
| `author` | `sanity/schemas/documents/author.ts` | Author profile — not used in frontend |
| `siteSettings` | `sanity/schemas/singletons/siteSettings.ts` | Global singleton — not used in frontend |

### Object schemas

| Schema | File | Purpose |
|---|---|---|
| `portableText` | `sanity/schemas/objects/portableText.ts` | Rich text body field |
| `imageBlock` | `sanity/schemas/objects/imageBlock.ts` | Image with alt, caption, and description |
| `videoBlock` | `sanity/schemas/objects/videoBlock.ts` | Vimeo embed with title and description |
| `pullQuote` | `sanity/schemas/objects/pullQuote.ts` | Pull-quote block |
| `seoFields` | `sanity/schemas/objects/seoFields.ts` | SEO meta fields |

### GROQ queries (all in `sanity/lib/queries.ts`)

`ALL_WRITING_QUERY`, `WRITING_QUERY`, `WRITING_SLUGS_QUERY`,
`ALL_MIXED_MEDIA_QUERY`, `MIXED_MEDIA_QUERY`, `MIXED_MEDIA_SLUGS_QUERY`,
`ALL_PHOTOGRAPHY_QUERY`, `PHOTOGRAPHY_QUERY`, `PHOTOGRAPHY_SLUGS_QUERY`,
`ALL_VIDEOGRAPHY_QUERY`, `VIDEOGRAPHY_QUERY`, `VIDEOGRAPHY_SLUGS_QUERY`,
`ALL_CONTENT_QUERY` (used by homepage + articles index),
`MAP_CONTENT_QUERY` (used by map page),
`SITE_SETTINGS_QUERY`

All queries use `description` (not `excerpt`) — this is the correct field name in all schemas.

---

## 8. WHAT HAS BEEN BUILT — CURRENT STATE

### Pages

| Page | Route | Status |
|---|---|---|
| Homepage | `/` | **Built.** Hero (full-viewport, GSAP parallax, no cover image fallback is a 404 — see issues), 3-column portrait card grid (up to 6 items), hover overlay with location + date, VIEW ALL link, fade-in entrance sequence. |
| Articles | `/articles` | **Built.** Dark background (`#18181b`). Filter bar: ALL / Writing / Photography / Mixed Media / Videography (fade transition 200ms out). Featured card: CSS grid `3fr 2fr`, `max-w-[1280px]` wrapper. 2-column grid for remaining items with 16:9 images. |
| Writing detail | `/writing/[slug]` | **Built.** Dark background. Nav clearance `clamp(5rem, 10vh, 8rem)`. `EssayHero` + `.article-body` + `PortableTextRenderer`. Placeholder data exists for `_placeholder-atlas` and `_placeholder-train`. |
| Mixed-media detail | `/mixed-media/[slug]` | **Built.** Identical layout to writing detail. Placeholder data for `_placeholder-nocamera` and `_placeholder-medina`. |
| Photography detail | `/photography/[slug]` | **Built.** Dark background. Optional full-bleed cover hero. Image grid. Placeholder data for `_placeholder-harbour` and `_placeholder-riads`. |
| Videography detail | `/videography/[slug]` | **Built but incomplete.** Dark background. Nav clearance. **No placeholder data** — any slug will 404 until real Sanity content exists. |
| Map | `/map` | **Built. Do not touch.** MapLibre GL via dynamic import (SSR disabled). Shows empty map when Sanity has no geo content. |
| About | `/about` | **Stub.** Heading and two lines of placeholder copy. Light background. |
| Contact | `/contact` | **Stub.** Heading and placeholder copy. Light background. |
| Studio | `/studio` | **Built.** Embedded Sanity Studio with all four content type schemas. |
| Not Found | `/_not-found` | **Built.** |

### Components

| Component | File | Notes |
|---|---|---|
| `SiteHeader` | `components/layout/SiteHeader.tsx` | Fixed, z-50. Transparent on homepage (until 90% scroll) and dark pages. Dark-page aware: white text on `/articles`, `/writing/*`, `/photography/*`, `/mixed-media/*`, `/videography/*`. Wordmark (`ARMAN'S WANDERINGS`) in `font-serif` (Lyon Text). Nav links in `font-sans` (Suisse Int'l). |
| `SiteFooter` | `components/layout/SiteFooter.tsx` | Simple footer with nav links. |
| `SiteNav` | `components/layout/SiteNav.tsx` | Legacy — not imported by `SiteHeader`. Do not delete without verifying nothing imports it. |
| `PageWrapper` | `components/layout/PageWrapper.tsx` | Generic content width wrapper. |
| `HeroSection` | `components/home/HeroSection.tsx` | `'use client'`. GSAP ScrollTrigger parallax (dynamic import). Falls back to `/images/hero-placeholder.jpg` — **this file does not exist, causing a 404**. Top + bottom gradient overlays. Category label (`font-sans`), title (`font-serif`), description (`font-serif italic font-light`), CTA button. |
| `ArticlesClient` | `components/articles/ArticlesClient.tsx` | `'use client'`. Dark page. Featured card uses CSS grid `md:grid-cols-[3fr_2fr]`. Remaining items in 2-col grid. Filter state with 200ms fade. |
| `EssayHero` | `components/content/EssayHero.tsx` | Hero block for writing and mixed-media detail pages. Accepts `title`, `description`, `publishedAt`, `location`, `tags`, `coverImage`. |
| `ImageBlock` | `components/content/ImageBlock.tsx` | Portable Text custom image renderer via `next/image`. |
| `PortableTextRenderer` | `components/content/PortableTextRenderer.tsx` | Maps Sanity block content to React components. |
| `PullQuote` | `components/content/PullQuote.tsx` | Pull-quote Portable Text block renderer. |
| `VideoBlock` | `components/content/VideoBlock.tsx` | `'use client'`. Vimeo embed with `aspect-video` wrapper. |
| `ContentCard` | `components/navigation/ContentCard.tsx` | Card component. Not used by `ArticlesClient`. May be orphaned — verify before deleting. |
| `MapLoader` | `components/map/MapLoader.tsx` | `'use client'`. Dynamic import wrapper for `MapView`. **Do not touch.** |
| `MapView` | `components/map/MapView.tsx` | MapLibre GL map with type-based marker colours. **Do not touch.** |

### Stub index files (empty barrels — do not mistake for implemented modules)

- `src/components/photography/index.ts`
- `src/components/ui/index.ts`
- `src/components/navigation/index.ts`

---

## 9. KNOWN REMAINING ISSUES

1. **Hero image missing.** `public/images/hero-placeholder.jpg` does not exist and the directory `public/images/` does not exist either. `HeroSection` falls back to `/images/hero-placeholder.jpg` — this 404s. The homepage hero background is invisible until a real Sanity cover image is present or the placeholder file is created.

2. **Articles page featured card — text cut off on right edge.** The featured card text column (`title`, `description`, `VIEW` button) is cut off at the right side of the viewport at ~1366px screen widths (MacBook Air). A fix was pushed in the most recent commit: `max-w-[1280px]` wrapper and `grid md:grid-cols-[3fr_2fr]` layout. **Verify on the live site after the next Vercel deployment.**

3. **ISR webhook not configured.** Publishing content in Sanity will not automatically update the live site. To fix: (a) add a webhook in Sanity → API → Webhooks pointing to `https://wandering-website-blush.vercel.app/api/revalidate`, (b) generate a secret and add it as `SANITY_WEBHOOK_SECRET` in both `.env.local` and Vercel environment variables.

4. **`NEXT_PUBLIC_SITE_URL` not set.** The root layout metadata base URL falls back to `'https://yourdomain.com'`. Set `NEXT_PUBLIC_SITE_URL=https://wandering-website-blush.vercel.app` in Vercel environment settings.

5. **Videography detail page has no placeholder data.** Navigating to `/videography/anything` will 404. This is expected until real Sanity content is published, but it means the filter tab on articles page will show videography items in the index (if any exist) but clicking through will always 404.

6. **About and Contact pages are stubs.** No design work has been done on these pages — they render heading and placeholder text only.

7. **`SiteNav.tsx` is likely unused.** It exists in `components/layout/` and is exported from `layout/index.ts`, but `SiteHeader` does not import it. Verify before deleting.

8. **`ContentCard` component may be orphaned.** `ArticlesClient` builds card markup inline. Verify whether any page imports `ContentCard` before removing.

9. **Lenis, Framer Motion, and PhotoSwipe are installed but unwired.** These packages are in `package.json` with no usage in the codebase. They represent planned functionality.

10. **`author` and `siteSettings` Sanity schemas defined but unused in frontend.** No queries fetch author data; no component renders it.

11. **Stale git branches.** `claude/happy-feynman-CICCs` and `claude/magical-newton-MB2gD` can be deleted on GitHub — all work has been merged to `main`.

12. **`@sanity/image-url` deprecation warning.** The default export is deprecated; `createImageUrlBuilder` should be used instead. This is a warning only — the site builds and runs correctly.

---

## 10. WHAT NOT TO TOUCH

Do not modify these files unless the task explicitly requires it:

- `src/app/(site)/map/page.tsx` and all files under `src/components/map/`
- `src/app/(site)/about/page.tsx`
- `src/app/(site)/contact/page.tsx`
- `src/app/studio/[[...index]]/page.tsx`
- `src/app/api/revalidate/route.ts`
- All files under `sanity/schemas/` — schema changes require careful coordination with any published content
- `sanity/sanity.config.ts` and `sanity/sanity.cli.ts`
- `CLAUDE.md` and `AGENTS.md`
- `tsconfig.json` — path aliases are correctly set; do not alter
- `next.config.ts` — do not add redirects, rewrites, or image domains without explicit instruction
- `src/lib/utils.ts` — stable utility; do not modify
- `src/lib/metadata.ts` — stable; do not modify

---

## 11. CONVENTIONS — ALWAYS ENFORCE

- [ ] **Import alias:** use `@/` for all `src/` imports. Never use relative `../../` paths crossing directory roots.
- [ ] **No `any` types.** TypeScript strict mode. Use proper types or `unknown` with narrowing.
- [ ] **No inline `style={{}}` props** except for the established dark-page colour pattern already present in `ArticlesClient.tsx`, detail pages, and `HeroSection.tsx`. New dark-page elements must use these exact values: `#18181b`, `#f8f4ef`, `#a09890`, `rgba(248,244,239,0.12)`, `rgba(255,255,255,0.04)`.
- [ ] **No hardcoded colour or spacing values** outside the dark-page exception above. Light-page styling uses Tailwind token classes (`bg-paper`, `text-ink`, etc.).
- [ ] **No `console.log` in finished code.**
- [ ] **Server Components by default.** Add `'use client'` only when the component uses browser APIs, React hooks, or event handlers. Keep client components as leaf nodes.
- [ ] **`next/image` for all images.** No `<img>` tags. No exceptions.
- [ ] **All animations wrapped in `prefers-reduced-motion`.** CSS animations: handled globally in `globals.css`. GSAP: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at the top of `useEffect` before setting up any tween.
- [ ] **`--color-accent` (`#453e36`) for interactive states only.** Never decorative.
- [ ] **No new npm packages** without explicit instruction from the user.
- [ ] **Tailwind v4 config is `@theme inline {}` in `globals.css`.** Do not create `tailwind.config.ts`. Do not use `@apply` with non-existent utilities.
- [ ] **`params` is a Promise in Next.js 16.2.7.** Always `const { slug } = await params;` — never destructure directly.
- [ ] **`generateStaticParams` and `generateMetadata` Sanity fetches must be wrapped in `try/catch`** to prevent build failures from CORS errors.
- [ ] **GSAP ScrollTrigger must be dynamically imported inside `useEffect`**, never at module top level.
- [ ] **Font rule:** `font-serif` (Lyon Text) for all editorial/content text. `font-sans` (Suisse Int'l) for all nav, UI, labels, captions, buttons, metadata.
- [ ] **No comments that describe what the code does.** Only comments explaining a non-obvious constraint, invariant, or workaround.

---

## 12. HOW TO START A NEW SESSION

Copy and send this as the first message to a new Claude Code session:

> "Read CLAUDE.md and SESSION_HANDOFF.md in the project root before doing anything. Note: ARCHITECTURE.md and DESIGN_SYSTEM.md do not exist — SESSION_HANDOFF.md contains all extracted design system values and current state. Do not write a single line of code until you have read both files. Then confirm you have read them and state what you understand the current state of the site to be before we begin."
