import themeData from '@/data/shoot-themes.json'
import imageData from '@/data/theme-images.json'

export type ThemeId = 'mountain-park' | 'street' | 'indoor' | 'road-trip'
export type StartingTheme = ThemeId | 'any'
export type ThemeImage = { id: string; theme: string; src: string; alt: string; source: string; credit: string }
export type ThemeSelection = { theme: StartingTheme; imageIds: string[]; suggestedUrl?: string }
export const THEMES = themeData
export const THEME_IMAGES: ThemeImage[] = imageData
export const MAX_PICKS = 5
export const PER_ROUND = 6
// Full rounds available; skips consume rounds without consuming picks.
export const ROUNDS = Math.floor(imageData.length / PER_ROUND)
export const PICKER_STORAGE_KEY = 'aidan:theme-picker:v2'
export const IMAGE_BY_ID = new Map(THEME_IMAGES.map(image => [image.id, image]))

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
// so no round is all one style. Only full rounds are returned.
export function makeRounds(seed: number): string[][] {
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
  const queues = THEMES.map(theme => shuffle(THEME_IMAGES.filter(image => image.theme === theme.id).map(image => image.id)))
  const rounds: string[][] = []
  for (let round = 0; ; round++) {
    const picks: string[] = []
    for (let slot = 0; picks.length < PER_ROUND && slot < PER_ROUND * queues.length; slot++) {
      const next = queues[(round + slot) % queues.length].shift()
      if (next) picks.push(next)
    }
    if (picks.length < PER_ROUND) return rounds
    rounds.push(shuffle(picks))
  }
}
