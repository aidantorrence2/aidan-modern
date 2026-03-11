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

V15 render (cropping fix + CPC copy):

```bash
node marketing/manila-model-search-carousel/render-v15.mjs
```

V15 outputs:

- `output-v15/01_models_in_manila_story.png`
- `output-v15/02_portfolio_images_story.png`
- `output-v15/03_what_you_get_story.png`
- `output-v15/04_how_the_shoot_works_story.png`
- `output-v15/05_sign_up_story.png`
- `output-v15/sources.json`

Additional V15 notes:

- Fixes cropping on pages 1 and 5: image containers are now 1310px tall (up from ~1016/1040) with `object-position: top 15%` so faces are not cut off.
- Top label moved down slightly (56px from top vs 42px) for breathing room from IG status bar.
- Page 1 headline changed to "Models wanted in Manila." with shorter subhead ending in "Sign up below."
- Page 5 CTA changed to "Sign up — it takes 60 seconds." with "I'll message you back within a day."
- darkBox padding and font sizes tightened to give images more real estate.
- Page 2 proof images slightly wider (316px vs 308px).
- Page 3 chips have more vertical spacing (144px gaps vs 136px).

V16 render (full-bleed DR creative, 4 slides):

```bash
node marketing/manila-model-search-carousel/render-v16.mjs
```

V16 outputs:

- `output-v16/01_hook_story.png`
- `output-v16/02_proof_story.png`
- `output-v16/03_how_easy_story.png`
- `output-v16/04_sign_up_story.png`
- `output-v16/sources.json`

Additional V16 notes:

- Completely new design optimized for CPC and form completion.
- 4 slides instead of 5 to reduce carousel drop-off: HOOK > PROOF > EASY > CTA.
- Full-bleed photos on every slide with dark gradient overlays — native IG story feel.
- Sans-serif headlines (Avenir Next / Futura) instead of serif for modern impact.
- Slide 1: "Models wanted." pattern-interrupt hook with full-bleed hero.
- Slide 2: 2x2 photo grid on dark background. "This is my work." + "You could look like this."
- Slide 3: Glassmorphism step cards over full-bleed image. "3 steps. That's it."
- Slide 4: "Sign up below." + urgency badge "Limited spots this month."
- Swipe indicators on slides 1-3.
- All text above SAFE_BOTTOM (410px).

V17 render (animated proof slide MP4):

```bash
node marketing/manila-model-search-carousel/render-v17.mjs
```

V17 outputs:

- `output-v17/01_hook_story.png`
- `output-v17/02_proof_story.mp4` (animated video)
- `output-v17/03_how_easy_story.png`
- `output-v17/04_sign_up_story.png`
- `output-v17/sources.json`

Additional V17 notes:

