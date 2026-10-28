# Charlotte — website version of the DM ad (27 Oct 2026)

Website clone of the live `charlotte - dms` carousel (the r1a control deck, render-v6 h01): same four cards, card 4
says "Interested? Sign up below." instead of "Let's chat.", and the click goes to the sign-up page instead of
Instagram Direct. Campaign built in Ads Manager by quick-duplicating the previous website campaign `ist - website - tr`
(120250494597350614, Sales / maximise landing page views) with the Advantage+ sales recommendation unticked and
"reach people interested in your locations" off, as for Berlin.

| level | name | id |
|---|---|---|
| campaign | charlotte - website | 120251065362430614 |
| ad set | charlotte - women | 120251065362410614 |
| ad | charlotte - women - carousel | 120251065362420614 |

Ad set: website, maximise landing page views, **$5.00/day** ad-set budget (same as `charlotte - dms`),
Charlotte, North Carolina (city) + 25 mi, age 21–33, women, placements as the source (Instagram Feed / Stories /
Explore home / Reels / Profile feed / Search + WhatsApp Status), ongoing, Advantage+ audience off.

Ad: 4 cards `r1a/clt-web-01..04.jpg` (uploaded to Meta under those names), headline on every card
`Charlotte Free Photo Shoot`, primary text
`i'm aidan, a portrait photographer. i'm in charlotte for a few weeks. free photo shoot, about an hour. i direct every frame.`,
CTA **Sign up**, URL `aidantorrence.com/sign-up-collab`, Tracking URL parameters
`utm_source=ig&utm_medium=paid&utm_campaign=charlotte-website` (lib/track.ts stores utm_* with the sign-up).
Pixel: Aidan modern pixel 1921768771718409. Format: carousel only. Enhancements all off except Relevant comments.

Published with the campaign OFF, then turned ON 28 Oct 2026 02:01 UTC after Aidan approved the spend card (`spend:turn-on-meta-campaign-charlotte-website--202610280155`).

Rebuild the cards: `node render-v6.mjs --photos=~/charlotte-video-ads/work/src2 --vision=~/charlotte-video-ads/work/vision2 --out=renders-v6-website --only=h01 --cta=signup`
