import themeData from '@/data/shoot-themes.json'
import imageData from '@/data/theme-images.json'
// Previous libraries (moodboard/ + theme-picker/ files, still served). Never shown
// in the picker; kept so picks saved by earlier signups still resolve on /admin,
// /your-moodboard and in the moodboard lines.
import legacyImageData from '@/data/theme-images-legacy.json'

export type ThemeId = 'sea' | 'old-town' | 'boat' | 'indoor'
export type StartingTheme = ThemeId | 'any'
// subjects: who is in the photo (woman / man / couple / brand — see
// scripts/prepare-pinterest-library.mjs); collab: shown in the free
// /sign-up-collab rotation. Both are absent on legacy entries.
export type ThemeImage = { id: string; theme: string; src: string; alt: string; source: string; credit: string; subjects?: string[]; collab?: boolean }
export type ThemeSelection = { theme: StartingTheme; imageIds: string[]; suggestedUrl?: string }
export const THEMES = themeData
// The whole pinterest/ library; /sign-up draws from it per subject.
export const LIBRARY_IMAGES: ThemeImage[] = imageData
// The free collab picker's rotation (the original hand-picked set).
export const THEME_IMAGES: ThemeImage[] = LIBRARY_IMAGES.filter(image => image.collab !== false)
export const MAX_PICKS = 5
export const PER_ROUND = 8 // photos per round; the ninth tile is Skip
// Full rounds available; skips consume rounds without consuming picks.
export const ROUNDS = Math.floor(THEME_IMAGES.length / PER_ROUND)
export const PICKER_STORAGE_KEY = 'aidan:theme-picker:v2'
export const IMAGE_BY_ID = new Map([...(legacyImageData as ThemeImage[]), ...LIBRARY_IMAGES].map(image => [image.id, image]))

// Every library pin tagged with this subject (order preserved).
export function imagesForSubject(subject: string): ThemeImage[] {
  return LIBRARY_IMAGES.filter(image => image.subjects?.includes(subject))
}

export function isStartingTheme(value: unknown): value is StartingTheme {
  return value === 'any' || THEMES.some(theme => theme.id === value)
}

// Library lookup, order preserved, unknown ids dropped. No cap: used for rounds.
export function libraryImages(ids: string[]): ThemeImage[] {
  return ids.flatMap(id => {
    const image = IMAGE_BY_ID.get(id)
    return image ? [image] : []
  })
}

// A visitor's selection: de-duplicated and capped at MAX_PICKS.
export function imagesForIds(ids: string[]): ThemeImage[] {
  return [...new Set(ids)].slice(0, MAX_PICKS).flatMap(id => {
    const image = IMAGE_BY_ID.get(id)
    return image ? [image] : []
  })
}

export function parseThemeSelection(value: unknown): ThemeSelection | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  if (!isStartingTheme(input.theme) || !Array.isArray(input.imageIds)) return null
  if (input.imageIds.length < 1 || input.imageIds.length > MAX_PICKS) return null
  if (input.imageIds.some(id => typeof id !== 'string' || !IMAGE_BY_ID.has(id))) return null
  if (new Set(input.imageIds).size !== input.imageIds.length) return null
  let suggestedUrl: string | undefined
  if (input.suggestedUrl !== undefined && input.suggestedUrl !== '') {
    if (typeof input.suggestedUrl !== 'string' || input.suggestedUrl.length > 2000) return null
    try {
      const url = new URL(input.suggestedUrl)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
      suggestedUrl = url.href
    } catch { return null }
  }
  return { theme: input.theme, imageIds: input.imageIds as string[], ...(suggestedUrl ? { suggestedUrl } : {}) }
}

export function selectionFromQuery(query: { theme?: string; images?: string }): ThemeSelection | null {
  return parseThemeSelection({ theme: query.theme || 'any', imageIds: (query.images || '').split(',').filter(Boolean) })
}

export function boardPath(selection: ThemeSelection, path = '/your-moodboard'): string {
  const query = new URLSearchParams({ theme: selection.theme, images: selection.imageIds.join(',') })
  return `${path}?${query}`
}

export function themeLabel(theme: StartingTheme): string {
  return THEMES.find(item => item.id === theme)?.label || 'Your moodboard'
}

export function moodboardEntries(selection: ThemeSelection): string[] {
  return [
    'Signup flow: theme-picker-v3',
    ...(selection.theme === 'any' ? [] : [`Starting theme: ${themeLabel(selection.theme)}`]),
    `Moodboard image IDs: ${selection.imageIds.join(',')}`,
    `View moodboard: https://www.aidantorrence.com${boardPath(selection)}`,
    ...imagesForIds(selection.imageIds).map(image => `Reference: ${image.alt} — https://www.aidantorrence.com${image.src}`),
    ...(selection.suggestedUrl ? [`Suggested moodboard: ${selection.suggestedUrl}`] : []),
  ]
}

// Deterministic rounds for a visit (seed), so back/refresh replay the same photos.
// Each round draws round-robin across the themes from per-theme shuffled queues,
// so no round is all one style. Only full rounds are returned. `pool` defaults
// to the collab rotation; /sign-up passes one subject's pins with
// `balanced`, which takes one pin from every style that still has some and
// fills the rest from the deepest queues — an uneven pool (many outdoor pins,
// few indoor) keeps mixing for as many rounds as possible instead of running
// the small styles dry in the first two rounds.
export function makeRounds(seed: number, pool: ThemeImage[] = THEME_IMAGES, balanced = false): string[][] {
  let randomState = seed >>> 0
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
    return randomState / 4294967296
  }
  const shuffle = <T,>(items: T[]) => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    return items
  }
  const queues = THEMES.map(theme => shuffle(pool.filter(image => image.theme === theme.id).map(image => image.id)))
  const rounds: string[][] = []
  for (let round = 0; ; round++) {
    const picks: string[] = []
    if (balanced) {
      const order = queues.map((_, i) => (round + i) % queues.length)
      for (const i of order) {
        if (picks.length === PER_ROUND) break
        const next = queues[i].shift()
        if (next) picks.push(next)
      }
      while (picks.length < PER_ROUND) {
        const deepest = order.reduce((best, i) => (queues[i].length > queues[best].length ? i : best), order[0])
        const next = queues[deepest].shift()
        if (!next) break
        picks.push(next)
      }
    } else {
      for (let slot = 0; picks.length < PER_ROUND && slot < PER_ROUND * queues.length; slot++) {
        const next = queues[(round + slot) % queues.length].shift()
        if (next) picks.push(next)
      }
    }
    if (picks.length < PER_ROUND) return rounds
    rounds.push(shuffle(picks))
  }
}
