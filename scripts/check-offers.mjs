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
  if (!Number.isInteger(o.priceUsd) || o.priceUsd <= 0) errors.push(`${at}: priceUsd must be a positive integer`)
  if (!STATUS.has(o.status)) errors.push(`${at}: bad status ${o.status}`)
  if (o.launched && !/^\d{4}-\d{2}-\d{2}$/.test(o.launched)) errors.push(`${at}: launched must be YYYY-MM-DD`)
  if (o.headline && o.headline.length > 200) errors.push(`${at}: headline over 200 chars`)
  if (o.kit) {
    for (const k of ['hook', 'script', 'caption', 'community', 'pitchSubject', 'pitch']) {
      if (typeof o.kit[k] !== 'string' || !o.kit[k].trim()) errors.push(`${at}: kit.${k} missing`)
      else if (/TODO/.test(o.kit[k]) && o.status !== 'draft') errors.push(`${at}: kit.${k} still has TODO`)
    }
    for (const k of ['caption', 'community', 'pitch']) {
      if (o.kit[k] && !o.kit[k].includes(`aidantorrence.com/offers/${o.slug}`)) errors.push(`${at}: kit.${k} must link to its own page`)
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
