# Money Flywheel — code side (this repo)

The operating brain is the Claude Doc "Money Flywheel — Operating Plan"
(https://claude.ai/code/artifact/0c0d8778-920b-445b-bd5f-3bf5781cb9f5). An hourly
scheduled task ("Money flywheel (hourly)", fires at :11 UTC) runs the loop from
that doc: launch an offer page as a Claude artifact, build the traffic kit, harvest
interest, decide, build. This repo is the **code home** for that loop: the hosted
offer pages (static export on GitHub Pages, never Vercel), the interest signal, and
the products that earn a build.

## Why hosted pages as well as artifacts

| | Claude artifact | GitHub Pages (`flywheel/config.json` → `publicBase`) |
|---|---|---|
| Live without a merge | yes | yes (`scripts/flywheel/publish-pages.sh` pushes `gh-pages`) |
| Real URL for link-in-bio, TikTok, Reddit | no | yes; custom domain later via a CNAME file + DNS |
| Interest capture | artifact DB | `formEndpoint` if set, else mailto to `config.mail` with subject `[offer:<slug>] <intent>` counted from Gmail |
| Analytics | no | none until a counter is added (no server); `?src=` still rides in the mailto/form payload |
| Pre-order button once a payment link exists | manual | TODO: add `preorderUrl` support to `scripts/flywheel/export-static.mjs` |

The Next.js pages under `app/offers` and the Neon-backed API routes stay in the repo as the
richer version for whenever a server host is wanted, but nothing depends on them going live.

Rule: an idea is launched first wherever it can go live fastest (artifact), and is
**also** added to `data/offers.json` so the hosted page exists the moment the branch
is merged. Both pages carry the same slug so counts can be added together.

## Pieces

| Path | Purpose |
|---|---|
| `data/offers.json` | One entry per offer: copy, price, buyer, status, `src` tags. The only file a launch has to touch. |
| `lib/offers.ts` | Types + loader + helpers (`getOffer`, `liveOffers`). |
| `app/offers/page.tsx` | Index of live offers ("Lab"). `noindex`. |
| `app/offers/[slug]/page.tsx` | Hosted offer page: headline, three bullets, price, honest pre-launch line, interest form. Tracks `page_view`, `offer_cta`, `offer_interest`. |
| `app/api/offers/interest` | POST: stores `{offer, intent: signup|would_pay|preorder, email, reason, src, utm}` in Neon `offer_interest`; Slack alert. Honeypot. |
| `app/api/offers/stats` | GET: counts per offer per intent, last 72h and all time. No emails. The hourly run harvests from here once live. |
| `scripts/flywheel/new-offer.mjs` | `node scripts/flywheel/new-offer.mjs --slug x --name "X" ...` appends an offer and scaffolds `flywheel/launches/x.md`. |
| `scripts/flywheel/stats.mjs` | Prints the stats table from the live site (or `BASE_URL`). |
| `flywheel/launches/<slug>.md` | Traffic kit: post script, caption, community post, pitch template, tracking links with `?src=`. |
| `flywheel/RUNBOOK.md` | What an hourly code-side run does, in order. |

## Thresholds (same as the doc)

Build now: 1 pre-order, or 3 "I'd pay" clicks, or 10 sign-ups in 72h.
Keep running: some sign-ups under threshold; second hook or segment for 72h.
Kill: 20+ pitches and a post with zero sign-ups, or 7 days under 3 sign-ups.

## What needs Aidan

1. Merge this branch to `main` and run `scripts/deploy.sh` (or tell the session to open a PR). Until then the hosted pages are not live; artifact pages carry the traffic.
2. Payment link base (Stripe Payment Link / Gumroad / Lemon Squeezy) per offer in `data/offers.json` (`preorderUrl`), rendered by the static exporter once added.
3. Post the scripts in `flywheel/launches/`. Nothing is posted or sent automatically.
