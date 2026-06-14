# SESSION HANDOFF — ARMAN'S WANDERINGS

> **Read CLAUDE.md and this file before touching any code.**
> ARCHITECTURE.md and DESIGN_SYSTEM.md do not currently exist in the repository.
> All design system facts below are extracted directly from `src/app/globals.css`
> and the existing component implementations — they are accurate as of the last commit.

---

## 1. WHAT THIS PROJECT IS

ARMAN'S WANDERINGS is a personal editorial archive: travel writing, photography, and mixed-media pieces by Arman Parsa. It is not a blog and not a portfolio. The emotional register is unhurried and print-influenced — the site should feel like a well-edited magazine that happens to exist on the web. Every layout and typographic decision privileges the work over the interface.

Content is organised into four types: writing (pure longform text), mixed media (writing combined with photos and/or video), photography (image-forward, minimal text), and videography (video-forward, minimal text). The site uses a dark ink-on-paper palette for light pages and a deep warm-black (`#1c1814`) for all content and article pages. The nav is always present but never intrusive — transparent over hero imagery, semi-opaque once scrolled.

---

## 2. CURRENT STACK

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js App Router | `16.2.7` — **not standard Next.js**; read `node_modules/next/dist/docs/` before writing Next.js code; `params` is `Promise<{ slug: string }>` and must be awaited |
| Language | TypeScript | `^5`, strict mode — no `any` types |
| CMS | Sanity v5 | `^5.30.0` via `next-sanity ^13.0.11`; project ID `8p5lsu79`, dataset `production`; **connected but contains no real content** |
| Hosting | Vercel | Production deploys from `main` |
| Styling | Tailwind CSS v4 | `^4`; configured via `@theme inline {}` in `globals.css` — **no `tailwind.config.ts` exists** |
| Globe | Three.js `^0.184.0` | Full custom WebGL globe on `/map`. Do not replace or refactor. |
| Font loading | CSS `@font-face` in `globals.css` | `Lyon_Regular.ttf` and `SuisseIntl_Light.ttf` present in `public/fonts/`; loaded via `@font-face` at top of `globals.css` |
| Import aliases | `@/` → `./src/*` | Defined in `tsconfig.json` |
| Image optimisation | `next/image` | Required for all images — no `<img>` tags ever |

> **Removed from active use (still installed):** MapLibre GL, react-map-gl — replaced by Three.js globe. GSAP, Lenis, Framer Motion, PhotoSwipe — installed but unwired; not used in any current component.

---

## 3. LIVE SITE

**https://wandering-website-blush.vercel.app**

Production branch: `main` — Vercel auto-deploys on every push to `main`.
Development branch convention: `claude/<session-id>` — merge to `main` when confirmed.

---

## 4. REPOSITORY STRUCTURE

Accurate as of current commit. Files marked `[STUB]` contain only a comment or empty export.

