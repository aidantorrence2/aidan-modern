# Antalya Instagram campaign

Four separate ad formats, built in order: casting notice, visual concept, behind the scenes, personal intro.

Exports: `/Users/aidantorrence/Documents/Antalya-IG-campaign`.

- Notice: one 1080 × 1350 JPG.
- Concept: three 1080 × 1350 JPGs, in numeric order.
- BTS: 17-second 1080 × 1920 MP4. Uses the user-supplied reel https://www.instagram.com/reel/DbqJbxzqFxF/ and C4518, C4612, C4617 from `/Volumes/PortableSSD/video/video faves`. Footage is labeled as past shoots. Silent export; reference reel music is omitted.
- Intro: approximately 19-second 1080 × 1920 MP4 with Aidan's authorized ElevenLabs voice. Uses real self portraits and portfolio photos. Narration exported from ElevenLabs as `ElevenLabs_2026-09-13T08_02_43_Aidan_ivc_sp120_s50_sb75_se33_b_m2.mp3`. Generated speech was locally transcribed to check script and timing.

Rebuild stills with `node marketing/antalya-ig-campaign/render-stills.mjs notice` or `concept`.
Rebuild reels with `python3 marketing/antalya-ig-campaign/render-reels.py` or append `intro`. Requires Pillow, FFmpeg, external source footage and saved narration. The BTS source reel is saved under the export folder's `bts/source`.

No fixed trip, dates, DM keywords, or technical delivery promises. No posting performed.
