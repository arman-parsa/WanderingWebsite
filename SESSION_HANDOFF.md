# SESSION HANDOFF — ARMAN'S WANDERINGS

> **Read ARCHITECTURE.md, CLAUDE.md, and this file before touching any code.**
> DESIGN_SYSTEM.md does not currently exist in the repository. All design system
> facts in this document are extracted directly from `src/app/globals.css` and the
> existing component implementations — they are accurate as of the last commit.

---

## 1. WHAT THIS PROJECT IS

ARMAN'S WANDERINGS is a personal editorial archive: travel writing, photography, and mixed-media pieces by Arman Parsa. It is not a blog and not a portfolio. The emotional register is unhurried and print-influenced — the site should feel like a well-edited magazine that happens to exist on the web. Every layout and typographic decision privileges the work over the interface.

Content is organised into three types: essays (pure text, longform), photo series (image-forward, minimal text), and editorials (mixed writing and visual). The site uses a dark ink-on-paper palette for light pages and a deep warm-black for content pages. The nav is always present but never intrusive — transparent over hero imagery, semi-opaque once scrolled.

---

## 2. CURRENT STACK

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js App Router | 16.2.7 — **not standard Next.js**; read `node_modules/next/dist/docs/` before writing Next.js code; `params` is `Promise<{ slug: string }>` and must be awaited |
| Language | TypeScript | `^5`, strict mode |
| CMS | Sanity v5 | `^5.30.0` via `next-sanity ^13.0.11`; project ID `8p5lsu79`; **connected but contains no real content** |
| Hosting | Vercel | Production deploys from `main`; feature work on `claude/magical-newton-MB2gD` |
| Styling | Tailwind CSS v4 | `^4`; configured via `@theme inline {}` in `globals.css` — **no `tailwind.config.ts` exists** |
| Animation | GSAP `^3.15.0` | ScrollTrigger imported dynamically inside `useEffect` only (SSR safety); `prefers-reduced-motion` guard required |
| Animation | CSS keyframes | `fade-up`, `fade-in` defined in `globals.css`; used for homepage entrance sequence |
| Scroll | Lenis `^1.3.23` | Installed; not yet wired up |
| Maps | MapLibre GL `^5.24.0` + react-map-gl `^8.1.1` | Used on `/map` page via dynamic import (SSR disabled) |
| Photography lightbox | PhotoSwipe `^5.4.4` | Installed; not yet wired up |
| Motion library | Framer Motion `^12.40.0` | Installed; not yet used |
| Font loading | Fonts declared in CSS custom properties | `--font-serif: 'Lyon Text', Georgia, serif`; `--font-sans: 'Suisse Int\'l', 'Helvetica Neue', Arial, sans-serif`; **font files are not present** — `public/fonts/` contains only `.gitkeep`; system fallbacks render until files are added |
| Import aliases | `@/` → `./src/*`; `@sanity/` → `./sanity/*` | Defined in `tsconfig.json` |
| Image optimisation | `next/image` | Required for all images, no exceptions |

---

## 3. LIVE SITE

**https://wandering-website-blush.vercel.app**

Production branch: `main`
Active development branch: `claude/magical-newton-MB2gD`

---

## 4. REPOSITORY STRUCTURE

Accurate as of current commit. Files marked `[STUB]` contain only a comment or empty export.

