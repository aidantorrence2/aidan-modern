'use client'
// The outfit styler, mix-and-match edition. The model is always dressed:
// every dress variant and every top×bottom combination has a prebuilt
// photographic look shot, so swiping just swaps photos — no waiting, no
// button. Color changes on separates re-key the prebuilt shot client-side
// (lib/recolorLook); dress variants each have their own real shot, which is
// what makes patterned dresses possible.
//
// Dresses are the default mode; "Top & bottoms" is the secondary mode with
// both pickers on screen at once — swipe the tops row and the bottoms row,
// the centered card is what she's wearing.

import { useEffect, useMemo, useRef, useState } from 'react'
import NextImage from 'next/image'
import { WARDROBE, pieceById, type Piece, type PieceKind } from '@/components/wardrobe'
import { pieceImage, colorwaySlug } from '@/lib/wardrobeImages'
import { baseColorway, recolorLook } from '@/lib/recolorLook'

export type LookPick = { id: string; hex: string }
export type Look = { top: LookPick | null; bottom: LookPick | null; dress: LookPick | null; layer: LookPick | null }
export const EMPTY_LOOK: Look = { top: null, bottom: null, dress: null, layer: null }

export function isLookEmpty(look: Look): boolean {
  return !look.top && !look.bottom && !look.dress
}

/** "Emerald silk blouse + Indigo straight jeans", or "Red gingham gingham sundress"-safe naming. */
export function lookLabel(look: Look): string | null {
  const name = (pick: LookPick | null) => {
    if (!pick) return null
    const piece = pieceById(pick.id)
    if (!piece) return null
    const cw = piece.colorways.find(c => c.hex === pick.hex) ?? piece.colorways[0]
    return `${cw.name} ${piece.label.toLowerCase()}`
  }
  const parts = [name(look.dress ?? look.top), name(look.bottom)].filter(Boolean)
  return parts.length > 0 ? parts.join(' + ') : null
}

/** Path to the prebuilt look shot for the current selection. */
function lookShot(look: Look): { src: string; recolor: { from: string; to: string }[] } | null {
  if (look.dress) {
    const dress = pieceById(look.dress.id)
    if (!dress) return null
    const cw = dress.colorways.find(c => c.hex === look.dress!.hex) ?? dress.colorways[0]
    return { src: `/images/wardrobe-looks/${dress.id}--${colorwaySlug(cw.name)}.jpg`, recolor: [] }
  }
  if (look.top && look.bottom) {
    const top = pieceById(look.top.id)
    const bottom = pieceById(look.bottom.id)
    if (!top || !bottom) return null
    const jobs: { from: string; to: string }[] = []
    const tBase = baseColorway(top), bBase = baseColorway(bottom)
    if (look.top.hex !== tBase.hex) jobs.push({ from: tBase.hex, to: look.top.hex })
    if (look.bottom.hex !== bBase.hex) jobs.push({ from: bBase.hex, to: look.bottom.hex })
    return { src: `/images/wardrobe-looks/${top.id}__${bottom.id}.jpg`, recolor: jobs }
  }
  return null
}

