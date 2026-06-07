# BTS Bridge Reels — Concept Set 85 (a–e)

Source shoot: film-scan editorial (denim jacket / navy crop / black tulle) at an industrial
sunset tower in Antipolo/Manila, PH. BTS = 22s phone clip of the model nervously crossing the
tower's hanging rope bridge at golden hour.

Brand goal: attract models to a **free / collab test shoot** (aidantorrence.com).

## Confirmed BTS transcript (whisper base.en + small.en verification)
- 0.0–2.6s  ambient (wind / "thunder" rumble)
- ~3–11s    nervous laughs, "I'm not gonna go down", "don't look down"
- **14.6–16.1s  "How many people have died on this?"**
- **17.6–19.1s  "Don't say that!"**  (ASR heard "don't do that"; using on-set wording)
- **21.0–22.4s  "Hopefully it's zero."**

The terror→beauty contrast (scary bridge BTS vs. calm gorgeous film portraits) is the engine of
every cut. Research (2 cited briefs in ./research/) converges on **BTS→reveal with the original
funny audio** as the #1 photographer format for 2026. The punchline ("…hopefully it's zero")
is timed to land on the photo reveal in every cut that uses it.

## BTS segment library (seconds into source)
- EST     0.0–2.0   low angle up the bridge to the flag tower (also the loop frame)
- WALK    3.4–6.0   she walks toward camera, arms out (hero motion)
- CROUCH  6.8–9.2   crouched, arm flung out, laughing (freeze-frame gold)
- NERVOUS 9.6–11.6  "I'm not gonna go down" / "don't look down"
- VERTIGO 13.0–14.4 looking straight down the slats (POV vertigo)
- DIALOGUE 14.5–22.0 the funny exchange + tower tilt-up (punchline lives here)

## Photo heroes (./photos/, film scans, shown contain-on-blur, NOT recropped/regraded)
- 22    arm raised, dynamic — big reveal #1
- 20    elegant turn, window light — premium
- 37    seated by window, city behind, dreamy — emotional
- 26    hands on hips, attitude — confident
- 10-2  on the bridge railing — **location callback** (terror→elegance), closer
- 27    seated editorial, city reflection
- 39    relaxed seated, tiled hallway
- 40    intimate, leaning on wall
- 19    moody, hazy industrial
- 36    clean catalog, white wall

## The 5 variations
| # | Concept | Len | Format | CTA keyword |
|---|---------|-----|--------|-------------|
| 85a | "you'd never guess how this photo was taken" | ~17s | flagship BTS→reveal, punchline on closer | SHOOT |
| 85b | "the things we do for ONE photo" | ~22s | full original-audio comedy story | FILM |
| 85c | "you're so creative ✨ → the reality" | ~12s | expectation-vs-reality, punchy | tag a friend |
| 85d | "rating the photos we almost died for" | ~20s | portfolio showcase + ratings | GOLDEN |
| 85e | seamless match-cut loop | ~9s | replay magnet, dreamy, loops to frame 0 | (caption only) |

## Spec (all)
1080×1920, 30fps, H.264 + AAC, audio loudnorm −14 LUFS, +faststart.
Hook in first ~1.5s. Cut every 1.5–3s. Text in safe zones (top-third hooks; lower-center
captions/CTA, clear of bottom 320px). Bebas/Anton display, white+black-border captions,
yellow hooks. Burned text is emoji-free (ffmpeg drawtext limitation); emoji live in ./captions/.

Build: `node render-85.mjs [a|b|c|d|e]` (no arg = all). Outputs → output-85{x}/ and copied to
./reels/ and the shared reels-final/reels/ library.
