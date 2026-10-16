# SESSION HANDOFF — ARMAN PARSA · PORTFOLIO

> **Read CLAUDE.md (→ AGENTS.md) and this file before touching any code.**
> Rewritten October 2026 after a full audit (performance, accessibility/SEO,
> code health/security, visual/UX) and the fixes that followed. Everything
> below describes the code as it is now; §13 lists what changed in that pass.

---

## 1. WHAT THIS PROJECT IS

A personal editorial archive — travel writing, photography, mixed media and
videography by Arman Parsa. Unhurried, print-influenced: a well-edited magazine
that happens to be on the web. Every decision privileges the work over the UI.

Four content types: **writing** (longform text), **mixed media** (writing +
photos/video), **photography** (image-forward), **videography** (video-forward).
Light pages are ink on paper (`#f8f4ef`); every article page is dark (`#0D0D0D`).
The nav floats transparently and gains a translucent bar only when content would
otherwise run under it.

---

## 2. STACK

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js App Router **16.4.1** (exact pin) | Not the Next.js in your training data — read `node_modules/next/dist/docs/` first. `params` is a Promise: `const { slug } = await params;` |
| Language | TypeScript 5, strict | No `any` (one documented exception: `sanityFetch`'s default generic, mirroring `client.fetch`) |
| CMS | Sanity v5 via `next-sanity` 13 | Project `8p5lsu79`, dataset `production`. **No real content yet** — placeholders in `src/lib/placeholders.ts` |
| Styling | Tailwind CSS v4 | Configured in `@theme inline {}` in `globals.css`; **no `tailwind.config.ts`** |
| Globe | Three.js 0.184 | Custom WebGL globe on `/earth` |
| Fonts | `@font-face` in `globals.css` | Lyon Regular + Suisse Int'l Light, **WOFF2 first, TTF fallback** (`public/fonts/`); preloaded manually in `src/app/layout.tsx` (Next only auto-preloads `next/font`). `ogCard.tsx` reads the TTFs — keep them |
| Images | `next/image` everywhere except the gallery collage (raw `<img>` by design — one fixed URL keeps the enlarge morph seamless) |
| Hosting | Vercel | Auto-deploys `main` |
| Aliases | `@/*` → `src/*`, **`@cms/*` → `sanity/*`** | (Was `@sanity/*`, which shadowed the real `@sanity/` npm packages) |

Dependencies are lean: next, react, sanity, next-sanity, @sanity/image-url,
@sanity/vision, three. (clsx/tailwind-merge removed with the unused `cn()`.)

---

## 3. LIVE SITE & RELATED

- **Site:** https://armanparsa.earth — production branch `main`.
- **Print store:** https://store.armanparsa.earth (Picfair, custom domain via
  CNAME). `/store` is a **temporary (307)** redirect to `STORE_URL` in
  `src/lib/siteConfig.ts` — change it there if the store moves. Brand assets
  for the Picfair store live in `brand/picfair/` (not used by the build).
- **Branches:** work on `claude/<session-id>`, merge to `main` via PR.
- Old routes `/articles` → `/library` and `/map` → `/earth` are permanent (308)
  redirects in `next.config.ts`.

---

## 4. REPOSITORY STRUCTURE