/** Horizontal snap carousel; the centered card is the selection. */
function SnapRow({
  pieces,
  selectedId,
  activeHexById,
  onSettle,
}: {
  pieces: Piece[]
  selectedId: string | null
  activeHexById: (p: Piece) => string
  onSettle: (piece: Piece) => void
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppress = useRef(false)

  function nearest(): Piece | null {
    const el = scroller.current
    if (!el) return null
    const mid = el.scrollLeft + el.clientWidth / 2
    let bestPiece: Piece | null = null
    let bestD = Infinity
    const children = Array.from(el.children)
    for (let i = 0; i < children.length; i++) {
      const c = children[i] as HTMLElement
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      if (pieces[i] && d < bestD) { bestD = d; bestPiece = pieces[i] }
    }
    return bestPiece
  }

  function handleScroll() {
    if (suppress.current) return
    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => {
      const piece = nearest()
      if (piece && piece.id !== selectedId) onSettle(piece)
    }, 110)
  }

  // Keep the selected card centered when selection changes from outside
  // (mode switch, preselect, tap).
  useEffect(() => {
    const el = scroller.current
    if (!el || !selectedId) return
    const idx = pieces.findIndex(p => p.id === selectedId)
    const child = el.children[idx] as HTMLElement | undefined
    if (!child) return
    suppress.current = true
    el.scrollTo({ left: child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2, behavior: 'smooth' })
    const t = setTimeout(() => { suppress.current = false }, 420)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  return (
    <div
      ref={scroller}
      onScroll={handleScroll}
      className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-[calc(50%-44px)] py-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {pieces.map(piece => {
        const on = piece.id === selectedId
        return (
          <button
            key={piece.id}
            type="button"
            onClick={() => onSettle(piece)}
            aria-pressed={on}
            className={`w-[88px] shrink-0 snap-center overflow-hidden rounded-xl border-2 bg-[#f0e9dc] transition ${
              on ? 'border-emerald-600 shadow-[0_0_0_3px_rgba(5,150,105,0.16)]' : 'border-neutral-200 opacity-80'
            }`}
            data-cta={`v5-piece-${piece.id}`}
          >
            <NextImage
              src={pieceImage(piece, activeHexById(piece))}
              alt={piece.label}
              width={176}
              height={176}
              sizes="88px"
              className="aspect-square w-full object-cover"
            />
            <span className="block w-full bg-white px-1 py-1 text-center text-[8.5px] font-bold leading-tight text-neutral-700">
              {piece.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

type Mode = 'dress' | 'separates'

export default function WardrobeStyler({
  look,
  onChange,
  onEngage,
}: {
  look: Look
  onChange: (next: Look) => void
  onEngage?: (event: string, props?: Record<string, string | number | boolean>) => void
}) {
  const [mode, setMode] = useState<Mode>(look.top || look.bottom ? 'separates' : 'dress')
  const [shotSrc, setShotSrc] = useState<string | null>(null)
  const recolorCache = useRef(new Map<string, string>())

  const dresses = WARDROBE.dress
  const tops = WARDROBE.top
  const bottoms = WARDROBE.bottom

  // The model is always dressed: an empty look opens on the first dress.
  useEffect(() => {
    if (isLookEmpty(look) && dresses.length > 0) {
      onChange({ ...EMPTY_LOOK, dress: { id: dresses[0].id, hex: dresses[0].colorways[0].hex } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shot = useMemo(() => lookShot(look), [look])

  useEffect(() => {
    let cancelled = false
    if (!shot) { setShotSrc(null); return }
    if (shot.recolor.length === 0) { setShotSrc(shot.src); return }
    const key = shot.src + '|' + shot.recolor.map(j => j.from + '>' + j.to).join(',')
    const cached = recolorCache.current.get(key)
    if (cached) { setShotSrc(cached); return }
    // Show the base combo instantly, then swap in the re-keyed version.
    setShotSrc(shot.src)
    recolorLook(shot.src, shot.recolor)
      .then(dataUrl => {
        recolorCache.current.set(key, dataUrl)
        if (!cancelled) setShotSrc(dataUrl)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [shot])

  function pickDress(piece: Piece) {
    onEngage?.('outfit_piece_toggled', { kind: 'dress', value: piece.label, on: true })
    onChange({ ...EMPTY_LOOK, dress: { id: piece.id, hex: piece.colorways[0].hex } })
  }

  function pickSeparate(kind: 'top' | 'bottom', piece: Piece) {
    onEngage?.('outfit_piece_toggled', { kind, value: piece.label, on: true })
    const next: Look = { ...look, dress: null, [kind]: { id: piece.id, hex: piece.colorways[0].hex } }
    // Both rows always have a wearer — entering separates fills the other row.
    if (!next.top) next.top = { id: tops[0].id, hex: tops[0].colorways[0].hex }
    if (!next.bottom) next.bottom = { id: bottoms[0].id, hex: bottoms[0].colorways[0].hex }
    onChange(next)
  }

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    onEngage?.('outfit_mode_switched', { to: next })
    if (next === 'dress') {
      const keep = look.dress ?? { id: dresses[0].id, hex: dresses[0].colorways[0].hex }
      onChange({ ...EMPTY_LOOK, dress: keep })
    } else {
      onChange({
        ...look,
        dress: null,
        top: look.top ?? { id: tops[0].id, hex: tops[0].colorways[0].hex },
        bottom: look.bottom ?? { id: bottoms[0].id, hex: bottoms[0].colorways[0].hex },
      })
    }
  }

  function tune(kind: PieceKind, hex: string) {
    const pick = look[kind]
    if (!pick) return
    const piece = pieceById(pick.id)
    const cw = piece?.colorways.find(c => c.hex === hex)
    onEngage?.('outfit_color_tuned', { kind, value: piece?.label ?? pick.id, color: cw?.name ?? hex })
    onChange({ ...look, [kind]: { ...pick, hex } })
  }

  const swatches = (kind: 'top' | 'bottom' | 'dress') => {
    const pick = look[kind]
    const piece = pick && pieceById(pick.id)
    if (!pick || !piece) return null
    return (
      <span className="flex flex-wrap items-center gap-1">
        {piece.colorways.map(cw => (
          <button
            key={cw.name}
            type="button"
            title={cw.name}
            aria-label={`${piece.label}: ${cw.name}`}
            onClick={() => tune(kind, cw.hex)}
            className={`h-[18px] w-[18px] rounded-full border transition ${
              pick.hex === cw.hex ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-black/10'
            }`}
            style={{ background: cw.hex }}
          />
        ))}
      </span>
    )
  }

  const rowHeader = (label: string, kind: 'top' | 'bottom' | 'dress') => (
    <div className="mt-3 flex items-center justify-between gap-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">{label}</p>
      {swatches(kind)}
    </div>
  )

  const text = lookLabel(look)

  return (
    <div>
      {/* The model — always dressed */}
      <div className="mt-4">
        <div className="relative mx-auto aspect-[3/4] w-[62%] overflow-hidden rounded-2xl border border-neutral-200 bg-[#f0e9dc]">
          {shotSrc ? (
            // Recolored shots are data URLs — plain img, not the optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shotSrc} alt={text ?? 'Your look'} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[11px] text-neutral-400">Your look</span>
          )}
        </div>
        {text && <p className="mt-2 text-center text-[12px] font-semibold text-neutral-600">{text}</p>}
      </div>

      {/* Mode toggle — dresses first */}
      <div className="mt-3.5 grid grid-cols-2 gap-1 rounded-2xl border border-neutral-200 bg-[#f5f5f4] p-1">
        {([['dress', 'Dresses'], ['separates', 'Top & bottoms']] as const).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            aria-pressed={mode === m}
            className={`rounded-xl py-2.5 text-[13px] font-bold transition ${
              mode === m ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.16)]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            data-cta={`v5-mode-${m}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'dress' ? (
        <>
          {rowHeader('Dresses — swipe to browse', 'dress')}
          <SnapRow
            pieces={dresses}
            selectedId={look.dress?.id ?? null}
            activeHexById={p => (look.dress?.id === p.id ? look.dress.hex : p.colorways[0].hex)}
            onSettle={pickDress}
          />
        </>
      ) : (
        <>
          {rowHeader('Tops — swipe to browse', 'top')}
          <SnapRow
            pieces={tops}
            selectedId={look.top?.id ?? null}
            activeHexById={p => (look.top?.id === p.id ? look.top.hex : p.colorways[0].hex)}
            onSettle={p => pickSeparate('top', p)}
          />
          {rowHeader('Bottoms — swipe to browse', 'bottom')}
          <SnapRow
            pieces={bottoms}
            selectedId={look.bottom?.id ?? null}
            activeHexById={p => (look.bottom?.id === p.id ? look.bottom.hex : p.colorways[0].hex)}
            onSettle={p => pickSeparate('bottom', p)}
          />
        </>
      )}
    </div>
  )
}
