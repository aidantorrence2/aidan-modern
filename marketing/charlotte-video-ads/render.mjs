#!/usr/bin/env node
// Charlotte reels — render one variant (engine from ~/paris-video-ads).
//   node render.mjs --v=a [--stills=0.5,2.4,6] [--version=1] [--force] [--workers=6]
//   --stills  → only those times as JPEGs + a sheet in work/<name>/ (fast canary, no encode)
//   default   → all frames → mix → out/charlotte-<name>-v<version>.mp4 + out/charlotte-<name>-v<version>-sheet.jpg
// Variants live in variants/<letter>-*.mjs and export build(ctx) → { name, fps, duration, html, fontsCheck?, audio, sheet }.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { ROOT, W, H, stage, face, renderFrames, encode, contactSheet, grid } from './lib/engine.mjs'
import { beatOf, mix } from './lib/audio.mjs'

const arg = k => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]
const letter = arg('v') || 'a'
const file = fs.readdirSync(path.join(ROOT, 'variants')).filter(f => f.endsWith('.mjs')).find(f => f.startsWith(letter + '-') && f.endsWith('.mjs'))
if (!file) throw new Error(`no variant ${letter}`)
const mod = await import(path.join(ROOT, 'variants', file))
const v = await mod.build({ stage, face, beatOf, W, H, ROOT, arg })
const workers = +(arg('workers') || 6)

if (arg('stills')) {
  const st = v.timeline?.starts || []
  const times = arg('stills') === 'sheet' ? v.sheet
    : arg('stills') === 'each' ? st.map((s, i) => +((s + (st[i + 1] ?? v.duration)) / 2).toFixed(3))
    : arg('stills').split(',').map(Number)
  if (v.frames) console.log(v.frames.join('\n'))
  const { frames } = await renderFrames(v, { only: times, workers: Math.min(workers, times.length) })
  const shots = fs.readdirSync(frames).filter(f => f.endsWith('.jpg')).sort().map(f => path.join(frames, f))
  const sheet = path.join(ROOT, 'work', v.name, 'stills-sheet.jpg')
  grid(shots, sheet, { cols: Math.min(6, shots.length), tw: 300, th: 533 })
  console.log(sheet)
} else {
  const version = arg('version') || '1'
  const out = path.join(ROOT, 'out', `charlotte-${v.name}-v${version}.mp4`)
  if (fs.existsSync(out) && !process.argv.includes('--force')) { console.error(`exists, not overwriting: ${out}`); process.exit(1) }
  // --reuse-frames: skip rendering when work/<name>/frames was made from this exact page + timing
  const crypto = await import('node:crypto')
  const hash = crypto.createHash('sha1').update(v.html + String(v.duration) + String(v.blurAt || '')).digest('hex')
  const fdir = path.join(ROOT, 'work', v.name, 'frames'), hf = path.join(fdir, '.hash')
  const N = Math.round(v.duration * v.fps)
  const reuse = process.argv.includes('--reuse-frames') && fs.existsSync(hf) && fs.readFileSync(hf, 'utf8') === hash && fs.readdirSync(fdir).filter(f => f.endsWith('.jpg')).length >= N
  const r = reuse ? (console.log(`[${v.name}] reusing ${N} frames`), { frames: fdir, N }) : await renderFrames(v, { workers })
  fs.writeFileSync(hf, hash)
  const wav = v.audio && !process.argv.includes('--silent') ? mix(v.name, v.duration, v.audio) : null
  encode(v, r, wav, out)
  const times = v.sheet || [...Array(12).keys()].map(i => (i + 0.5) * v.duration / 12)
  contactSheet(out, times, out.replace(/\.mp4$/, '-sheet.jpg'))
  const meta = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,r_frame_rate', '-of', 'compact=p=0', out]).toString().trim()
  console.log(`✓ ${out}\n${meta}`)
}
