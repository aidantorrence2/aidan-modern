import { TOPS } from './tops'
import { BOTTOMS } from './bottoms'
import { DRESSES } from './dresses'
import { LAYERS } from './layers'
import type { Piece, PieceKind } from './contract'

export type { Piece, PieceKind, Colorway } from './contract'
export { default as Croquis } from './croquis'

export const WARDROBE: Record<PieceKind, Piece[]> = {
  top: TOPS,
  bottom: BOTTOMS,
  dress: DRESSES,
  layer: LAYERS,
}

export const ALL_PIECES: Piece[] = [...TOPS, ...LAYERS, ...BOTTOMS, ...DRESSES]

export function pieceById(id: string): Piece | undefined {
  return ALL_PIECES.find(p => p.id === id)
}
