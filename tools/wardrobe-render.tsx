// Renders the full wardrobe catalog to a static HTML file — every piece in
// every colorway, plus composites on the croquis — without needing the Next
// dev server. Used to verify garment art in isolation:
//
//   npx tsx tools/wardrobe-render.tsx /tmp/wardrobe.html
//
// Then screenshot the file with a headless browser and look at it.

import { writeFileSync } from 'fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { WARDROBE, ALL_PIECES } from '../components/wardrobe'
import Croquis from '../components/wardrobe/croquis'
import type { Piece } from '../components/wardrobe/contract'

const out = process.argv[2]
if (!out) {
  console.error('usage: npx tsx tools/wardrobe-render.tsx <out.html>')
  process.exit(1)
}

const tile = (p: Piece, hex: string, name: string) => (
  <div style={{ display: 'inline-block', margin: 4, textAlign: 'center' }}>
    <div style={{ width: 110, background: '#faf8f4', border: '1px solid #ddd', borderRadius: 10, padding: 4 }}>
      <svg viewBox={p.tileBox} style={{ width: '100%', height: 130 }}>{p.render(hex)}</svg>
    </div>
    <div style={{ fontSize: 9, color: '#888' }}>{name}</div>
  </div>
)

const model = (picks: { p: Piece; hex: string }[], label: string) => (
  <div style={{ display: 'inline-block', margin: 6, textAlign: 'center' }}>
    <svg viewBox="0 0 300 800" style={{ height: 430, background: '#faf8f4', border: '1px solid #ddd', borderRadius: 10 }}>
      <Croquis />
      {(['bottom', 'top', 'dress', 'layer'] as const).flatMap(kind =>
        picks.filter(x => x.p.kind === kind).map(x => <g key={x.p.id}>{x.p.render(x.hex)}</g>)
      )}
    </svg>
    <div style={{ fontSize: 10, color: '#666' }}>{label}</div>
  </div>
)

const by = (id: string) => ALL_PIECES.find(p => p.id === id)
const composites: React.ReactNode[] = [model([], 'croquis')]
const blouse = by('silk-blouse'), jeans = by('straight-jeans'), slip = by('slip-dress')
if (blouse && jeans) composites.push(model([{ p: jeans, hex: jeans.colorways[0].hex }, { p: blouse, hex: blouse.colorways[0].hex }], 'blouse + jeans'))
if (slip) composites.push(model([{ p: slip, hex: slip.colorways[0].hex }], 'slip dress'))
// Every piece also gets a solo turn on the model so fit against the body is checkable.
for (const p of ALL_PIECES) {
  const base = p.kind === 'top' || p.kind === 'layer'
    ? (jeans ? [{ p: jeans, hex: jeans.colorways[0].hex }] : [])
    : p.kind === 'bottom' && blouse ? [{ p: blouse, hex: blouse.colorways[0].hex }] : []
  composites.push(model([...base, { p, hex: p.colorways[0].hex }], p.label))
}

const page = (
  <html>
    <body style={{ fontFamily: 'system-ui', background: '#f4f2ee', padding: 24 }}>
      <h1 style={{ fontSize: 18 }}>Wardrobe — {ALL_PIECES.length} pieces</h1>
      <h2 style={{ fontSize: 13, color: '#999', textTransform: 'uppercase' }}>On the model</h2>
      <div>{composites}</div>
      {(['top', 'layer', 'bottom', 'dress'] as const).map(kind => (
        <div key={kind}>
          <h2 style={{ fontSize: 13, color: '#999', textTransform: 'uppercase' }}>{kind} — {WARDROBE[kind].length}</h2>
          {WARDROBE[kind].map(p => (
            <div key={p.id}>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8 }}>{p.label} ({p.id})</div>
              <div>{p.colorways.map(cw => tile(p, cw.hex, cw.name))}</div>
            </div>
          ))}
        </div>
      ))}
    </body>
  </html>
)

writeFileSync(out, '<!doctype html>' + renderToStaticMarkup(page))
console.log(`wrote ${out} — ${ALL_PIECES.length} pieces`)
