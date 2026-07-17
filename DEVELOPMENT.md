# Development Guide — aidan-modern

## Build commands

```bash
npm install
npm run build       # production build (catches type errors; run before pushing)
npm run lint        # ESLint
```

## Test commands

No automated tests configured. Manual review is recommended after major UI edits.

```bash
npm run lint        # known issue: legacy travel promo pages still trigger react/no-unescaped-entities
```

## Run / restart

```bash
# Dev server (http://localhost:5173)
npm run dev
# Background:
npm run dev >/tmp/aidan-modern-dev.log 2>&1 & echo $!

# Serve built site
npm run start

# Optimise images from default source folder
npm run images
```

## Architecture overview

Next.js 14 App Router (TypeScript, TailwindCSS). Deployed on Vercel Pro project `aidan-vercel/aidan-modern-at9e`.

- `app/` — App Router pages. Global layout + scripts: `app/layout.tsx`; typography/utilities: `app/globals.css`.
- `components/` — shared UI (header, footer, gallery, lightbox, sticky CTAs).
- Campaign/landing experiences co-located in `app/<route>/page.tsx`.
- Meta Pixel support gated by `NEXT_PUBLIC_META_PIXEL_ID`.
- Availability slots persisted in **Neon** Postgres (`DATABASE_URL`), table `availability_slots` (`lib/neon.ts`, `@neondatabase/serverless`). Separate from the Supabase-backed `signups` flow.

### First-party analytics (/sign-up-collab)

- Client tracker `lib/track.ts` batches events to `POST /api/events`, stored in Neon table `analytics_events` (auto-created on first insert; geo from Vercel headers).
- `SignUpFormCollab` tracks the full funnel: page_view → form_start → field_engaged per field → validation_error → submit_attempt/success/error, plus scroll depth, active time, concept/location choices, UTM/referrer attribution. Counts and booleans only — no raw contact details in events.
- Report: `node scripts/pull-collab-analytics.mjs [days]` (funnel, drop-off, sources, geo, engagement). Headless/bot UAs are excluded.

### Sign-up notifications

- Slack: `SLACK_BOOKING_WEBHOOK`
- WhatsApp via CallMeBot (free): `CALLMEBOT_PHONE` + `CALLMEBOT_API_KEY`. Rate limit: ~1 msg/few seconds; each sign-up sends 1 text + N image messages.

## Important file locations

| Path | Purpose |
|---|---|
| `app/layout.tsx` | Global layout and scripts |
| `app/globals.css` | Typography and utilities |
| `components/Header.tsx` | Navigation (add new pages here) |
| `components/SignUpFormBali.tsx` | Bali booking form with 4 packages |
| `lib/neon.ts` | Neon Postgres helper for availability slots |
| `tailwind.config.ts` | Tailwind content paths — update when adding new files |
| `tools/process_images.py` | Rewrites `public/images/manifest.json` from source directory |
| `public/images/large/` | Full-size images served by the site |
| `public/images/thumbs/` | Thumbnail images |
| `tools/render_manila_video_ads.sh` | Manila V1 video ads render script |
| `tools/render_manila_video_ads_v2.sh` | Manila V2 video ads render script |
| `tools/render_manila_free_video_ads.sh` | Manila Free V4 video ads |
| `tools/render_manila_free_video_ads_v5.sh` | Manila Free V5 video ads |
| `marketing/manila-model-search-carousel/` | Static carousel renders (V1–V14) + reels |
| `marketing/bts-reels/` | BTS Bridge Reels (sets 85, 86, 87) |
| `marketing/cpc-carousel-ads/` | Antipolo CPC story ads |
| `marketing/story-carousels/` | 5-theme × 3-location story carousel set |
| `marketing/manila-free-ads-ultimate/` | Manila Free story/reels ad set (Playwright-rendered) |
| `.vercel/project.json` | Must name `aidan-modern-at9e` |

## Quirks & gotchas

### Vercel deploy (critical — read before deploying)

**Always deploy with `scripts/deploy.sh`. Do not hand-run `git push` / `vercel --prod` for a production ship.**