- Identical to V16 except slide 2 (proof/mosaic) is an animated MP4 video instead of a static PNG.
- Uses Playwright's `recordVideo` API to capture the page animation, then converts to H.264 MP4 via ffmpeg.
- 10 mosaic images fade in with a slight scale-up (0.85 to 1.0), staggered 300ms apart, creating a "gallery loading" reveal effect.
- Header text ("MANILA" in gold #e8b880 + "This is my work.") fades in at the start.
- After all images are revealed, holds for ~1 second before the video ends.
- Video is 1080x1920, ~5 seconds, 30fps, H.264/MP4.
- Dark background (#0a0a0a) visible throughout. All text above safe bottom (410px from bottom).
- Static slides 1, 3, and 4 are unchanged PNGs.

V18 render (high-contrast bold white-bg design, 4 slides):

```bash
node marketing/manila-model-search-carousel/render-v18.mjs
```

V18 outputs:

- `output-v18/01_hook_story.png`
- `output-v18/02_proof_story.png`
- `output-v18/03_process_story.png`
- `output-v18/04_cta_story.png`
- `output-v18/sources.json`

Additional V18 notes:

- Completely new design — looks nothing like v16. Optimized for CPC and form completion.
- High-contrast bold aesthetic: white backgrounds, black text, thick black image borders, red-orange MANILA accent color (#D4380D).
- Feels like a Nike ad — clean, punchy, scroll-stopping on IG because it breaks the pattern of dark filtered content.
- 4 slides: HOOK > PROOF > PROCESS > CTA.
- Slide 1: "Models wanted." with thick-bordered hero image below text, clean white space.
- Slide 2: 3x3 photo grid (9 diverse images) with thick borders on white. "This is my work."
- Slide 3: Numbered steps (01/02/03) with horizontal rules, monospace step numbers in accent color, small accent image bottom-right.
- Slide 4: Large bordered image top half, "Sign up below." with black urgency pill "LIMITED SPOTS THIS MONTH."
- No swipe indicators.
- MANILA prominent in red-orange on every slide.
- All content above SAFE_BOTTOM (410px).
- Images have less than 10% crop thanks to bordered containers with object-fit:cover.

V19 render (v18 white-bg design with animated proof slide MP4):

```bash
node marketing/manila-model-search-carousel/render-v19.mjs
```

V19 outputs:

- `output-v19/01_hook_story.png`
- `output-v19/02_proof_story.mp4` (animated video)
- `output-v19/03_process_story.png`
- `output-v19/04_cta_story.png`
- `output-v19/sources.json`

Additional V19 notes:

- Identical to V18 except slide 2 (proof grid) is an animated MP4 video instead of a static PNG.
- Uses Playwright's `recordVideo` API to capture the page animation, then converts WebM to H.264 MP4 via ffmpeg.
- 9 grid images (3x3) fade in with a slight scale-up (0.85 to 1.0), staggered 300ms apart, creating a "gallery loading" reveal effect.
- Header text ("MANILA" in red-orange #D4380D + "This is my work.") fades in at the start.
- After all images are revealed, holds for ~1.5 seconds before the video ends.
- Video is 1080x1920, ~5.8 seconds, 30fps, H.264/MP4.
- White background (#FFFFFF) with thick black borders on each grid cell, matching v18's bold aesthetic.
- All text above SAFE_BOTTOM (410px from bottom).
- Static slides 1, 3, and 4 are unchanged PNGs from v18's design.

V20 render (warm editorial magazine aesthetic, animated proof slide MP4):

```bash
node marketing/manila-model-search-carousel/render-v20.mjs
```

V20 outputs:

- `output-v20/01_hook_story.png`
- `output-v20/02_proof_story.mp4` (animated video)
- `output-v20/03_process_story.png`
- `output-v20/04_cta_story.png`
- `output-v20/sources.json`

Additional V20 notes:

- Completely new third distinct design -- looks nothing like v16 (dark/moody) or v18 (white/bold Nike).
- Warm editorial magazine aesthetic: cream/sand backgrounds (#F5F0E8), elegant serif headlines (Georgia, italic), soft drop shadows, Vogue/fashion lookbook feel.
- MANILA in burnt sienna (#C2652A) with wide letter-spacing and thin accent rule on every slide.
- 4 slides: HOOK > PROOF (animated MP4) > PROCESS > CTA.
- Slide 1: Italic serif "Models wanted." with rounded hero image on cream, soft shadow.
- Slide 2: Animated MP4 -- 10 images in 3-row masonry grid on cream, fade+scale+translateY reveal staggered 300ms apart, ~5.5 seconds, 30fps H.264.
- Slide 3: Numbered step cards on warm sand (#EDE6D8) panels with italic serif numbers in accent color, taupe hairline rules, small accent image bottom-right.
- Slide 4: Large rounded hero image top half, italic serif "Sign up below." with warm rounded urgency pill in burnt sienna.
- No swipe indicators.
- All content above SAFE_BOTTOM (410px).
- Images have minimal crop with rounded corners and soft shadows instead of hard borders.
- Uses 13 manila-gallery images (statue, closeup, canal, dsc, garden, ivy, graffiti, urban, shadow, tropical, dsc-0190, park).

V21 render (warm editorial, ALL 4 slides animated MP4):

```bash
node marketing/manila-model-search-carousel/render-v21.mjs
```

V21 outputs:

- `output-v21/01_hook_story.mp4` (animated video, ~5s)
- `output-v21/02_proof_story.mp4` (animated video, ~5.4s)
- `output-v21/03_process_story.mp4` (animated video, ~4.7s)
- `output-v21/04_cta_story.mp4` (animated video, ~5.2s)
- `output-v21/sources.json`

Additional V21 notes:

- ALL 4 slides are animated MP4 videos (no static PNGs). First version with full video carousel.
- Warm editorial magazine aesthetic distinct from v16 (dark), v18 (white/bold), and v20 (cream/serif italic).
- Warm cream background (#F0EBE3), terracotta/burnt sienna MANILA accent (#C4562A), serif headlines (Georgia), sans-serif body (Avenir Next).
- 4 slides: HOOK > PROOF > PROCESS > CTA.
- Slide 1 (HOOK): MANILA label fades up, then "Models wanted." headline animates line by line, terracotta accent line grows, subtext fades in, then hero image reveals with clip-path wipe from top.
- Slide 2 (PROOF): Header fades in, then 10 gallery images stagger in with translateY + scale, 300ms apart.
- Slide 3 (PROCESS): Header and accent line animate in, then 3 step cards slide in from the left sequentially (500ms apart), small accent image fades in last.
- Slide 4 (CTA): Text fades in line by line, accent line grows, urgency badge appears then pulses continuously, hero image fades in last.
- All videos: 1080x1920, 30fps, H.264/MP4, 4-6 seconds each.
- No swipe indicators.
- MANILA prominent in terracotta on every slide.
- All content above SAFE_BOTTOM (410px).
- Uses 13 manila-gallery images (canal, closeup, dsc, garden, night, graffiti, urban, shadow, ivy, dsc-0190, floor).

V22 render (story-format narrative ad, fundamentally new concept):

```bash
node marketing/manila-model-search-carousel/render-v22.mjs
```

V22 outputs:

- `output-v22/01_story_hook.png`
- `output-v22/02_shoot_day.mp4` (animated video)
- `output-v22/03_results.png`
- `output-v22/04_cta.png`
- `output-v22/sources.json`

Additional V22 notes:

- FUNDAMENTALLY DIFFERENT AD CONCEPT: Instead of the standard "hook headline > proof photos > how it works > sign up CTA" ad structure used in v1-v21, v22 tells a mini-story across 4 slides. The viewer follows a narrative arc about a real person, creating emotional investment before the CTA.
- Story-format narrative: "She'd never modeled before. She signed up on Tuesday. By Saturday she had these photos."
- Warm editorial magazine aesthetic: cream background (#FAF6F1), elegant serif headlines (Georgia), gold accent color (#C4974A), monospace MANILA tag, soft shadows.
- 4 slides: STORY HOOK > SHOOT DAY (animated) > RESULTS > CTA.
- Slide 1: "She'd never modeled before." -- Serif headline on cream with single candid photo below. Feels like the opening of a magazine article, not an ad.
- Slide 2: Animated MP4 -- "The shoot day." -- 6 photos from different locations/vibes fade in with translateY + scale animation staggered across ~3.5 seconds, showing what the shoot experience looks like. Cream background, editorial layout.
- Slide 3: "The results." -- Two large side-by-side portrait photos filling the frame. "No experience. No agency. Just her." caption below.
- Slide 4: "This could be you." -- Dark overlay on full-bleed hero, serif headline, gold urgency badge "3 SPOTS LEFT THIS MONTH" with dot indicator.
- MANILA appears in gold monospace text top-left of every slide.
- All content above SAFE_BOTTOM (410px).
- Video is 1080x1920, ~5.5 seconds, 30fps, H.264/MP4.
- Uses 10 manila-gallery images (garden-002, canal-002, graffiti-001, dsc-0911, ivy-001, night-003, urban-001, canal-001, tropical-001, floor-001).
