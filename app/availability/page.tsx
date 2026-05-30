'use client'

import { useEffect, useState } from 'react'

type Slot = { id: number; start_at: string; note: string | null }

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function dayLabel(date: Date) {
  const today = startOfDay(new Date())
  const that = startOfDay(date)
  const diffDays = Math.round((that.getTime() - today.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays > 1 && diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'long' })
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function timeLabel(date: Date) {
  return date
    .toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    .replace(':00', '')
    .toLowerCase()
}

function dateSubLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/availability')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        if (d.error) setError(d.error)
        else setSlots(d.slots || [])
      })
      .catch(() => active && setError('Could not load availability'))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-paper">
      <div className="mx-auto w-full max-w-md px-5 pb-16 pt-12">
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Book a session
          </p>
          <h1 className="mt-3 text-[34px] leading-[1.05]">Next availability</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Tap a time that works for you and I&apos;ll lock it in.
          </p>
        </header>

        <div className="mt-9">
          {error && (
            <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-6 text-center text-sm text-muted">
              {error}
            </div>
          )}

          {!error && slots === null && (
            <ul className="space-y-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-[78px] animate-pulse rounded-2xl border border-neutral-200/70 bg-white/60"
                />
              ))}
            </ul>
          )}

          {!error && slots && slots.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-5 py-10 text-center">
              <p className="text-[15px] text-ink">No open times right now</p>
              <p className="mt-1.5 text-sm text-muted">
                Check back soon — new slots open up regularly.
              </p>
            </div>
          )}

          {!error && slots && slots.length > 0 && (
            <ul className="space-y-3">
              {slots.map((slot) => {
                const d = new Date(slot.start_at)
                const subject = encodeURIComponent('Session request')
                const body = encodeURIComponent(
                  `Hi Aidan, I'd like to book ${dayLabel(d)} (${dateSubLabel(d)}) at ${timeLabel(d)}.`
                )
                return (
                  <li key={slot.id}>
                    <a
                      href={`mailto:aidan.torrence@gmail.com?subject=${subject}&body=${body}`}
                      className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition-all active:scale-[0.99] hover:border-accent/50 hover:shadow-md"
                    >
                      <span className="flex flex-col">
                        <span className="text-[18px] font-semibold leading-tight text-ink">
                          {dayLabel(d)}
                        </span>
                        <span className="mt-0.5 text-[13px] text-muted">{dateSubLabel(d)}</span>
                        {slot.note && (
                          <span className="mt-1 text-[12px] text-accent">{slot.note}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="rounded-full bg-paper px-3.5 py-1.5 text-[15px] font-semibold tabular-nums text-ink ring-1 ring-inset ring-neutral-200 transition-colors group-hover:bg-accent group-hover:text-white group-hover:ring-accent">
                          {timeLabel(d)}
                        </span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <p className="mt-10 text-center text-[12px] leading-relaxed text-muted">
          Times shown in your local timezone. Don&apos;t see something that fits?{' '}
          <a className="underline decoration-accent/40 underline-offset-2" href="/book">
            Send a request
          </a>
          .
        </p>
      </div>
    </div>
  )
}
