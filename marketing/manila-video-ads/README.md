# Manila Video Ads (Studio + Outdoor Fashion Sessions)

This folder contains 5 finished short-form video ads rendered from existing portfolio assets for `/manila` campaign traffic.

## Final Video Files
- `videos/ad01_scroll_stopping_fashion_portraits.mp4`
- `videos/ad02_not_a_model_perfect.mp4`
- `videos/ad03_studio_outdoor_combo.mp4`
- `videos/ad04_manila_locations.mp4`
- `videos/ad05_limited_slots_retargeting.mp4`

## Specs
- Format: MP4 (H.264 + AAC)
- Resolution: 1080 x 1920 (9:16)
- Duration: 18 seconds each
- Frame rate: 30 fps
- Audio: stereo AAC track (silent bed, platform-compatible)

## Re-render Command
```bash
/Users/aidantorrence/Documents/aidan-modern/tools/render_manila_video_ads.sh
```

## Edit Inputs
- Still image source: `public/images/large/*.jpg`
- Subtitle timing/text: `subtitles/ad01.srt` ... `subtitles/ad05.srt`
- Motion, overlays, encoding settings: `tools/render_manila_video_ads.sh`

## Quick Publishing Notes
- Use ad 1-4 for cold prospecting and ad 5 for retargeting.
- Keep CTA destination set to: `https://www.aidantorrence.com/manila`
- Recommended first test set: 5 creatives x 2 audience groups (broad Manila + warm retargeting).
