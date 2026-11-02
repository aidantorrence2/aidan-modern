# Rio — Portuguese website campaign (2 Nov 2026)

Portuguese clone of the live `miami - website` carousel (120251115509380614), pointed at the new
`/sign-up-collab-rio` page (English + Brazilian Portuguese; `?lang=pt` forces Portuguese, otherwise the
page follows the browser language — lib/locale.ts, RIO_LANGS). Same four cards (h01 hook · meu trabalho
recente · nunca fez isso? · CTA), every line in pt-BR, rendered by `render-v6-pt.mjs` (the Miami Spanish
renderer with `CITY = 'Rio'` and Portuguese copy):

    node render-v6-pt.mjs --photos=~/charlotte-video-ads/work/src2 --vision=~/charlotte-video-ads/work/vision2 --out=renders-v6-pt --only=h01 --cta=signup

Upload copies: `launch-website-pt/r1a/rio-web-pt-01..04.jpg` (uploaded to Meta under those names, 2 Nov).

Built in Ads Manager by quick-duplicating `miami - website` (Advantage+ sales unticked, "reach people
interested in your locations" off):

| level | name | id | state |
|---|---|---|---|
| campaign | rio - website - pt | 120251149336730614 | draft, toggle OFF |
| ad set | rio - women - pt | 120251149336720614 | draft |
| ad | rio - website - pt | 120251149336710614 | draft |

Ad set: website, maximise landing page views, **$10.00/day** ad-set budget, location Rio de Janeiro (city,
Brazil) only, women 21–33, languages: all (Portuguese is the local language, so no language limit — unlike
Miami es which targeted Spanish), placements as the source, ongoing, Advantage+ audience off.

Ad: carousel, headline on every card `Rio · Ensaio de Fotos Grátis`, primary text
`sou o aidan, fotógrafo de retratos. estou no rio por pouco tempo. ensaio de fotos grátis, mais ou menos uma hora. eu dirijo cada foto.`,
CTA **Sign up**, every card URL `https://www.aidantorrence.com/sign-up-collab-rio`, URL parameters
`lang=pt&utm_source=ig&utm_medium=paid&utm_campaign=rio-website-pt`. Pixel 1921768771718409. Enhancements as
the source (Add music + Relevant comments on). Review tab verified: 4 destination URLs, params, headline,
primary text (2 Nov).

Status: draft, NOT published — publish + turn on queued as one approval card (same flow as miami - website - es).
Judge after 72 h against the Miami pair.
