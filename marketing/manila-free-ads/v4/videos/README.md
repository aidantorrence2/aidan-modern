# Manila Free V4 Video Ads

Instagram-ready vertical MP4 exports generated from stitched motion footage (`reel-VEED*.mp4`) with direct-response ad structure.

## Render

```bash
tools/render_manila_free_video_ads.sh
```

## Output

- `manila_free_A.mp4`
- `manila_free_B.mp4`
- `manila_free_C.mp4`
- `manila_free_D.mp4`
- `manila_free_E.mp4`

## Specs

- Resolution: 1080x1920
- Framerate: 30 fps
- Codec: H.264 + AAC
- Runtime: 18s each
- Burned overlays:
  - Top direct-response hook
  - Mid offer/value line
  - Subtitle captions
  - Bottom CTA line
- Includes generated voiceover narration mixed over source audio
