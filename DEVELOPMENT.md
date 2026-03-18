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

## Manila Model Search Carousel V3 (Manila-Only, No Face Overlays)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v3.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v3`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Uses the top `manila*` prefixed images from `public/images/large` by sorted filename order and records them in `output-v3/sources.json`.
  - Layout avoids placing text over subjects' faces by using solid copy panels and separate framed photos.

## Manila Model Search Carousel V4 (Full-Height Imagery)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v4.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v4`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Continues to keep text above the lower CTA-safe area, while allowing imagery to extend farther to the bottom of the frame.
  - Uses the same top `manila*` image selection strategy as V3 and records it in `output-v4/sources.json`.
  - Slide 3 uses simpler process copy and avoids disclosing any selective review language.

## Manila Model Search Carousel V5 (Photo Proof Flow)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v5.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v5`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Flow order is:
    - `models in Manila`
    - `photo proof`
    - `what you get`
    - `how the shoot works`
    - `sign up`
  - No FAQ card/page is included in V5.

## Manila Model Search Carousel V6 (Manila Label + Portfolio Proof)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v6.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v6`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Every slide includes a large visible `MANILA` label without using pill UI.
  - Page 2 is positioned as portfolio proof and uses stronger Manila photos while keeping the first two proof images from the prior layout.

## Manila Model Search Carousel V7 (Improved Direct-Response UI)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v7.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v7`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Keeps `MANILA` clearly visible on every slide.
  - Uses a more aggressive visual hierarchy and cleaner proof/CTA layouts than V6 while preserving the same message flow.

## Manila Model Search Carousel V8 (Text-First Hook + CTA)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v8.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v8`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Pages 1 and 5 place the copy in the upper half with the image below to simplify composition.
  - Page 5 uses shorter CTA copy than V7.

## Antipolo CPC Story Ads (Low-CPC Static Pack)
- Source folder: `marketing/cpc-carousel-ads`
- Render command:
  - `node marketing/cpc-carousel-ads/render-antipolo-low-cpc-v2.mjs`
- Output folder:
  - `marketing/cpc-carousel-ads/output/antipolo-low-cpc-v2`
- Notes:
  - This renderer creates a brand new Antipolo-only folder and does not touch `marketing/cpc-carousel-ads/output/antipolo` or `marketing/cpc-carousel-ads/output/antipolo-low-cpc-v1`.
  - The pack is built for story/reels placement and keeps the message focused on local callout + explicit free offer + proof + objection handling + urgency.
  - `sources.json` in the output folder records the photo sources and the strategy for each creative.
  - If you need more local specificity, add new Antipolo-specific source images first; the current pack still uses the shared portfolio library from `public/images/large`.

## Antipolo CPC Story Ads V4 (100 Creative Concepts)
- Source folder: `marketing/cpc-carousel-ads`
- Render command:
  - `node marketing/cpc-carousel-ads/render-antipolo-low-cpc-v4.mjs`
- Output folder:
  - `marketing/cpc-carousel-ads/output/antipolo-low-cpc-v4`
- Notes:
  - V4 exports 100 static 1080x1920 slides plus `sources.json`.
  - `render-antipolo-low-cpc-v4.mjs` is a dedicated entrypoint that sets `CPC_OUT_SLUG=antipolo-low-cpc-v4` and runs the V3 concept renderer.
  - Concepts are explicitly authored one-by-one (not permutation mixing), each with distinct hook copy and assigned visual treatment.
  - Renderer currently uses 10 layout families (`hero`, `glass`, `proof`, `checklist`, `split`, `chat`, `magazine`, `urgency`, `timeline`, `sticky`) to keep feed variety high while preserving readability.

## Antipolo CPC Story Ads V5 (Quality + Copy Upgrade)
- Source folder: `marketing/cpc-carousel-ads`
- Render command:
  - `node marketing/cpc-carousel-ads/render-antipolo-low-cpc-v5.mjs`
- Output folder:
  - `marketing/cpc-carousel-ads/output/antipolo-low-cpc-v5`
- Notes:
  - V5 keeps the 100-concept structure but improves conversion-oriented copy quality (cleaner hooks, clearer offer language, less low-trust phrasing).
  - Typography was upgraded to use `Oswald` as the display face for stronger headline legibility.
  - Renderer now uses `deviceScaleFactor: 2` for crisper final PNG output.

