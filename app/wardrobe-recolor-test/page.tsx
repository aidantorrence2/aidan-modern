'use client'
// Internal harness: runs the real client recolor over the real look shots for
// the hard transitions, side by side with the base, so recolor quality is a
// thing we look at rather than assume. Not linked from anywhere.

import { useEffect, useState } from 'react'
import { pieceById } from '@/components/wardrobe'
import { baseColorway, recolorLook } from '@/lib/recolorLook'

const CASES: { top: string; bottom: string; tune: { kind: 'top' | 'bottom'; name: string }[] }[] = [
  { top: 'silk-blouse', bottom: 'straight-jeans', tune: [{ kind: 'top', name: 'Ivory' }, { kind: 'top', name: 'Black' }, { kind: 'top', name: 'Dusty blue' }, { kind: 'top', name: 'Burgundy' }] },
  { top: 'crew-tee', bottom: 'straight-jeans', tune: [{ kind: 'top', name: 'White' }, { kind: 'top', name: 'Black' }, { kind: 'top', name: 'Sage' }] },
  { top: 'wrap-top', bottom: 'straight-jeans', tune: [{ kind: 'top', name: 'Olive' }, { kind: 'top', name: 'Black' }, { kind: 'top', name: 'Ivory' }] },
  { top: 'silk-blouse', bottom: 'straight-jeans', tune: [{ kind: 'bottom', name: 'Washed black' }, { kind: 'bottom', name: 'Ecru' }, { kind: 'bottom', name: 'Light wash' }] },
  { top: 'tank-top', bottom: 'leather-pants', tune: [{ kind: 'top', name: 'White' }, { kind: 'bottom', name: 'Black' }, { kind: 'bottom', name: 'Oxblood' }] },
  { top: 'corset-top', bottom: 'satin-slip-skirt', tune: [{ kind: 'bottom', name: 'Black' }, { kind: 'bottom', name: 'Sage' }, { kind: 'top', name: 'Ivory' }] },
]

function Cell({ src, jobs, label }: { src: string; jobs: { from: string; to: string }[]; label: string }) {
  const [out, setOut] = useState<string | null>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    recolorLook(src, jobs).then(setOut).catch(() => setErr(true))
  }, [src, JSON.stringify(jobs)]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ display: 'inline-block', margin: 4, textAlign: 'center', verticalAlign: 'top' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {out ? <img src={out} alt={label} style={{ height: 300, borderRadius: 8 }} /> : <div style={{ height: 300, width: 220, background: '#eee' }}>{err ? 'ERR' : '…'}</div>}
      <div style={{ font: '10px system-ui', color: '#555' }}>{label}</div>
    </div>
  )
}

export default function RecolorTest() {
  return (
    <main style={{ background: '#f4f2ee', padding: 16 }}>
      {CASES.map((c, i) => {
        const top = pieceById(c.top)!
        const bottom = pieceById(c.bottom)!
        const src = `/images/wardrobe-looks/${top.id}__${bottom.id}.jpg`
        const tBase = baseColorway(top), bBase = baseColorway(bottom)
        return (
          <section key={i}>
            <h2 style={{ font: 'bold 12px system-ui', margin: '14px 0 2px' }}>
              {top.label} ({tBase.name} base) + {bottom.label} ({bBase.name} base)
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div style={{ display: 'inline-block', margin: 4, textAlign: 'center', verticalAlign: 'top' }}>
              <img src={src} alt="base" style={{ height: 300, borderRadius: 8 }} />
              <div style={{ font: '10px system-ui', color: '#555' }}>BASE</div>
            </div>
            {c.tune.map(t => {
              const piece = t.kind === 'top' ? top : bottom
              const base = t.kind === 'top' ? tBase : bBase
              const cw = piece.colorways.find(x => x.name === t.name)!
              return <Cell key={t.kind + t.name} src={src} jobs={[{ from: base.hex, to: cw.hex }]} label={`${t.kind}: ${base.name} → ${t.name}`} />
            })}
          </section>
        )
      })}
    </main>
  )
}