```
WanderingWebsite/
├── AGENTS.md                          # Next.js version warning — read before writing Next.js code
├── CLAUDE.md                          # Re-exports AGENTS.md
├── README.md                          # Default create-next-app readme — not project-specific
├── SESSION_HANDOFF.md                 # This file
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
│
├── public/
│   ├── fonts/
│   │   └── .gitkeep                   # [STUB] No font files present — fallbacks active
│   └── images/
│       └── (empty)                    # Directory exists; hero-placeholder.jpg NOT present yet
│
├── sanity/                            # Sanity studio — separate from Next.js src
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   ├── lib/
│   │   ├── client.ts                  # Sanity client configuration
│   │   └── queries.ts                 # All GROQ queries
│   └── schemas/
│       ├── index.ts                   # Schema registry
│       ├── documents/
│       │   ├── essay.ts
│       │   ├── editorial.ts
│       │   ├── photoSeries.ts
│       │   └── author.ts
│       ├── objects/
│       │   ├── portableText.ts
│       │   ├── imageBlock.ts
│       │   ├── videoBlock.ts
│       │   ├── pullQuote.ts
│       │   └── seoFields.ts
│       └── singletons/
│           └── siteSettings.ts
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout — no header/footer here
    │   ├── globals.css                # Design tokens + Tailwind v4 @theme + base styles
    │   ├── favicon.ico
    │   ├── studio/
    │   │   └── [[...index]]/
    │   │       └── page.tsx           # Sanity Studio embedded at /studio
    │   ├── api/
    │   │   └── revalidate/
    │   │       └── route.ts           # Webhook revalidation endpoint
    │   └── (site)/                    # Route group: shares SiteHeader + SiteFooter layout
    │       ├── layout.tsx             # Renders SiteHeader + SiteFooter around children
    │       ├── page.tsx               # Homepage: hero + portrait grid
    │       ├── not-found.tsx
    │       ├── about/
    │       │   └── page.tsx           # Static placeholder content
    │       ├── contact/
    │       │   └── page.tsx           # Static placeholder content
    │       ├── map/
    │       │   └── page.tsx           # Geographic archive — MapLoader + MapView
    │       ├── articles/
    │       │   └── page.tsx           # All content index — delegates to ArticlesClient
    │       ├── (journal)/             # Sub-group: writing and mixed-media
    │       │   ├── writing/
    │       │   │   └── [slug]/
    │       │   │       └── page.tsx   # Essay detail page
    │       │   └── mixed-media/
    │       │       └── [slug]/
    │       │           └── page.tsx   # Editorial detail page
    │       └── (visual)/              # Sub-group: photography and videography
    │           ├── photography/
    │           │   └── [slug]/
    │           │       └── page.tsx   # Photo series detail page
    │           └── videography/
    │               └── [slug]/
    │                   └── page.tsx   # Videography detail page
    │
    ├── components/
    │   ├── articles/
    │   │   └── ArticlesClient.tsx     # 'use client'; filter + featured card + grid
    │   ├── content/
    │   │   ├── index.ts
    │   │   ├── EssayHero.tsx          # Hero block for writing/editorial detail pages
    │   │   ├── ImageBlock.tsx         # Portable Text image renderer
    │   │   ├── PortableTextRenderer.tsx # Portable Text → React
    │   │   ├── PullQuote.tsx          # Decorative pull-quote block
    │   │   └── VideoBlock.tsx         # Vimeo embed ('use client')
    │   ├── home/
    │   │   └── HeroSection.tsx        # 'use client'; GSAP parallax hero for homepage
    │   ├── layout/
    │   │   ├── index.ts
    │   │   ├── SiteHeader.tsx         # 'use client'; fixed nav, scroll-aware, dark-page aware
    │   │   ├── SiteNav.tsx            # Legacy nav component — not currently used by SiteHeader
    │   │   ├── SiteFooter.tsx         # Simple footer with nav links
    │   │   └── PageWrapper.tsx        # Generic content width wrapper
    │   ├── map/
    │   │   ├── index.ts
    │   │   ├── MapLoader.tsx          # 'use client'; dynamic import wrapper for MapView
    │   │   └── MapView.tsx            # MapLibre GL map — SSR disabled
    │   ├── navigation/
    │   │   ├── index.ts               # [STUB]
    │   │   └── ContentCard.tsx        # Card component (used by older pages; not by ArticlesClient)
    │   ├── photography/
    │   │   └── index.ts               # [STUB]
    │   └── ui/
    │       └── index.ts               # [STUB]
    │
    └── lib/
        ├── sanity.ts                  # Re-exports client + queries using @sanity/ alias
        ├── sanityImage.ts             # @sanity/image-url builder
        ├── placeholders.ts            # Hardcoded placeholder content (6 items + essay/photo stubs)
        ├── metadata.ts                # Shared metadata helpers
        └── utils.ts                   # cn() (clsx + tailwind-merge), formatDate()
```

---

## 5. DESIGN SYSTEM — NON-NEGOTIABLES

**DESIGN_SYSTEM.md does not exist in the repository.** The following is extracted verbatim from `globals.css` and enforced in code. Treat these as the authoritative source.

