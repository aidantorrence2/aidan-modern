"use client"
import { useRef, useState } from 'react'

type State = { ok: boolean; error?: string }

function resizeImage(dataUrl: string, maxBytes: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width, h = img.height
      let quality = 0.8
      let scale = 1
      const attempt = () => {
        canvas.width = w * scale
        canvas.height = h * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const result = canvas.toDataURL('image/jpeg', quality)
        const size = Math.round((result.length - 'data:image/jpeg;base64,'.length) * 0.75)
        if (size > maxBytes && (scale > 0.15 || quality > 0.3)) {
          if (quality > 0.4) quality -= 0.1
          else scale *= 0.7
          attempt()
        } else {
          resolve(result)
        }
      }
      if (w > 800) { scale = 800 / w }
      attempt()
    }
    img.src = dataUrl
  })
}

const moodboardOptions = [
  { id: 'Street', img: '/images/moodboards/street-editorial.jpg' },
  { id: 'Nature', img: '/images/moodboards/nature-editorial.jpg' },
  { id: 'Indoor/Studio', img: '/images/moodboards/indoor.jpg' },
]

const shootDetails: Record<string, { duration: string; what: string }> = {
  'Street': { duration: '1–2 hours', what: 'Urban textures, architecture, street life as backdrop. Outfit changes welcome.' },
  'Nature': { duration: '1–2 hours', what: 'Parks, gardens, greenery. Flowy outfits work great.' },
  'Indoor/Studio': { duration: '1–2 hours', what: 'Cafés, studios, or homes. Cozy, intimate vibes.' },
}

