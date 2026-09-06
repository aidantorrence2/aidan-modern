import themeData from '@/data/shoot-themes.json'
import imageData from '@/data/theme-images.json'

export type ThemeId = 'mountain-park' | 'street' | 'indoor' | 'road-trip'
export type StartingTheme = ThemeId | 'any'
export type ThemeImage = { id: string; theme: string; src: string; alt: string; source: string; credit: string }
export type ThemeSelection = { theme: StartingTheme; imageIds: string[]; suggestedUrl?: string }
export const THEMES = themeData
export const THEME_IMAGES: ThemeImage[] = imageData
export const MAX_PICKS = 5
// Rounds of four available in the deck; skips consume rounds without consuming picks.
export const ROUNDS = Math.floor(imageData.length / 4)
export const PICKER_STORAGE_KEY = 'aidan:theme-picker:v2'
export const IMAGE_BY_ID = new Map(THEME_IMAGES.map(image => [image.id, image]))

export function isStartingTheme(value: unknown): value is StartingTheme {
  return value === 'any' || THEMES.some(theme => theme.id === value)
}

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
    'Signup flow: theme-picker-v2',
    `Starting theme: ${themeLabel(selection.theme)}`,
    `Moodboard image IDs: ${selection.imageIds.join(',')}`,
    `View moodboard: https://www.aidantorrence.com${boardPath(selection)}`,
    ...imagesForIds(selection.imageIds).map(image => `Reference: ${image.alt} — https://www.aidantorrence.com${image.src}`),
    ...(selection.suggestedUrl ? [`Suggested moodboard: ${selection.suggestedUrl}`] : []),
  ]
}

// A fixed deck per visit gives back/refresh stable rounds. The chosen starting
// theme comes first; the rest stays available so people can discover a mix.
export function makeDeck(theme: StartingTheme, seed: number): string[] {
  let randomState = seed >>> 0
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
    return randomState / 4294967296
  }
  const deck = THEME_IMAGES.map(image => image.id)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return theme === 'any' ? deck : [
    ...deck.filter(id => IMAGE_BY_ID.get(id)?.theme === theme),
    ...deck.filter(id => IMAGE_BY_ID.get(id)?.theme !== theme),
  ]
}
