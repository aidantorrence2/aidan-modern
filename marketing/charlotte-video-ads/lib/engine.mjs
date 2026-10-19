// Frame-exact motion renderer (cloned from ~/paris-video-ads for the Charlotte reels).
// A variant is an HTML page that defines window.renderFrame(t) — a PURE function of time (no CSS transitions, no
// timers) — so N Chromium pages can render interleaved frames in parallel. Frames → JPEG → x264, audio mixed
// separately (lib/audio.mjs) and muxed at the end.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, execFile } from 'node:child_process'
import { promisify } from 'node:util'
const execFileP = promisify(execFile)
import { createRequire } from 'node:module'
const require = createRequire('/Users/aidantorrence/Documents/aidan-modern/package.json')
const { chromium } = require('playwright')

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
// upright copies of public/images/tier_candidates (T<n>.jpg, via aidan-modern marketing/charlotte-ig-dm/prep-photos.py)
// plus public/images/self/*.jpg; gitignored, rebuilt from those sources
export const SRC = path.join(ROOT, 'work/src')
export const VISION = path.join(ROOT, 'work/vision')
export const W = 1080, H = 1920
// IG Stories cover the top ~250 px; Reels cover far more at the bottom (caption, CTA, right rail). Every word stays in
// y 250 … 1440 (top 75 % of the frame, Aidan's ad-layout rule) and 40 px off the sides.
export const SAFE = { top: 250, bottom: 1440, left: 40, right: W - 40 }

export const FF = (() => {
  const full = '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg'
  try { execFileSync(full, ['-version'], { stdio: 'ignore' }); return full } catch { return 'ffmpeg' }
})()

export const face = stem => JSON.parse(fs.readFileSync(path.join(VISION, `${stem}.face.json`), 'utf8'))

// Stage one tier0 photo into the variant's work dir: Lanczos upscale to 2400 px on the long… height axis (cleaner than
// Chromium's bilinear on push-ins), optional RGBA cut-out from the Vision subject mask. Source dir is read-only.
export function stage(workDir, stem, { cutout = false, long = 2400 } = {}) {
  const dir = path.join(workDir, 'assets'); fs.mkdirSync(dir, { recursive: true })
  const src = path.join(SRC, `${stem}.jpg`)
  const [iw, ih] = execFileSync('magick', ['identify', '-format', '%w %h', src]).toString().split(' ').map(Number)
  const k = long / Math.max(iw, ih)
  const out = path.join(dir, `${stem}.jpg`)
  if (!fs.existsSync(out)) execFileSync('magick', [src, '-colorspace', 'RGB', '-filter', 'Lanczos', '-resize', `${Math.round(iw * k)}x${Math.round(ih * k)}!`, '-colorspace', 'sRGB', '-quality', '95', out])
  const a = { stem, src: `assets/${stem}.jpg`, w: Math.round(iw * k), h: Math.round(ih * k), k }
  if (cutout) {
    const cut = path.join(dir, `${stem}.cut.png`)
    // feather the Vision mask a touch so the occluding edge doesn't look like a sticker
    if (!fs.existsSync(cut)) execFileSync('magick', [out, '(', path.join(VISION, `${stem}.mask.png`), '-resize', `${a.w}x${a.h}!`, '-morphology', 'Erode', 'Disk:1.5', '-blur', '0x1.6', ')', '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', cut])
    a.cut = `assets/${stem}.cut.png`
  }
  const fj = path.join(VISION, `${stem}.face.json`)
  if (fs.existsSync(fj)) {
    const f = JSON.parse(fs.readFileSync(fj, 'utf8')).faces[0]
    if (f) a.face = { box: f.box.map(v => v * k), le: f.leftEye?.map(v => v * k), re: f.rightEye?.map(v => v * k) }
    a.faces = JSON.parse(fs.readFileSync(fj, 'utf8')).faces.map(g => g.box.map(v => v * k))
  }
  return a
}

// A photo layer sized a.w×a.h (position it with a transform) carrying invisible .fbox markers on every face, so the
// renderer can fail any frame where visible text overlaps a visible face, wherever the motion has moved the photo.
export const fboxes = a => (a.faces || []).map(b => `<div class="fbox" style="position:absolute;left:${b[0].toFixed(0)}px;top:${b[1].toFixed(0)}px;width:${b[2].toFixed(0)}px;height:${b[3].toFixed(0)}px;"></div>`).join('')
export const layer = (a, id, extra = '') => `<div id="${id}" class="abs ph" style="width:${a.w}px;height:${a.h}px;transform-origin:0 0;${extra}"><img src="${a.src}" style="width:100%;height:100%"/>${fboxes(a)}</div>`