```
WanderingWebsite/
├── AGENTS.md                          # Next.js version warning — read before writing Next.js code
├── CLAUDE.md                          # Re-exports AGENTS.md via @AGENTS.md
├── README.md                          # Default create-next-app readme — not project-specific
├── SESSION_HANDOFF.md                 # This file
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── vercel.json
│
├── public/
│   ├── fonts/
│   │   ├── Lyon_Regular.ttf           # Lyon Text — serif, weight 400
│   │   └── SuisseIntl_Light.ttf       # Suisse Int'l — sans, weight 300–400
│   └── data/
│       └── ne_110m_land.json          # 252KB Natural Earth GeoJSON — used by GlobeView
│                                      # NOTE: public/images/ does NOT exist.
│
├── sanity/
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   ├── lib/
│   │   ├── client.ts
│   │   └── queries.ts                 # All GROQ queries
│   └── schemas/
│       ├── index.ts
│       ├── documents/
│       │   ├── essay.ts               # Exports `writing` type
│       │   ├── editorial.ts           # Exports `mixedMedia` type
│       │   ├── photoSeries.ts         # Exports `photography` type
│       │   ├── videography.ts         # Exports `videography` type
│       │   └── author.ts              # Exports `author` type — not used in frontend
│       ├── objects/
│       │   ├── portableText.ts
│       │   ├── imageBlock.ts
│       │   ├── videoBlock.ts
│       │   ├── pullQuote.ts
│       │   └── seoFields.ts
│       └── singletons/
│           └── siteSettings.ts        # Not used in frontend
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout — no header/footer here
    │   ├── globals.css                # @font-face + design tokens + Tailwind v4 @theme + all component CSS
    │   ├── favicon.ico
    │   ├── studio/[[...index]]/page.tsx
    │   ├── api/revalidate/route.ts    # ISR webhook endpoint
    │   └── (site)/
    │       ├── layout.tsx             # Renders SiteHeader + SiteFooter around children
    │       ├── page.tsx               # Homepage: delegates to HomepageClient
    │       ├── not-found.tsx
    │       ├── about/page.tsx         # Stub — static placeholder copy
    │       ├── contact/page.tsx       # Stub — static placeholder copy
    │       ├── map/page.tsx           # Globe page — dark bg #070b12, inset:0, delegates to GlobeLoader
    │       ├── articles/page.tsx      # Library — delegates to ExploreClient
    │       ├── (journal)/
    │       │   ├── writing/[slug]/page.tsx
    │       │   └── mixed-media/[slug]/page.tsx
    │       └── (visual)/
    │           ├── photography/[slug]/page.tsx
    │           └── videography/[slug]/page.tsx
    │
    ├── components/
    │   ├── home/
    │   │   └── HomepageClient.tsx     # ★ Full homepage — hero + article list (see section 8)
    │   ├── layout/
    │   │   ├── SiteHeader.tsx         # Fixed header wrapper h-16, z-50, overflow:visible
    │   │   ├── NavInner.tsx           # ★ All nav logic — 3-col grid, scroll, symbol (see section 8)
    │   │   ├── NavLink.tsx            # Active-underline nav anchor
    │   │   ├── SiteFooter.tsx         # SVG symbol + copyright
    │   │   ├── SiteNav.tsx            # Legacy — not imported; do not delete without checking
    │   │   └── PageWrapper.tsx        # Generic content-width wrapper
    │   ├── explore/
    │   │   └── ExploreClient.tsx      # Library page — multi-select filter pills + content grid
    │   ├── map/
    │   │   ├── index.ts               # Exports GlobeLoader + GlobeItem type
    │   │   ├── GlobeLoader.tsx        # 'use client'; dynamic import wrapper for GlobeView
    │   │   ├── GlobeView.tsx          # ★ Three.js globe — see section 8 for full spec
    │   │   └── ArticlePanel.tsx       # Slide-in panel for article pins on globe
    │   ├── articles/
    │   │   └── ArticlesClient.tsx     # (legacy articles client — may be superseded by ExploreClient)
    │   ├── content/
    │   │   ├── EssayHero.tsx
    │   │   ├── ImageBlock.tsx
    │   │   ├── PortableTextRenderer.tsx
    │   │   ├── PullQuote.tsx
    │   │   └── VideoBlock.tsx
    │   └── navigation/
    │       └── ContentCard.tsx        # Possibly orphaned — verify before deleting
    │
    └── lib/
        ├── sanity.ts
        ├── sanityImage.ts
        ├── placeholders.ts            # All placeholder data incl. PLACEHOLDER_GLOBE_ITEMS
        ├── metadata.ts
        └── utils.ts
```

---

## 5. DESIGN SYSTEM — NON-NEGOTIABLES

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

Dark pages (articles, all detail pages): `#1c1814` bg, `#f8f4ef` primary text, `#a09890` secondary, `rgba(248,244,239,0.12)` borders, `rgba(255,255,255,0.04)` card surface.

Map page background: `#070b12` (deep navy-black — distinct from dark-page ink colour).

### Typefaces

| Face | CSS variable | Usage domain |
|---|---|---|
| Lyon Text | `--font-serif` | All editorial text: headings, body copy, article titles |
| Suisse Int'l | `--font-sans` | All UI chrome: nav links, labels, metadata, captions, buttons, filters |

**Rule:** content text = `font-serif`. Navigation, UI, labelling = `font-sans`.

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

### Animation

```
--duration-fast:   200ms   --ease-default: cubic-bezier(0.4, 0, 0.2, 1)
--duration-normal: 350ms   --ease-out:     cubic-bezier(0, 0, 0.2, 1)
--duration-slow:   600ms   --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1)
```

All animation wrapped in `prefers-reduced-motion: reduce` guard. `globals.css` disables `.animate-fade-up` and `.animate-fade-in` globally.

---

## 6. CONTENT TYPES

### Writing (`writing`) — `/writing/[slug]`
Dark background. `EssayHero` + `.article-body` + `PortableTextRenderer`. Drop-cap on first paragraph.

