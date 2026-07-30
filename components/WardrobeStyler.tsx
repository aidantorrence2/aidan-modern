'use client'
// The outfit styler, photographic edition: a catalog of real product photos
// by category, per-piece color tuning limited to each fabric's real
// colorways, an editorial look-board of the selected pieces, and an
// on-demand generated photo of a model wearing the exact combination.

import { useMemo, useState } from 'react'
import NextImage from 'next/image'
import { WARDROBE, pieceById, type Piece, type PieceKind } from '@/components/wardrobe'
import { pieceImage, colorwaySlug } from '@/lib/wardrobeImages'

export type LookPick = { id: string; hex: string }
export type Look = { top: LookPick | null; bottom: LookPick | null; dress: LookPick | null; layer: LookPick | null }
export const EMPTY_LOOK: Look = { top: null, bottom: null, dress: null, layer: null }

export function isLookEmpty(look: Look): boolean {
  return !look.top && !look.bottom && !look.dress && !look.layer
}

/** "Emerald silk blouse + Indigo straight jeans + Camel long wool coat" */
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

/** The look-board: selected product photos arranged as an editorial collage. */
function LookBoard({ worn }: { worn: { piece: Piece; hex: string }[] }) {
  const at = (kind: PieceKind) => worn.find(w => w.piece.kind === kind)
  const dress = at('dress'), top = at('top'), bottom = at('bottom'), layer = at('layer')
  const img = (w: { piece: Piece; hex: string }, cls: string, priority = false) => (
    <div key={w.piece.id} className={`absolute overflow-hidden rounded-xl shadow-[0_10px_24px_-12px_rgba(23,21,15,0.5)] ring-1 ring-black/5 ${cls}`}>
      <NextImage src={pieceImage(w.piece, w.hex)} alt={w.piece.label} width={440} height={440} priority={priority} className="h-full w-full object-cover" />
    </div>
  )
  const main = dress ?? top
  return (
    <div className="relative h-full w-full">
      {layer && img(layer, main || bottom ? 'right-1 top-1 w-[56%] rotate-[2.5deg]' : 'left-[12%] top-[10%] w-[76%]')}
      {dress && img(dress, 'left-[14%] top-[6%] w-[64%] -rotate-1', true)}
      {top && img(top, bottom ? 'left-1.5 top-1.5 w-[62%] -rotate-2' : 'left-[16%] top-[10%] w-[68%] -rotate-1', true)}
      {bottom && img(bottom, top || dress ? 'bottom-1.5 right-1.5 w-[62%] rotate-[1.5deg]' : 'left-[16%] top-[10%] w-[68%]')}
    </div>
  )
}

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
  const [tuning, setTuning] = useState<PieceKind | null>(null)
  // The generated on-model photo for the current look, keyed by look signature
  // so an edit after generating falls back to the board automatically.
  const [modelShot, setModelShot] = useState<{ sig: string; src: string } | null>(null)
  const [modelBusy, setModelBusy] = useState(false)
  const [modelError, setModelError] = useState(false)

  const worn = useMemo(() => {
    const order: PieceKind[] = ['dress', 'top', 'bottom', 'layer']
    return order.flatMap(kind => {
      const pick = look[kind]
      const piece = pick && pieceById(pick.id)
      return piece ? [{ piece, hex: pick.hex, kind }] : []
    })
  }, [look])

  const sig = worn.map(w => `${w.piece.id}:${w.hex}`).join('|')

  function toggle(piece: Piece) {
    const kind = piece.kind
    const current = look[kind]
    const next: Look = { ...look }
    if (current?.id === piece.id) {
      next[kind] = null
      setTuning(null)
    } else {
      next[kind] = { id: piece.id, hex: piece.colorways[0].hex }
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

  async function generateModelShot() {
    if (modelBusy || worn.length === 0) return
    setModelBusy(true)
    setModelError(false)
    onEngage?.('outfit_model_requested', { pieces: worn.length })
    try {
      const res = await fetch('/api/wardrobe-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          picks: worn.map(w => {
            const cw = w.piece.colorways.find(c => c.hex === w.hex) ?? w.piece.colorways[0]
            return { id: w.piece.id, colorway: cw.name }
          }),
        }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok || !j?.image) throw new Error('failed')
      setModelShot({ sig, src: j.image })
      onEngage?.('outfit_model_generated', { pieces: worn.length })
    } catch {
      setModelError(true)
      onEngage?.('outfit_model_error', {})
    } finally {
      setModelBusy(false)
    }
  }

  const showingModel = modelShot?.sig === sig

  return (
    <div>
      {/* The look — collage of the real photos, or the generated model shot */}
      <div className="mt-4 flex gap-2.5">
        <div className="relative aspect-[3/4] w-[46%] shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-[#f0e9dc] p-1.5">
          {worn.length === 0 ? (
            <p className="flex h-full items-center justify-center px-3 text-center text-[11px] leading-relaxed text-neutral-400">
              Your look builds here
            </p>
          ) : showingModel ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={modelShot.src} alt="Your look on a model" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <LookBoard worn={worn} />
          )}
          {modelBusy && (
            <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 backdrop-blur-[2px]">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Generating" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">Your look</p>
          {worn.length === 0 ? (
            <p className="mt-2 text-[12px] leading-relaxed text-neutral-400">
              Tap pieces below — mix a top and a bottom, or a dress, and add a layer over it.
            </p>
          ) : (
            <>
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
              <button
                type="button"
                onClick={showingModel ? () => setModelShot(null) : generateModelShot}
                disabled={modelBusy}
                className="mt-2.5 w-full rounded-full border border-neutral-900 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50"
                data-cta="v5-model-shot"
              >
                {modelBusy ? 'Dressing the model…' : showingModel ? 'Back to the pieces' : 'See it on a model'}
              </button>
              {modelError && (
                <p className="mt-1.5 text-[11px] text-red-500">Couldn&rsquo;t generate that just now — try again.</p>
              )}
            </>
          )}
          {/* Color tuning — the selected piece's real colorways */}
          {tuning && look[tuning] && (() => {
            const pick = look[tuning]!
            const piece = pieceById(pick.id)
            if (!piece) return null
            return (
              <div className="mt-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">{KIND_NAME[piece.kind]} color</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {piece.colorways.map(cw => (
                    <button
                      key={cw.name}
                      type="button"
                      title={cw.name}
                      aria-label={`${piece.label}: ${cw.name}`}
                      onClick={() => tune(piece.kind, cw.hex)}
                      className={`h-6 w-6 rounded-full border transition ${
                        pick.hex === cw.hex
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-black/10 hover:border-neutral-400'
                      }`}
                      style={{ background: cw.hex }}
                    />
                  ))}
                </div>
              </div>
            )
          })()}
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

      {/* Catalog — real product photos */}
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
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
              className={`relative flex flex-col items-center overflow-hidden rounded-xl border-2 bg-[#f0e9dc] transition active:scale-[0.97] ${
                on ? 'border-emerald-600 shadow-[0_0_0_3px_rgba(5,150,105,0.16)]' : 'border-neutral-200 hover:border-neutral-300'
              }`}
              data-cta={`v5-piece-${piece.id}`}
            >
              <NextImage
                src={pieceImage(piece, hex)}
                alt={piece.label}
                width={300}
                height={300}
                sizes="(max-width: 640px) 30vw, 130px"
                className="aspect-square w-full object-cover"
              />
              <span className="w-full bg-white px-1 py-1 text-center text-[9px] font-bold leading-tight text-neutral-700">
                {piece.label}
              </span>
              {on && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
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
