# Miami — Spanish website campaign (2 Nov 2026)

Spanish clone of the live `miami - website` carousel (120251115509380614 → /sign-up-collab-miami). Same four cards
(h01 hook · my recent work · never done this before? · CTA), every line in Spanish, rendered by
`render-v6-es.mjs` (the Charlotte v6 renderer with `CITY = 'Miami'` and Spanish copy):

    node render-v6-es.mjs --photos=~/charlotte-video-ads/work/src2 --vision=~/charlotte-video-ads/work/vision2 --out=renders-v6-es --only=h01 --cta=signup

Upload copies: `launch-website-es/r1a/mia-web-es-01..04.jpg` (uploaded to Meta under those names, 2 Nov).

Built in Ads Manager by quick-duplicating `miami - website` (Advantage+ sales unticked, "reach people interested in
your locations" off):

| level | name | id | state |
|---|---|---|---|
| campaign | miami - website - es | 120251149040590614 | draft, toggle OFF |
| ad set | miami - women - es | 120251149040580614 | draft |
| ad | miami - website - es | 120251149040600614 | draft |

Ad set: website, maximise landing page views, **$10.00/day** ad-set budget, Miami + Miami Beach FL (as the source),
women 21–33, **Languages: Spanish (All)** (locale 1002), placements as the source (IG Feed / Stories / Explore home /
Reels / Profile feed / Search + WhatsApp Status), ongoing, Advantage+ audience off.

Ad: carousel, headline on every card `Miami · Sesión de Fotos Gratis`, primary text
`soy aidan, fotógrafo de retratos. estoy en miami por poco tiempo. sesión de fotos gratis, como una hora. dirijo cada toma.`,
CTA **Sign up**, URL `https://www.aidantorrence.com/sign-up-collab-miami`, URL parameters
`lang=es&utm_source=ig&utm_medium=paid&utm_campaign=miami-website-es` (`lang=es` forces the Spanish page; the page
otherwise follows the browser language — lib/locale.ts). Pixel 1921768771718409. Enhancements as the source
(Add music + Relevant comments on).

Status: draft reviewed (budget, copy, 4 new image hashes, URL params all verified in the preview) — NOT published:
the automation classifier refused the Publish click. Publish + turn on are queued as one approval card.
Compare after 72 h against `miami - website` (English, $5/day).
