// ── The wardrobe contract ──
//
// Every garment is drawn on ONE shared coordinate system — the croquis body in
// croquis.tsx, viewBox 0 0 300 800 — so any top can stack over any bottom on
// the model and land correctly by construction. This is how paper-doll styling
// tools work; nothing is positioned at runtime.
//
// BODY ANCHORS (croquis.tsx is the source of truth — draw against these):
//   neck base          (150, 132)
//   shoulders          (104, 150) left · (196, 150) right
//   underarm           y ≈ 205
//   waist              y = 300, x 118–182
//   high hip           y = 340
//   hip (widest)       y = 372, x 102–198
//   crotch             (150, 398)
//   knee               y ≈ 560
//   ankle              y ≈ 726
//   arm line (left)    shoulder (104,152) → elbow (92,268) → wrist (88,390)
//   arm line (right)   mirror around x=150: (196,152) → (208,268) → (212,390)
//   hem heights        crop 260 · waist 310 · regular top 350 · tunic 400
//                      mini 460 · knee 560 · midi 640 · maxi/ankle 720
//
// LAYERING on the model (z-order): croquis → bottom → top OR dress → layer.
// Sleeved garments draw their own sleeves along the arm line, over the skin.
// A `layer` (jacket, blazer…) is cut ~8px wider than a top and worn open.
//
// REALISM RULES — this is editorial, not clip-art:
//   · The base silhouette is ONE path filled with `c` (the selected colorway).
//   · Drape and construction come from overlay paths that are color-agnostic:
//     shadows = black at 0.06–0.16 alpha, highlights/sheen = white at
//     0.05–0.12 alpha, seams/topstitch = #2b2620 at 0.25–0.5 alpha, thin.
//   · Every garment needs at least: 2–3 drape/fold shadows, one light pass,
//     and its construction details (plackets, waistbands, cuffs, pockets,
//     zips, darts) or it reads as a sticker.
//   · Colorways are CURATED PER GARMENT to what the fabric actually comes in:
//     denim is indigo/washed/black/ecru — never emerald; leather is black/
//     chocolate/oxblood; silk takes jewel tones and champagnes. 4–8 each.
//     First colorway is the default.
//   · Outline stroke: #2b2620, width 1.5–2, join/cap round.

import type React from 'react'

export type PieceKind = 'top' | 'bottom' | 'dress' | 'layer'

export type Colorway = { name: string; hex: string }

export type Piece = {
  id: string
  kind: PieceKind
  label: string
  /** Realistic colors for THIS garment; first entry is the default. */
  colorways: Colorway[]
  /** Garment art on the shared 0 0 300 800 body system. `c` = colorway hex. */
  render: (c: string) => React.ReactNode
  /** viewBox crop for the standalone tile, e.g. '60 120 180 260' for a top. */
  tileBox: string
}

/** Shared stroke for garment outlines. */
export const outline = {
  stroke: '#2b2620',
  strokeWidth: 1.8,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}

/** Thin construction lines — seams, plackets, topstitching. */
export const seam = {
  stroke: '#2b2620',
  strokeWidth: 1,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
  fill: 'none',
  opacity: 0.4,
}