```
WanderingWebsite/
├── AGENTS.md / CLAUDE.md       Agent instructions (Next.js version warning)
├── README.md                   Setup, env vars, commands
├── SESSION_HANDOFF.md          This file
├── next.config.ts              images (remotePatterns, avif/webp, qualities [75,90]),
│                               security + cache headers, redirects (/store, /articles, /map)
├── brand/picfair/              Logo/watermark files for the Picfair store
├── scripts/compress-photos.mjs Resize (2560px) + strip metadata before uploading photos
├── public/
│   ├── fonts/                  Lyon_Regular / SuisseIntl_Light — .woff2 + .ttf
│   ├── images/                 Homepage hero photos (every file here rotates) + about-portrait.jpg
│   ├── data/ne_110m_land.json  Globe land outlines (coords rounded to 0.01°, ~57 KB gz)
│   ├── og.jpg                  Fallback photo for generated OG cards
│   └── icon-192.png / icon-512.png   Manifest icons
├── sanity/
│   ├── sanity.config.ts        basePath '/studio' (embedded studio)
│   ├── lib/client.ts           API client (useCdn:false — ISR is the cache)
│   ├── lib/queries.ts          All GROQ (defineQuery from next-sanity)
│   └── schemas/                documents: essay.ts=writing, editorial.ts=mixedMedia,
│                               photoSeries.ts=photography, videography.ts, author (unused);
│                               objects: portableText, imageBlock, imagePair, videoBlock,
│                               pullQuote, seoFields; singletons/siteSettings (unused)
└── src/
    ├── app/
    │   ├── layout.tsx          Root: fonts preload, pre-hydration intro script, JSON-LD, lang en-GB
    │   ├── globals.css         Tokens, @theme, all component CSS
    │   ├── sitemap.ts / robots.ts / manifest.ts / icon.svg / apple-icon.png / favicon.ico
    │   ├── not-found.tsx       Root 404 (unmatched URLs) — recreates header/footer
    │   ├── api/revalidate/route.ts   Sanity webhook → revalidatePath('/', 'layout')
    │   ├── studio/             Embedded Sanity Studio (noindex layout)
    │   └── (site)/
    │       ├── layout.tsx      IntroLoader + SiteHeader + children + SiteFooter
    │       ├── template.tsx    Page fade on navigation
    │       ├── page.tsx        Homepage → HomepageClient
    │       ├── library/ gallery/ earth/ about/ contact/   (+ opengraph-image.tsx each)
    │       ├── not-found.tsx   In-group 404
    │       ├── (journal)/writing/[slug]  (journal)/mixed-media/[slug]
    │       └── (visual)/photography/[slug]  (visual)/videography/[slug]
    ├── components/
    │   ├── layout/   SiteHeader (skip link), NavInner ★, NavLink, SiteFooter, IntroLoader
    │   ├── home/     HomepageClient ★, HeroNameSVG (name as vector outline)
    │   ├── explore/  ExploreClient (Library grid + filters)
    │   ├── gallery/  GalleryClient (floating collage + enlarged view)
    │   ├── map/      GlobeLoader, GlobeView ★, ArticlePanel, index.ts
    │   ├── content/  ArticleHero, ArticleEndNav, ReadingProgress, PortableTextRenderer,
    │   │             ImageBlock, ImagePair, VideoBlock, AmbientVimeo, PullQuote,
    │   │             MediaLightbox, SanityImage
    │   └── seo/      JsonLd
    └── lib/
        ├── siteConfig.ts   Pure constants (SITE_URL, SITE_NAME, STORE_URL…) — safe anywhere
        ├── contentTypes.ts TYPE_HREF / TYPE_LABEL — the one map of type → URL/label
        ├── sanity.ts       Re-exports client + queries
        ├── sanityFetch.ts  sanityFetch() + hasRealContent() — see §7
        ├── sanityImage.ts  urlFor() — builder from projectId/dataset (no API client)
        ├── metadata.ts     buildContentMetadata(), pageMetadata(), contentImageUrl()
        ├── jsonld.ts       WebSite/Person graph + per-piece Article/ImageGallery/VideoObject
        ├── ogCard.tsx / articleOg.tsx   Photo-led OG card rendering
        ├── adjacentPieces.ts   Previous/next piece for ArticleEndNav
        ├── articleMedia.ts     Media types, imageRatio, collectArticleMedia
        ├── placeholders.ts     Placeholder pieces/globe items (empty CMS only)
        ├── usePrefersReducedMotion.ts
        └── utils.ts            formatDate (Europe/London)
```

---

## 5. DESIGN SYSTEM — NON-NEGOTIABLES

### Colour
| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#f8f4ef` | Light page background |
| `--color-ink` | `#1c1814` | Text on light pages |
| `--color-ink-muted` | **`#736960`** | Secondary text (4.9:1 on paper — was `#7a7067`, 4.4:1) |
| `--color-ink-faint` | `#b8b3ac` | Disabled / dividers only (not text) |
| `--color-surface` | `#efece6` | Cards on light pages |
| `--color-border` | `#ddd9d2` | Borders on light pages |
| `--color-accent` | `#453e36` | Interactive states only — never decorative |

