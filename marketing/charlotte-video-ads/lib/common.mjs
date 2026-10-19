// Shared copy + helpers for the Charlotte reels.
// Copy rules (Aidan): English, "free photo shoot", never tfp; NOTHING about film; no "models"/casting/job words (US
// Employment category); no dates unless real; nothing about looks or age; city = Charlotte; text never covers a face.
export const HANDLE = '@madebyaidan'

// seeded PRNG (same as page-side U.rng) so typing jitter is identical in video and audio timelines
export const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }

// When each character of `text` appears, human-ish: base cps with jitter, a breath after punctuation/spaces.
export function typeTimes(text, start, { cps = 17, seed = 7 } = {}) {
  const r = rng(seed), chars = Array.from(text), times = []
  let t = start
  for (let i = 0; i < chars.length; i++) {
    times.push(+t.toFixed(4))
    const c = chars[i]
    let d = (1 / cps) * (0.7 + 0.6 * r())
    if (c === ' ') d *= 1.25
    if (/[,.!?’']/.test(c)) d += 0.12
    t += d
  }
  return { chars, times, end: t }
}

// one key-click SFX event per typed character (variants rotate so it never sounds machine-gunned)
export function keyEvents(sched, { gainDb = -6, seed = 3 } = {}) {
  const r = rng(seed)
  return sched.chars.map((c, i) => ({ t: sched.times[i], file: c === ' ' ? 'sfx-key-space.wav' : `sfx-key-${1 + Math.floor(r() * 4)}.wav`, gainDb: gainDb + (r() - 0.5) * 3 }))
}

// cover-crop focus point that centres the face (if Vision found one) — returns {fx, fy} in 0..1
export function faceFocus(a, W = 1080, H = 1920, z = 1, bias = { x: 0, y: -0.06 }) {
  const k = Math.max(W / a.w, H / a.h) * z, sw = a.w * k, sh = a.h * k
  if (!a.face) return { fx: 0.5, fy: 0.5 }
  const cx = (a.face.box[0] + a.face.box[2] / 2) * k, cy = (a.face.box[1] + a.face.box[3] / 2) * k
  const fx = sw > W ? Math.min(1, Math.max(0, (cx - W * (0.5 + bias.x)) / (sw - W))) : 0.5
  const fy = sh > H ? Math.min(1, Math.max(0, (cy - H * (0.42 + bias.y)) / (sh - H))) : 0.5
  return { fx: +fx.toFixed(3), fy: +fy.toFixed(3) }
}
