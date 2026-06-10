# Arman's Wanderings

Personal editorial archive — travel writing, photography, and mixed media by Arman Parsa.
Live at **https://wandering-website-blush.vercel.app** (production domain: `armanparsa.earth`).

## Stack

- **Next.js 16.2.7** (App Router, Turbopack) — note: `params` is a `Promise` and must be awaited; read `node_modules/next/dist/docs/` before writing framework code (see `AGENTS.md`)
- **Sanity v5** CMS (project `8p5lsu79`, dataset `production`), embedded studio at `/studio`
- **Tailwind CSS v4** — configured via `@theme inline {}` in `src/app/globals.css`; there is no `tailwind.config.ts`
- **Three.js** WebGL globe on `/map`
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
| `SANITY_API_READ_TOKEN` | Server-only preview reads (optional) |
| `SANITY_WEBHOOK_SECRET` | Required for the `/api/revalidate` ISR webhook |

## Project documentation

- `SESSION_HANDOFF.md` — architecture, design system, component deep dives, conventions
- `AGENTS.md` / `CLAUDE.md` — instructions for AI coding agents
- `STUDIO_SETUP_HANDOFF.md` — Sanity studio + schema notes

## Commands

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```
