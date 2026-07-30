#!/usr/bin/env node
// Generates the photographic wardrobe catalog: one e-commerce-style product
// photo per piece per colorway, via the Gemini image API, into
// public/images/wardrobe/{pieceId}--{colorwaySlug}.jpg
//
// Idempotent and incremental — existing files are skipped, every finished
// image lands on disk immediately, so an interrupted run resumes where it
// stopped. Usage:
//   GEMINI_API_KEY=... node scripts/generate-wardrobe.mjs [--only pieceId]
//
// One prompt template for the whole catalog so the grid photographs as a set:
// same cream backdrop, same soft studio light, same flat-lay framing.

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { execFileSync } from 'child_process'
import path from 'path'
import url from 'url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public/images/wardrobe')
const MANIFEST = JSON.parse(readFileSync(path.join(ROOT, 'data/wardrobe-manifest.json'), 'utf8'))

const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1) }

const MODEL = 'gemini-3.1-flash-image'
const CONCURRENCY = 3
const MAX_ATTEMPTS = 4

// What each garment IS, photographically. The colorway name + hex is injected.
const DESCRIPTORS = {
  'silk-blouse': "women's long-sleeve silk blouse with a soft camp collar, covered button placket and cuffed sleeves, fluid silk with gentle sheen",
  'tank-top': "women's fitted cotton-jersey tank top with a scoop neck and clean bound edges",
  'cami': "women's bias-cut silk camisole with thin spaghetti straps and a delicate lace-trimmed neckline",
  'crop-tee': "women's fitted cropped t-shirt with cap sleeves and a snug ribbed hem",
  'crew-tee': "women's relaxed crew-neck cotton t-shirt with short sleeves",
  'off-shoulder-top': "women's off-the-shoulder top with an elasticated straight neckline and short sleeves, soft woven cotton",
  'corset-top': "women's structured corset top with a sweetheart neckline and visible boning seams, matte satin",
  'bodysuit': "women's sleeveless bodysuit with a square neckline, smooth stretch jersey, shown folded as a fitted top",
  'oversized-shirt': "women's oversized button-up shirt with a pointed collar, chest pocket and full placket, crisp cotton poplin",
  'turtleneck': "women's slim turtleneck with a folded roll neck, fine ribbed knit",
  'knit-sweater': "women's relaxed fine-knit sweater with ribbed crew neck, cuffs and hem, soft merino",
  'wrap-top': "women's wrap top with a crossover V-neckline and side tie with hanging ends, matte jersey",
  'halter-top': "women's halter-neck top tied behind the neck, open shoulders, fluid drape",
  'tube-top': "women's strapless tube top, smooth fitted band of doubled stretch fabric",
  'puff-blouse': "women's puff-sleeve blouse with a square neckline and gathered voluminous short sleeves, crisp cotton",
  'cardigan': "women's button-through cardigan with ribbed trim and small buttons, fine knit",
  'sb-blazer': "women's single-breasted tailored blazer with notch lapels and a single button, structured shoulders, refined suiting wool",
  'moto-jacket': "women's leather biker jacket with asymmetric zip, wide snapped lapels and zip pockets, supple leather with natural grain and sheen",
  'denim-jacket': "women's classic denim trucker jacket with pointed collar, button placket and chest flap pockets, visible topstitching",
  'trench-coat': "women's classic trench coat with storm flap, epaulets, belt with buckle and button front, cotton gabardine",
  'wool-coat': "women's long minimal wool overcoat with clean lines and dropped shoulders, brushed wool",
  'duster-cardigan': "women's long open duster cardigan with ribbed edges, soft chunky knit",
  'straight-jeans': "women's straight-leg jeans with classic five-pocket styling, waistband and fly, authentic denim texture with subtle wash",
  'mini-a-line-skirt': "women's A-line mini skirt with waistband and front darts, smooth suiting fabric",
  'pencil-midi-skirt': "women's fitted pencil midi skirt with waistband and back vent, smooth stretch suiting",
  'pleated-midi-skirt': "women's knife-pleated midi skirt with crisp regular pleats falling from the waistband",
  'satin-slip-skirt': "women's bias-cut satin slip skirt, midi length, liquid drape with soft sheen",
  'tiered-maxi-skirt': "women's tiered maxi skirt with gathered flowing tiers, lightweight cotton",
  'denim-mini-skirt': "women's denim mini skirt with five-pocket styling, waistband and fly, visible topstitching",
  'wide-leg-trousers': "women's high-waisted wide-leg trousers with pressed front creases, fluid suiting",
  'tailored-slim-trousers': "women's tailored slim ankle-length trousers with pressed creases, refined suiting wool",
  'leather-pants': "women's slim leather trousers, supple leather with natural grain and soft sheen",
  'cargo-pants': "women's relaxed cargo trousers with thigh flap pockets and utility details, cotton twill",
  'linen-wide-pants': "women's relaxed wide-leg linen trousers with soft natural crumple, breathable linen weave",
  'slip-dress': "women's bias-cut silk slip dress with thin straps and a draped cowl neckline, midi length, liquid satin sheen",
  'sundress': "women's sundress with fitted bodice, waist seam and flared knee-length skirt, crisp lightweight cotton",
  'wrap-dress': "women's wrap dress with deep V surplice neckline and waist tie, below-knee length, matte jersey",
  'bodycon-midi': "women's fitted bodycon midi dress with ruched side gathering and thin straps, stretch jersey",
  'cocktail-dress': "women's fitted cocktail dress with sweetheart neckline, above-knee length, structured satin",
  'maxi-dress': "women's flowing maxi dress with V-neck, gathered empire waist and full-length soft skirt, airy chiffon",
  'shirt-dress': "women's belted shirt dress with pointed collar, full button placket and short sleeves, knee length, crisp cotton",
  'evening-gown': "women's floor-length evening gown with structured strapless sweetheart bodice and high side slit, heavy satin",
}

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const jobs = []
for (const piece of MANIFEST) {
  if (process.argv.includes('--only') && process.argv[process.argv.indexOf('--only') + 1] !== piece.id) continue
  const desc = DESCRIPTORS[piece.id]
  if (!desc) { console.error(`no descriptor for ${piece.id}`); process.exit(1) }
  for (const cw of piece.colorways) {
    const file = path.join(OUT_DIR, `${piece.id}--${slug(cw.name)}.jpg`)
    if (existsSync(file)) continue
    jobs.push({ piece, cw, desc, file })
  }
}

