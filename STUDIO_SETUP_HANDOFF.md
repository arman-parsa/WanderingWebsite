# STUDIO_SETUP_HANDOFF.md
## Sanity Studio + Schema Redesign — Session Notes
### For Claude Code — Read Before Touching Any Schema or Git

---

## WHAT WE WERE TRYING TO DO

1. Get the embedded Sanity Studio working at `localhost:3000/studio`
2. Redesign the Sanity document types to match the site's actual content structure

Both are done in code. The git situation is what needs resolving.

---

## GIT STATE — THE CORE ISSUE

All schema and frontend changes are committed on branch `claude/happy-feynman-CICCs` at commit `c74fb69`. They are **not on `main`**.

The developer thought they merged the branch on GitHub but `main` still has the old code. When they run `git pull origin main` locally it says "Already up to date" but the files still contain the old schema names (`essay`, `editorial`, `photoSeries`).

**The fix needed:**
Go to `https://github.com/arman-parsa/WanderingWebsite` and create + merge a PR from `claude/happy-feynman-CICCs` into `main`. Then locally:

```bash
git checkout main
git pull origin main
npm run dev
```

Then hard-refresh `localhost:3000/studio` and the new document types will appear.

**In the meantime**, the developer can use the studio right now by running:

```bash
git checkout claude/happy-feynman-CICCs
npm run dev
```

---

## LOCAL ENVIRONMENT

- **Local project path:** `/Users/armanparsa/Documents/GitHub/REPOSITORIES/wandering-website/WanderingWebsite`
- **Sanity project ID:** `8p5lsu79`
- **Sanity dataset:** `production`
- **`.env.local` exists** at the project root with `NEXT_PUBLIC_SANITY_PROJECT_ID=8p5lsu79`
- **`node_modules` exists** — `npm install` has already been run
- **CORS:** `http://localhost:3000` is listed in Sanity project settings with credentials allowed
- **Studio URL:** `http://localhost:3000/studio` (not the sanity.io dashboard — that shows nothing)
- **Live site:** `https://wandering-website-blush.vercel.app`

---

## SCHEMA REDESIGN — WHAT CHANGED

The old document types (`essay`, `editorial`, `photoSeries`) have been replaced with four new ones. All changes are in the `claude/happy-feynman-CICCs` branch.

| Old name | New name | Studio title | URL pattern |
|---|---|---|---|
| `essay` | `writing` | Writing | `/writing/[slug]` |
| `editorial` | `mixedMedia` | Mixed Media | `/mixed-media/[slug]` |
| `photoSeries` | `photography` | Photography | `/photography/[slug]` |
| *(new)* | `videography` | Videography | `/videography/[slug]` |

### Fields on every document type
- `title` (required)
- `slug` (required, auto-generated from title)
- `publishedAt` (datetime)
- `description` (replaces old `excerpt` — short intro shown on cards and at top of piece)
- `coverImage` (image with hotspot + required alt text)
- `location` (string)
- `coordinates` (geopoint — used by the map page)
- `tags` (array of strings)
- `seo` (seoFields object)

### Type-specific fields
- **Writing:** `body` (portableText), `readingTime`
- **Mixed Media:** `body`, `images[]` (imageBlock), `videos[]` (videoBlock), `readingTime`, `photographyCredit`
- **Photography:** `images[]` (imageBlock), `displayMode` (grid/slideshow/vertical-scroll)
- **Videography:** `videos[]` (videoBlock)

### Object schema updates
- **`imageBlock`** — added `description` (text, optional) alongside existing `alt` and `caption`
- **`videoBlock`** — added `description` (text, optional) alongside existing `platform`, `vimeoId`, `title`

---

## FILES CHANGED IN `claude/happy-feynman-CICCs`

### Sanity schemas
- `sanity/schemas/documents/essay.ts` — rewritten as `writing` type
- `sanity/schemas/documents/editorial.ts` — rewritten as `mixedMedia` type
- `sanity/schemas/documents/photoSeries.ts` — rewritten as `photography` type
- `sanity/schemas/documents/videography.ts` — **new file**
- `sanity/schemas/objects/imageBlock.ts` — added `description` field
- `sanity/schemas/objects/videoBlock.ts` — added `description` field
- `sanity/schemas/index.ts` — updated imports and exports
- `sanity/sanity.config.ts` — projectId and dataset hardcoded (not read from env vars)

