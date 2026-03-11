"use client"
import { useRef, useState } from 'react'

type State = { ok: boolean; error?: string }

export default function SignUpForm() {
  const [state, setState] = useState<State | null>(null)
  const [city, setCity] = useState('')
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'instagram'>('whatsapp')
  const [contact, setContact] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const cityDone = city.trim().length > 0
  const contactDone = contact.trim().length > 0
  const photoDone = !!photoPreview

  function clearStatus() {
    if (state) setState(null)
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setState({ ok: false, error: 'Photo must be under 10 MB.' })
      return
    }
    clearStatus()
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPhotoPreview(result)
      setPhotoData(result)
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
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.trim(),
          contactMethod,
          contact: contact.trim(),
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

      form.reset()
      setCity('')
      setContact('')
      setContactMethod('whatsapp')
      setPhotoPreview(null)
      setPhotoData(null)
    } catch {
      setState({ ok: false, error: 'Something went wrong. Try again or DM @madebyaidan on IG.' })
    } finally {
      setSubmitting(false)
    }
  }

  function Check() {
    return (
      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )
  }

  function StepNumber({ n }: { n: number }) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white/50">
        {n}
      </span>
    )
  }

  if (state?.ok) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
          <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-white">You&apos;re in!</p>
        <p className="mt-1 text-sm text-white/60">I&apos;ll reach out soon to plan everything.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      {state && !state.ok && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {state.error}
        </div>
      )}

      {/* Step 1: City */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-white/80">
          {cityDone ? <Check /> : <StepNumber n={1} />}
          City
        </label>
        <input
          name="city"
          value={city}
          onChange={e => { setCity(e.target.value); clearStatus() }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          placeholder="e.g. Manila, BGC, Makati"
        />
      </div>

      {/* Step 2: Contact method */}
      <fieldset className="space-y-2">
        <legend className="flex items-center gap-2 text-sm font-medium text-white/80">
          {contactDone ? <Check /> : <StepNumber n={2} />}
          How should I contact you?
        </legend>
        <div className="flex gap-2">
          {(['whatsapp', 'instagram'] as const).map(method => (
            <button
              key={method}
              type="button"
              onClick={() => { setContactMethod(method); setContact(''); clearStatus() }}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                contactMethod === method
                  ? 'border-accent bg-accent/20 text-accent'
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
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          placeholder={contactMethod === 'whatsapp' ? '+63 917 123 4567' : '@yourhandle'}
        />
        {contactMethod === 'instagram' && (
          <p className="text-xs text-amber-400/80">Follow @madebyaidan so I can message you</p>
        )}
      </fieldset>

      {/* Step 3: Photo */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-white/80">
          {photoDone ? <Check /> : <StepNumber n={3} />}
          What you look like
        </label>
        <p className="text-xs text-white/40">A basic selfie or headshot is fine</p>
        {photoPreview ? (
          <div className="relative mt-1 inline-block">
            <img
              src={photoPreview}
              alt="Preview"
              className="h-28 w-28 rounded-xl border border-white/10 object-cover"
            />
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
            className="mt-1 flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 text-sm text-white/40 transition hover:border-accent/50 hover:text-accent"
          >
            Tap to upload a photo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="hidden"
        />
      </div>

      {/* Honeypot */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Progress + Submit */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${((cityDone ? 1 : 0) + (contactDone ? 1 : 0) + (photoDone ? 1 : 0)) / 3 * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-white/40">
            {(cityDone ? 1 : 0) + (contactDone ? 1 : 0) + (photoDone ? 1 : 0)}/3
          </span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/20 transition hover:brightness-110 disabled:opacity-50"
          data-cta="sign-up-submit"
        >
          {submitting ? 'Submitting...' : 'Sign Up'}
        </button>
      </div>
    </form>
  )
}
