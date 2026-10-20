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
