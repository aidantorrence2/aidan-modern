# Antalya Instagram campaign

Four separate ad formats, built in order: casting notice, visual concept, behind the scenes, personal intro.

Exports: `/Users/aidantorrence/Documents/Antalya-IG-campaign`.

- Notice: one 1080 × 1350 JPG.
- Concept: three 1080 × 1350 JPGs, in numeric order.
- BTS: 17-second 1080 × 1920 MP4. Uses the user-supplied reel https://www.instagram.com/reel/DbqJbxzqFxF/ and C4518, C4612, C4617 from `/Volumes/PortableSSD/video/video faves`. Footage is labeled as past shoots. Silent export; reference reel music is omitted.
- Intro: approximately 19-second 1080 × 1920 MP4 with Aidan's authorized ElevenLabs voice. Uses real self portraits and portfolio photos. Narration exported from ElevenLabs as `ElevenLabs_2026-09-13T08_02_43_Aidan_ivc_sp120_s50_sb75_se33_b_m2.mp3`. Generated speech was locally transcribed to check script and timing.

Rebuild the notice with `node marketing/antalya-ig-campaign/render-stills.mjs notice` (its `concept` set is the superseded v1).
Rebuild reels with `python3 marketing/antalya-ig-campaign/render-reels.py` or append `intro`. Requires Pillow, FFmpeg, external source footage and saved narration. The BTS source reel is saved under the export folder's `bts/source`.

No fixed trip, dates, DM keywords, or technical delivery promises. No posting performed.

## Concept carousel (moved here 15 Sept 2026)

The three-slide visual concept now lives in this folder instead of the export folder. Rebuild with `node marketing/antalya-ig-campaign/render-concept.mjs` (writes `output-concept-v4/`, three 1080 × 1350 JPGs at 2× plus `preview.jpg`; pass `--out=output-concept-v5` for the next version). Reference images are in `concept-refs/` and every version's credits are in its `output-concept-v*/SOURCES.md`; outputs and refs are gitignored like the rest of `marketing/`.

Lineage: v1 portfolio photos (13 Sept), v2 six Pinterest pins (13 Sept, `render-pinterest-concept.mjs`, superseded), v3 seven full-res pins (14 Sept), v4 the three slide heroes replaced with pins from `public/images/pinterest/` (15 Sept). The export folder's `concept/` still holds v3 with a pointer file.
