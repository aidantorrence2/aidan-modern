# Manila Video Ads V2 (Rebuild)

This V2 set replaces the earlier slideshow-style ads with faster cuts from real moving source footage, voiceover, and stronger conversion-focused copy.

## Final Deliverables
- `videos/ad01_stop_scrolling_upgrade.mp4`
- `videos/ad02_not_a_model_guided.mp4`
- `videos/ad03_one_session_two_looks.mp4`
- `videos/ad04_manila_locations_premium.mp4`
- `videos/ad05_limited_slots_urgency.mp4`

## Technical Spec
- Vertical 9:16 (1080x1920)
- 18 seconds each
- H.264 + AAC
- Hook-first overlays + CTA bar + burned-in subtitles
- Voiceover ducked over bed audio

## Regenerate
```bash
tools/render_manila_video_ads_v2.sh
```

## Inputs Used
- Source reels: `/Users/aidantorrence/Downloads/reel-VEED*.mp4`
- Subtitle scripts: `subtitles/ad01.srt` ... `subtitles/ad05.srt`
- Voice tracks: generated in `voice/` during render
- Intermediate cuts: generated in `work/` during render
