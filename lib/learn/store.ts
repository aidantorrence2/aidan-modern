import type { Deck, Note } from './types'
import { dayIndex, LEARN_AHEAD, type CardProgress } from './srs'

/** r = recognition (target → English), p = production (English → target). */
export type Direction = 'r' | 'p'

export interface CardRef {
  id: string
  note: Note
  dir: Direction
  due: number
}

export interface DayLog {
  new: number
  reviews: number
  again: number
  ms: number
  /** Extra new cards unlocked on top of the daily limit. */
  extra: number
}

export interface Settings {
  newPerDay: number
  mode: 'both' | 'recognition' | 'production'
  autoplay: boolean
  typeAnswers: boolean
  rate: number
  voice: string
  /** Topic ids that stop introducing new cards. */
  off: string[]
}

export interface Store {
  v: 1
  cards: Record<string, CardProgress>
  days: Record<string, DayLog>
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  newPerDay: 15,
  mode: 'both',
  autoplay: true,
  typeAnswers: false,
  rate: 0.95,
  voice: '',
  off: [],
}

export const emptyLog = (): DayLog => ({ new: 0, reviews: 0, again: 0, ms: 0, extra: 0 })

const storageKey = (code: string) => `learn:${code}:v1`

export function emptyStore(): Store {
  return { v: 1, cards: {}, days: {}, settings: { ...DEFAULT_SETTINGS } }
}

export function parseStore(raw: unknown): Store | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Partial<Store>
  if (s.v !== 1 || !s.cards || typeof s.cards !== 'object') return null
  return {
    v: 1,
    cards: s.cards,
    days: s.days && typeof s.days === 'object' ? s.days : {},
    settings: { ...DEFAULT_SETTINGS, ...s.settings },
  }
}

export function loadStore(code: string): Store {
  try {
    const raw = localStorage.getItem(storageKey(code))
    return (raw && parseStore(JSON.parse(raw))) || emptyStore()
  } catch {
    return emptyStore()
  }
}

export function saveStore(code: string, store: Store) {
  try {
    localStorage.setItem(storageKey(code), JSON.stringify(store))
  } catch {
    // storage full or blocked — progress just won't persist
  }
}

export function todayLog(store: Store, now: number): DayLog {
  return { ...emptyLog(), ...store.days[dayIndex(now)] }
}

/** Every card in deck order: each note yields a recognition and/or production card. */
export function allCards(deck: Deck, settings: Settings) {
  const out: { id: string; note: Note; dir: Direction }[] = []
  for (const t of deck.topics) {
    for (const note of t.notes) {
      if (settings.mode !== 'production') out.push({ id: `${note.id}:r`, note, dir: 'r' })
      if (settings.mode !== 'recognition') out.push({ id: `${note.id}:p`, note, dir: 'p' })
    }
  }
  return out
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export interface Queue {
  learning: CardRef[]
  reviews: CardRef[]
  fresh: CardRef[]
}

export function buildQueue(deck: Deck, store: Store, now: number): Queue {
  const today = dayIndex(now)
  const log = todayLog(store, now)
  const { settings } = store
  const off = new Set(settings.off)
  const newLeft = Math.max(0, settings.newPerDay + log.extra - log.new)
  const learning: CardRef[] = []
  const reviews: CardRef[] = []
  const fresh: CardRef[] = []

  for (const ref of allCards(deck, settings)) {
    const p = store.cards[ref.id]
    if (!p) {
      if (fresh.length >= newLeft || off.has(ref.note.topic)) continue
      // In "both" mode a production card waits until its recognition sibling
      // has graduated on an earlier day, so you learn to read a word before producing it.
      if (ref.dir === 'p' && settings.mode === 'both') {
        const sib = store.cards[`${ref.note.id}:r`]
        if (!sib || sib.state !== 'review' || dayIndex(sib.last) >= today) continue
      }
      fresh.push({ ...ref, due: now })
    } else if (p.state === 'review') {
      if (p.due <= now) reviews.push({ ...ref, due: p.due })
    } else {
      learning.push({ ...ref, due: p.due })
    }
  }

  learning.sort((a, b) => a.due - b.due)
  // Overdue first; within a day, a stable shuffle so reviews don't come in deck order.
  reviews.sort((a, b) => a.due - b.due || hash(a.id + today) - hash(b.id + today))
  return { learning, reviews, fresh }
}

export function pickNext(q: Queue, now: number): CardRef | null {
  const ready = q.learning.find((c) => c.due <= now)
  if (ready) return ready
  if (q.reviews.length || q.fresh.length) {
    const takeNew = q.fresh.length > 0 && Math.random() < q.fresh.length / (q.fresh.length + q.reviews.length)
    return takeNew ? q.fresh[0] : q.reviews[0]
  }
  const ahead = q.learning[0]
  return ahead && ahead.due <= now + LEARN_AHEAD ? ahead : null
}

export function streak(store: Store, now: number) {
  const studied = (d: number) => {
    const log = store.days[d]
    return !!log && log.new + log.reviews > 0
  }
  let d = dayIndex(now)
  if (!studied(d)) d -= 1
  let n = 0
  while (studied(d)) {
    n++
    d--
  }
  return n
}

/** Review counts for today (incl. overdue) and the following days. */
export function forecast(store: Store, now: number, days = 7) {
  const today = dayIndex(now)
  const out = new Array(days).fill(0)
  for (const p of Object.values(store.cards)) {
    if (p.state !== 'review') continue
    const d = Math.max(0, dayIndex(p.due) - today)
    if (d < days) out[d]++
  }
  return out
}
