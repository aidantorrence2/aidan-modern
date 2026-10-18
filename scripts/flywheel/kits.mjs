#!/usr/bin/env node
// Renders flywheel/launches/<slug>.md (the traffic kit) for every offer in
// data/offers.json that has a `kit`. Run after editing offers.json:
//   node scripts/flywheel/kits.mjs [slug]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const offers = JSON.parse(readFileSync(resolve(root, 'data/offers.json'), 'utf8'))
const only = process.argv[2]
const BASE = 'https://aidantorrence2.github.io/aidan-modern'

mkdirSync(resolve(root, 'flywheel/launches'), { recursive: true })
let n = 0
for (const o of offers) {
  if (only && o.slug !== only) continue
  if (!o.kit) continue
  const url = `${BASE}/${o.slug}`
  const md = `# ${o.name} — launch kit

Offer: ${o.headline}
Price: ${o.price}${o.priceNote ? ` (${o.priceNote})` : ''}
Buyer: ${o.buyer}
Status: ${o.status}${o.launched ? ` since ${o.launched}` : ''}
Hosted page: ${url} (live after merge to main + deploy)${o.artifactUrl ? `\nArtifact page: ${o.artifactUrl}` : ''}

## Tracking links (one per channel)

| Channel | Link |
|---|---|
| TikTok / Reels bio | ${url}?src=tiktok |
| Instagram story | ${url}?src=ig |
| Cold email | ${url}?src=email |
| Reddit | ${url}?src=reddit |
| Facebook group | ${url}?src=fb |
| Indie Hackers / forum | ${url}?src=forum |

## 15–30 second post

Hook (first line on screen and in the caption):
> ${o.kit.hook}

Script:
${o.kit.script}

Caption:
${o.kit.caption}

## Community post (paste as is)

${o.kit.community}

## Cold pitch (Gmail draft; {first} and {specific reference} must be filled per person)

Subject: ${o.kit.pitchSubject}

${o.kit.pitch}

Rules: published business emails only, never guessed; dedupe against sent mail and drafts; no URLs except the offer link written as plain text; drafts only unless standing permission is granted.

## Kill / build check (72h after the first traffic)

Build now: 1 pre-order, or 3 "I'd pay" clicks, or 10 sign-ups.
Keep running: some sign-ups under threshold; try a second hook or segment for 72h.
Kill: 20+ pitches and a post with zero sign-ups, or 7 days with under 3 sign-ups.
`
  writeFileSync(resolve(root, `flywheel/launches/${o.slug}.md`), md)
  n++
}
console.log(`wrote ${n} launch kit(s)`)