## Manila Model Search Carousel V9 (Larger Manila Label)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v9.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v9`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Enlarges the `MANILA` label across all slides.
  - Removes small kicker labels and uses simpler top-level copy.
  - Uses taller portrait image framing on pages 1 and 5.

## Manila Model Search Carousel V10 (Refined Layout Pass)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v10.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v10`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Enlarges the page 1 and page 5 images further.
  - Rebuilds page 2 and page 3 layouts for a cleaner, higher-quality presentation.
  - Makes the page 4 image column wider than in V9.

## Manila Model Search Carousel V11 (Copy + Image Scale Pass)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v11.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v11`
- Notes:
  - Exports a five-slide 1080x1920 PNG set for story/reels use.
  - Increases the visual weight of pages 1 and 5 by scaling the images up further.
  - Rewrites page 2 and page 5 copy to sound more natural and sales-oriented.

## Manila Model Search Carousel V12 (Header Text Update)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v12.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v12`
- Notes:
  - Same layout as V11.
  - Shared page header text is updated from `MANILA` to `MANILA MODEL SEARCH`.

## Manila Model Search Carousel V13 (Borderless Hero + CTA Images)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v13.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v13`
- Notes:
  - Same layout as V12.
  - Page 1 and page 5 remove the white framed image treatment in favor of larger borderless image blocks.

## Manila Model Search Carousel V14 (Larger Page 1 + 5 Images)
- Source folder: `marketing/manila-model-search-carousel`
- Render command:
  - `node marketing/manila-model-search-carousel/render-v14.mjs`
- Output folder:
  - `marketing/manila-model-search-carousel/output-v14`
- Notes:
  - Same layout as V13.
  - Page 1 and page 5 increase image size further and switch to `cover` framing so the photos read as larger, cleaner image blocks with no bordered look.

## Manila Model Search Carousel Reel v70a (Subway/Transit Map)
- Script: `marketing/manila-model-search-carousel/reels-final/render-70a.mjs`
- Output: `marketing/manila-model-search-carousel/reels-final/output-70a/manila-subway-v70a.mp4`
- Copied to: `marketing/manila-model-search-carousel/reels-final/reels/manila-subway-v70a.mp4`
- Render command: `node marketing/manila-model-search-carousel/reels-final/render-70a.mjs`
- Notes:
  - 1080x1920, 30fps, 24s duration (720 frames). Frame-capture approach with Playwright.
  - Photos from `/Volumes/PortableSSD/Exports/film scans/` (8 film scan filenames starting with 000040850xxx.jpg).
  - Transit map concept: red main line (#E53935) draws itself down screen, stopping at 8 stations.
  - Each station pops a photo card (scaleX expand) and a solid station dot; train rect moves along the line.
  - 12–14s: map zooms out to 0.75x to show the full line.
  - 14–18s: blue branch line (#1E88E5) branches from STATION 08 with CTA stops: DM / PICK YOUR DATE / SHOW UP.
  - 18–22s: dark CTA board ("@madebyaidan · Transfer to Instagram · Fare: FREE · Now Boarding").
  - 22–24s: train pulses at terminus, white flash, hold.

## Story Carousel Image Ads (5 Themes x 3 Locations)
- Source folder: `marketing/story-carousels`
- Render command:
  - `node marketing/story-carousels/render-story-carousels.mjs`
- Output folder:
  - `marketing/story-carousels/output/{theme}/{location}/01-hook.png ... 05-cta.png`
- Themes: `vhs`, `photo-booth`, `slot-machine`, `bts-contact-sheet`, `tetris`
- Locations: `manila`, `antipolo`, `subic`
- Notes:
  - Generates 75 total 1080x1920 PNG story carousel slides (5 themes x 3 locations x 5 slides each).
  - Uses Playwright screenshot approach (same pattern as `render-v4.mjs`).
  - Photos sourced from `public/images/large/manila-gallery-*.jpg`.
  - Each carousel follows a 5-slide flow: hook -> proof -> how -> what -> cta.
  - Location name appears on hook and CTA slides; middle slides are shared across location variants.
  - Typography: Georgia serif for headlines, system sans-serif for body, Courier New monospace for VHS/Tetris themes.