```sh
scripts/deploy.sh
```

That script is the single supported path. It: builds locally (catches missing-env/type errors), pushes committed `HEAD` only, waits for the `at9e` production build of that exact commit to reach Ready, **promotes it onto `www.aidantorrence.com`**, and verifies the live domain actually moved. It exists because of the failure mode below — promotion is easy to forget, and forgetting leaves the live site silently stale on an old build.

Background / why the script does what it does:

- Production project is `aidan-vercel/aidan-modern-at9e` (`prj_IprqbRdPN7RV4OpOzzAYPhGHTvAr`). Do NOT deploy to `aidan-vercel/aidan-modern` (a **stray duplicate** that rebuilds on every push but serves no real domain — safe to ignore, or delete it in the dashboard) or the legacy Hobby project under `aidantorrences-projects`. `scripts/deploy.sh` asserts `.vercel/project.json` names `aidan-modern-at9e` before doing anything; relink if needed with `vercel link --project aidan-modern-at9e --scope aidan-vercel --yes`.
- **Auto-assign-domain is ON for at9e but does NOT reliably move the alias** — the live domain had been manually pinned to a specific deployment, which overrides auto-assign, so new Ready production builds stay dark until explicitly promoted. The script always promotes; never rely on the push alone.
- **Never run `vercel --prod` from this dirty working tree.** It uploads the working tree (not clean git `HEAD`) — and this repo carries ~9GB of `marketing/` assets plus tracked deletions that would become production 404s. The script ships via `git push` + `vercel promote` precisely to avoid this. If a bad upload ever lands: `vercel rollback <known-good-deployment-url> --scope aidan-vercel --yes`.
- The script self-verifies, but for a manual spot-check the live domain after any deploy: `vercel inspect https://www.aidantorrence.com` should resolve to the NEW deployment URL, and `curl` the changed route and grep for new content (edge can serve a cached page from an old deployment — check `x-vercel-cache`/`age` headers).

### Video ad rendering

- Requires `ffmpeg-full` (not plain `ffmpeg`) for `drawtext` and `subtitles` filters: `brew install ffmpeg-full`. Scripts auto-detect `/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg`.
- If overlays/captions fail with `No such filter: drawtext`, the shell is using plain `ffmpeg` without libfreetype/libass support.
- Long single-line captions overflow 1080px at size 50+; use the `CAP2()` two-line helper in the render scripts.
- BTS reels 85 was rejected (cheap/off-brand); 85 mp4s moved to `reels/_archive-v85/` (not deleted). 86 supersedes 85.
- BTS reel 86: NO synthetic `noise` grain — it exploded bitrate to 100MB+. The film scans already carry grain.
- Photos from exports/film scans are already positive — do NOT negate them.
- Photos are shown full-frame (cover-crop to 1080x1920 with per-photo focus point) in 86+; 85 used blurred-bar contain (rejected).

### Availability slots

- `datetime-local` in the admin is interpreted in the admin's local timezone, stored as UTC; the public page renders in each visitor's local timezone with relative day labels (Today/Tomorrow/weekday).
- Removals are soft deletes (`deleted_at`). Public/admin APIs filter to `deleted_at IS NULL AND start_at >= now()`.
- Uses Neon (not Supabase) for availability.

### Bali booking packages

`/sign-up-bali` has a price floor with four packages: Essential (Rp 2,500,000 ~$150), Signature (Rp 5,000,000 ~$300, default), Editorial (Rp 9,000,000 ~$550), Student/PWYW (min Rp 800,000). Package maps to the `Price:` line in the Slack/CallMeBot notification.

### Carousel / reels versioning

- New concept → new version **number** (e.g., 59, 60)
- Changes to existing concept → bump version **letter** (e.g., 59a → 59b)
- File naming: `{number}{letter}-{description}.mp4`; render scripts: `render-{number}{letter}.mjs`; output dirs: `output-{number}{letter}/`
- Every rendered mp4 must be copied to `reels-final/reels/` with the correct name

## Common issues & fixes

