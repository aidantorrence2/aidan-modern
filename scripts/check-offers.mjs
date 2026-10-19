#!/usr/bin/env node
// Regression check for data/offers.json and the launch kits: every offer has
// the fields the page needs, slugs are unique and URL-safe, the kit's links
// point at the offer's own page, and each live offer has its kit rendered.
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const offers = JSON.parse(readFileSync(resolve(root, 'data/offers.json'), 'utf8'))
const STATUS = new Set(['draft', 'live', 'threshold_met', 'building', 'shipped', 'killed'])
const errors = []
const seen = new Set()
for (const o of offers) {
  const at = `offer ${o.slug || '(no slug)'}`
  if (!o.slug || !/^[a-z0-9-]+$/.test(o.slug)) errors.push(`${at}: slug must be kebab-case`)
  if (seen.has(o.slug)) errors.push(`${at}: duplicate slug`)
  seen.add(o.slug)
  for (const k of ['name', 'headline', 'buyer', 'price']) if (typeof o[k] !== 'string' || !o[k].trim()) errors.push(`${at}: missing ${k}`)
  if (!Array.isArray(o.bullets) || o.bullets.length < 2 || o.bullets.length > 5) errors.push(`${at}: 2–5 bullets required`)
  const freeTest = o.demand?.catalog && /^Free/.test(o.price || '') && o.priceUsd === 0
  if (!freeTest && (!Number.isInteger(o.priceUsd) || o.priceUsd <= 0)) errors.push(`${at}: priceUsd must be a positive integer`)
  if (!STATUS.has(o.status)) errors.push(`${at}: bad status ${o.status}`)
  if (o.launched && !/^\d{4}-\d{2}-\d{2}$/.test(o.launched)) errors.push(`${at}: launched must be YYYY-MM-DD`)
  if (o.headline && o.headline.length > 200) errors.push(`${at}: headline over 200 chars`)
  // Demand gate (Aidan, 18 Oct 2026): an offer goes live only if it is software and the
  // market already asked for it. Evidence is public posts by different people, each cited.
  // Catalog exception (Aidan, 19 Oct 2026): he chose to launch all 120 offers from the research
  // catalog of human problems he supplied. Each carries the catalog's cited sources (paid
  // alternatives, reported revenue or usage) instead of three posts by different people.
  const d0 = o.demand || {}
  if (d0.catalog && ['live', 'threshold_met', 'building', 'shipped'].includes(o.status)) {
    if (o.type !== 'software') errors.push(`${at}: type must be "software" to go live`)
    const s = Array.isArray(d0.signals) ? d0.signals : []
    if (!s.length || !s.every(x => /^https:\/\//.test(x.url || '') && (x.quote || '').trim() && ['opened', 'snippet', 'catalog'].includes(x.seen))) errors.push(`${at}: catalog offer needs its cited source (https url, observed evidence)`)
    if (typeof d0.wtp !== 'string' || !d0.wtp.trim()) errors.push(`${at}: demand.wtp missing`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d0.checked || '')) errors.push(`${at}: demand.checked must be YYYY-MM-DD`)
  } else if (['live', 'threshold_met', 'building', 'shipped'].includes(o.status)) {
    if (o.type !== 'software') errors.push(`${at}: type must be "software" to go live`)
    if (typeof o.need !== 'string' || !o.need.trim()) errors.push(`${at}: need is required (Aidan, 19 Oct: every offer answers a personal need in the buyer's words)`)
    const d = o.demand || {}
    const sig = Array.isArray(d.signals) ? d.signals : []
    const urls = new Set(sig.map(x => x && x.url))
    const people = new Set(sig.map(x => x && x.who).filter(Boolean))
    if (sig.length < 3 || urls.size < 2) errors.push(`${at}: demand.signals needs 3+ signals from at least 2 distinct pages`)
    if (people.size < 3) errors.push(`${at}: demand.signals needs 3+ different people (who)`)
    for (const x of sig) {
      if (!x || !/^https:\/\//.test(x.url || '')) errors.push(`${at}: every demand signal needs an https url`)
      if (!x || typeof x.quote !== 'string' || !x.quote.trim()) errors.push(`${at}: every demand signal needs a short verbatim quote`)
      if (!x || !['opened', 'snippet'].includes(x.seen)) errors.push(`${at}: demand signal seen must be "opened" or "snippet"`)
    }
    if (sig.filter(x => x && x.seen === 'opened').length < 2) errors.push(`${at}: at least 2 demand signals must have been opened, not just seen as snippets`)
    if (typeof d.wtp !== 'string' || !d.wtp.trim()) errors.push(`${at}: demand.wtp must say who already pays, or says they'd pay`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.checked || '')) errors.push(`${at}: demand.checked must be YYYY-MM-DD`)
  }
  if (o.kit) {
    for (const k of ['hook', 'script', 'caption', 'community', 'pitchSubject', 'pitch']) {
      if (typeof o.kit[k] !== 'string' || !o.kit[k].trim()) errors.push(`${at}: kit.${k} missing`)
      else if (/TODO/.test(o.kit[k]) && o.status !== 'draft') errors.push(`${at}: kit.${k} still has TODO`)
    }
    for (const k of ['caption', 'community', 'pitch']) {
      if (o.kit[k] && !o.kit[k].includes(`aidantorrence2.github.io/aidan-modern/${o.slug}`)) errors.push(`${at}: kit.${k} must link to its own page`)
    }
    if (o.kit.pitch && /https?:\/\//.test(o.kit.pitch)) errors.push(`${at}: kit.pitch must not contain http links (plain-text offer link only)`)
    const banned = /(testimonial|customers love|trusted by|\d+ (happy )?customers|only \d+ left|limited spots)/i
    for (const k of ['hook', 'script', 'caption', 'community', 'pitch']) if (banned.test(o.kit[k] || '')) errors.push(`${at}: kit.${k} reads like invented social proof or scarcity`)
  }
  if (o.status !== 'draft' && o.status !== 'killed' && o.kit && !existsSync(resolve(root, `flywheel/launches/${o.slug}.md`))) {
    errors.push(`${at}: run node scripts/flywheel/kits.mjs to render its launch kit`)
  }
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`offers ok: ${offers.length} offers, ${offers.filter(o => o.status === 'live').length} live`)
