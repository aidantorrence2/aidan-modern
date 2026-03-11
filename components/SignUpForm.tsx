"use client"
import { useRef, useState } from 'react'

type State = { ok: boolean; error?: string }

export default function SignUpForm() {
  const [state, setState] = useState<State | null>(null)
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'instagram' | ''>('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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

    // Honeypot
    if (data.company) {
      setState({ ok: true })
      return
    }

    if (!data.city?.trim()) {
      setState({ ok: false, error: 'Please enter your city.' })
      return
    }
    if (!contactMethod) {
      setState({ ok: false, error: 'Please select a contact method.' })
      return
    }
    const contactValue = contactMethod === 'whatsapp' ? data.whatsapp : data.instagram
    if (!contactValue?.trim()) {
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
          city: data.city.trim(),
          contactMethod,
          contact: contactValue.trim(),
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
      setContactMethod('')
      setPhotoPreview(null)
      setPhotoData(null)
    } catch {
      setState({ ok: false, error: 'Something went wrong. Try again or DM @madebyaidan on IG.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      {state?.ok && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
          You&apos;re in! I&apos;ll reach out soon to plan everything.
        </div>
      )}
      {state && !state.ok && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">
          {state.error}
        </div>
      )}

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">City</label>
        <input
          name="city"
          onChange={clearStatus}
          className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          placeholder="e.g. Manila, BGC, Makati"
        />
      </div>

      {/* Contact method */}
      <fieldset>
        <legend className="text-sm font-medium text-neutral-700">How should I contact you?</legend>
        <div className="mt-2 flex gap-3">
          {(['whatsapp', 'instagram'] as const).map(method => (
            <button
              key={method}
              type="button"
              onClick={() => { setContactMethod(method); clearStatus() }}
              className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all ${
                contactMethod === method
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {method === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Conditional contact field */}
      {contactMethod && (
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            {contactMethod === 'whatsapp' ? 'WhatsApp number' : 'Instagram handle'}
          </label>
          <input
            required
            name={contactMethod === 'whatsapp' ? 'whatsapp' : 'instagram'}
            onChange={clearStatus}
            className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            placeholder={contactMethod === 'whatsapp' ? '+63 917 123 4567' : '@yourhandle'}
          />
          {contactMethod === 'instagram' && (
            <p className="mt-1.5 text-xs text-amber-600">Make sure you follow @madebyaidan so I can message you</p>
          )}
        </div>
      )}

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">What you look like</label>
        <p className="mt-0.5 text-xs text-neutral-500">A basic selfie or headshot is fine</p>
        {photoPreview ? (
          <div className="mt-2 inline-block relative">
            <img
              src={photoPreview}
              alt="Preview"
              className="h-32 w-32 rounded-2xl border border-neutral-200 object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs text-white shadow transition hover:bg-red-600"
              aria-label="Remove photo"
            >
              &times;
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex h-32 w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-white text-sm text-neutral-500 transition hover:border-accent hover:text-accent"
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

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full py-3.5 text-base disabled:opacity-60"
        data-cta="sign-up-submit"
      >
        {submitting ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  )
}
