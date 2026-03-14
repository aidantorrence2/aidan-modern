# Project: Aidan Torrence Photography Portfolio

## Stack
- Next.js 14.2.5 with App Router (TypeScript)
- `typedRoutes` experiment enabled — use `as any` for dynamic route hrefs
- Deployed on Vercel

## Build & Deploy
- Always run `npx next build` before pushing to catch type errors early
- Vercel auto-deploys from GitHub on push
- Production domain: aidantorrence.com

## Code Conventions
- All page components use `'use client'` directive
- CSS is injected inline via template literals with `dangerouslySetInnerHTML`
- Images served from `/images/large/FILENAME`
- Dark theme: background `#0c0c0c`, white text, Georgia serif + system-ui sans-serif
- Header/footer hidden on custom pages with: `body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }`

## Reels Versioning & Naming

- **New concept** → new version **number** (e.g., 59, 60, 61)
- **Changes to existing concept** → bump the version **letter** (e.g., 59a → 59b → 59c)
- **File naming**: `{number}{letter}-{description}.mp4` (e.g., `59a-slot-machine.mp4`, `66b-photo-booth.mp4`)
- **Render scripts**: `render-{number}{letter}.mjs` with matching `output-{number}{letter}/` dir
- **All output filenames must match**: render script output name, output dir name, and reels/ copy name must all use the same `{number}{letter}` identifier
- **Copy to reels/**: Every rendered mp4 must be copied to `reels-final/reels/` with the correct name
