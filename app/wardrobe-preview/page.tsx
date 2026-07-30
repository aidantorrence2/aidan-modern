'use client'
// Internal review surface for the wardrobe catalog — every piece in every
// colorway, plus composites on the model. Not linked from anywhere; used to
// verify garment art before it reaches the sign-up flow.

import { WARDROBE, ALL_PIECES, Croquis, type Piece } from '@/components/wardrobe'

function Tile({ piece, hex, name }: { piece: Piece; hex: string; name: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 rounded-xl border border-neutral-200 bg-[#faf8f4] p-1">
        <svg viewBox={piece.tileBox} className="h-28 w-full">{piece.render(hex)}</svg>
      </div>
      <span className="mt-1 text-[9px] font-semibold text-neutral-500">{name}</span>
    </div>
  )
}

function Model({ pieces }: { pieces: { piece: Piece; hex: string }[] }) {
  const byKind = (k: string) => pieces.filter(p => p.piece.kind === k)
  return (
    <svg viewBox="0 0 300 800" className="h-[420px] w-auto rounded-xl border border-neutral-200 bg-[#faf8f4]">
      <Croquis />
      {byKind('bottom').map(({ piece, hex }) => <g key={piece.id}>{piece.render(hex)}</g>)}
      {byKind('top').map(({ piece, hex }) => <g key={piece.id}>{piece.render(hex)}</g>)}
      {byKind('dress').map(({ piece, hex }) => <g key={piece.id}>{piece.render(hex)}</g>)}
      {byKind('layer').map(({ piece, hex }) => <g key={piece.id}>{piece.render(hex)}</g>)}
    </svg>
  )
}

export default function WardrobePreview() {
  const find = (id: string) => ALL_PIECES.find(p => p.id === id)
  const blouse = find('silk-blouse')
  const jeans = find('straight-jeans')
  const slip = find('slip-dress')
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-xl font-bold">Wardrobe catalog — {ALL_PIECES.length} pieces</h1>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-widest text-neutral-400">Composites</h2>
      <div className="mt-3 flex flex-wrap gap-4">
        <Model pieces={[]} />
        {blouse && jeans && <Model pieces={[{ piece: jeans, hex: jeans.colorways[0].hex }, { piece: blouse, hex: blouse.colorways[0].hex }]} />}
        {blouse && jeans && <Model pieces={[{ piece: jeans, hex: jeans.colorways[3].hex }, { piece: blouse, hex: blouse.colorways[2].hex }]} />}
        {slip && <Model pieces={[{ piece: slip, hex: slip.colorways[0].hex }]} />}
      </div>

      {(['top', 'layer', 'bottom', 'dress'] as const).map(kind => (
        <section key={kind}>
          <h2 className="mt-10 text-sm font-bold uppercase tracking-widest text-neutral-400">
            {kind} — {WARDROBE[kind].length}
          </h2>
          {WARDROBE[kind].map(piece => (
            <div key={piece.id} className="mt-4">
              <p className="text-[12px] font-bold text-neutral-700">{piece.label} <span className="font-normal text-neutral-400">({piece.id})</span></p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {piece.colorways.map(cw => <Tile key={cw.name} piece={piece} hex={cw.hex} name={cw.name} />)}
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  )
}
