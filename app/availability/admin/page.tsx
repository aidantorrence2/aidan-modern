'use client'

import { useEffect, useState } from 'react'

type Slot = { id: number; start_at: string; note: string | null }

function fmt(slot: Slot) {
  const d = new Date(slot.start_at)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Default the picker to the next occurrence of 4:00 PM (tomorrow if today's
// 4pm has passed) — matches the common "4pm" slot pattern.
function defaultDateTimeLocal() {
  const now = new Date()
  const d = new Date(now)
  d.setHours(16, 0, 0, 0)
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

export default function AvailabilityAdminPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [when, setWhen] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setWhen(defaultDateTimeLocal())
  }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/availability/admin')
      const d = await r.json()
      if (d.error) setError(d.error)
      else {
        setSlots(d.slots || [])
        setError(null)
      }
    } catch {
      setError('Could not load slots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function addSlot(e: React.FormEvent) {
    e.preventDefault()
    if (!when) return
    setSaving(true)
    setError(null)
    try {
      // datetime-local has no timezone; interpret in the admin's local zone.
      const iso = new Date(when).toISOString()
      const r = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_at: iso, note: note || undefined }),
      })
      const d = await r.json()
      if (d.error) setError(d.error)
      else {
        setNote('')
        await load()
      }
    } catch {
      setError('Could not add slot')
    } finally {
      setSaving(false)
    }
  }

  async function removeSlot(id: number) {
    setBusyId(id)
    setError(null)
    try {
      const r = await fetch('/api/availability/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await r.json()
      if (d.error) setError(d.error)
      else setSlots((s) => s.filter((x) => x.id !== id))
    } catch {
      setError('Could not remove slot')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Admin
            </p>
            <h1 className="mt-2 text-[30px]">Manage availability</h1>
            <p className="mt-2 text-sm text-muted">
              Slots you add here appear instantly on{' '}
              <a className="underline decoration-accent/40 underline-offset-2" href="/availability">
                /availability
              </a>
              .
            </p>
          </div>
          <a href="/availability" className="btn btn-ghost">
            View public page
          </a>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* Add form */}
          <form
            onSubmit={addSlot}
            className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Add a slot</h2>
            <label className="mt-5 block text-sm font-medium text-ink">
              Date &amp; time
              <input
                type="datetime-local"
                required
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-paper px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-ink">
              Note <span className="font-normal text-muted">— optional</span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Golden hour · 90 min"
                className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-paper px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <button type="submit" disabled={saving} className="btn btn-primary mt-5 w-full">
              {saving ? 'Adding…' : 'Add slot'}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </form>

          {/* Existing slots */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming slots</h2>
              <span className="text-sm text-muted">{slots.length} open</span>
            </div>

            <div className="mt-5">
              {loading ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : slots.length === 0 ? (
                <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-muted">
                  No upcoming slots yet. Add one on the left.
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {slots.map((slot) => (
                    <li key={slot.id} className="flex items-center justify-between gap-4 py-3.5">
                      <div>
                        <p className="text-[15px] font-medium text-ink tabular-nums">{fmt(slot)}</p>
                        {slot.note && <p className="text-[13px] text-muted">{slot.note}</p>}
                      </div>
                      <button
                        onClick={() => removeSlot(slot.id)}
                        disabled={busyId === slot.id}
                        className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {busyId === slot.id ? 'Removing…' : 'Remove'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
