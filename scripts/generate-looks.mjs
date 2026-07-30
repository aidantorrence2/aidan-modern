#!/usr/bin/env node
// Prebuilds the model photos for the styler, so the model is always dressed
// with zero runtime generation:
//
//   · one shot per top×bottom COMBO, generated in each garment's BASE
//     colorway (its most saturated one — chosen so the client can re-key the
//     hue to other colorways locally): public/images/wardrobe-looks/{top}__{bottom}.jpg
//   · one shot per dress VARIANT (patterns can't be re-keyed from a solid,
//     and the dress count is manageable): public/images/wardrobe-looks/{dress}--{variant}.jpg
//
// Idempotent + incremental like generate-wardrobe.mjs. Usage:
//   GEMINI_API_KEY=... node scripts/generate-looks.mjs combos   # tops × bottoms
//   GEMINI_API_KEY=... node scripts/generate-looks.mjs dresses  # every dress variant

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { execFileSync } from 'child_process'
import path from 'path'
import url from 'url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const CATALOG = path.join(ROOT, 'public/images/wardrobe')
const OUT_DIR = path.join(ROOT, 'public/images/wardrobe-looks')
const MANIFEST = JSON.parse(readFileSync(path.join(ROOT, 'data/wardrobe-manifest.json'), 'utf8'))

const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1) }
const MODEL = 'gemini-3.1-flash-image'
const CONCURRENCY = 3
const MAX_ATTEMPTS = 4

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// Most saturated colorway = the recolor anchor. Mirrored in lib/wardrobeImages.ts
// (baseColorway) — keep the two implementations identical.
function saturation(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  if (max === min) return 0
  const l = (max + min) / 2
  return (max - min) / (l > 0.5 ? 2 - max - min : max + min)
}
const baseColorway = piece => [...piece.colorways].sort((a, b) => saturation(b.hex) - saturation(a.hex))[0]

const POSE =
  'Full-length editorial fashion photograph of one young woman modeling the outfit, standing straight facing ' +
  'the camera, arms relaxed at her sides, neutral pleasant expression, on a plain warm cream seamless studio ' +
  'background, soft even studio light, shot on 35mm film with soft grain. She wears exactly the garments from ' +
  'the attached product photos, matching their colors, fabrics and details precisely. Tasteful, modest styling. ' +
  'Simple neutral flat shoes. No text, no watermark.'

const jobs = []
const mode = process.argv[2]
if (mode === 'combos') {
  const tops = MANIFEST.filter(p => p.kind === 'top')
  const bottoms = MANIFEST.filter(p => p.kind === 'bottom')
  for (const t of tops) for (const b of bottoms) {
    const file = path.join(OUT_DIR, `${t.id}__${b.id}.jpg`)
    if (existsSync(file)) continue
    const tc = baseColorway(t), bc = baseColorway(b)
    jobs.push({
      file,
      images: [
        path.join(CATALOG, `${t.id}--${slug(tc.name)}.jpg`),
        path.join(CATALOG, `${b.id}--${slug(bc.name)}.jpg`),
      ],
      text: `${POSE} The outfit: a ${tc.name.toLowerCase()} ${t.label.toLowerCase()} worn with ${bc.name.toLowerCase()} ${b.label.toLowerCase()}.`,
    })
  }
} else if (mode === 'dresses') {
  for (const d of MANIFEST.filter(p => p.kind === 'dress')) {
    for (const cw of d.colorways) {
      const file = path.join(OUT_DIR, `${d.id}--${slug(cw.name)}.jpg`)
      if (existsSync(file)) continue
      jobs.push({
        file,
        images: [path.join(CATALOG, `${d.id}--${slug(cw.name)}.jpg`)],
        text: `${POSE} The outfit: a ${cw.name.toLowerCase()} ${d.label.toLowerCase()}.`,
      })
    }
  }
} else {
  console.error('usage: generate-looks.mjs combos|dresses'); process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })
console.log(`${jobs.length} look(s) to generate`)
const sleep = ms => new Promise(r => setTimeout(r, ms))
let done = 0
const failures = []

async function generate(job) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const parts = [{ text: job.text }]
      for (const img of job.images) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: readFileSync(img).toString('base64') } })
      }
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'] } }),
      })
      if (res.status === 429 || res.status >= 500) { await sleep(4000 * attempt + Math.random() * 2000); continue }
      const j = await res.json()
      const part = j?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
      if (!part) throw new Error(`no image: ${JSON.stringify(j).slice(0, 120)}`)
      const tmp = job.file.replace(/\.jpg$/, '.tmp.png')
      writeFileSync(tmp, Buffer.from(part.inlineData.data, 'base64'))
      // Portrait 3:4-ish, 1000px tall is plenty for a 46%-width phone panel.
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '80', '-Z', '1000', tmp, '--out', job.file], { stdio: 'ignore' })
      unlinkSync(tmp)
      done++
      console.log(`[${done}] ${path.basename(job.file)}`)
      return
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) { failures.push(`${path.basename(job.file)}: ${err.message}`); return }
      await sleep(3000 * attempt)
    }
  }
  failures.push(`${path.basename(job.file)}: rate-limited`)
}

const queue = [...jobs]
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length > 0) await generate(queue.shift())
}))
console.log(`\ndone: ${done}, failed: ${failures.length}`)
for (const f of failures) console.log('FAILED', f)
process.exit(failures.length > 0 ? 1 : 0)
