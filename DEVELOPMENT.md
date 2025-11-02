# Development Guide

## Prerequisites
- Node.js 20.x (project tested with 20.11)
- npm 10+
- Python 3.x (for the image processing helper)

## Initial Setup
1. Install dependencies: `npm install`
2. (Optional) Generate optimized image assets: `npm run images`
   - Source folder defaults to `/Users/aidantorrence/Documents/selected`
   - Output manifests and thumbnails land in `public/images/{large,thumbs}`

## Running the App
- Start the dev server: `npm run dev`
  - Server runs on http://localhost:5173
  - To background the server from this CLI: `npm run dev >/tmp/aidan-modern-dev.log 2>&1 & echo $!`
- Production build: `npm run build`
- Serve the production build locally: `npm run start`

## Testing & Quality
- Lint the project: `npm run lint`
  - Current codebase includes pre-existing `react/no-unescaped-entities` warnings on legacy location pages. Address or temporarily disable if they block your workflow.
- No other automated tests are configured.

## Architecture Notes
- Next.js 14 app-router project (`app/` directory) with TypeScript and TailwindCSS.
- Global layout and shared UI live in `app/layout.tsx`, `app/globals.css`, and `components/`.
- Gallery images are generated via `create-og-image.py` and `tools/process_images.py`.
- Sticky call-to-action components surface in location-specific landing pages for conversion tracking.

## Key Paths
- `app/page.tsx` – homepage hero + gallery pipeline.
- `app/bali-assistant/page.tsx` – creative assistant landing page (added in this iteration).
- `components/` – reusable UI (hero, CTAs, gallery, lightbox, etc.).
- `data/` – structured content used across pages.

## Common Issues & Gotchas
- Running `npm run lint` currently surfaces `react/no-unescaped-entities` on legacy travel promos; sanitize copy with HTML entities before shipping.
- `npm run images` expects the source folder above; override the path when running against different photo sets.
- Meta Pixel tracking depends on `NEXT_PUBLIC_META_PIXEL_ID`; unset by default in local development.
