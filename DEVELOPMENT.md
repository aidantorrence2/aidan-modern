# Development Guide

## Prerequisites
- Node.js 20.x (project verified with 20.11)
- npm 10+
- Python 3.x for the optional image tooling (`npm run images`)

## Setup & Common Commands
- Install deps: `npm install`
- Start dev server (http://localhost:5173):
  - Foreground: `npm run dev`
  - Background from this CLI: `npm run dev >/tmp/aidan-modern-dev.log 2>&1 & echo $!`
- Build for production: `npm run build`
- Serve built site: `npm run start`
- Optimise images from the default source folder: `npm run images`

## Testing & Quality
- Lint: `npm run lint`
  - Known issue: legacy travel promo pages still trigger `react/no-unescaped-entities` until their copy is entity-escaped.
- No other automated tests are configured; manual review is recommended after major UI edits.

## Architecture Overview
- Next.js 14 App Router (`app/` directory) with TypeScript and TailwindCSS.
- Global layout + scripts: `app/layout.tsx`, typography/utilities: `app/globals.css`.
- Shared UI lives in `components/` (header, footer, gallery, lightbox, sticky CTAs).
- Campaign/landing experiences are co-located in `app/<route>/page.tsx`.
- Meta Pixel support is gated by `NEXT_PUBLIC_META_PIXEL_ID` environment variable.

## Key Routes (Nov 2025)
- `/` – portfolio home and gallery.
- `/about`, `/book`, `/shoots/[slug]` – supporting storytelling + booking flows.
- `/manila` – Instagram ads landing page for Manila sessions with Cal.com "learn more" + quick intro call CTA flow and Meta Pixel interactions (`ViewContent`, `LandingScrollDepth`, lead clicks).

## Daily Ops Checklist for Campaign Pages
- Confirm CTA phone/email destinations when duplicating sticky bars.
- If a new page is created, add it to navigation via `components/Header.tsx` when appropriate.
- Map any new Tailwind utility usage to files included in `tailwind.config.ts#content`.

## Common Issues & Fixes
- **Lint failures**: escape `'`/`"` in JSX strings (`&apos;`, `&quot;`) before shipping.
- **Slow image loads**: rerun `npm run images` to generate thumbnails/manifest and ensure new photos land under `public/images`.
- **Dev server port conflicts**: override with `npm run dev -- -p 3000` or stop existing process (e.g., `kill <pid>` from `/tmp/aidan-modern-dev.log`).

## Video Ad Rendering (Manila Campaign)
- Rendering script: `tools/render_manila_video_ads.sh`
- Output folder: `marketing/manila-video-ads/videos`
- Requires `ffmpeg-full` (not plain `ffmpeg`) for `drawtext` and `subtitles` filters.
  - Install: `brew install ffmpeg-full`
  - Binary used by script when available: `/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg`
- Re-render command:
  - `tools/render_manila_video_ads.sh`
- Gotcha:
  - If overlays/captions fail with `No such filter: drawtext`, the shell is using plain `ffmpeg` without libfreetype/libass support.

## Video Ad Rendering V2 (Rebuild)
- Rendering script: `tools/render_manila_video_ads_v2.sh`
- Output folder: `marketing/manila-video-ads-v2/videos`
- Inputs:
  - Moving source clips from `/Users/aidantorrence/Downloads/reel-VEED*.mp4`
  - Subtitle templates in `marketing/manila-video-ads-v2/subtitles`
- V2 pipeline characteristics:
  - 8-segment fast-cut assembly per ad (18s total)
  - Voiceover generation via macOS `say` + dynamic ducking
  - Burned-in hooks, CTA strip, and subtitles
- Regenerate:
  - `tools/render_manila_video_ads_v2.sh`