### Colour tokens

| Token | Hex | Usage rule |
|---|---|---|
| `--color-paper` | `#f8f4ef` | Default page background (light pages) |
| `--color-ink` | `#1c1814` | Default text; also dark-page background |
| `--color-ink-muted` | `#7a7067` | Secondary text, metadata, captions |
| `--color-ink-faint` | `#b8b3ac` | Disabled states, dividers |
| `--color-surface` | `#efece6` | Card backgrounds on light pages |
| `--color-border` | `#ddd9d2` | Borders and dividers on light pages |
| `--color-accent` | `#453e36` | **Interactive states only — hover, active, focus. Never decorative.** |

Dark pages (articles, article detail) use raw hex values not mapped to tokens:
- Background: `#1c1814` (same as `--color-ink`)
- Primary text: `#f8f4ef` (same as `--color-paper`)
- Secondary text / metadata: `#a09890`
- Borders: `rgba(248, 244, 239, 0.12)`
- Card surface: `rgba(255, 255, 255, 0.04)`

### Typefaces

| Face | CSS variable | Fallback stack | Usage domain |
|---|---|---|---|
| Lyon Text | `--font-serif` | `Georgia, serif` | All editorial text: headings, body, nav wordmark |
| Suisse Int'l | `--font-sans` | `'Helvetica Neue', Arial, sans-serif` | All UI: nav links, labels, metadata, captions, buttons |

**Font files are not present.** `public/fonts/` is empty. Both typefaces fall back to system fonts until files are added. Do not change the font stack variables — add files to `public/fonts/` and wire via `next/font/local` when available.

### Body text specifications

```
font-family: var(--font-serif)
font-size:   var(--text-lg)  → clamp(1.1rem, 1rem + 0.5vw, 1.25rem)
line-height: var(--leading-relaxed)  → 1.7
max-width:   var(--content-max-width)  → 740px
```

Applied via `.article-body` class. First paragraph gets a drop-cap via `::first-letter` (4.5em, float left, `--color-accent`).

### Fluid type scale (all tokens)

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
- Hero text: `animation-delay: 800ms`, `animation-duration: 600ms`, `animate-fade-up`

All animation must be wrapped in `prefers-reduced-motion: reduce` guard. The `globals.css` already disables `.animate-fade-up` and `.animate-fade-in` under this media query. GSAP animations check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at the top of their `useEffect`.

### Spacing (8-point grid)

```
--space-1: 0.25rem   --space-8:  2rem
--space-2: 0.5rem    --space-10: 2.5rem
--space-3: 0.75rem   --space-12: 3rem
--space-4: 1rem      --space-16: 4rem
--space-5: 1.25rem   --space-20: 5rem
--space-6: 1.5rem    --space-24: 6rem
                     --space-32: 8rem
                     --space-40: 10rem
                     --space-48: 12rem
```

Content widths:
```
--content-max-width:  740px    ← article body column
--content-wide-width: 1100px   ← video embeds, wide layouts
--content-full-width: 1440px   ← page container cap
--content-padding-x:  clamp(1rem, 4vw, 3rem)
```

### The colophon rule

No colophon convention is documented. This section cannot be completed without DESIGN_SYSTEM.md. Do not invent one.

---

## 6. CONTENT TYPES

No DESIGN_SYSTEM.md exists to extract from. The following is derived from the Sanity schemas and page implementations.

### Essay (`essay`) — Pure Writing
URL pattern: `/writing/[slug]`
Layout: `EssayHero` (title, excerpt, metadata, optional cover image) followed by `PortableTextRenderer` in a `740px` max-width column. Drop-cap on first paragraph. Dark background (`#1c1814`), light text (`#f8f4ef`). Nav clearance: `clamp(5rem, 10vh, 8rem)`.
Sanity fields: `title`, `slug`, `publishedAt`, `excerpt`, `coverImage` (with hotspot + alt), `body` (portableText), `location`, `coordinates`, `readingTime`, `tags`, `seo`.

### Editorial (`editorial`) — Writing + Visual
URL pattern: `/mixed-media/[slug]`
Layout: identical to Essay — `EssayHero` + `PortableTextRenderer`. The schema additionally supports `photographyCredit`, `heroVideo` (videoBlock), and `relatedSeries`. Dark background, same nav clearance.
Sanity fields: superset of essay fields plus `photographyCredit`, `heroVideo`, `relatedSeries`.

