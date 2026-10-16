# Money Flywheel — code side (this repo)

The operating brain is the Claude Doc "Money Flywheel — Operating Plan"
(https://claude.ai/code/artifact/0c0d8778-920b-445b-bd5f-3bf5781cb9f5). An hourly
scheduled task ("Money flywheel (hourly)", fires at :11 UTC) runs the loop from
that doc: launch an offer page as a Claude artifact, build the traffic kit, harvest
interest, decide, build. This repo is the **code home** for that loop: the hosted
offer pages on aidantorrence.com, the interest database, and the products that
earn a build.

## Why hosted pages as well as artifacts

| | Claude artifact | aidantorrence.com/offers/<slug> |
|---|---|---|
| Live without a merge | yes | no (needs merge to `main` + `scripts/deploy.sh`) |
| Real domain for link-in-bio, TikTok, Reddit | no | yes |
| Meta Pixel + first-party funnel analytics | no | yes (`lib/track.ts`, Neon `analytics_events`) |
| Slack alert on every sign-up | no | yes (`SLACK_BOOKING_WEBHOOK`) |
| Pre-order button once a payment link exists | manual | per-offer `preorderUrl` or `NEXT_PUBLIC_PREORDER_BASE` |

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
2. Payment link base (Stripe Payment Link / Gumroad / Lemon Squeezy) in Vercel env `NEXT_PUBLIC_PREORDER_BASE`, or per offer in `data/offers.json`.
3. Post the scripts in `flywheel/launches/`. Nothing is posted or sent automatically.