// shared page chrome: reset, fonts, helpers available to every variant as window.U
export const BASE_CSS = `*{box-sizing:border-box;margin:0;padding:0}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
body{position:relative;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.abs{position:absolute;left:0;top:0}img{display:block}`
export const HELPERS = `
window.U = {
  clamp:(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),
  lerp:(a,b,x)=>a+(b-a)*x,
  // progress of t through [a,b], clamped
  p:(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a))),
  eio:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,         // easeInOutCubic
  eo:x=>1-Math.pow(1-x,3),                               // easeOutCubic
  eo5:x=>1-Math.pow(1-x,5),
  ei:x=>x*x*x,
  expo:x=>x===0?0:Math.pow(2,10*x-10),                   // easeInExpo
  eoexpo:x=>x===1?1:1-Math.pow(2,-10*x),
  // seeded random for jitter that is identical on every worker
  rng:s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},
  // cover-fit a w×h image into the frame with a focus point (fx,fy ∈ 0..1) and extra zoom z about that point
  cover:(w,h,fx=.5,fy=.5,z=1,W=${W},H=${H})=>{const k=Math.max(W/w,H/h)*z,sw=w*k,sh=h*k;return{k,x:-(sw-W)*fx,y:-(sh-H)*fy,sw,sh}},
}`

