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
  { id: 'Street editorial', img: '/images/moodboards/street-editorial.jpg' },
  { id: 'Nature editorial', img: '/images/moodboards/nature-editorial.jpg' },
  { id: 'Indoor', img: '/images/moodboards/indoor.jpg' },
]

const shootDetails: Record<string, { duration: string; bestTime: string; what: string }> = {
  'Street editorial': { duration: '1–2 hours', bestTime: 'Late afternoon (golden hour)', what: 'Urban textures, architecture, street life as backdrop. Outfit changes welcome.' },
  'Nature editorial': { duration: '1–2 hours', bestTime: 'Morning or golden hour', what: 'Parks, gardens, greenery. Flowy outfits work great.' },
  'Indoor': { duration: '1–2 hours', bestTime: 'Anytime', what: 'Cafés, studios, or homes. Cozy, intimate vibes.' },
}

export default function SignUpForm() {
  const [state, setState] = useState<State | null>(null)
  const [city, setCity] = useState('')
  const [moodboard, setMoodboard] = useState<string[]>([])
  const [customConcept, setCustomConcept] = useState('')
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'instagram'>('whatsapp')
  const [contact, setContact] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function clearStatus() {
    if (state) setState(null)
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      setState({ ok: false, error: 'Photo must be under 20 MB.' })
      return
    }
    clearStatus()
    const reader = new FileReader()
    reader.onload = async () => {
      const raw = reader.result as string
      const resized = await resizeImage(raw, 300 * 1024)
      setPhotoPreview(resized)
      setPhotoData(resized)
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhotoPreview(null)
    setPhotoData(null)
    if (fileRef.current) fileRef.current.value = ''
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
      return
    }
    if (!contact.trim()) {
      setState({ ok: false, error: `Please enter your ${contactMethod === 'whatsapp' ? 'WhatsApp number' : 'Instagram handle'}.` })
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
          photo: photoData || null
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
    return (
      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-white">You&apos;re in!</p>
          <p className="mt-1 text-sm text-white/60">I&apos;ll reach out soon to plan everything.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-5">
          <h3 className="font-display text-lg font-semibold text-white">Your photo shoot details</h3>

          <div className="space-y-1">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Location</p>
            <p className="text-sm text-white">{city}</p>
          </div>

          {allMoodboard.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Selected concepts</p>
              <div className="flex flex-wrap gap-1.5">
                {allMoodboard.map(m => (
                  <span key={m} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">{m}</span>
                ))}
              </div>
            </div>
          )}

          {moodboard.map(m => {
            const d = shootDetails[m]
            if (!d) return null
            return (
              <div key={m} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 space-y-2">
                <p className="text-sm font-semibold text-white">{m}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/40">Duration</span>
                    <p className="text-white/80 mt-0.5">{d.duration}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Best time</span>
                    <p className="text-white/80 mt-0.5">{d.bestTime}</p>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-white/40">What to expect</span>
                  <p className="text-white/80 mt-0.5">{d.what}</p>
                </div>
              </div>
            )
          })}

          <div className="space-y-1 text-xs text-white/40">
            <p><span className="text-white/60 font-medium">Cost:</span> Free</p>
            <p><span className="text-white/60 font-medium">What you get:</span> Edited photos ready to post</p>
            <p><span className="text-white/60 font-medium">Experience needed:</span> None — I direct everything</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Form: single page ──
  return (
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
          value={city}
          onChange={e => { setCity(e.target.value); clearStatus() }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          placeholder="e.g. Manila, Antipolo, Quezon City"
        />
      </div>

      {/* Moodboards */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-white/80">Choose your shoot concept</legend>
        <p className="text-xs text-white/40">Select one or more</p>
        <div className="grid grid-cols-2 gap-2">
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
              <img src={option.img} alt={option.id} className="aspect-square w-full object-cover" />
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

      {/* Photo (optional) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white/80">
          What you look like <span className="text-xs text-white/30">(optional)</span>
        </label>
        <p className="text-xs text-white/40">A basic selfie or headshot is fine</p>
        {photoPreview ? (
          <div className="relative mt-1 inline-block">
            <img src={photoPreview} alt="Preview" className="h-28 w-28 rounded-xl border border-white/10 object-cover" />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white backdrop-blur transition hover:bg-red-500"
              aria-label="Remove photo"
            >
              &times;
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-1 flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 text-sm text-white/40 transition hover:border-emerald-400/50 hover:text-emerald-400"
          >
            Tap to upload a photo
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
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
        {submitting ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  )
}
