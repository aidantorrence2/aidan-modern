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

V4 render (full-height imagery, simpler process copy):

```bash
node marketing/manila-model-search-carousel/render-v4.mjs
```

V4 outputs:

- `output-v4/01_models_in_manila_story.png`
- `output-v4/02_what_you_get_story.png`
- `output-v4/03_how_the_shoot_works_story.png`
- `output-v4/04_faq_story.png`
- `output-v4/05_sign_up_story.png`
- `output-v4/sources.json`

Additional V4 notes:

- Keeps text out of the lower CTA-safe zone but lets photos run farther toward the bottom.
- Updates slide 3 to use a different Manila image and simpler, easier process language without selection wording.

V5 render (photo proof sequence):

```bash
node marketing/manila-model-search-carousel/render-v5.mjs
```

V5 outputs:

- `output-v5/01_models_in_manila_story.png`
- `output-v5/02_photo_proof_story.png`
- `output-v5/03_what_you_get_story.png`
- `output-v5/04_how_the_shoot_works_story.png`
- `output-v5/05_sign_up_story.png`
- `output-v5/sources.json`

Additional V5 notes:

- Removes the FAQ page entirely.
- Uses the five-page order: hook, photo proof, what you get, how it works, sign up.

V6 render (clear Manila labeling, improved proof page):

```bash
node marketing/manila-model-search-carousel/render-v6.mjs
```

V6 outputs:

- `output-v6/01_models_in_manila_story.png`
- `output-v6/02_portfolio_images_story.png`
- `output-v6/03_what_you_get_story.png`
- `output-v6/04_how_the_shoot_works_story.png`
- `output-v6/05_sign_up_story.png`
- `output-v6/sources.json`

Additional V6 notes:

- Every slide includes a clear visible `MANILA` label without pill styling.
- Page 2 is reframed as portfolio proof rather than "photo proof".
- Page 2 keeps the first two proof images and swaps the rest for stronger Manila images.

V7 render (stronger direct-response UI):

```bash
node marketing/manila-model-search-carousel/render-v7.mjs
```

V7 outputs:

- `output-v7/01_models_in_manila_story.png`
- `output-v7/02_portfolio_images_story.png`
- `output-v7/03_what_you_get_story.png`
- `output-v7/04_how_the_shoot_works_story.png`
- `output-v7/05_sign_up_story.png`
- `output-v7/sources.json`

Additional V7 notes:

- Keeps the V6 five-slide flow but redesigns the layouts for stronger hierarchy and cleaner contrast.
- Maintains visible `MANILA` labeling on every slide without using pill UI.

V8 render (text-first pages 1 and 5):

```bash
node marketing/manila-model-search-carousel/render-v8.mjs
```

V8 outputs:

- `output-v8/01_models_in_manila_story.png`
- `output-v8/02_portfolio_images_story.png`
- `output-v8/03_what_you_get_story.png`
- `output-v8/04_how_the_shoot_works_story.png`
- `output-v8/05_sign_up_story.png`
- `output-v8/sources.json`

Additional V8 notes:

- Pages 1 and 5 use a text-above / image-below structure.
- Page 5 uses much shorter CTA copy than V7.

V9 render (bigger Manila label, cleaner copy):

```bash
node marketing/manila-model-search-carousel/render-v9.mjs
```

V9 outputs:

- `output-v9/01_models_in_manila_story.png`
- `output-v9/02_portfolio_images_story.png`
- `output-v9/03_what_you_get_story.png`
- `output-v9/04_how_the_shoot_works_story.png`
- `output-v9/05_sign_up_story.png`
- `output-v9/sources.json`

Additional V9 notes:

- Uses a larger `MANILA` treatment on every slide.
- Removes the small kicker/subheader labels.
- Makes the page 1 and page 5 images taller portrait frames.

V10 render (larger hero/cta images, rebuilt proof/value pages):

```bash
node marketing/manila-model-search-carousel/render-v10.mjs
```

V10 outputs:

- `output-v10/01_models_in_manila_story.png`
- `output-v10/02_portfolio_images_story.png`
- `output-v10/03_what_you_get_story.png`
- `output-v10/04_how_the_shoot_works_story.png`
- `output-v10/05_sign_up_story.png`
- `output-v10/sources.json`

V11 render (larger images + better sales copy):

```bash
node marketing/manila-model-search-carousel/render-v11.mjs
```

V11 outputs:

- `output-v11/01_models_in_manila_story.png`
- `output-v11/02_portfolio_images_story.png`
- `output-v11/03_what_you_get_story.png`
- `output-v11/04_how_the_shoot_works_story.png`
- `output-v11/05_sign_up_story.png`
- `output-v11/sources.json`

V12 render (header copy update):

```bash
node marketing/manila-model-search-carousel/render-v12.mjs
```

V12 outputs:

- `output-v12/01_models_in_manila_story.png`
- `output-v12/02_portfolio_images_story.png`
- `output-v12/03_what_you_get_story.png`
- `output-v12/04_how_the_shoot_works_story.png`
- `output-v12/05_sign_up_story.png`
- `output-v12/sources.json`

V13 render (borderless page 1 and 5 images):

```bash
node marketing/manila-model-search-carousel/render-v13.mjs
```

V13 outputs:

- `output-v13/01_models_in_manila_story.png`
- `output-v13/02_portfolio_images_story.png`
- `output-v13/03_what_you_get_story.png`
- `output-v13/04_how_the_shoot_works_story.png`
- `output-v13/05_sign_up_story.png`
- `output-v13/sources.json`

Additional V13 notes:

- Keeps the V12 layouts and header copy.
- Removes the white framed image treatment from pages 1 and 5 and replaces it with clean borderless image blocks.

V14 render (larger full-bleed page 1 and 5 images):

```bash
node marketing/manila-model-search-carousel/render-v14.mjs
```

V14 outputs:

- `output-v14/01_models_in_manila_story.png`
- `output-v14/02_portfolio_images_story.png`
- `output-v14/03_what_you_get_story.png`
- `output-v14/04_how_the_shoot_works_story.png`
- `output-v14/05_sign_up_story.png`
- `output-v14/sources.json`

Additional V14 notes:

- Keeps the V13 layouts and copy.
- Page 1 and page 5 use larger `cover` image treatments to remove the remaining bordered look and push the photos closer to full-bleed.