Dark (article) pages: bg `#0D0D0D`, text `#f8f4ef`, secondary `#a09890`,
borders `rgba(248,244,239,0.12)`. Globe page: `#070b12`. Nav bars:
`BAR_PAPER rgba(248,244,239,.82)` / `BAR_INK rgba(13,13,13,.82)` with blur.

### Type
- **Lyon Text** (`font-serif`) for all editorial text; **Suisse Int'l** (`font-sans`) for UI, labels, metadata.
- Only Regular (Lyon) and Light (Suisse) are installed — italics and bold are
  browser-synthesised. Real italic/bold files would need to come from the font licence.
- Fluid scale `--text-xs … --text-display` in `globals.css`.
- ⚠️ **Tailwind v4 gotcha:** write sizes as **`text-[length:var(--text-lg)]`**.
  `text-[var(--text-lg)]` compiles to a *colour* and silently does nothing (this
  was the case for 18 classes until Oct 2026). Same family of trap as the
  `--width-*` keys in `@theme` hijacking `w-full` — never add `--width-*` there.

### Layout
- **One side margin everywhere:** `clamp(1.5rem, 4vw, 3rem)` = nav padding =
  `--content-padding-x` = footer = homepage = library.
- Content widths: `--content-max-width` 740px (text column), `--content-wide-width` 1100px.
- Tap targets ≥ 44px — small links get invisible padding (+ negative margin or a
  `::before` hit area) so their visual position never changes.

### Motion
- Tokens: `--duration-fast/normal/slow`, `--ease-default/out/spring`.
- Every animation has a `prefers-reduced-motion` path (CSS guards; JS via
  `matchMedia` / `usePrefersReducedMotion`). Reduced motion: no intro, no
  slideshow, no globe spin, no gallery drift, no page fade, instant lightbox.

### Focus
Global quiet focus ring: `:where(a, button, …):focus-visible { outline: 1px solid currentColor; outline-offset: 4px }` (zero specificity — component styles win).

---

## 6. CONTENT TYPES & PAGES

All four detail pages: `ArticleHero` (full-bleed cover with scrim, or a text
header when no cover) → body → `ArticleEndNav` (previous/next piece in archive
order, optional **Buy a Print**, "Explore More" → /library) inside an
`ArticleMediaProvider` (lightbox). Each has `generateMetadata`
(`buildContentMetadata`), JSON-LD, and a photo-led `opengraph-image`.

- **Writing** `/writing/[slug]` — `.article-body` + PortableText, drop cap, reading-progress line, "N min read" if `readingTime` set.
- **Mixed media** `/mixed-media/[slug]` — as writing, plus end gallery (`images[]`, `videos[]`), photography credit.
- **Photography** `/photography/[slug]` — grid of `images[]` (4:3 crops, open lightbox); `printsUrl` → Buy a Print. (`displayMode` is hidden in the studio: only the grid exists.)
- **Videography** `/videography/[slug]` — Vimeo videos. No placeholders.

Site pages: **Home** (slideshow from `public/images`, name graphic, 3 latest
pieces with cover-on-hover), **Library** (filterable grid), **Gallery**
(floating collage of photos *inside* pieces; covers if none; enlarged view with
arrows/counter/keys), **Earth** (globe), **About**, **Contact**.

**Portable Text** renders h2/h3/h4, blockquote, bullet/number lists, imageBlock
(column/wide/full), imagePair, pullQuote, videoBlock (Vimeo only — the platform
field is hidden).

---

## 7. SANITY & DATA

- **Fetching:** always `sanityFetch(query, params)` from `src/lib/sanityFetch.ts`.
  During `next build` a failed fetch returns `null` (fallbacks render, build never
  breaks); **at runtime it throws**, so ISR keeps serving the last good page
  during a Sanity outage instead of caching placeholders or a 404 (verified).
  `generateStaticParams` / `generateMetadata` still use try/catch.
- **Placeholders only while the CMS is empty** (`hasRealContent()` =
  `REAL_CONTENT_COUNT_QUERY`). Once one real piece is published: no fake globe
  pins, gallery uses real photos → covers → "Nothing here yet.", placeholder
  slugs are no longer pre-built.
- **Publishing:** `/api/revalidate` (Bearer `SANITY_WEBHOOK_SECRET`; rejects all
  if unset) calls `revalidatePath('/', 'layout')` — refreshes every page, OG
  card and the sitemap. Sitemap also revalidates hourly. Page timers: home 5 min,
  lists 1 min, articles 1 h.
