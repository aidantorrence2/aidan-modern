"use client"
import { useEffect, useMemo, useState } from 'react'

type State = { ok: boolean; error?: string }
type DateOption = { value: string; label: string; secondary: string }
type TimeOption = { value: string; label: string }
type SessionOption = {
  value: string
  label: string
  bullets: string[]
}

const TIME_OPTIONS: TimeOption[] = [
  { value: '10:00', label: '10:00 AM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '20:00', label: 'Night Session' }
]

const SESSION_OPTIONS: SessionOption[] = [
  {
    value: 'mini',
    label: 'Mini Session',
    bullets: ['30 minutes', '5–10 selects', '$149']
  },
  {
    value: 'full',
    label: 'Full Session',
    bullets: ['2 hours', '20–30 selects', '$249']
  }
]

function isWeekday(value: string | undefined){
  if(!value) return false
  const [y,m,d] = value.split('-').map(Number)
  const date = new Date(y, (m || 1) - 1, d || 1)
  const day = date.getDay()
  return day >= 1 && day <= 5
}

export default function BookForm(){
  const upcomingDates = useMemo<DateOption[]>(()=>{
    const base = new Date()
    const weekdayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
    const detailFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
    return Array.from({ length: 4 }, (_, idx) => {
      const d = new Date(base)
      d.setDate(d.getDate() + idx + 1)
      const value = d.toLocaleDateString('en-CA')
      const label = idx === 0 ? 'Tomorrow' : weekdayFmt.format(d)
      const secondary = detailFmt.format(d)
      return { value, label, secondary }
    })
  }, [])

  const [state, setState] = useState<State | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedSession, setSelectedSession] = useState<string>('')

  function clearStatus(){
    if(state) setState(null)
  }

  useEffect(()=>{
    if(selectedTime && isWeekday(selectedDate) && selectedTime === '10:00'){
      setSelectedTime('')
    }
  }, [selectedDate, selectedTime])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    if (data.company) {
      setState({ ok: true })
      form.reset()
      setSelectedDate('')
      setSelectedTime('')
      setSelectedSession('')
      return
    }
    setState(null)
    if(!data.name || !data.whatsapp || !data.date || !data.time || !data.session){
      setState({ ok: false, error: 'Please complete every required selection.' })
      return
    }
    try{
      const res = await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if(!res.ok) throw new Error('Failed to submit')
      setState({ ok: true })
      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: any }).fbq
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', {
            session: data.session,
            date: data.date,
            time: data.time
          })
          console.info('[Meta Pixel] Lead event fired', {
            session: data.session,
            date: data.date,
            time: data.time
          })
        }
      }
      form.reset()
      setSelectedDate('')
      setSelectedTime('')
      setSelectedSession('')
    }catch(err:any){
      setState({ ok: false, error: err.message })
    }
  }

  return (
    <div className="p-0 sm:p-2">
      <h2 className="text-xl font-semibold text-neutral-900">Fill out your details</h2>
      <p className="mt-1 text-sm text-neutral-600">Sessions are limited; I’ll respond quickly to confirm availability.</p>
      {state?.ok && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Thanks — got it. I’ll WhatsApp you ASAP.</div>
      )}
      {state && !state.ok && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error ?? 'Something went wrong. Please reach out on WhatsApp.'}</div>
      )}

      <form onSubmit={onSubmit} className="mt-4 grid gap-6 sm:mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Name</label>
            <input required name="name" onChange={clearStatus} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30" placeholder="Aidan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">WhatsApp</label>
            <input required name="whatsapp" onChange={clearStatus} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30" placeholder="e.g. +49 175 8966210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Location</label>
            <input name="location" onChange={clearStatus} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30" placeholder="City where you’d like to shoot" />
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-700">Photo shoot date</legend>
          <p className="mt-1 text-xs text-neutral-500">Check available dates below.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {upcomingDates.map(option => (
              <label key={option.value} className="group">
                <input
                  type="radio"
                  name="date"
                  value={option.value}
                  className="peer sr-only"
                  checked={selectedDate === option.value}
                  onChange={()=>{
                    clearStatus()
                    setSelectedDate(option.value)
                    setSelectedTime('')
                  }}
                  required
                />
                <span className="flex h-full flex-col items-center justify-center rounded-full border border-neutral-200 bg-white px-3 py-3 text-sm font-medium text-neutral-700 transition-all peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                  <span>{option.label}</span>
                  <span className="text-xs font-normal text-neutral-500">{option.secondary}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-700">Time of day</legend>
          <p className="mt-1 text-xs text-neutral-500">Choose an available time.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {TIME_OPTIONS.map(option => {
              const disabled = option.value === '10:00' && isWeekday(selectedDate)
              const isActive = selectedTime === option.value
              return (
                <label key={option.value} className={disabled ? 'opacity-40' : ''}>
                  <input
                    type="radio"
                    name="time"
                    value={option.value}
                    className="peer sr-only"
                    checked={isActive}
                    onChange={()=>{
                      clearStatus()
                      setSelectedTime(option.value)
                    }}
                    required
                    disabled={disabled}
                  />
                  <span className={`flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-all peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 ${isActive ? 'border-accent bg-accent/10 text-accent' : 'border-dashed border-neutral-300 bg-white text-neutral-500'}`}
                  >{option.label}{disabled ? ' (unavailable)' : ''}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-700">Session type</legend>
          <p className="mt-1 text-xs text-neutral-500">Choose the format that fits how much time you’d like.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SESSION_OPTIONS.map(option => {
              const isActive = selectedSession === option.value
              return (
                <label key={option.value} className="group">
                  <input
                    type="radio"
                    name="session"
                    value={option.value}
                    className="peer sr-only"
                    checked={isActive}
                    onChange={()=>{
                      clearStatus()
                      setSelectedSession(option.value)
                    }}
                    required
                  />
                  <span className={`flex h-full flex-col rounded-2xl border px-4 py-4 transition-all peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 ${isActive ? 'border-accent bg-accent/10 text-accent' : 'border-dashed border-neutral-300 bg-white text-neutral-600'}`}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span className="font-display text-lg text-[#4d5138] sm:text-xl">{option.bullets.at(-1)}</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-neutral-600">
                      {option.bullets.slice(0, option.bullets.length - 1).map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Anything I should know?</label>
          <textarea name="notes" rows={4} onChange={clearStatus} className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30" placeholder="First shoot nerves, location ideas, wardrobe thoughts…" />
        </div>

        {/* Honeypot */}
        <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

        <div>
          <button className="btn btn-primary px-6" data-cta="book-form-submit">Send request</button>
        </div>
      </form>
    </div>
  )
}
