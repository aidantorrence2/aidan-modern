# Focus pipeline — LOG

## 2026-11-11 — run 1
- Created branch `claude/focus-pipeline` from `main` (did not exist on origin) and the `marketing/focus/` structure: STATE.md, LOG.md, owner-todo.md, scripts/, videos/, queue/.
- Wrote 5 original draft scripts (001–005) with hook, steps, caption, comment keyword, matched offer, disclosure and a claims check.
- Checked session for posting credentials: no Facebook, TikTok or X connector/credential present → publishing is owner-blocked (owner-todo #1).
- Verified: ffmpeg at /usr/bin/ffmpeg; existing reel render scripts under `marketing/bts-reels/` to learn from.
- Not verified: affiliate terms listed in the brief (all still marked unverified); no signals research done yet — hooks are educated guesses.
- Next: build renderer, render script 001, inspect frames.

## 2026-11-11 — run 2
- Copied the standing rules (where state lives / choosing the step / hard limits) into the top of STATE.md.
- Built `render/render.mjs` (Playwright HTML cards → PNG → ffmpeg zoompan + xfade, silent AAC) and spec `render/specs/001.json`.
- Rendered `videos/001-phone-out-of-bedroom.mp4` + `.txt` caption: h264 1080x1920 30fps, 24.0 s, 2.0 MB.
- Inspected frames at several timestamps. First pass had the CTA keyword box nearly touching the right edge and "7-day" splitting across lines → fixed (two-tier keyword box, no-wrap on "N-word") and re-rendered; second-pass frames look clean.
- Fixed a caption error in script 001: said "3 changes" but the video shows 4 steps.
- Honest limits: video is text cards with a slow push-in only — no icons, no music, no voiceover. Not yet human-reviewed.
- Note: repo-root .gitignore excludes *.mp4; added `videos/.gitignore` with `!*.mp4` so rendered videos are committed.
- Next: write scripts 006–007 (unrendered buffer is 4, target ≥5), then render 002.

## 2026-11-11 — run 3
- Wrote scripts 006 (50-minute study session, keyword STUDY → Freedom / lock box) and 007 (first hour without the phone, keyword MORNING → Freedom). Unrendered buffer now 6 (target ≥5).
- Added both to the keyword→offer map in STATE.md. Offer terms still unverified.
- No render this run (one step per run). Next: render 002 (KIDS).

## 2026-11-11 — run 4
- Rendered `videos/002-kids-phone-settings.mp4` + `.txt` caption from new spec `render/specs/002.json` (teal accent, 5 step cards incl. bonus): 26.6 s, 2.08 MB, 1080x1920.
- Frame check found "step-by-step" breaking at a hyphen on the CTA card → generalised the renderer's no-wrap rule to any hyphenated word, re-rendered, re-checked the CTA frame: clean.
- Removed the unsupported "takes about 10 minutes" from the 002 caption (script + video caption file).
- Unrendered buffer is now exactly 5 (003–007). Next: write 008 to keep the buffer, or render 003.

## 2026-11-11 — run 5
- Rendered `videos/003-block-sites-on-computer.mp4` + `.txt` caption from `render/specs/003.json` (blue accent): 24.0 s, 1.70 MB, 1080x1920.
- Frame check (hook, steps 1/2/4, CTA): text fits, no bad wraps or edge crowding.
- Changed the CTA from "my exact blocklist" to "a ready-made blocklist" (avoids implying a personal persona/usage claim); script updated to match.
- Unrendered buffer now 4 (004–007). Next: write script 008, then render 004.

## 2026-11-12 — run 6
- Wrote scripts 008 (kid's first phone setup, keyword FIRST → Aura/Qustodio; parents are the highest-value audience) and 009 (notification cleanup, keyword QUIET → lead magnet). Unrendered buffer now 6.
- Added both to the keyword→offer map. Offer terms still unverified.
- Next: render 004 (TAPS), or 008 early for the higher-value parent offer.

## 2026-11-12 — run 7
- Rendered `videos/008-kids-first-phone.mp4` + `.txt` caption (spec `render/specs/008.json`, orange accent): 24.4 s, 2.10 MB. Chose 008 ahead of 004 because parent offers (Aura/Qustodio) are the highest-value in the list.
- Frame check: all cards fit; the CTA sub-line left "free." orphaned on its own line → reworded and re-rendered; final CTA frame checked clean.
- Rendered so far: 001, 002, 003, 008. Unrendered buffer: 5 (004–007, 009).
- Next: write 010 to keep the buffer above 5, then render 004.