### Photo Series (`photoSeries`) — Pure Visual
URL pattern: `/photography/[slug]`
Layout: optional full-bleed cover image hero, followed by a 3-column image grid with `aspect-[4/3]` cells and hover scale. Dark background (`#1c1814`). Nav clearance: `clamp(5rem, 10vh, 8rem)`.
Sanity fields: `title`, `slug`, `publishedAt`, `coverImage`, `location`, `coordinates`, `description`, `images` (array of imageBlock), `film` (videoBlock), `displayMode`, `seo`.

---

## 7. SANITY CMS STATUS

- **Connected:** yes. Sanity project ID `8p5lsu79`.
- **Real content:** none. All articles visible on the site are placeholder data hardcoded in `src/lib/placeholders.ts`.
- **Placeholder strategy:** Every page that fetches from Sanity wraps the fetch in `try/catch`. If the fetch fails (CORS during build) or returns nothing, placeholder data is used. Placeholder slugs begin with `_placeholder-`.
- **Schema changes in recent sessions:** none. Schemas are stable.

### Document schemas (4 total in registry, 3 content types + 1 support)

| Schema | File | Purpose |
|---|---|---|
| `essay` | `sanity/schemas/documents/essay.ts` | Longform travel writing |
| `editorial` | `sanity/schemas/documents/editorial.ts` | Mixed writing + visual |
| `photoSeries` | `sanity/schemas/documents/photoSeries.ts` | Photography series |
| `author` | `sanity/schemas/documents/author.ts` | Author profile (not yet used in frontend) |
| `siteSettings` | `sanity/schemas/singletons/siteSettings.ts` | Global singleton (not yet used in frontend) |

### Object schemas (5 total)

| Schema | File | Purpose |
|---|---|---|
| `portableText` | `sanity/schemas/objects/portableText.ts` | Rich text body field |
| `imageBlock` | `sanity/schemas/objects/imageBlock.ts` | Image with alt + caption |
| `videoBlock` | `sanity/schemas/objects/videoBlock.ts` | Vimeo embed |
| `pullQuote` | `sanity/schemas/objects/pullQuote.ts` | Pull-quote block |
| `seoFields` | `sanity/schemas/objects/seoFields.ts` | SEO meta fields |

---

## 8. WHAT HAS BEEN BUILT — CURRENT STATE

### Pages

| Page | Route | Status |
|---|---|---|
| Homepage | `/` | **Built.** Hero (full-viewport, GSAP parallax, local image fallback), portrait card grid (6 items, 3-col), fade-in entrance sequence, VIEW ALL link. |
| Articles | `/articles` | **Built.** Dark background (`#1c1814`). Featured card (first item, 60/40 image-text split, `min-height: 480px`). 2-column grid for remaining items (16:9 images, dark card surface). Client-side filter: ALL / Writing / Photography / Mixed Media (fade transition 200ms out / 300ms in). |
| Writing detail | `/writing/[slug]` | **Built.** Dark background. Nav clearance `clamp(5rem, 10vh, 8rem)`. `EssayHero` + `PortableTextRenderer`. Placeholder data for `_placeholder-atlas` and `_placeholder-train`. |
| Mixed-media detail | `/mixed-media/[slug]` | **Built.** Same as writing detail. Placeholder data for `_placeholder-nocamera` and `_placeholder-medina`. |
| Photography detail | `/photography/[slug]` | **Built.** Dark background. Nav clearance. Optional full-bleed cover hero. 3-col image grid. Placeholder data for `_placeholder-harbour` and `_placeholder-riads`. |
| Videography detail | `/videography/[slug]` | **Built.** Dark background. Nav clearance. No placeholder data (no videography placeholder items). |
| Map | `/map` | **Built. Do not touch.** Fetches Sanity geo data; renders MapLibre GL map with MapLoader (dynamic import, SSR disabled). Shows empty map when Sanity has no content. |
| About | `/about` | **Stub.** Renders heading and a few lines of placeholder copy. Light background. |
| Contact | `/contact` | **Stub.** Renders heading and placeholder copy. Light background. |
| Not Found | `/_not-found` | **Built.** Standard 404 page. |
| Studio | `/studio` | **Built.** Embedded Sanity Studio. |

