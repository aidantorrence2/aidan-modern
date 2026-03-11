# Manila Model Search Carousel

V1 render:

```bash
node marketing/manila-model-search-carousel/render.mjs
```

V1 outputs:

- `output/01_models_in_manila.png`
- `output/02_what_you_get.png`
- `output/03_how_the_shoot_works.png`
- `output/04_faq.png`
- `output/05_sign_up.png`
- `output/proof-sources.json`

V2 render (stories/reels-safe layout):

```bash
node marketing/manila-model-search-carousel/render-v2.mjs
```

V2 outputs:

- `output-v2/01_models_in_manila_story.png`
- `output-v2/02_what_you_get_story.png`
- `output-v2/03_how_the_shoot_works_story.png`
- `output-v2/04_faq_story.png`
- `output-v2/05_sign_up_story.png`
- `output-v2/sources.json`

Notes:

- Exports are 1080x1350 portrait PNGs for Instagram carousel use.
- Slide 2 proof images are scraped from the live homepage at `https://aidantorrence.com`.
- If the live scrape fails or an image is unavailable, the renderer falls back to local portfolio files from `public/images/large`.
- Manila-specific hero/process/CTA photos come from the local Manila gallery assets already in the repo.
- V2 exports are 1080x1920 story/reels PNGs.
- V2 keeps all important text above the bottom CTA-safe area and does not render a fake sign-up button into the image.
- V2 uses the top image files from `public/images/large` by sorted filename order and records them in `output-v2/sources.json`.

V3 render (Manila-only, no text on faces):

```bash
node marketing/manila-model-search-carousel/render-v3.mjs
```

V3 outputs:

- `output-v3/01_models_in_manila_story.png`
- `output-v3/02_what_you_get_story.png`
- `output-v3/03_how_the_shoot_works_story.png`
- `output-v3/04_faq_story.png`
- `output-v3/05_sign_up_story.png`
- `output-v3/sources.json`

Additional V3 notes:

- Uses the top `manila*` prefixed files from `public/images/large` by sorted filename order.
- Layout keeps copy off the photos by using split panels and separate framed images instead of text overlays on faces.
