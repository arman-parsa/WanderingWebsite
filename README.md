# Arman Parsa

Portfolio of Arman Parsa — travel, documentary and lifestyle photography, film and writing, for personal work and commissions (hotels, travel experiences, outdoor brands, conservation, editorial).
Live at **https://www.armanparsa.earth** (the bare domain redirects there). Prints: **https://store.armanparsa.earth** (Picfair; the STORE nav link goes via `/store`).

## Site map

- `/` — hero (Site Settings images, shuffled) and the latest personal pieces
- `/earth` — globe of personal pieces · `/gallery` — floating collage of their photographs
- `/library` (nav: PERSONAL) — all personal pieces: `/writing`, `/mixed-media`, `/photography`, `/videography`
- `/commissions` and `/commissions/<slug>` — client work (separate Sanity type, never mixed with personal pieces)
- `/contact` — bio, email and social links (`/about` redirects here) · `/store` → Picfair

## Editing in Sanity Studio (`/studio`)

- **Site Settings** (top of the sidebar): hero images, bio, email, social links, and *Search & sharing* — homepage title, site description and the default share image. Every field falls back to a built-in default when empty.
- **Personal work**: Writing, Mixed Media, Photography, Videography. **Commissions**: one document per client project.
- Publishing refreshes the site through the `/api/revalidate` webhook.

## Stack

- **Next.js 16.4.1** (App Router, Turbopack) — note: `params` is a `Promise` and must be awaited; read `node_modules/next/dist/docs/` before writing framework code (see `AGENTS.md`)
- **Sanity v5** CMS (project `8p5lsu79`, dataset `production`), embedded studio at `/studio`
- **Tailwind CSS v4** — configured via `@theme inline {}` in `src/app/globals.css`; there is no `tailwind.config.ts`
- **Three.js** WebGL globe on `/earth`
- **Vercel** hosting — auto-deploys `main`

## Getting started

```bash
cp .env.example .env.local   # fill in values (see below)
npm install
npm run dev
```

Open http://localhost:3000 — the studio lives at http://localhost:3000/studio.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project (falls back to `8p5lsu79`) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (falls back to `production`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata/sitemap (falls back to `https://armanparsa.earth`) |
| `SANITY_WEBHOOK_SECRET` | Required for the `/api/revalidate` ISR webhook |

## Project documentation

- `SESSION_HANDOFF.md` — architecture, design system, component deep dives, conventions, and the change log (§13 onwards)
- `AGENTS.md` / `CLAUDE.md` — instructions for AI coding agents

## Commands

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
npm run compress-photos -- <folder>   # resize/compress photos before uploading
```
