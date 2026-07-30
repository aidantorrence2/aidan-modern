// Client-side recoloring of the prebuilt look shots.
//
// The combo photos are generated ONCE per top×bottom, each garment in its
// BASE colorway — its most saturated one, so its hue is distinct enough to
// key on. Choosing a different colorway re-keys those pixels locally: hue
// rotates by the base→target delta, saturation and lightness follow, and
// everything outside the hue window (skin, backdrop, the other garment) is
// left alone. Neutral targets (black, ivory…) desaturate instead of rotate.
//
// baseColorway() here MUST match the choice in scripts/generate-looks.mjs.

import type { Piece, Colorway } from '@/components/wardrobe/contract'

type HSL = { h: number; s: number; l: number }

function hexToHsl(hex: string): HSL {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = d / (l > 0.5 ? 2 - max - min : max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) h = ((b - r) / d + 2) * 60
  else h = ((r - g) / d + 4) * 60
  return { h, s, l }
}

export function baseColorway(piece: Piece): Colorway {
  return [...piece.colorways].sort((a, b) => hexToHsl(b.hex).s - hexToHsl(a.hex).s)[0]
}

const hueDist = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

export type RecolorJob = { from: string; to: string }

/** Returns a data URL of `src` with each job's hue band remapped. */
export function recolorLook(src: string, jobs: RecolorJob[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const active = jobs
      .map(j => ({ from: hexToHsl(j.from), to: hexToHsl(j.to) }))
      .filter(j => hueDist(j.from.h, j.to.h) > 4 || Math.abs(j.from.s - j.to.s) > 0.08 || Math.abs(j.from.l - j.to.l) > 0.08)
    if (active.length === 0) { resolve(src); return }

    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const px = data.data
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i] / 255, g = px[i + 1] / 255, b = px[i + 2] / 255
          const max = Math.max(r, g, b), min = Math.min(r, g, b)
          const l = (max + min) / 2
          if (max === min) continue // greys never key
          const d = max - min
          const s = d / (l > 0.5 ? 2 - max - min : max + min)
          if (s < 0.13) continue
          let h = 0
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
          else if (max === g) h = ((b - r) / d + 2) * 60
          else h = ((r - g) / d + 4) * 60

          for (const job of active) {
            if (hueDist(h, job.from.h) > 26) continue
            let nh: number, ns: number, nl: number
            if (job.to.s < 0.13) {
              // Neutral target: keep the shading, drop the color.
              nh = h
              ns = s * 0.12
              nl = Math.max(0.02, Math.min(0.97, l + (job.to.l - job.from.l) * 0.9))
            } else {
              nh = (job.to.h + (h - job.from.h) + 360) % 360
              ns = Math.max(0, Math.min(1, s * (job.to.s / Math.max(job.from.s, 0.05))))
              nl = Math.max(0.02, Math.min(0.97, l + (job.to.l - job.from.l) * 0.85))
            }
            // hsl → rgb
            const q = nl < 0.5 ? nl * (1 + ns) : nl + ns - nl * ns
            const p = 2 * nl - q
            const hk = nh / 360
            const chan = (t: number) => {
              t = (t + 1) % 1
              if (t < 1 / 6) return p + (q - p) * 6 * t
              if (t < 1 / 2) return q
              if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
              return p
            }
            px[i] = Math.round(chan(hk + 1 / 3) * 255)
            px[i + 1] = Math.round(chan(hk) * 255)
            px[i + 2] = Math.round(chan(hk - 1 / 3) * 255)
            break
          }
        }
        ctx.putImageData(data, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('look image failed to load'))
    img.src = src
  })
}
