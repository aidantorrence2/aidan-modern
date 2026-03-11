# Manila Model Search Carousel

Render the 5-slide Instagram carousel:

```bash
node marketing/manila-model-search-carousel/render.mjs
```

Outputs:

- `output/01_models_in_manila.png`
- `output/02_what_you_get.png`
- `output/03_how_the_shoot_works.png`
- `output/04_faq.png`
- `output/05_sign_up.png`
- `output/proof-sources.json`

Notes:

- Exports are 1080x1350 portrait PNGs for Instagram carousel use.
- Slide 2 proof images are scraped from the live homepage at `https://aidantorrence.com`.
- If the live scrape fails or an image is unavailable, the renderer falls back to local portfolio files from `public/images/large`.
- Manila-specific hero/process/CTA photos come from the local Manila gallery assets already in the repo.