### Components

| Component | Location | Notes |
|---|---|---|
| `SiteHeader` | `components/layout/SiteHeader.tsx` | Fixed nav. Scroll-aware (transparent → opaque). Dark-page aware (white text on `/articles`, `/writing/*`, `/photography/*`, `/mixed-media/*`, `/videography/*`). Wordmark in `font-serif` (Lyon Text). Nav links fade-up animation. |
| `SiteFooter` | `components/layout/SiteFooter.tsx` | Simple footer with nav links. |
| `SiteNav` | `components/layout/SiteNav.tsx` | **Legacy.** Exists but is not used by `SiteHeader`. Do not delete — check before removing. |
| `PageWrapper` | `components/layout/PageWrapper.tsx` | Generic content width wrapper utility. |
| `HeroSection` | `components/home/HeroSection.tsx` | 'use client'. GSAP ScrollTrigger parallax. Falls back to `/images/hero-placeholder.jpg` when no Sanity cover image. Top + bottom gradients. Category label, title, excerpt, CTA. |
| `ArticlesClient` | `components/articles/ArticlesClient.tsx` | 'use client'. All articles logic: dark bg, featured card, grid, filter state. |
| `EssayHero` | `components/content/EssayHero.tsx` | Hero block for writing/editorial detail pages. |
| `ImageBlock` | `components/content/ImageBlock.tsx` | Portable Text custom image renderer. |
| `PortableTextRenderer` | `components/content/PortableTextRenderer.tsx` | Maps Sanity block content to React. |
| `PullQuote` | `components/content/PullQuote.tsx` | Pull-quote Portable Text block. |
| `VideoBlock` | `components/content/VideoBlock.tsx` | 'use client'. Vimeo embed with `aspect-video`. |
| `ContentCard` | `components/navigation/ContentCard.tsx` | Card component. Not used by `ArticlesClient`; may be used elsewhere. |
| `MapLoader` | `components/map/MapLoader.tsx` | 'use client'. Dynamic import wrapper. |
| `MapView` | `components/map/MapView.tsx` | MapLibre GL. SSR disabled. |

### Stub index files (empty — do not mistake for implemented modules)

- `src/components/photography/index.ts`
- `src/components/ui/index.ts`
- `src/components/navigation/index.ts`

---

## 9. KNOWN REMAINING ISSUES

1. **Hero image missing.** `public/images/hero-placeholder.jpg` does not exist. The `HeroSection` component references it as the fallback when no Sanity cover image is present. Until the file is added, the hero background will render as a broken image. The directory `public/images/` exists and is ready.

2. **Font files missing.** `public/fonts/` contains only `.gitkeep`. Lyon Text and Suisse Int'l are referenced in CSS custom properties but not loaded. All type renders in Georgia and Helvetica Neue until font files are added and wired via `next/font/local`.

3. **About and Contact pages are stubs.** Both exist and render, but contain placeholder copy only. No design work has been done on these pages.

4. **SiteNav.tsx may be unused.** `SiteNav` exists in `components/layout/` and is exported from the layout index, but `SiteHeader` (the active nav) does not import it. Its current role is unknown — verify before deleting.

5. **Lenis, Framer Motion, and PhotoSwipe are installed but unwired.** These packages are in `package.json` but have no usage in the codebase. They represent planned functionality not yet implemented.

6. **`ContentCard` component may be orphaned.** `ArticlesClient` builds its own card markup inline and does not use `ContentCard`. Verify whether any page still imports it before removing.

7. **`author` and `siteSettings` Sanity schemas are defined but not used in the frontend.** No queries fetch author data and no frontend component renders it.

8. **`NEXT_PUBLIC_SITE_URL` in root layout is not set.** The metadata base URL falls back to `'https://yourdomain.com'` if the env var is missing. This should be set to `https://wandering-website-blush.vercel.app` in Vercel environment settings.