### Mixed Media (`mixedMedia`) — `/mixed-media/[slug]`
Identical layout to writing. Superset of fields (adds `images[]`, `videos[]`).

### Photography (`photography`) — `/photography/[slug]`
Dark background. Optional full-bleed cover hero + image grid.

### Videography (`videography`) — `/videography/[slug]`
Dark background. **No placeholder data — any slug 404s until real Sanity content.**

---

## 7. SANITY STATUS

- **Connected:** yes. Project `8p5lsu79`, dataset `production`.
- **Real content:** none. All items on site are from `src/lib/placeholders.ts`.
- **ISR webhook:** not configured. Sanity publish ≠ automatic site update.
- GROQ queries in `sanity/lib/queries.ts`: `ALL_CONTENT_QUERY`, `MAP_CONTENT_QUERY`, per-type queries. All use `description` (not `excerpt`).

---

## 8. COMPONENT DEEP DIVES — KEY IMPLEMENTATIONS

### NavInner (`src/components/layout/NavInner.tsx`)

3-column CSS grid: `EARTH (left) | alchemical symbol (center) | hamburger (right)`.

**State:**
- `bodyBgActive` — MutationObserver watches `document.body.classList` for `'bg-active'` class (set by HomepageClient on article hover)
- `scrollY` — tracked via `useLayoutEffect` (fires before paint, preventing cream flash on load/navigation)
- `menuOpen` — hamburger toggle

**Logic:**
```
DARK_PAGE_PREFIXES = ['/writing', '/photography', '/mixed-media', '/videography', '/map']
isMapPage  = pathname === '/map'
isHomepage = pathname === '/'
scrolled   = scrollY > 60
onHero     = isHomepage && !scrolled
isLight    = isDarkPage || bodyBgActive || onHero
textColour = isLight ? '#f8f4ef' : '#1c1814'
bgValue    = (bodyBgActive || onHero || isMapPage) ? 'transparent'
           : isDarkPage ? 'rgba(28,24,20,0.92)'
           : 'rgba(248,244,239,0.92)'
showBlur   = !bodyBgActive && !onHero && !isMapPage
```

**Symbol scaling (Bug 2 fix):** Uses a `useRef<HTMLAnchorElement>` (`logoRef`) — transform is set via direct DOM mutation inside a `useEffect` scroll handler (bypasses React re-render batching for 60fps). `SYMBOL_SCALE_MAX = 2.0` (28px SVG → 56px at peak, within 64px nav bounds). `SYMBOL_SCALE_END = 220px`. No CSS transition on the transform — direct assignment per frame.

**Flash prevention (Bug 1 fix):** Scroll listener set up in `useLayoutEffect` (runs before paint). A second `useLayoutEffect` keyed on `pathname` re-syncs `scrollY` on every route change, preventing stale values when navigating to homepage.

**Hamburger:** Two-bar icon (`nav-hamburger-bars`) toggles to `✕`. Menu links (`LIBRARY`, `ABOUT`, `CONTACT`) appear with `.nav-menu-expanded` animation (180ms translateX). Closes on pathname change.

**Nav CSS classes in `globals.css`:** `.nav-shell`, `.nav-bg`, `.nav-bg--blur`, `.nav-inner`, `.nav-grid`, `.nav-grid-left`, `.nav-grid-center`, `.nav-grid-right`, `.nav-hamburger-btn`, `.nav-hamburger-bars`, `.nav-menu-expanded`, `.nav-close-x`, `.nav-link`, `.nav-link--active`, `.logo-link`.

---

### HomepageClient (`src/components/home/HomepageClient.tsx`)

**Z-index structure (Bug 3 fix):**
```
z-50  fixed nav header
z-3   article + footer wrapper (position:relative) — article titles always above bg
z-2   fixed hover bg div (opacity 0→1 on article hover, 100ms ease)
z-1   hero section (position:relative) — covered by hover bg when hovering articles
      <main> has position:relative but NO z-index (no stacking context)
```