- **Lint failures**: escape `'`/`"` in JSX strings (`&apos;`, `&quot;`) before shipping.
- **Slow image loads**: rerun `npm run images` to generate thumbnails/manifest; ensure new photos land under `public/images`.
- **Dev server port conflicts**: override with `npm run dev -- -p 3000` or kill existing process (find pid in `/tmp/aidan-modern-dev.log`).
- **One-off landing page image swaps**: for ad-hoc replacements on a single route, add resized files directly under `public/images/large` and `public/images/thumbs` with stable slugs instead of rerunning the full manifest pipeline.

## Non-obvious procedures

### CallMeBot one-time setup

1. From the recipient phone, save +34 644 51 95 23 (CallMeBot) as a contact.
2. Send the exact text `I allow callmebot to send me messages` to that contact via WhatsApp.
3. You'll receive a reply with your personal API key.
4. Set `CALLMEBOT_PHONE` (international format with `+`) and `CALLMEBOT_API_KEY` in `.env.local` and Vercel project settings.

### Video ad render commands

| Ad set | Script | Output |
|---|---|---|
| Manila V1 | `tools/render_manila_video_ads.sh` | `marketing/manila-video-ads/videos` |
| Manila V2 | `tools/render_manila_video_ads_v2.sh` | `marketing/manila-video-ads-v2/videos` |
| Manila Free story ads (ultimate) | `node marketing/manila-free-ads-ultimate/render.mjs` | `marketing/manila-free-ads-ultimate/funnel-01..03` |
| Manila Free V4 | `tools/render_manila_free_video_ads.sh` | `marketing/manila-free-ads/v4/videos` |
| Manila Free V5 | `tools/render_manila_free_video_ads_v5.sh` | `marketing/manila-free-ads/v5/videos` |
| BTS Bridge 85 | `node marketing/bts-reels/render-85.mjs [a b c d e]` | `marketing/bts-reels/output-85{x}/` |
| BTS Bridge 86 (supersedes 85) | `node marketing/bts-reels/render-86.mjs [a b c d e]` | `marketing/bts-reels/output-86{x}/` |
| BTS Bridge 87 | `node marketing/bts-reels/render-87.mjs [a b c d]` | `marketing/bts-reels/output-87{x}/` |
| Manila subway reel v70a | `node marketing/manila-model-search-carousel/reels-final/render-70a.mjs` | `reels-final/output-70a/` + `reels/` |
| Story carousels (5 themes × 3 locations) | `node marketing/story-carousels/render-story-carousels.mjs` | `marketing/story-carousels/output/{theme}/{location}/` |
| Antipolo CPC V2 | `node marketing/cpc-carousel-ads/render-antipolo-low-cpc-v2.mjs` | `output/antipolo-low-cpc-v2` |
| Antipolo CPC V4 (100 concepts) | `node marketing/cpc-carousel-ads/render-antipolo-low-cpc-v4.mjs` | `output/antipolo-low-cpc-v4` |
| Antipolo CPC V5 | `node marketing/cpc-carousel-ads/render-antipolo-low-cpc-v5.mjs` | `output/antipolo-low-cpc-v5` |
| Bali model-collab carousel | `node marketing/carousel/render-bali-model-collab.mjs` | `marketing/carousel/output-v3/bali-model-collab` |

Manila static carousel (V1–V14): `node marketing/manila-model-search-carousel/render-v{N}.mjs` → output in `output-v{N}/`.

### BTS reel inputs (local, gitignored)

- BTS clip: `marketing/bts-reels/src/bts-source.mp4` (copied from `/Volumes/PortableSSD/VID_20260607_013526.mp4`)
- Front clip (87): `marketing/bts-reels/src/front-clip.mp4` (copied from `/Volumes/PortableSSD/VID_20260323_165127.mp4`)
- 10 film-scan portraits: `marketing/bts-reels/photos/` (from `/Volumes/PortableSSD/Exports/ray selects/`)
- Fonts (committed): `marketing/bts-reels/fonts/` (Bebas Neue, Anton, Montserrat)
- Subway reel photos: 8 film scan filenames starting with `000040850xxx.jpg` from `/Volumes/PortableSSD/Exports/film scans/`