9. **Articles page filter does not include Videography.** The filter row shows ALL / Writing / Photography / Mixed Media. A Videography type exists in the Sanity schema and routes exist at `/videography/[slug]`, but the filter label is absent from `ArticlesClient.tsx`. Items of `_type: 'photoSeries'` with a `film` field are the closest equivalent — the relationship between `photoSeries` and the videography route is not fully resolved.

10. **`@sanity/image-url` deprecation warning.** The default export is deprecated; `createImageUrlBuilder` named export should be used instead. This is a warning, not an error — the site builds and runs correctly.

---

## 10. WHAT NOT TO TOUCH

Do not modify these files or pages unless the task explicitly requires it:

- `src/app/(site)/map/page.tsx` and all map components (`MapLoader`, `MapView`)
- `src/app/(site)/about/page.tsx`
- `src/app/(site)/contact/page.tsx`
- `src/app/studio/[[...index]]/page.tsx`
- `src/app/api/revalidate/route.ts`
- All files under `sanity/schemas/` — schema changes have not been part of recent sessions and require careful coordination with any published content
- `sanity/sanity.config.ts` and `sanity/sanity.cli.ts`
- `ARCHITECTURE.md` and `CLAUDE.md`
- `tsconfig.json` — path aliases are set correctly; do not alter
- `next.config.ts` — do not add redirects, rewrites, or image domains without explicit instruction
- `src/lib/utils.ts` — stable utility; do not modify
- `src/lib/metadata.ts` — stable; do not modify

---

## 11. CONVENTIONS — ALWAYS ENFORCE

- [ ] **Import alias:** use `@/` for all `src/` imports; use `@sanity/` for all `sanity/` imports. Never use relative `../../` paths crossing directory roots.
- [ ] **No `any` types.** TypeScript strict mode. Use proper types or `unknown` with narrowing.
- [ ] **No inline styles.** All styling via Tailwind utilities or CSS custom properties. Arbitrary Tailwind values (`[animation-delay:600ms]`, `bg-[#1c1814]`) are acceptable. `style={{ }}` props are not.
- [ ] **No hardcoded colour or spacing values** outside of the exceptions already established in `ArticlesClient.tsx` (dark-page colours not in the token set). When adding new dark-page elements, match those exact hex values: `#1c1814`, `#f8f4ef`, `#a09890`, `rgba(248,244,239,0.12)`, `rgba(255,255,255,0.04)`.
- [ ] **No `console.log` in finished code.**
- [ ] **Server Components by default.** Add `'use client'` only when the component uses browser APIs, React hooks, or event handlers. Keep client components as leaf nodes — do not put `'use client'` on layouts or pages unless unavoidable.
- [ ] **`next/image` for all images.** No `<img>` tags. No exceptions.
- [ ] **All animations wrapped in `prefers-reduced-motion`.**  CSS animations: handled globally in `globals.css`. GSAP: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at the top of `useEffect` before setting up any tween.
- [ ] **`--color-accent` (`#453e36`) is for interactive states only.** Never use it as a decorative colour, background, or border.
- [ ] **No new npm packages** without explicit instruction from the user.
- [ ] **Tailwind v4 configuration is in `globals.css` via `@theme inline {}`**. Do not create `tailwind.config.ts`. Do not use `@apply` with non-existent utilities.
- [ ] **`params` in Next.js 16.2.7 is a Promise.** Always `await params` before destructuring: `const { slug } = await params;`
- [ ] **`generateStaticParams` and `generateMetadata` Sanity fetches must be wrapped in `try/catch`** to prevent build failures from CORS errors when build workers cannot reach Sanity.
- [ ] **GSAP ScrollTrigger must be dynamically imported inside `useEffect`**, never at module top level. `gsap` itself can be imported statically; `gsap/ScrollTrigger` cannot.
- [ ] **No comments that describe what the code does.** Only comments that explain a non-obvious constraint, invariant, or workaround.

---

## 12. HOW TO START A NEW SESSION

Copy and send this as the first message to a new Claude Code session:

> "Read ARCHITECTURE.md, CLAUDE.md, and SESSION_HANDOFF.md in the project root before doing anything. Note: DESIGN_SYSTEM.md does not exist — SESSION_HANDOFF.md section 5 contains the extracted design system. Do not write a single line of code until you have read all three. Then confirm you have read them and state what you understand the current state of the site to be before we begin."