### GROQ queries
- `sanity/lib/queries.ts` — all queries renamed and updated:
  - `ALL_WRITING_QUERY`, `WRITING_QUERY`, `WRITING_SLUGS_QUERY`
  - `ALL_MIXED_MEDIA_QUERY`, `MIXED_MEDIA_QUERY`, `MIXED_MEDIA_SLUGS_QUERY`
  - `ALL_PHOTOGRAPHY_QUERY`, `PHOTOGRAPHY_QUERY`, `PHOTOGRAPHY_SLUGS_QUERY`
  - `ALL_VIDEOGRAPHY_QUERY`, `VIDEOGRAPHY_QUERY`, `VIDEOGRAPHY_SLUGS_QUERY`
  - `ALL_CONTENT_QUERY` updated to include all four types
  - `MAP_CONTENT_QUERY` updated to include all four types

### Frontend
- `src/lib/placeholders.ts` — `_type` values updated; `excerpt` renamed to `description`; `PLACEHOLDER_ESSAY` renamed to `PLACEHOLDER_WRITING`
- `src/components/articles/ArticlesClient.tsx` — type map updated; Videography filter tab added
- `src/components/content/EssayHero.tsx` — `excerpt` prop renamed to `description`
- `src/app/(site)/page.tsx` — `ContentItem` type and `TYPE_HREF`/`TYPE_LABEL` maps updated
- `src/app/(site)/articles/page.tsx` — `ContentItem` type updated
- `src/app/(site)/(journal)/writing/[slug]/page.tsx` — uses `WRITING_QUERY`
- `src/app/(site)/(journal)/mixed-media/[slug]/page.tsx` — uses `MIXED_MEDIA_QUERY`
- `src/app/(site)/(visual)/photography/[slug]/page.tsx` — uses `PHOTOGRAPHY_QUERY`
- `src/app/(site)/(visual)/videography/[slug]/page.tsx` — rewritten; uses `VIDEOGRAPHY_QUERY`

---

## SANITY CONFIG FIX

`sanity/sanity.config.ts` previously read `projectId` from `process.env.NEXT_PUBLIC_SANITY_PROJECT_ID`. This caused the studio to receive `undefined` and show "Connect this studio to your project". Fixed by hardcoding:

```typescript
export default defineConfig({
  projectId: '8p5lsu79',
  dataset: 'production',
  // ...
});
```

The project ID is public by design (`NEXT_PUBLIC_` prefix) — safe to hardcode.

---

## WHAT STILL NEEDS TO BE DONE

1. **Merge `claude/happy-feynman-CICCs` into `main` on GitHub** — this is the immediate blocker. Without it, local `main` still has old schemas and the studio shows old document types.

2. **Verify studio shows new document types** — after the merge and `git pull`, open `localhost:3000/studio` → Structure and confirm Writing, Mixed Media, Photography, Videography are present.

3. **Create first real content** — once the studio is confirmed working, create a test document (any type), publish it, and verify it appears on `localhost:3000/articles`.

4. **Set up ISR revalidation webhook** — so publishing in Sanity automatically updates the live Vercel site. Needs:
   - A webhook configured in Sanity (project settings → API → Webhooks) pointing to `https://wandering-website-blush.vercel.app/api/revalidate`
   - `SANITY_WEBHOOK_SECRET` added to `.env.local` and to Vercel environment variables

5. **`NEXT_PUBLIC_SITE_URL` env var** — should be set to `https://wandering-website-blush.vercel.app` in Vercel environment settings (currently falls back to `'https://yourdomain.com'`).

---

## HOW TO START THE STUDIO (every time)

```bash
cd /Users/armanparsa/Documents/GitHub/REPOSITORIES/wandering-website/WanderingWebsite
npm run dev
```

Open `http://localhost:3000/studio` in browser. Leave the terminal window open while working.

---

*Generated end of session — June 2026*
