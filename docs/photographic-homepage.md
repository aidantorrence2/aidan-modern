# Photographic homepage

The root route renders the approved photographic edit (source version `e330984387305137362cab8174ca3903a19bcbb4`). It presents exactly 47 selected photographs once each, opening with `phoenix-ii-3-r1-09797-0005` and `phoenix-ii-r1-09793-0028`.

- `data/photographic-edit.json`: descriptive alt text, natural dimensions, final reading order, and all 26 image-specific passage layouts and grounds.
- `components/PhotographicPortfolio.tsx`: responsive image links and the native dialog viewer (Escape, arrow keys, swipe, wraparound navigation, focus restoration).
- `components/PhotographicPortfolio.module.css`: approved desktop/mobile composition, scoped to this homepage. The existing Inter font and optimized WebP files are reused unchanged.
- `app/page.tsx`: production metadata and canonical URL. The review-only noindex instruction is not present.

Other routes, shared layout/analytics, APIs, SEO assets, image files, and `data/portfolio-tiers.json` remain intact. All 99 prioritized photographs are retained in the existing tier data. `/designs/1` continues to show its previous globe, rather than re-exporting the redesigned homepage. Existing incoming `/#work` links still have an anchor.

Checks before publishing:

```sh
npm run test:portfolio
npm run test:photographic-edit
npx tsc --noEmit
npx next lint --file app/page.tsx --file components/PhotographicPortfolio.tsx --file app/designs/1/page.tsx
npm run build
```

The existing full-repository lint baseline still includes legacy `react/no-unescaped-entities` errors. Browser QA should compare desktop/mobile against the approved edit, verify all 47 images load, check no horizontal overflow, and exercise repeated opening, close/Escape, arrows, wraparound, swipe and focus restoration. Verify the exact merged commit's deployment status and the public production domain after GitHub publication; a successful build alone does not prove the public domain changed.
