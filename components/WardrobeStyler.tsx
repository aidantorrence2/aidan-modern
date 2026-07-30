'use client'
// The outfit styler: a model wearing the current look, a catalog of drawn
// garments by category, and per-piece color tuning limited to each fabric's
// real colorways. Pieces layer the way clothes do — top + bottom + layer, or
// a dress (which replaces the separates) still under a layer.

import { useMemo, useState } from 'react'
import { WARDROBE, pieceById, Croquis, type Piece, type PieceKind } from '@/components/wardrobe'

export type LookPick = { id: string; hex: string }
export type Look = { top: LookPick | null; bottom: LookPick | null; dress: LookPick | null; layer: LookPick | null }
export const EMPTY_LOOK: Look = { top: null, bottom: null, dress: null, layer: null }

export function isLookEmpty(look: Look): boolean {
  return !look.top && !look.bottom && !look.dress && !look.layer
}

/** "Emerald silk blouse + Indigo straight jeans + Camel blazer" */
export function lookLabel(look: Look): string | null {
  const name = (pick: LookPick | null) => {
    if (!pick) return null
    const piece = pieceById(pick.id)
    if (!piece) return null
    const cw = piece.colorways.find(c => c.hex === pick.hex) ?? piece.colorways[0]
    return `${cw.name} ${piece.label.toLowerCase()}`
  }
  const parts = [name(look.dress ?? look.top), name(look.bottom), name(look.layer)].filter(Boolean)
  return parts.length > 0 ? parts.join(' + ') : null
}

const KIND_TABS: { kind: PieceKind; label: string }[] = [
  { kind: 'top', label: 'Tops' },
  { kind: 'bottom', label: 'Bottoms' },
  { kind: 'dress', label: 'Dresses' },
  { kind: 'layer', label: 'Layers' },
]

const KIND_NAME: Record<PieceKind, string> = { top: 'Top', bottom: 'Bottom', dress: 'Dress', layer: 'Layer' }

export default function WardrobeStyler({
  look,
  onChange,
  onEngage,
}: {
  look: Look
  onChange: (next: Look) => void
  onEngage?: (event: string, props?: Record<string, string | number | boolean>) => void
}) {
  const [tab, setTab] = useState<PieceKind>('top')
  // Whose swatches are showing — the piece touched last.
  const [tuning, setTuning] = useState<PieceKind | null>(null)

  const worn = useMemo(() => {
    const order: PieceKind[] = ['bottom', 'top', 'dress', 'layer']
    return order.flatMap(kind => {
      const pick = look[kind]
      const piece = pick && pieceById(pick.id)
      return piece ? [{ piece, hex: pick.hex, kind }] : []
    })
  }, [look])

  function toggle(piece: Piece) {
    const kind = piece.kind
    const current = look[kind]
    const next: Look = { ...look }
    if (current?.id === piece.id) {
      next[kind] = null
      setTuning(null)
    } else {
      next[kind] = { id: piece.id, hex: piece.colorways[0].hex }
      // A dress is the whole outfit; separates come off. And vice versa.
      if (kind === 'dress') { next.top = null; next.bottom = null }
      if (kind === 'top' || kind === 'bottom') next.dress = null
      setTuning(kind)
    }
    onEngage?.('outfit_piece_toggled', { kind, value: piece.label, on: next[kind]?.id === piece.id })
    onChange(next)
  }

  function tune(kind: PieceKind, hex: string) {
    const pick = look[kind]
    if (!pick) return
    const piece = pieceById(pick.id)
    const cw = piece?.colorways.find(c => c.hex === hex)
    onEngage?.('outfit_color_tuned', { kind, value: piece?.label ?? pick.id, color: cw?.name ?? hex })
    onChange({ ...look, [kind]: { ...pick, hex } })
  }

  const tuningPick = tuning ? look[tuning] : null
  const tuningPiece = tuningPick ? pieceById(tuningPick.id) : null

  return (
    <div>
      {/* The model, wearing the look, beside the look's contents */}
      <div className="mt-4 flex gap-2.5">
        <div className="w-[46%] shrink-0 rounded-2xl border border-neutral-200 bg-[#faf8f4]">
          <svg viewBox="0 0 300 800" className="h-[264px] w-full">
            <Croquis />
            {worn.map(({ piece, hex }) => <g key={piece.id}>{piece.render(hex)}</g>)}
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">Your look</p>
          {worn.length === 0 ? (
            <p className="mt-2 text-[12px] leading-relaxed text-neutral-400">
              Tap pieces below to dress the model — mix a top and a bottom, or a dress, and add a layer over it.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {worn.map(({ piece, hex, kind }) => {
                const cw = piece.colorways.find(c => c.hex === hex)
                return (
                  <li key={piece.id}>
                    <button
                      type="button"
                      onClick={() => setTuning(kind)}
                      className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition ${
                        tuning === kind ? 'border-emerald-500 bg-emerald-50/60' : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10" style={{ background: hex }} />
                      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-neutral-800">
                        {cw?.name} {piece.label.toLowerCase()}
                      </span>
                      <span
                        role="button"
                        aria-label={`Remove ${piece.label}`}
                        onClick={e => { e.stopPropagation(); toggle(piece) }}
                        className="shrink-0 px-0.5 text-[13px] leading-none text-neutral-300 transition hover:text-red-500"
                      >
                        &times;
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {/* Color tuning for the selected piece — its real colorways only */}
          {tuningPiece && tuningPick && (
            <div className="mt-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                {KIND_NAME[tuningPiece.kind]} color
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tuningPiece.colorways.map(cw => (
                  <button
                    key={cw.name}
                    type="button"
                    title={cw.name}
                    aria-label={`${tuningPiece.label}: ${cw.name}`}
                    onClick={() => tune(tuningPiece.kind, cw.hex)}
                    className={`h-6 w-6 rounded-full border transition ${
                      tuningPick.hex === cw.hex
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-black/10 hover:border-neutral-400'
                    }`}
                    style={{ background: cw.hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-4 flex gap-1.5">
        {KIND_TABS.map(t => (
          <button
            key={t.kind}
            type="button"
            onClick={() => setTab(t.kind)}
            aria-pressed={tab === t.kind}
            className={`rounded-full border px-3.5 py-2 text-[12px] font-bold tracking-[-0.01em] transition-all ${
              tab === t.kind
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 bg-[#faf9f6] text-neutral-600 hover:border-neutral-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Catalog grid for the active category */}
      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        {WARDROBE[tab].map(piece => {
          const pick = look[piece.kind]
          const on = pick?.id === piece.id
          const hex = on ? pick.hex : piece.colorways[0].hex
          return (
            <button
              key={piece.id}
              type="button"
              onClick={() => toggle(piece)}
              aria-pressed={on}
              className={`relative flex flex-col items-center rounded-xl border-2 bg-[#faf8f4] px-1 pb-1.5 pt-1.5 transition active:scale-[0.97] ${
                on ? 'border-emerald-600 shadow-[0_0_0_3px_rgba(5,150,105,0.16)]' : 'border-neutral-200 hover:border-neutral-300'
              }`}
              data-cta={`v5-piece-${piece.id}`}
            >
              <svg viewBox={piece.tileBox} className="h-16 w-full">{piece.render(hex)}</svg>
              <span className="mt-1 text-center text-[9px] font-bold leading-tight text-neutral-700">{piece.label}</span>
              {on && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg viewBox="0 0 24 24" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