export function pageHTML({ css = '', body = '', script = '' }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}${css}</style></head><body>${body}
<script>${HELPERS}</script><script>${script}</script></body></html>`
}

// Render all frames. variant = { name, fps, duration, html, fontsCheck?: [css font strings] }
export async function renderFrames(v, { workers = Math.max(2, Math.min(8, os.cpus().length - 2)), only = null, quality = 94 } = {}) {
  const work = path.join(ROOT, 'work', v.name)
  const frames = path.join(work, only ? `stills/${Date.now()}` : 'frames')
  fs.mkdirSync(frames, { recursive: true })
  fs.writeFileSync(path.join(work, 'index.html'), v.html)
  // motion blur: v.blurAt(t) → K samples spread over a 180° shutter ending at t, averaged (only where motion is fast)
  const rate = v.fps
  const N = Math.round(v.duration * rate)
  const list = only ? only.map(t => Math.min(N - 1, Math.round(t * rate))) : [...Array(N).keys()]
  const sub = path.join(work, 'sub'); if (!only && v.blurAt) fs.mkdirSync(sub, { recursive: true })
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'] })
  const bad = []
  const t0 = Date.now()
  let done = 0, samples = 0
  async function worker(wi) {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
    page.on('pageerror', e => { console.error(`[${v.name}] page error:`, e.message) })
    await page.goto('file://' + path.join(work, 'index.html'))
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); if (window.ready) await window.ready })
    if (wi === 0 && v.fontsCheck) for (const f of v.fontsCheck) {
      const ok = await page.evaluate(f => document.fonts.check(f), f)
      if (!ok) throw new Error(`font not available: ${f}`)
    }
    for (let j = wi; j < list.length; j += workers) {
      const fi = list[j], t = fi / rate
      const name = only ? `still-${String(t.toFixed(2)).padStart(6, '0')}s.jpg` : `${String(fi).padStart(5, '0')}.jpg`
      const K = only || !v.blurAt ? 1 : Math.max(1, Math.round(v.blurAt(t)))
      if (K > 1) {
        const parts = []
        for (let k = 0; k < K; k++) {
          const ts = t - (0.5 / rate) * (1 - (k + 0.5) / K)
          await page.evaluate(ts => window.renderFrame(ts), ts)
          const f = path.join(sub, `${String(fi).padStart(5, '0')}-${k}.jpg`)
          await page.screenshot({ path: f, type: 'jpeg', quality: 96 }); parts.push(f)
        }
        samples += K
        await execFileP('magick', [...parts, '-evaluate-sequence', 'mean', '-quality', String(quality), path.join(frames, name)])
      }
      await page.evaluate(t => window.renderFrame(t), t)
      // safe-zone audit: every visible .t (text) element must sit inside the IG-safe box
      if (fi % 3 === 0 || only) {
        const r = await page.evaluate(S => [...document.querySelectorAll('.t')].filter(e => !e.closest('[data-nosafe]')).filter(e => {
          const cs = getComputedStyle(e); let o = 1, n = e
          while (n && n !== document.body) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden') return false; o *= +s.opacity; n = n.parentElement }
          return o > 0.05 && e.getBoundingClientRect().width > 0
        }).map(e => { const rg = document.createRange(); rg.selectNodeContents(e); const b = rg.getBoundingClientRect(); return { id: e.id || e.className, top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right) } })
          .filter(b => b.top < S.top || b.bottom > S.bottom || b.left < S.left - 1 || b.right > S.right + 1), SAFE)
        if (r.length) bad.push({ t: +t.toFixed(2), r })
        // face audit: no visible text may overlap a visible face (text marked data-behind sits behind a cut-out; data-card = text on an opaque card above the photos)
        const fo = await page.evaluate(() => {
          const vis = e => { let o = 1, n = e; while (n && n !== document.body) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden') return 0; o *= +s.opacity; n = n.parentElement } return o }
          const R = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
          const faces = [...document.querySelectorAll('.fbox')].filter(e => vis(e) > 0.3).map(e => e.getBoundingClientRect()).filter(b => b.right > 0 && b.left < innerWidth && b.bottom > 0 && b.top < innerHeight && b.width > 30)
          const texts = [...document.querySelectorAll('.t')].filter(e => !e.closest('[data-behind],[data-card]') && vis(e) > 0.05).map(e => { const rg = document.createRange(); rg.selectNodeContents(e); return { id: e.id || e.className, b: rg.getBoundingClientRect() } })
          const hits = []
          for (const tx of texts) for (const f of faces) { const a = R(tx.b, f); if (a > 0.04 * f.width * f.height) hits.push(`${tx.id}×face(${Math.round(f.left)},${Math.round(f.top)},${Math.round(f.width)})`) }
          return hits
        })
        if (fo.length) bad.push({ t: +t.toFixed(2), face: fo })
      }
      if (K === 1) await page.screenshot({ path: path.join(frames, name), type: 'jpeg', quality })
      if (++done % 60 === 0) process.stdout.write(`  [${v.name}] ${done}/${list.length} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s\n`)
    }
    await page.close()
  }
  await Promise.all([...Array(Math.min(workers, list.length)).keys()].map(worker))
  await browser.close()
  if (bad.length) {
    console.error(`[${v.name}] TEXT OUTSIDE SAFE ZONE / OVER A FACE at ${bad.length} sampled frames, first:`, JSON.stringify(bad.slice(0, 3)))
    if (!process.argv.includes('--ignore-safe')) throw new Error('safe-zone or face violation')
  }
  console.log(`[${v.name}] ${list.length} frames (+${samples} blur samples) in ${((Date.now() - t0) / 1000).toFixed(1)}s → ${frames}`)
  return { frames, N }
}

// frames → silent h264 (work), then mux with the mixed audio → out/<file>
export function encode(v, { frames, N }, audioWav, outFile) {
  const work = path.join(ROOT, 'work', v.name)
  const silent = path.join(work, 'video.mp4')
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(v.fps), '-i', path.join(frames, '%05d.jpg'),
    '-frames:v', String(N), '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level', '4.1', '-crf', '18', '-maxrate', '14M', '-bufsize', '28M',
    '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-tag:v', 'avc1', '-movflags', '+faststart', silent], { stdio: 'inherit' })
  if (fs.existsSync(outFile) && !process.argv.includes('--force')) throw new Error(`exists, not overwriting: ${outFile}`)
  // no -shortest (it drops the last frames on packet boundaries): pad the audio and cap at the exact video length
  const a = audioWav ? ['-i', audioWav, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-af', 'apad'] : ['-map', '0:v']
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', silent, ...a, '-c:v', 'copy', '-t', (N / v.fps).toFixed(4), '-movflags', '+faststart', outFile], { stdio: 'inherit' })
  return outFile
}

// 4×N contact sheet of evenly spaced (or given) times, for review
export function contactSheet(file, times, sheet, { cols = 4, tw = 270 } = {}) {
  const th = Math.round(tw * H / W)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheet-'))
  const shots = times.map((t, i) => { const f = path.join(tmp, `g${String(i).padStart(2, '0')}.png`); execFileSync(FF, ['-v', 'error', '-y', '-ss', t.toFixed(3), '-i', file, '-frames:v', '1', '-vf', `scale=${tw}:${th}`, f]); return f })
  return grid(shots, sheet, { cols, tw, th })
}

// image grid without ImageMagick `montage` (its default-font lookup fails on this Mac)
export function grid(files, out, { cols = 4, tw = 270, th = 480, gap = 6, bg = '#111' } = {}) {
  const args = []
  for (let i = 0; i < files.length; i += cols) {
    const row = files.slice(i, i + cols)
    args.push('(', ...row.flatMap(f => ['(', f, '-resize', `${tw}x${th}`, '-background', bg, '-gravity', 'center', '-extent', `${tw + gap * 2}x${th + gap * 2}`, ')']), '+append', ')')
  }
  execFileSync('magick', [...args, '-background', bg, '-append', out])
  return out
}