This structure means the article hover background (showing the hovered article's cover image) cleanly covers the hero section when both are visible in the viewport simultaneously.

**Hero section:** `.hero-section` (100vh, overflow:hidden). Array of rotating background images (`heroImages[]`), each as an `position:absolute` div with opacity 0/1 and `transition: opacity 1500ms ease`. Rotates every 5000ms via `setInterval`. Skips if `prefers-reduced-motion`. Dark overlay `rgba(28,24,20,0.48)`. Centered tagline: *"Stories collected around the world."* (`font-serif italic`).

**Article list:** 3 most recent items. `onMouseEnter/Leave` sets `hovered` state. On hover: article title changes to `#f8f4ef`, meta fades in (location, type label, description). `isMobile` (≤860px) — meta always visible on mobile. Fixed hover bg shows hovered item's `coverImageUrl` with `rgba(28,24,20,0.38)` overlay.

**Body class sync:** `document.body.classList.toggle('bg-active', bgActive)` — NavInner MutationObserver reads this to stay in sync with article hover state (keeps nav text cream while bg is active).

**CSS classes in `globals.css`:** `.hero-section`, `.hero-tagline`, `.home-article-item`, `.home-article-row`, `.home-article-title`, `.home-article-meta`, `.home-read-more`.

**`src/app/(site)/page.tsx`:** Fetches 3 items from `ALL_CONTENT_QUERY`, maps to `HomeItem[]` with `coverImageUrl` via `urlFor()`. `heroImages` = mapped cover URLs. Falls back to `PLACEHOLDER_ITEMS.slice(0, 3)`.

---

### GlobeView (`src/components/map/GlobeView.tsx`)

Full Three.js WebGL globe. **Do not refactor without explicit instruction.**

**Key constants:**
```
GLOBE_RADIUS  = 1.0
LAND_RADIUS   = 1.008    ← raised to prevent chord-sag (landmass holes)
ATMO_RADIUS   = 1.06
PIN_RADIUS    = 0.012
CAM_INIT_Z    = 2.8
```

**Colours:**
```
Ocean:      0x1a2a3a    ← MeshStandardMaterial, roughness 0.95
Land:       0x8a9a6a    ← MeshStandardMaterial
Background: #070b12     ← set on page container (map/page.tsx)
Pins:       white (#ffffff)
Atmosphere: rgba(140,170,200) shader
```

**GeoJSON rendering:** `public/data/ne_110m_land.json` (Natural Earth 110m). Each polygon face is earcut-triangulated via `ShapeGeometry`. `subdivideAndEmit()` recursively splits triangles until span ≤ 10° to prevent chord-sag where flat triangles dip below the ocean sphere.

**Rotation:** Y-axis only drag (no tilt accumulation). Initial tilt: `globeGroup.quaternion.setFromEuler(new THREE.Euler(-0.4, 0, 0))` — tilts globe slightly so high-latitude pins are visible during spin. Momentum: exponential decay.

**Stars:** 1800 points at r=40. `ShaderMaterial` with `uTime` uniform for per-point twinkling: `float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase); gl_PointSize = aSize * twinkle;`

**Pins:** Clustered — `clusterItems()` groups items within ~800km. White spheres (`PIN_RADIUS`). Click opens `ArticlePanel` slide-in.

**`src/app/(site)/map/page.tsx`:** `position: fixed; inset: 0; backgroundColor: '#070b12'` (no top offset — dark bg covers full viewport including behind the transparent nav).

---

## 9. KNOWN ISSUES

1. **No hero images.** `public/images/` does not exist. The homepage `heroImages[]` array comes from article `coverImageUrl` values (Sanity). Until real Sanity content is published, the hero section shows no background image (falls back to placeholder articles which have no cover images). To fix: add images to Sanity and publish articles, OR add static images to `public/images/hero/` and modify `page.tsx` to use them directly.

2. **ISR webhook not configured.** Publishing in Sanity does not update the live site. To fix: (a) add webhook in Sanity → API → Webhooks pointing to `https://wandering-website-blush.vercel.app/api/revalidate`; (b) add `SANITY_WEBHOOK_SECRET` to Vercel env vars.

3. **`NEXT_PUBLIC_SITE_URL` not set.** Root layout metadata base URL falls back to `'https://yourdomain.com'`. Set `NEXT_PUBLIC_SITE_URL=https://wandering-website-blush.vercel.app` in Vercel.

4. **Videography detail has no placeholder data.** Any `/videography/*` slug 404s until real Sanity content is published.

5. **About and Contact are stubs.** No design has been done — just heading + placeholder text.

6. **`@sanity/image-url` deprecation warning.** Warning only; site builds and runs correctly.

7. **`SiteNav.tsx` is likely unused.** Exists in `components/layout/` but `SiteHeader` imports `NavInner` directly. Verify before deleting.

8. **`ContentCard` may be orphaned.** `ExploreClient` builds card markup inline. Verify before removing.

9. **Stale branches.** `claude/happy-feynman-CICCs`, `claude/jolly-wright-UBel7`, `claude/magical-newton-MB2gD`, `claude/trusting-ride-apd6cp` can be deleted — all merged to `main`.

---

## 10. WHAT NOT TO TOUCH

- `src/components/map/GlobeView.tsx` — do not refactor unless explicitly asked
- `src/app/(site)/map/page.tsx` — do not adjust unless explicitly asked
- `src/app/studio/[[...index]]/page.tsx`
- `src/app/api/revalidate/route.ts`
- All files under `sanity/schemas/`
- `sanity/sanity.config.ts`, `sanity/sanity.cli.ts`
- `CLAUDE.md`, `AGENTS.md`
- `tsconfig.json`
- `next.config.ts`
- `src/lib/utils.ts`, `src/lib/metadata.ts`

---

## 11. CONVENTIONS — ALWAYS ENFORCE

- **`@/` import alias** for all `src/` imports. Never `../../` across roots.
- **No `any` types.** Strict TypeScript. Use `unknown` with narrowing.
- **Inline `style={{}}` is acceptable** in the current codebase — NavInner, HomepageClient, and GlobeView use them extensively for dynamic values. New light-page elements should prefer Tailwind classes; dark-page and dynamic values use inline style.
- **No `console.log` in finished code.**
- **Server Components by default.** `'use client'` only for browser APIs, hooks, or event handlers.
- **`next/image` for all images.** No `<img>` tags. No exceptions.
- **`prefers-reduced-motion` guard** for all animations (CSS: handled in `globals.css`; JS: check `window.matchMedia` in `useEffect`).
- **`--color-accent` for interactive states only** — never decorative.
- **No new npm packages** without explicit instruction.
- **Tailwind v4 config is `@theme inline {}` in `globals.css`.** No `tailwind.config.ts`. No `@apply` with non-existent utilities.
- **`params` is a Promise in Next.js 16.2.7.** Always `const { slug } = await params;`.
- **`generateStaticParams` and `generateMetadata` Sanity fetches must be wrapped in `try/catch`** to prevent build failures from CORS errors.
- **Font rule:** `font-serif` (Lyon Text) for content. `font-sans` (Suisse Int'l) for UI/nav/labels.

---

## 12. HOW TO START A NEW SESSION

Copy and send this as the first message to a new Claude Code session:

> "Read CLAUDE.md and SESSION_HANDOFF.md in the project root before doing anything. Note: ARCHITECTURE.md and DESIGN_SYSTEM.md do not exist — SESSION_HANDOFF.md contains all extracted design system values and current state. Do not write a single line of code until you have read both files. Then confirm you have read them and state what you understand the current state of the site to be before we begin."

---

## 13. FINAL-AUDIT ADDENDUM — June 2026

A full pre-launch audit was carried out. Changes since the sections above were written:

**New since this doc was drafted (earlier sessions):** `public/images/` now exists with 10 hero JPGs used by the homepage rotation; SEO files added (`src/app/sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.svg`, `src/lib/siteConfig.ts`, `src/lib/jsonld.ts`, `src/components/seo/JsonLd.tsx`); `IntroLoader` first-visit animation added; `SiteNav.tsx` already deleted; canonical origin is `https://armanparsa.earth` (fallback in `siteConfig.ts`).

**Audit changes:**
- Hero photos recompressed in place (max 2560px, q82, EXIF stripped): 46MB → 3.6MB. Originals recoverable from git history.
- Homepage hero rotation converted from CSS `background-image` divs to `next/image` (`fill`, first slide `priority`); slides mount progressively so the browser never fetches all heroes up front.
- `src/app/not-found.tsx` added — unmatched URLs previously got Next's unstyled default 404. `(site)/not-found.tsx` still handles in-group `notFound()`.
- `<main id="main-content">` landmark added to /articles and all four detail page types (skip-link now works everywhere).
- `public/og.jpg` (1200×630) added as the site-wide social card, wired via `OG_IMAGE` in `siteConfig.ts` into every static page's `openGraph.images` and as the fallback in `buildContentMetadata` (Sanity cover/SEO images still win on detail pages). PNG icons (192/512) added for the web manifest; `src/app/favicon.ico` generated.
- `viewport.themeColor` added. Manual font preloads in the root layout are REQUIRED — Next only auto-preloads `next/font` fonts, not `@font-face` CSS fonts.
- NavInner: route-change scroll re-sync + menu close moved from effects to React's render-time adjustment pattern (fixes lint errors, same behaviour).
- `sanity/lib/client.ts` falls back to public project ID `8p5lsu79` (build no longer crashes without `.env.local`).
- `sanityImage.ts` uses named `createImageUrlBuilder` export (deprecation warning gone — Known Issue 6 resolved).
- **Guarded-file edits (minimal, justified):** `api/revalidate/route.ts` now rejects all requests when `SANITY_WEBHOOK_SECRET` is unset (was an auth bypass); `lib/utils.ts` `formatDate` pins `timeZone: 'UTC'` (dates no longer shift a day west of UTC); dead `TooltipData` type removed from `GlobeView.tsx`.
- Contrast fixes: footer copyright `text-ink-faint` → `text-ink-muted`; Library inactive filter pills/label darkened to meet WCAG AA. Homepage hover meta `aria-hidden` now tracks visibility instead of always-true.
- Orphans deleted: `MapView`, `MapLoader`, `HeroSection`, `ContentCard`, `ArticlesClient`, comment-only barrels (`navigation/ui/photography/content` index.ts). Unused packages removed: maplibre-gl, react-map-gl, gsap, lenis, framer-motion, photoswipe. Dead `.map-popup` CSS removed. (`PageWrapper` kept — documented utility.)
- React keys on content lists are now `_type-slug` composites.
- README rewritten (was create-next-app boilerplate).

**Still open (require dashboard access, not code):** Vercel env vars (`NEXT_PUBLIC_SITE_URL`, `SANITY_WEBHOOK_SECRET`) and Sanity webhook — Known Issues 2 & 3; `armanparsa.earth` domain attachment unverified; no real Sanity content yet (Known Issues 1, 4); contact page email is `armanparsa03@gmail.com` — confirm this is the intended address. `npm audit` shows 19 moderate transitive advisories in Sanity/Next tooling; the proposed fixes are breaking downgrades — do not run `npm audit fix --force`.

---

## 14. ARTICLE MEDIA SYSTEM ("plates") — June 2026

Post-launch feature pass: full media UX for pieces. Files: `src/lib/articleMedia.ts` (types + `imageRatio` + `collectArticleImages`), `src/components/content/MediaLightbox.tsx` (provider, lightbox dialog, `LightboxTrigger`, `OpenGalleryButton`), `ImageBlock.tsx`, `ImagePair.tsx`, `VideoBlock.tsx`, `src/lib/usePrefersReducedMotion.ts`.

- **Lightbox**: native `<dialog>` + CSS scroll-snap (no deps). Solid `#14110e` room, counter `03 — 14`, caption + credit bar, edge chevrons (`pointer-fine:` only), swipe on touch, ←/→/Esc, backdrop-click close. Only active±1 slides mount images (2048px webp); **films are slides too** — mounted only while active (one ambient loop at a time, stops on flick-away), rendered via shared `AmbientVimeo` with the corner sound toggle. Pages collect every body + end-gallery visual in narrative order via `collectArticleMedia` (images, pairs, films) and wrap content in `ArticleMediaProvider`; inline images, inline films (transparent surface overlay — also lets touch scroll pass over iframes), and photography-grid cells open it via context (`_key` match). Wired on: writing, mixed-media, photography detail pages.
- **Width registers**: `width` field on `imageBlock`/`videoBlock` — `column` (default, 740px) / `wide` (1100px) / `full` (100vw). Breakout via `.media-wide`/`.media-full` in globals.css (`left:50% translateX(-50%)`; requires viewport-centred column — true everywhere). Column portraits stay width-capped/centred; wide/full render as given.
- **`imagePair` object** (registered in portableText + mixedMedia.images): 2–3 plain images (alt/caption fields), justified-row layout — each cell `flex: ratio 1 0%` → equal heights, no cropping. All-portrait pairs stay side-by-side on mobile; otherwise stacks (`sm:` breakpoint). Width: wide (default) or full.
- **"N photographs — view"** (`OpenGalleryButton`): renders in EssayHero meta row and at mixed-media article end; null when no images/provider — safe everywhere.
- **Ambient video**: VideoBlock = Vimeo `background=1` (chromeless autoplay muted loop) + corner sound toggle via postMessage; accepts pasted URLs incl. unlisted hashes. Reduced-motion users get the standard player, no autoplay. NOTE: if Vimeo plan gating ever re-surfaces chrome, fall back to per-video embed settings in Vimeo.
- Reduced motion respected throughout (`usePrefersReducedMotion`, instant lightbox cuts, no fade).
- Existing content needs no migration: missing `width` = column; all images become clickable automatically.

---

## 15. STANDARDISED ARTICLE HERO + TRANSPARENT NAV — June 2026

- **`src/components/content/ArticleHero.tsx`** replaces `EssayHero` (deleted) across all four detail types (writing, mixed-media, photography, videography). Full-bleed cover image at `height:100svh`, gradient scrim (strong foot for the title, faint crown for nav legibility), title (`text-4xl` serif light) + serif-italic description (Lyon — fixes the photography hero's old `font-sans` description bug) + meta row (location — date, #tags) + `OpenGalleryButton` overlaid at the foot. No-cover fallback = centred text header with top padding to clear the nav. Optional `eyebrow` prop exists (content-type label) but is unused — heroes intentionally match the photography layout the client preferred (no type word). Flip by passing `eyebrow`.
- Pages no longer wrap content in the `paddingTop: clamp(5rem,10vh,8rem)` div; the hero is flush to the top and the nav floats over it. Body sections use `py-20`.
- Photography page now wraps hero + grid in one `ArticleMediaProvider` (hero gains the "N photographs — view" button); videography hero standardised (was a cropped `h-[60vh]`).
- **Nav transparency** (`NavInner.tsx`): new `HERO_PAGE_PREFIXES` → `onHero` now true for article detail pages too, so the nav is transparent over the hero and solidifies (dark blur) after 60px scroll, exactly like the homepage. `isDarkPage` still governs text colour.

---

## 16. HERO REFINEMENTS + END NAV + HOMEPAGE NAV — June 2026

- **ArticleHero**: description is no longer italic (was reading as a third typeface — now sans meta + one serif voice for title & description). Title enlarged to `clamp(2.75rem,1.9rem+4.2vw,5.25rem)` for a grounded, introductory feel; both image and no-image branches share `TITLE_CLASS`. Meta row collapses location + date into one `LOCATION — DATE` span (removes the awkward gap before the em dash). `eyebrow` prop removed.
- **`ArticleEndNav`** added to the foot of all four article types: a centred "Explore more" with serif links **Library** (`/articles`) and **Earth** (`/map`) — labels match the destinations' own page names.
- **Nav transparency over heroes** (`NavInner.tsx`): hero pages (homepage + article details) now stay transparent until the hero scrolls past the bar — threshold is `viewportH - 72` (tracked via a resize listener) instead of a flat 60px, which was flipping the nav to a solid band over the still-visible full-height hero. Fixes the homepage "band on landing" report and keeps article heroes clean.
- Homepage CTA "All work" (→ /articles) left as-is — it's a descriptive CTA, not a page-name label; flag if it should read "Library".

---

## 17. ROUTE RENAMES + EYEBROW + MINIMAL EXPLORE BUTTON — June 2026

- **Routes renamed to match page names**: `/articles` → `/library`, `/map` → `/earth` (folders `src/app/(site)/library`, `src/app/(site)/earth`). Component folder `src/components/map/` is unchanged — that's the globe code, not a route. Permanent (308) redirects added in `next.config.ts` for the old paths so indexed links/bookmarks keep working. Updated: nav links (EARTH→/earth, LIBRARY→/library), `NavInner` `DARK_PAGE_PREFIXES`/`isMapPage` (now `/earth`), homepage "All work" + `TYPE_HREF` fallback (→/library), `sitemap.ts`, `/api/revalidate` (revalidates `/library` + `/earth` + `/`), and both pages' canonical/OG URLs. Earlier historical sections of this doc still say `/articles` and `/map` — the live routes are now `/library` and `/earth`.
- **Category eyebrow** re-added to `ArticleHero` via `category` prop (Writing / Mixed Media / Photography / Videography), rendered as a kicker above the title. Hero order is now: eyebrow → title → description → meta (location—date · #tags · gallery "view").
- **`ArticleEndNav`** is now a single minimal "Explore More" link to `/library`, styled with `home-read-more` + new `home-read-more--invert` (light variant for the dark article background) to match the homepage's "All work" button.
