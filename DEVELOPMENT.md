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
- `/manila-free` – Free collab/TFP version of the Manila landing page. Same structure but no pricing, emphasizes free sessions. Separate Cal.com link (`manila-free-photo-shoot`) and distinct Pixel tracking names.

## Daily Ops Checklist for Campaign Pages
- Confirm CTA phone/email destinations when duplicating sticky bars.
- If a new page is created, add it to navigation via `components/Header.tsx` when appropriate.
- Map any new Tailwind utility usage to files included in `tailwind.config.ts#content`.

## Common Issues & Fixes
- **Lint failures**: escape `'`/`"` in JSX strings (`&apos;`, `&quot;`) before shipping.
- **Slow image loads**: rerun `npm run images` to generate thumbnails/manifest and ensure new photos land under `public/images`.
- **Dev server port conflicts**: override with `npm run dev -- -p 3000` or stop existing process (e.g., `kill <pid>` from `/tmp/aidan-modern-dev.log`).
- **One-off landing page image swaps**: `tools/process_images.py` rewrites `public/images/manifest.json` from its source directory. For ad-hoc replacements on a single route, add resized files directly under `public/images/large` and `public/images/thumbs` with stable slugs instead of rerunning the full manifest pipeline.

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

## Manila Free Story / Reels Ad Rendering (Ultimate)
- Source folder: `marketing/manila-free-ads-ultimate`
- Render command:
  - `node marketing/manila-free-ads-ultimate/render.mjs`
- Output folders:
  - `marketing/manila-free-ads-ultimate/funnel-01_last-chance-electric`
  - `marketing/manila-free-ads-ultimate/funnel-02_last-chance-fresh`
  - `marketing/manila-free-ads-ultimate/funnel-03_last-chance-bold`
- Notes:
  - The script uses Playwright to render static 1080x1920 PNG story/reels frames from inline HTML.
  - Script behavior: each run deletes prior `story-*` and `funnel-*` output folders before rendering fresh frames.
  - All funnels follow a fixed five-slide flow: `hey free photo shoot` -> `proof` -> `how it works` -> `what you get` -> `cta`.
  - Messaging is interest/questions via direct message to move forward (no intro-call flow).
  - Creative strategy keeps direct-response structure with simple upbeat copy and clear urgency (last chance, limited time, limited slots).
  - Photo layers use `object-fit: contain` so source images are not cropped.
  - The package intentionally reuses only the Manila photo assets while replacing all prior ad copy/layouts.

## Manila Free V4 Video Ads (Instagram MP4)
- Motion clip inputs:
  - `/Users/aidantorrence/Downloads/reel-VEED.mp4`
  - `/Users/aidantorrence/Downloads/reel-VEED (1).mp4`
  - `/Users/aidantorrence/Downloads/reel-VEED (2).mp4`
  - `/Users/aidantorrence/Downloads/reel-VEED (3).mp4`
  - `/Users/aidantorrence/Downloads/reel-VEED (4).mp4`
  - `/Users/aidantorrence/Downloads/reel-VEED (5).mp4`
- Rendering script: `tools/render_manila_free_video_ads.sh`
- Output folder: `marketing/manila-free-ads/v4/videos`
- Re-render command:
  - `tools/render_manila_free_video_ads.sh`
- Notes:
  - Generates 5 vertical MP4 ads (`manila_free_A.mp4` ... `manila_free_E.mp4`) from stitched moving footage.
  - Uses 30fps H.264 + AAC output at 1080x1920, each 18s.
  - Render strategy is direct-response:
    - Hook (top text)
    - Offer/value line
    - Burned subtitle captions
    - Explicit bottom CTA
  - Script generates voiceovers using macOS `say` and mixes them over source audio.
  - Prefers `/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg`; falls back to `ffmpeg` if present.

## Manila Free V5 Video Ads (New Creative Set)
- Motion clip inputs:
  - `/Users/aidantorrence/Downloads/Copy of Copy of Copy of Copy of Copy of best ph (1080 x 1080 px) (Mobile Video).mp4`
  - `/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (1).mp4`
  - `/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (2).mp4`
  - `/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (3).mp4`
  - `/Users/aidantorrence/Downloads/Copy of Copy of IMG_1430-VEED (4).mp4`
  - `/Users/aidantorrence/Downloads/Copy of Copy of Copy of Copy of Copy of Copy of best ph (1080 x 1080 px).mp4`
- Rendering script: `tools/render_manila_free_video_ads_v5.sh`
- Output folder: `marketing/manila-free-ads/v5/videos`
- Re-render command:
  - `tools/render_manila_free_video_ads_v5.sh`
- Notes:
  - Generates 5 vertical MP4 ads (`manila_free_new_01.mp4` ... `manila_free_new_05.mp4`) at 1080x1920, 30fps, 18s.
  - Uses square-source framing with blurred background + centered foreground composite.
  - Handles mixed source clips where some inputs have no audio tracks.
  - Final videos currently use synthesized voiceover only (no source-bed audio mix).

## Manila Model Search Carousel (Static Instagram Ad)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output`
- Notes:
  - Exports a five-slide 1080x1350 PNG carousel:
    - `01_models_in_manila`
    - `02_what_you_get`
    - `03_how_the_shoot_works`
    - `04_faq`
    - `05_sign_up`
  - Slide 2 proof images are scraped from the live homepage at `https://aidantorrence.com` and recorded in `output/proof-sources.json`.
  - If the homepage scrape fails, the renderer falls back to local portfolio files in `public/images/large`.
  - As of March 11, 2026, `https://aidantorrence.com/manila-free` returns `404`, so the carousel proof references the live homepage portfolio instead of that route.

## Manila Model Search Carousel V2 (Stories / Reels Safe)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v2.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v2`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels ad placement.
  - Important text is intentionally kept above the lower CTA-safe area so platform overlays do not cover copy.
  - The sign-up button is not baked into the creative; slide 5 tells viewers to use the platform CTA.
  - Source photos come from the top image files in `public/images/large` by sorted filename order and are recorded in `output-v2/sources.json`.