- **Images:** `urlFor()` builds URLs from projectId/dataset only (keeps the API
  client out of the browser). `<SanityImage>` (client component) uses a custom
  loader that asks the Sanity CDN for each srcset width directly
  (`auto=format`, q85, `fit=max`) — one encode, no Next re-compression. Blur-up
  uses Sanity's `lqip` (projected as `"lqip": asset->metadata.lqip` on cover,
  imageBlock and imagePair images in the detail queries).
- **Dates:** `formatDate` uses `Europe/London`; lists sort by
  `coalesce(publishedAt, _createdAt) desc`.
- **SEO image:** `seo.ogImage` ("Social Share Image") overrides the cover on article OG cards.
- **imageBlock nesting:** the picture lives at `block.asset` (an image object
  whose own `.asset` is the reference) — hence `asset { …, "lqip": asset->metadata.lqip }`.

---

## 8. KEY COMPONENTS

### NavInner (`src/components/layout/NavInner.tsx`)
3-col grid: EARTH | symbol (home link) | menu button.
- **Colour:** light contents over dark surfaces (globe, articles, homepage hero,
  homepage hover overlay); the menu button turns ink over the globe's cream
  panel (`globe-panel-open` body class from GlobeView).
- **Bar:** articles → `BAR_INK` once past the cover hero (`[data-hero]` via
  IntersectionObserver) or on scroll if no cover; light pages → `BAR_PAPER` on
  scroll; gallery on phones → `BAR_PAPER` always; homepage hover overlay → none.
- **Menu:** < 1100px a full-width dropdown; ≥ 1100px a row absolutely
  positioned left of the button (never shifts the symbol). DOM order puts links
  after the button (Tab reaches them); Escape closes and refocuses; `aria-controls`.
- Symbol scales 2× → 1× over the first 220px of homepage scroll (direct DOM writes).
- Route change resets scroll state and closes the menu during render (no flash).

### HomepageClient
Slideshow: every file in `public/images` (read with `fs` in `page.tsx`),
`next/image` q90; slide 2 mounts after slide 1 loads (3 s fallback); rotation
every 5 s, paused when the hero is off-screen or the tab hidden. Overlay =
tint + faint top/bottom shade. Article list: hover darkens the page with the
cover — only for pieces that have one; covers preloaded only on hover-capable
devices after 2 s. Z-order: nav 50 > list 3 > hover bg 2 > hero 1.

### GlobeView (`src/components/map/GlobeView.tsx`)
Three.js globe; land from GeoJSON (earcut + subdivision to avoid chord-sag).
Opens facing the pins (circular mean longitude); auto-spin starts after 5 s,
holds while a pin is hovered, never for reduced motion. Pins have invisible
3.5× hit spheres for touch. Hover label tracks its pin when the panel shifts the
canvas. Hidden-until-focused keyboard list of places opens the same panel.
`ArticlePanel` is a labelled dialog (focus in, Escape, focus returns).
Land data preloaded from the page; late fetches ignored after unmount.

### GalleryClient
Collage of slots (sparse sets repeat — repeats are `aria-hidden`/untabbable);
thumbnails lazy, 800px (Sanity) or 828px via the optimiser (placeholders).
Enlarged view: morph from the thumbnail, 2000px version fades in over it,
caption + "View the piece", ←/→ + counter (edge arrows below 480px tall),
focus trapped, collage `inert`, focus returns to the source print.

### IntroLoader
Homepage only, once per session (pre-hydration script in the root layout adds
`intro-seen` for other paths / repeat visits). Page behind is `inert` while it plays.

---

## 9. SEO & ACCESSIBILITY FACTS
- `pageMetadata()` for site pages keeps og:site_name/locale/type and matching
  Twitter title/description; no global robots tag (placeholders + studio are noindex).
- Sitemap lists home, library, gallery, earth, about, contact + real pieces.
- JSON-LD: WebSite + Person graph in the root layout; per-piece schema with inline author.
- Skip link, one `<main id="main-content">` and an h1 on every page; nav labelled "Main".
- Contrast meets WCAG AA for text on paper and on dark pages.

---

