# Charlotte IG DM campaign: handoff

Goal: a click-to-Instagram-Direct campaign for Charlotte, NC at $5/day, offering a free photo shoot, and published live.
Order the user asked for: research → storyboards of 50–100 variations → build the ads → publish.

## Status
- Done: creative + Charlotte research (`research-creative.md`)
- In progress: Meta DM-ad mechanics + Marketing API research. If `research-meta-dm.md` is missing, redo it: objective, destination, welcome message / ice breakers, API payloads.
- Done (draft): 80 storyboards in 13 families (`concepts.py`) plus campaign plan (`plan.html`)
- Build the board: `python3 marketing/charlotte-ig-dm/build-storyboards.py [out.html]`

## Photos: use the `tier_candidates` folder (user's instruction)
The draft boards use `data/portfolio-tiers.json` photos (keys A = tier-2, B = tier-1, C = tier0, S0 = self).
**The user wants photos from the local `tier_candidates` folder instead.** Swap the photo keys in
`concepts.py` and the `img()` loader in `build-storyboards.py` to point at that folder, re-pick
photos per frame, rebuild the board, and show it to the user before rendering any ads.

## After the user approves the storyboards
1. Render the launch set (10 ads: 01 05 14 17 30 31 49 54 59 67): Reels 1080×1920 (keep text in y≈270–1250), carousels 1080×1350
2. Publish through the Marketing API. Needs a token with ads_management, the ad account `act_…`, the Page ID linked to IG, and a payment method
   - Campaign: OUTCOME_ENGAGEMENT, 1 ad set $5/day, destination Instagram Direct, optimise for conversations
   - Charlotte +25 mi, ages 20–40, IG placements, welcome message + 4 ice breakers (see plan.html)

## Offer details still to confirm with the user
Dates in Charlotte · number of spots (boards assume 10) · photos delivered and turnaround (~10, ~1 week assumed) ·
shot on film? · duo/couple sessions? · whether the tier-2 photos are from Paris (concept 18)
