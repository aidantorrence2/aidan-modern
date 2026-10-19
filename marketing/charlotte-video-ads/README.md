# Charlotte video ads (Instagram DM reels)

Engine cloned from ~/paris-video-ads (frame-exact Playwright renderer, Apple Vision, one audio mix at -14 LUFS).
Added here: every frame is audited for text over a face (`.fbox` markers from Vision, see `layer()`/`fboxes()` in
lib/engine.mjs) on top of the y 250–1440 safe zone; a failing frame fails the render.

Photos: `work/src` = upright tier_candidates (`python3 ~/Documents/aidan-modern/.../charlotte-ig-dm/prep-photos.py`)
plus public/images/self. Then `xcrun swift lib/vision.swift work/vision work/src/*.jpg`.

| v | file | idea |
|---|---|---|
| a | a-notes | Notes-app story types itself, portraits pop in, slides off to the CTA |
| b | b-hi-aidan | mirror selfie hello → "here's what i shoot" montage → offer → CTA (real-video plan: HI-AIDAN-SHOTLIST.md) |
| c | c-winner | the winning 8-card story deck as one reel (no film card) |
| d | d-eyes | eye-locked match cuts (port of Paris c-regard) |
| e | e-behind | CHARLOTTE rises behind the model (port of Paris b-couverture) |
| f | f-wall | drifting photo wall → whip → full frame (port of Paris d-le-mur) |

`node render.mjs --v=a --stills=sheet` (canary) → `node render.mjs --v=a [--version=N]` → out/charlotte-<name>-vN.mp4
Copy rules: English, "Free Photo Shoot", CTA "Interested? Let's chat.", no film, no models/casting/job words, no dates.
