# Manila Free Ads Ultimate

Render command:

```bash
node marketing/manila-free-ads-ultimate/render.mjs
```

This package uses only the original Manila photo assets and a playful conversion-first creative style.
Tone is lighter and simpler while still pushing a clear limited-time offer.

Output funnels:

- `funnel-01_last-chance-electric`
- `funnel-02_last-chance-fresh`
- `funnel-03_last-chance-bold`

Each funnel now uses the same five-slide sequence:
1. `hey free photo shoot`
2. `proof`
3. `how it works`
4. `what you get`
5. `cta`

Notes:

- Every run clears prior `story-*` and `funnel-*` output folders before rendering.
- All exports are 1080x1920 PNG story/reels frames.
- Copy is short, high-conversion, and intentionally upbeat with "last chance / limited time / limited slots" language on every funnel.
- Process language is message-first: if interested or if someone has questions, they message to move forward.
- Photo rendering uses `object-fit: contain` to avoid cropping the source images.