export default function SignUpForm() {
  const [state, setState] = useState<State | null>(null)
  const [city, setCity] = useState('')
  const [moodboard, setMoodboard] = useState<string[]>([])
  const [customConcept, setCustomConcept] = useState('')
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'instagram'>('instagram')
  const [contact, setContact] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const moodboardRef = useRef<HTMLFieldSetElement>(null)

  function clearStatus() {
    if (state) setState(null)
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    clearStatus()
    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) {
        setState({ ok: false, error: 'Each photo must be under 20 MB.' })
        continue
      }
      const raw = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      const resized = await resizeImage(raw, 300 * 1024)
      setPhotos(prev => [...prev, resized])
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>

    if (data.company) {
      setState({ ok: true })
      return
    }

    if (!city.trim()) {
      setState({ ok: false, error: 'Please enter your city.' })
      cityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      cityRef.current?.focus()
      return
    }
    if (moodboard.length === 0 && !customConcept.trim()) {
      setState({ ok: false, error: 'Please select at least one shoot concept or suggest your own.' })
      moodboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!contact.trim()) {
      setState({ ok: false, error: `Please enter your ${contactMethod === 'whatsapp' ? 'WhatsApp number' : 'Instagram handle'}.` })
      contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      contactRef.current?.focus()
      return
    }
    if (photos.length === 0) {
      setState({ ok: false, error: 'Please upload a photo of yourself.' })
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setState(null)
    try {
      const allMoodboard = [...moodboard, ...(customConcept.trim() ? [customConcept.trim()] : [])]
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.trim(),
          contactMethod,
          contact: contact.trim(),
          moodboard: allMoodboard.length > 0 ? allMoodboard : null,
          photos: photos.length > 0 ? photos : null
        })
      })
      if (!res.ok) throw new Error('Failed to submit')
      setState({ ok: true })

      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', { source: 'sign-up' })
        }
      }
    } catch {
      setState({ ok: false, error: 'Something went wrong. Try again or DM @madebyaidan on IG.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success: info sheet ──
  if (state?.ok) {
    const allMoodboard = [...moodboard, ...(customConcept.trim() ? [customConcept.trim()] : [])]
    const selectedImg = moodboardOptions.find(o => moodboard.includes(o.id))?.img
    return (
      <div className="mt-6 space-y-0 overflow-hidden rounded-2xl border border-white/[0.08]" style={{ background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>
        {/* Hero image from selected moodboard */}
        {selectedImg && (
          <div className="relative h-48 overflow-hidden">
            <img src={selectedImg} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.6) saturate(1.2)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.95) 100%)' }} />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="font-display text-2xl font-semibold text-white" style={{ fontFamily: "Georgia, serif", fontStyle: 'italic' }}>Thanks for signing up</p>
            </div>
          </div>
        )}
        {!selectedImg && (
          <div className="px-6 pt-6 pb-2">
            <p className="font-display text-2xl font-semibold text-white" style={{ fontFamily: "Georgia, serif", fontStyle: 'italic' }}>Thanks for signing up</p>
          </div>
        )}

        <div className="px-6 pt-4 pb-6 space-y-5">
          <p className="text-sm text-white/50">I&apos;ll reach out soon to plan everything. Here&apos;s a preview of your shoot.</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Location</p>
              <p className="text-sm font-medium text-white">{city}</p>
            </div>
            {allMoodboard.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Concept</p>
                <p className="text-sm font-medium text-white">{allMoodboard.join(', ')}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Duration</p>
              <p className="text-sm font-medium text-white">1–2 hours</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Cost</p>
              <p className="text-sm font-medium text-emerald-400">Free</p>
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* What to expect */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">What to expect</p>
            <div className="space-y-2.5">
              {[
                { icon: '📸', text: 'Edited photos ready to post' },
                { icon: '🎯', text: 'I direct everything — no experience needed' },
                { icon: '👗', text: 'Bring 2–3 fashion outfits' },
                { icon: '✨', text: 'Natural hair & makeup' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-white/70">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Form: single page ──
  return (
    <div>
    <h1 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
      Design your photo shoot
    </h1>
    <p className="mt-3 text-base text-white/50">
      Pick your vibe below and I&apos;ll send you all the details — timing, location ideas, what to wear, and next steps.
    </p>
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      {state && !state.ok && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {state.error}
        </div>
      )}

      {/* City */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white/80">Where are you located?</label>
        <input
          ref={cityRef}
          value={city}
          onChange={e => { setCity(e.target.value); clearStatus() }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          placeholder="e.g. Manila, Antipolo, Quezon City"
        />
      </div>

      {/* Moodboards */}
      <fieldset ref={moodboardRef} className="space-y-2">
        <legend className="text-sm font-medium text-white/80">Choose a shoot concept (or suggest your own) <span className="text-xs text-red-400/70">*</span></legend>
        <div className="grid grid-cols-1 gap-4 max-w-[260px] mx-auto">
          {moodboardOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setMoodboard(prev =>
                  prev.includes(option.id) ? prev.filter(o => o !== option.id) : [...prev, option.id]
                )
                clearStatus()
              }}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                moodboard.includes(option.id)
                  ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              <div className="px-2 py-1.5 text-left font-display text-sm font-semibold tracking-wide text-white">{option.id}</div>
              <img src={option.img} alt={option.id} className="w-full object-cover" />
              {moodboard.includes(option.id) && (
                <div className="absolute inset-0 bg-emerald-400/20" />
              )}
              {moodboard.includes(option.id) && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                  <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <input
          value={customConcept}
          onChange={e => { setCustomConcept(e.target.value); clearStatus() }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          placeholder="Or suggest your own concept..."
        />
      </fieldset>

      {/* Contact method */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-white/80">How should I contact you?</legend>
        <div className="flex gap-2">
          {(['whatsapp', 'instagram'] as const).map(method => (
            <button
              key={method}
              type="button"
              onClick={() => { setContactMethod(method); setContact(''); clearStatus() }}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                contactMethod === method
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80'
              }`}
            >
              {method === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
            </button>
          ))}
        </div>
        <input
          ref={contactRef}
          required
          key={contactMethod}
          name={contactMethod === 'whatsapp' ? 'whatsapp' : 'instagram'}
          value={contact}
          onChange={e => { setContact(e.target.value); clearStatus() }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          placeholder={contactMethod === 'whatsapp' ? '+63 917 123 4567' : '@yourhandle'}
        />
        {contactMethod === 'instagram' && (
          <p className="text-xs text-amber-400/80">Follow @madebyaidan so I can message you</p>
        )}
      </fieldset>

      {/* Photos (required) */}
      <div ref={photoRef} className="space-y-1.5">
        <label className="text-sm font-medium text-white/80">
          What you look like <span className="text-xs text-red-400/70">*</span>
        </label>
        <p className="text-xs text-white/40">A selfie or headshot — you can upload multiple</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt="Preview" className="h-24 w-24 rounded-xl border border-white/10 object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white backdrop-blur transition hover:bg-red-500"
                aria-label="Remove photo"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 text-2xl text-white/30 transition hover:border-emerald-400/50 hover:text-emerald-400"
          >
            +
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
      </div>

      {/* Honeypot */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50"
        data-cta="sign-up-submit"
      >
        {submitting ? 'Submitting...' : 'Sign Up & Get Details'}
      </button>
    </form>
    </div>
  )
}
