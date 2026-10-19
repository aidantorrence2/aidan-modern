// Anki-style SM-2 scheduler: minute-based learning steps, then day-based reviews
// whose interval grows by the card's ease factor.

export type Grade = 1 | 2 | 3 | 4 // again, hard, good, easy
export type CardState = 'new' | 'learning' | 'review' | 'relearning'

export interface CardProgress {
  state: CardState
  due: number // epoch ms
  interval: number // days
  ease: number
  step: number
  reps: number
  lapses: number
  last: number // epoch ms of the last answer
}

export const MINUTE = 60_000
export const DAY = 86_400_000
/** Show learning cards this early when nothing else is left in the session. */
export const LEARN_AHEAD = 20 * MINUTE

const LEARN_STEPS = [1, 10] // minutes
const RELEARN_STEPS = [10]
const ROLLOVER_HOUR = 4 // a "day" starts at 4am local, so late-night study counts for that day
const START_EASE = 2.5
const MIN_EASE = 1.3
const MAX_INTERVAL = 36_500

/** Local calendar day number (with the 4am rollover). */
export function dayIndex(t: number) {
  const d = new Date(t - ROLLOVER_HOUR * 3_600_000)
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY)
}

/** Epoch ms at which a day (from dayIndex) begins. */
export function dayStart(day: number) {
  const d = new Date(day * DAY)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), ROLLOVER_HOUR).getTime()
}

function fuzzed(days: number) {
  if (days < 3) return days
  const spread = Math.max(1, Math.round(days * 0.05))
  return days + Math.round((Math.random() * 2 - 1) * spread)
}

export function schedule(prev: CardProgress | undefined, grade: Grade, now: number, fuzz = true): CardProgress {
  const c: CardProgress = prev
    ? { ...prev }
    : { state: 'new', due: now, interval: 0, ease: START_EASE, step: 0, reps: 0, lapses: 0, last: 0 }
  const daysLate = c.state === 'review' ? Math.max(0, dayIndex(now) - dayIndex(c.due)) : 0
  c.reps += 1
  c.last = now

  const toReview = (days: number) => {
    const iv = Math.min(MAX_INTERVAL, Math.max(1, Math.round(fuzz ? fuzzed(days) : days)))
    c.state = 'review'
    c.step = 0
    c.interval = iv
    c.due = dayStart(dayIndex(now) + iv)
    return c
  }
  const inMinutes = (m: number) => {
    c.due = now + Math.round(m * MINUTE)
    return c
  }

  if (c.state === 'new') {
    c.state = 'learning'
    c.step = 0
  }

  if (c.state === 'learning' || c.state === 'relearning') {
    const relearning = c.state === 'relearning'
    const steps = relearning ? RELEARN_STEPS : LEARN_STEPS
    const step = Math.min(c.step, steps.length - 1)
    switch (grade) {
      case 1:
        c.step = 0
        return inMinutes(steps[0])
      case 2:
        if (step > 0) return inMinutes(steps[step])
        return inMinutes(steps.length > 1 ? (steps[0] + steps[1]) / 2 : steps[0] * 1.5)
      case 3:
        if (step + 1 < steps.length) {
          c.step = step + 1
          return inMinutes(steps[c.step])
        }
        return toReview(relearning ? c.interval : 1)
      default:
        return toReview(relearning ? c.interval + 1 : 4)
    }
  }

  const iv = c.interval
  const good = Math.max(iv + 1, (iv + daysLate / 2) * c.ease)
  switch (grade) {
    case 1:
      c.lapses += 1
      c.ease = Math.max(MIN_EASE, c.ease - 0.2)
      c.interval = Math.max(1, Math.floor(iv * 0.2))
      c.state = 'relearning'
      c.step = 0
      return inMinutes(RELEARN_STEPS[0])
    case 2:
      c.ease = Math.max(MIN_EASE, c.ease - 0.15)
      return toReview(Math.max(iv + 1, iv * 1.2))
    case 3:
      return toReview(good)
    default: {
      const easy = Math.max(good + 1, (iv + daysLate) * c.ease * 1.3)
      c.ease += 0.15
      return toReview(easy)
    }
  }
}

export function formatDays(days: number) {
  if (days < 30) return `${days}d`
  if (days < 365) return `${+(days / 30).toFixed(1)}mo`
  return `${+(days / 365).toFixed(1)}y`
}

export function formatMs(ms: number) {
  const m = Math.max(1, Math.round(ms / MINUTE))
  if (m < 60) return `${m}m`
  if (m < 60 * 24) return `${+(m / 60).toFixed(1)}h`
  return formatDays(Math.round(m / 60 / 24))
}

/** The label shown under each answer button, e.g. "10m" or "4d". */
export function previewInterval(prev: CardProgress | undefined, grade: Grade, now: number) {
  const next = schedule(prev, grade, now, false)
  return next.state === 'review' ? formatDays(next.interval) : formatMs(next.due - now)
}
