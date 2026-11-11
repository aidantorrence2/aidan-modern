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