mkdirSync(OUT_DIR, { recursive: true })
console.log(`${jobs.length} image(s) to generate`)

const sleep = ms => new Promise(r => setTimeout(r, ms))
let done = 0
const failures = []

async function generate(job) {
  const { piece, cw, desc, file } = job
  const prompt =
    `Professional e-commerce product photograph: ${desc}, in ${cw.name.toLowerCase()} color (${cw.hex}). ` +
    `Neatly styled flat lay, centered on a warm cream seamless studio background (#f0e9dc), soft diffused ` +
    `studio lighting from the upper left, gentle natural folds showing true fabric texture, garment fills ` +
    `about 80% of the frame. No person, no mannequin, no hangers, no props, no text, no watermark. Square image.`

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      })
      if (res.status === 429 || res.status >= 500) {
        await sleep(4000 * attempt + Math.random() * 2000)
        continue
      }
      const j = await res.json()
      const part = j?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
      if (!part) throw new Error(`no image in response: ${JSON.stringify(j).slice(0, 140)}`)
      const tmp = file.replace(/\.jpg$/, '.tmp.png')
      writeFileSync(tmp, Buffer.from(part.inlineData.data, 'base64'))
      // Normalize: 900px, JPEG — keeps the catalog ~50-90KB per image.
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', '900', tmp, '--out', file], { stdio: 'ignore' })
      unlinkSync(tmp)
      done++
      console.log(`[${done}] ${piece.id} — ${cw.name}`)
      return
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        failures.push(`${piece.id}--${slug(cw.name)}: ${err.message}`)
        return
      }
      await sleep(3000 * attempt)
    }
  }
  failures.push(`${piece.id}--${slug(cw.name)}: rate-limited after ${MAX_ATTEMPTS} attempts`)
}

const queue = [...jobs]
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length > 0) await generate(queue.shift())
}))

console.log(`\ndone: ${done} generated, ${failures.length} failed`)
for (const f of failures) console.log('FAILED', f)
process.exit(failures.length > 0 ? 1 : 0)
