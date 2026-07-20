"use client"
import { useRef, useState } from 'react'
import NextImage from 'next/image'
import CountryCodeSelect from './CountryCodeSelect'

type State = { ok: boolean; error?: string }

function resizeImage(dataUrl: string, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => reject(new Error('Image load timed out')), 30000)
    img.onload = () => {
      clearTimeout(timer)
      const canvas = document.createElement('canvas')
      const w = img.width, h = img.height
      let quality = 0.8
      let scale = w > 800 ? 800 / w : 1
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
      attempt()
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Could not load image — unsupported format'))
    }
    img.src = dataUrl
  })
}

const locationChips = ['Kolkata', 'Varanasi', 'Agra', 'Jaipur']

// The gold used across the Kolkata carousel creative — this form is the same
// concept as those ads: outfit + location + show up, zero production.
const GOLD = '#e9c986'

const proofImages = [
  '/images/proof/000001-8.jpg',
  '/images/proof/000019-6.jpg',
  '/images/proof/000038-4.jpg',
  '/images/proof/000041.jpg',
]

export default function SignUpFormCollabNew() {
  const [state, setState] = useState<State | null>(null)
  const [location, setLocation] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [instagram, setInstagram] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const whatsappRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)

  function clearStatus() {
    if (state) setState(null)
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    clearStatus()
    setProcessingPhotos(true)
    let failures = 0
    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          failures++
          continue
        }
        try {
          const raw = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(new Error('Could not read file'))
            reader.readAsDataURL(file)
          })
          const resized = await resizeImage(raw, 300 * 1024)
          setPhotos(prev => [...prev, resized])
        } catch {
          failures++
        }
      }
    } finally {
      setProcessingPhotos(false)
      if (fileRef.current) fileRef.current.value = ''
      if (failures > 0) {
        setState({
          ok: false,
          error: failures === 1
            ? 'One photo could not be added (too large or unsupported format — try a JPG/PNG under 20 MB).'
            : `${failures} photos could not be added (too large or unsupported format — try JPG/PNG under 20 MB).`
        })
      }
    }
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { setState({ ok: true }); return }

    if (processingPhotos) {
      setState({ ok: false, error: 'Photos are still processing — hang on a sec and try again.' })
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const whatsappTrim = whatsapp.trim()
    if (!whatsappTrim) {
      setState({ ok: false, error: 'Please enter your WhatsApp number.' })
      whatsappRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      whatsappRef.current?.focus()
      return
    }
    if (photos.length === 0) {
      setState({ ok: false, error: 'Add a photo or two of yourself — selfies are fine.' })
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setState(null)
    try {
      const moodboard = [
        'Collab sign-up',
        'Variant: 3step',
        ...(location.trim() ? ['Location: ' + location.trim()] : []),
        ...(instagram.trim() ? ['Instagram: ' + instagram.trim()] : []),
      ]
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: location.trim(),
          contactMethod: 'whatsapp',
          contact: countryCode + ' ' + whatsappTrim,
          moodboard,
          photos,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setState({ ok: true })
      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-new' })
      }
    } catch {
      setState({ ok: false, error: 'Something went wrong. Try again or DM @madebyaidan on IG.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success ──
  if (state?.ok) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08]" style={{ background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>
        <div className="relative h-48 overflow-hidden">
          <NextImage src={proofImages[3]} alt="" width={400} height={192} priority sizes="(max-width: 640px) 100vw, 400px" className="w-full h-full object-cover object-top" style={{ filter: 'brightness(0.55) saturate(1.15)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.95) 100%)' }} />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-2xl font-semibold text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>That&apos;s it. You&apos;re in.</p>
          </div>
        </div>
        <div className="px-6 pt-4 pb-6 space-y-5">
          <p className="text-sm text-white/50">
            See? Told you it was easy. I&apos;ll reach out within 24 hours — we&apos;ll lock your spot and time on one quick call.
          </p>
          <div className="space-y-2.5">
            {[
              'Your outfit is the styling — wear what you feel best in',
              'I direct every frame — posing, angles, light',
              'About an hour, daytime and public',
              'Edited 35mm scans, yours to keep. Free — we both get content',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                <span className="text-sm text-white/70">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──
  return (
    <div>
      {/* Header — the How-it-works section opens the page */}
      <div className="space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">How it works</p>
        {[
          ['1', 'Sign up.'],
          ['2', 'We will quickly discuss the outfit and the photo shoot location.'],
          ['3', 'Show up. We take photos. I’ll let you know how to pose, what to do, etc.'],
          ['4', 'I’ll send you the photos.'],
        ].map(([n, t]) => (
          <div key={n} className="flex items-baseline gap-3">
            <span className="w-5 shrink-0 text-lg font-bold" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GOLD }}>{n}</span>
            <p className="text-sm font-medium leading-relaxed text-white/85">{t}</p>
          </div>
        ))}
        <p className="text-sm font-semibold" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GOLD }}>and yes, it&apos;s totally free.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-9">
        {state && !state.ok && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
            {state.error}
          </div>
        )}

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Location</label>
          <div className="flex flex-wrap gap-2">
            {locationChips.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => { setLocation(chip); clearStatus() }}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                  location.trim() === chip
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                    : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          <input
            value={location}
            onChange={e => { setLocation(e.target.value); clearStatus() }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            placeholder="Or type another city"
          />
        </div>

        {/* Outfit — nothing to fill in, that's the point */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Outfit</label>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
            <p className="text-sm text-white/70">Wear the thing you feel best in. Your closet is the styling department.</p>
          </div>
        </div>

        {/* Contact + photos */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">WhatsApp</label>
            <div className="flex gap-2">
              <CountryCodeSelect value={countryCode} onDetect={setCountryCode} onChange={code => { setCountryCode(code); clearStatus() }} />
              <input
                ref={whatsappRef}
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                name="whatsapp"
                value={whatsapp}
                onChange={e => { setWhatsapp(e.target.value); clearStatus() }}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                placeholder="98765 43210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Instagram <span className="text-xs text-white/30">(optional)</span></label>
            <input
              name="instagram"
              value={instagram}
              onChange={e => { setInstagram(e.target.value); clearStatus() }}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              placeholder="@yourhandle"
            />
          </div>

          <div ref={photoRef} className="space-y-2">
            <label className="text-sm font-medium text-white/80">Photos of yourself</label>
            <p className="text-xs leading-relaxed text-white/40">
              Selfies are fine &mdash; just looking to see the real you.
            </p>
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                Like this &mdash; simple &amp; natural, don&apos;t hide your face
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {['/images/collab-examples/good-1.jpg', '/images/collab-examples/good-2.jpg', '/images/collab-examples/good-3.jpg', '/images/collab-examples/good-4.jpg'].map((src, i) => (
                  <div key={i} className="relative overflow-hidden rounded-lg border border-emerald-400/40 aspect-[3/4]">
                    <NextImage src={src} alt="Good example photo" width={200} height={267} sizes="(max-width: 640px) 25vw, 100px" className="w-full h-full object-cover" />
                    <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400/90">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                Not like this &mdash; heavy makeup, filters, face hidden
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {['/images/collab-examples/bad-1.jpg', '/images/collab-examples/bad-2.jpg', '/images/collab-examples/bad-3.jpg', '/images/collab-examples/bad-4.jpg'].map((src, i) => (
                  <div key={i} className="relative overflow-hidden rounded-lg border border-red-400/30 aspect-[3/4]">
                    <NextImage src={src} alt="Bad example photo" width={150} height={200} sizes="(max-width: 640px) 25vw, 100px" className="w-full h-full object-cover opacity-70 saturate-[0.85]" />
                    <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt="Preview" className="h-14 w-14 rounded-lg border border-white/10 object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs text-white backdrop-blur transition hover:bg-red-500"
                    aria-label="Remove photo"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={processingPhotos}
                className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-4xl font-light text-white/40 transition hover:border-emerald-400/50 hover:text-emerald-400 disabled:opacity-50"
              >
                {processingPhotos ? (
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-emerald-400" aria-label="Processing" />
                ) : '+'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
          </div>
        </div>

        {/* Honeypot */}
        <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

        <button
          type="submit"
          disabled={submitting || processingPhotos}
          className="w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50"
          data-cta="sign-up-collab-new-submit"
        >
          {submitting || processingPhotos ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" aria-label="Loading" />
          ) : 'That’s the whole plan — sign me up'}
        </button>
      </form>

    </div>
  )
}