## 10. KNOWN ISSUES / OPEN ITEMS
1. **No real Sanity content yet** — real photos, lightboxes, covers and inline media couldn't be checked end-to-end; give them a once-over after the first publish.
2. **Vercel/Sanity dashboard items:** confirm `NEXT_PUBLIC_SITE_URL=https://armanparsa.earth` and `SANITY_WEBHOOK_SECRET` in Vercel, and create the Sanity webhook (URL `https://armanparsa.earth/api/revalidate`, header `Authorization: Bearer <secret>`, projection `{_type, slug}`).
3. **Low-resolution sources:** `about-portrait.jpg` is 1496×1000 landscape cropped to portrait; hero `DSC06121` (1616px) and `DSC06207` (1277px) are soft full-screen. Replace with larger exports.
4. **Fonts:** only Lyon Regular + Suisse Light — italics/bold are synthesised. Converting to WOFF2 was format-only; check the font licences cover web use.
5. **npm audit:** remaining advisories are in Sanity's CLI/build tooling (transitive); the offered fix is a breaking downgrade — don't `audit fix --force`.
6. **Not done (by choice):** Sanity typegen (results are untyped), moving the globe mesh build into a Web Worker, a CSP header, a dedicated slideshow pause control.
7. Videography ignores a video's `width` (always wide).

---

## 11. CONVENTIONS — ALWAYS
- `@/` for src imports, `@cms/` for the sanity folder. No `../../` across roots.
- Strict TS; Server Components by default; `'use client'` only when needed.
- `next/image` for images (gallery collage excepted); Sanity images via `<SanityImage>` + `urlFor()`.
- Fetch Sanity via `sanityFetch`; never import `@/lib/sanity` in `siteConfig`/`jsonld`/manifest/robots.
- Type → URL/label via `src/lib/contentTypes.ts` only.
- Text sizes `text-[length:var(--text-*)]`; side margin `clamp(1.5rem, 4vw, 3rem)`.
- Reduced-motion path for every animation; 44px targets; `--color-accent` interactive only.
- No `console.log`; no new npm packages without asking.
- **Verify every change:** `npx tsc --noEmit`, `npx eslint .`, `npm run build`,
  then screenshot key pages at 375/768/1440 and compare before/after.
  Clean `.next` before local before/after comparisons (stale route-cache entries
  from older builds otherwise reference missing chunks).

---

## 12. HOW TO START A NEW SESSION
> "Read CLAUDE.md and SESSION_HANDOFF.md in the project root before doing anything. Don't write code until you've read both. Then confirm and summarise the current state of the site before we begin."

---

## 13. OCTOBER 2026 AUDIT — WHAT CHANGED
Six commits on `claude/compassionate-pascal-vzk6f0`, each verified (tsc, eslint,
build, pixel comparison of 10 routes × 3 widths, keyboard tests):
- **A — security & broken:** Next 16.2.7 → 16.4.1 (critical advisories in next/og and AVIF optimisation); fixed two broken gallery images; compressed three 5–15 MB originals (29 MB → 1.2 MB); studio `basePath`.
- **B — speed:** Sanity client out of browser bundles (~40 KB gz); gallery thumbnails sized + lazy; smarter slideshow; WOFF2 fonts; 30-day cache for fonts/data; lighter, preloaded globe data.
- **C — accessibility:** menu/gallery/globe keyboard and focus handling; library filter state; metadata helper; icons at declared sizes.
- **E — real-content readiness:** outage-safe fetching, placeholders only for an empty CMS, whole-site revalidation, lqip blur, UK dates, studio field tidy-up, h4/list styles, dead code/deps/CSS removed, shared type maps, `@cms` alias, README/.env.example, obsolete `STUDIO_SETUP_HANDOFF.md` removed.
- **D — visual:** text-size fix (the `length:` hint), nav overlap/bars/icon colours, contrast, one side margin, tap targets, drop cap, dark article footer, hover/no-cover, 404 Library link, gallery "Tap".
- **F — globe, intro, extras:** globe faces pins / hover-pause / touch targets / hint; intro homepage-only; reading progress; previous/next; gallery arrows; page fade; focus ring; reading time.

Earlier history (Picfair store, image-quality loader, SEO pass, article media
system, route renames) is reflected in the sections above.
