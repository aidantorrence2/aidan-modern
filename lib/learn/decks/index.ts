import type { Deck } from '../types'
import ptBR from './pt-br'

export const DECKS: Deck[] = [ptBR]

export function getDeck(code: string) {
  return DECKS.find((d) => d.code === code)
}
