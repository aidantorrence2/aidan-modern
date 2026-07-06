"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { COUNTRY_CODES } from './countryCodes'

// Searchable dial-code picker used by the collab sign-up forms.
// Reports the dial code (e.g. "+91") via onChange; tracks the chosen ISO
// internally so shared dial codes (+1 US/Canada) display the right flag.
export default function CountryCodeSelect({ value, onChange }: { value: string; onChange: (dial: string) => void }) {
  const [iso, setIso] = useState('IN')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const current = useMemo(
    () => COUNTRY_CODES.find(c => c.iso === iso && c.dial === value) || COUNTRY_CODES.find(c => c.dial === value),
    [iso, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRY_CODES
    const dialQ = q.startsWith('+') ? q : '+' + q
    return COUNTRY_CODES.filter(c =>
      c.name.toLowerCase().includes(q) || (/^\+?\d/.test(q) && c.dial.startsWith(dialQ))
    )
  }, [query])

  useEffect(() => {
    function onDocDown(e: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('touchstart', onDocDown)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('touchstart', onDocDown)
    }
  }, [])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery('') }}
        aria-label="Country code"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
      >
        <span>{current ? `${current.flag} ${current.dial}` : value}</span>
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#161616] shadow-2xl">
          <div className="border-b border-white/[0.06] p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
            />
          </div>
          <div className="max-h-60 overflow-y-auto overscroll-contain">
            {filtered.map(c => (
              <button
                key={c.iso}
                type="button"
                onClick={() => { setIso(c.iso); onChange(c.dial); setOpen(false) }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-white/10 ${c.iso === current?.iso ? 'bg-emerald-400/10 text-emerald-300' : 'text-white/80'}`}
              >
                <span>{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-white/40">{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-3 text-xs text-white/40">No matches</p>}
          </div>
        </div>
      )}
    </div>
  )
}
