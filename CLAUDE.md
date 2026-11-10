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

## Model Workflow: Plan on Fable 5.2, Execute on Opus 5.5

- **Main session (Fable 5.2)** does the high-level work: understanding the request, exploring the codebase, deciding the approach, breaking it into steps, and reviewing results.
- **Execution goes to Opus 5.5**: delegate implementation (writing/editing code, running builds and renders) to the `executor` subagent (`.claude/agents/executor.md`, `model: opus`) via the Agent tool. Give it a self-contained brief: goal, files involved, constraints, and what "done" looks like.
- Run independent pieces of work as parallel `executor` agents; keep dependent steps sequential.
- After each executor finishes, the main session reviews the diff and the verification output before committing and pushing.
- Exception: trivial changes (a one-line fix, a typo, a config tweak) can be made directly in the main session — delegation is not worth the overhead.
