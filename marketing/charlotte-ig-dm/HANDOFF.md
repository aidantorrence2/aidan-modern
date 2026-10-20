# Charlotte IG DM campaign: handoff

Goal: a click-to-Instagram-Direct campaign for Charlotte, NC at $5/day, offering a free photo shoot, and published live.
Order the user asked for: research → storyboards of 50–100 variations → build the ads → publish.

## Status
- Done: creative + Charlotte research (`research-creative.md`)
- Done: Meta DM-ad mechanics + Marketing API research (`research-meta-dm.md`, API v26). Watch for: `explore` placement removed in v26; `instagram_user_id` not `instagram_actor_id`; casting/"models wanted" wording can push the ad into the Employment category (no age targeting, 15-mi minimum), which matters for the NOTICE family.
- Done (draft): 80 storyboards in 13 families (`concepts.py`) plus campaign plan (`plan.html`)
- Build the board: `python3 marketing/charlotte-ig-dm/build-storyboards.py [out.html]`

## Photos: done (19 Oct 2026)
Every frame now uses `public/images/tier_candidates` (local and untracked). Keys are `T<n>`, and `TC` in `concepts.py` maps each key to a file stem plus the rotation needed (the scans are sideways: +90 or −90). 53 of the 95 frames are used. The photos are from Almaty and Paris (T51–T66 are Paris). Build the board with
`TIER_DIR=<path to tier_candidates> python3 marketing/charlotte-ig-dm/build-storyboards.py out.html` (the default path is the repo's own `public/images/tier_candidates`).
The board went to the user for review: https://claude.ai/artifact/5NLvEqbRpkRv87Y1hLxSPv

## After the user approves the storyboards
1. Render the launch set (10 ads: 01 05 14 17 30 31 49 54 59 67): Reels 1080×1920 (keep text in y≈270–1250), carousels 1080×1350
2. Publish through the Marketing API. Needs a token with ads_management, the ad account `act_…`, the Page ID linked to IG, and a payment method
   - Campaign: OUTCOME_ENGAGEMENT, 1 ad set $5/day, destination Instagram Direct, optimise for conversations
   - Charlotte +25 mi, ages 20–40, IG placements, welcome message + 4 ice breakers (see plan.html)

## Offer details still to confirm with the user
Dates in Charlotte · number of spots (boards assume 10) · photos delivered and turnaround (~10, ~1 week assumed) ·
shot on film? · duo/couple sessions? · whether the tier-2 photos are from Paris (concept 18)

## v2: CPC-first concepts against the current winner (20 Oct 2026)
The user sent the Istanbul DM story deck (8 cards) as "the defined current successful ad" and asked for concepts that do much
better on CPC, not variations of it, using tier_candidates. Built:
- `render-v2.mjs`: control C00 (the winner re-cast: no film card, CTA "Interested? Let's chat.") + 12 challengers N01–N12
  (one frame ×3 heroes, face wall, question hook, Notes app, where-should-we-shoot, the DM, camera roll vs one hour,
  bring a friend, callout 5, eye-contact reel, hi I'm Aidan, before the leaves drop). Text is kept above y=1440.
  `python3 prep-photos.py <tier_candidates> /tmp/x && node render-v2.mjs --photos=/tmp/x --out=<dir>`
- `build-board-v2.py`: board with the CPC equation, past campaign numbers, $5/day test plan. Frames are gitignored (marketing/**/*.jpg): re-render them, or use the local copy in ~/Documents/aidan-modern-charlotte-ws/marketing/charlotte-ig-dm/renders-v2/.
- Board: https://claude.ai/artifact/RHB5FnfTiSZdL8EJjGc4uA
Rules applied: no film wording (Aidan, 23 Sept), no "models"/job words (US Employment category), city big on hooks,
women-only ad set, 3–4 ads per round at $5/day. The v1 board (80 concepts, incl. a FILM family) is superseded by v2.
Open: duo sessions (N08), dates (N12), selfie video (N11), the about-card claim "back in the States".

## v2b: Aidan's picks + videos (20 Oct 2026)
Aidan liked C00 (winner), N04 (Notes) and N11 (Hi, I'm Aidan); rule: text never covers a face. render-v2.mjs now takes
`--vision=<dir>` (Apple Vision face boxes, from ~/charlotte-video-ads/work/vision), places hook/CTA type in the clear band
above/below faces (`clearTop`) and fails any slide with text over a face. Videos live in ~/charlotte-video-ads (jj repo,
engine from ~/paris-video-ads with the same face audit per frame): a-notes (v3), b-hi-aidan, c-winner, d-eyes, e-behind,
f-wall → out/charlotte-*.mp4. Board (same URL) shows picks, the six reels, then other stills. Round 1 proposal:
C00 still deck + winner reel + notes reel + hi-aidan reel. Known: e-behind last cover hides part of "Charlotte".
