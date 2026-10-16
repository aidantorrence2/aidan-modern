#!/usr/bin/env node
// Scaffolds a new offer in data/offers.json and its launch kit. Edit the copy
// afterwards, then run kits.mjs and `npm run test:offers`.
//   node scripts/flywheel/new-offer.mjs --slug cull-assist --name "Cull Assist" --price "$12/month" --usd 12 \
//        --headline "..." --buyer "..." --bullet "..." --bullet "..." --bullet "..."
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const file = resolve(root, 'data/offers.json')
const args = process.argv.slice(2)
const get = k => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined }
const all = k => args.flatMap((a, i) => (a === `--${k}` ? [args[i + 1]] : []))

const slug = get('slug')
const name = get('name')
if (!slug || !name || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('usage: --slug kebab-case --name "Name" [--price "$9/month" --usd 9 --headline ... --buyer ... --bullet ... x3]')
  process.exit(1)
}
const offers = JSON.parse(readFileSync(file, 'utf8'))
if (offers.some(o => o.slug === slug)) {
  console.error(`offer ${slug} already exists`)
  process.exit(1)
}
const today = new Date().toISOString().slice(0, 10)
const bullets = all('bullet')
const offer = {
  slug,
  name,
  headline: get('headline') || `${name}: TODO one line naming the result.`,
  buyer: get('buyer') || 'TODO who this is for, in their words',
  bullets: bullets.length ? bullets : ['TODO what they get', 'TODO what they get', 'TODO what they get'],
  price: get('price') || '$9/month',
  priceUsd: Number(get('usd') || 9),
  status: get('status') || 'live',
  launched: today,
  reasonPrompt: 'What would make you buy this? One line is plenty.',
  faq: [],
  kit: {
    hook: 'TODO first line of the post',
    script: 'TODO 15–30 second script',
    caption: `TODO caption. aidantorrence.com/offers/${slug}`,
    community: `TODO community post. aidantorrence.com/offers/${slug}`,
    pitchSubject: `${name} (pre-launch)`,
    pitch: `Hi {first},\n\nI'm Aidan, a photographer. I saw {specific reference}.\n\nI'm deciding whether to build ${name}: TODO one sentence, ${get('price') || '$9/month'}.\n\nIf that's useful, the pre-launch page has an 'I'd pay' button: aidantorrence.com/offers/${slug}?src=email\n\nIf not, one line on why helps as much.\n\nBest,\nAidan`,
  },
}
offers.push(offer)
writeFileSync(file, JSON.stringify(offers, null, 2) + '\n')
execFileSync(process.execPath, [resolve(root, 'scripts/flywheel/kits.mjs'), slug], { stdio: 'inherit' })
console.log(`added ${slug}; edit data/offers.json, re-run kits.mjs, then npm run test:offers`)
