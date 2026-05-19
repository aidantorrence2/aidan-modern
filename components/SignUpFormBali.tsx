"use client"
import { useRef, useState } from 'react'
import NextImage from 'next/image'

type State = { ok: boolean; error?: string }

function resizeImage(dataUrl: string, maxBytes: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
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
    img.src = dataUrl
  })
}

const locationOptions = [
  { id: 'Rice terraces', desc: 'Tegallalang, Jatiluwih — iconic green layers' },
  { id: 'Beach & cliffs', desc: 'Uluwatu, Padang Padang, black sand' },
  { id: 'Temple & jungle', desc: 'Tirta Empul, monkey forest, hidden waterfalls' },
  { id: 'Villa / indoor', desc: 'Private villa, bathtub, intimate setting' },
  { id: 'Streets of Ubud', desc: 'Art markets, cafes, lush alleyways' },
  { id: 'Other', desc: "You have a spot in mind — tell me!" },
]

const vibeOptions = [
  { id: 'Editorial & high fashion', desc: 'Magazine-quality, dramatic, styled' },
  { id: 'Dreamy & romantic', desc: 'Golden light, flowing fabrics, soft' },
  { id: 'Raw & adventurous', desc: 'Real, unposed, in-the-moment' },
  { id: 'Sexy & intimate', desc: 'Confident, bold, your most magnetic self' },
  { id: "Let's figure it out", desc: "We'll vibe check and decide together" },
]

const pricePresetsIDR = [200000, 1000000, 5000000]
const pricePresetsUSD = [15, 60, 300]

const heroImage = '/images/moodboards/nature-editorial.jpg'

export default function SignUpFormBali() {
  const [state, setState] = useState<State | null>(null)
  const [location, setLocation] = useState('')
  const [vibe, setVibe] = useState('')
  const [currency, setCurrency] = useState<'idr' | 'usd'>('idr')
  const [price, setPrice] = useState<number | null>(null)
  const [customPrice, setCustomPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'instagram'>('instagram')
  const [contact, setContact] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLFieldSetElement>(null)
  const priceRef = useRef<HTMLFieldSetElement>(null)

  function clearStatus() {
    if (state) setState(null)
  }

  const pricePresets = currency === 'idr' ? pricePresetsIDR : pricePresetsUSD
  const sym = currency === 'idr' ? 'Rp' : '$'
  const effectivePrice = price === -1 ? (parseInt(customPrice) || 0) : (price ?? 0)
  const fmtPrice = (n: number) => `${sym} ${n.toLocaleString()}`

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
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { setState({ ok: true }); return }

    if (!location) {
      setState({ ok: false, error: 'Pick a location.' })
      locationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (price === null) {
      setState({ ok: false, error: 'Choose your price.' })
      priceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (price === -1 && !customPrice.trim()) {
      setState({ ok: false, error: 'Enter your custom amount.' })
      priceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!contact.trim()) {
      setState({ ok: false, error: `Please enter your ${contactMethod === 'whatsapp' ? 'WhatsApp number' : 'Instagram handle'}.` })
      contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      contactRef.current?.focus()
      return
    }
    if (photos.length === 0) {
      setState({ ok: false, error: 'Upload a photo of yourself.' })
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setState(null)
    try {
      const moodboard = [
        `Location: ${location}`,
        ...(vibe ? [`Vibe: ${vibe}`] : []),
        `Price: ${fmtPrice(effectivePrice)} (pay what you want)`,
        ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
      ]
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'Bali',
          contactMethod,
          contact: contact.trim(),
          moodboard,
          photos,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setState({ ok: true })
      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-bali', value: effectivePrice, currency: currency.toUpperCase() })
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
      <div className="mt-6 space-y-0 overflow-hidden rounded-2xl border border-white/[0.08]" style={{ background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>
        <div className="relative h-48 overflow-hidden">
          <NextImage src={heroImage} alt="" width={400} height={192} className="w-full h-full object-cover" unoptimized style={{ filter: 'brightness(0.5) saturate(1.2)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.95) 100%)' }} />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="font-display text-2xl font-semibold text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>You&apos;re booked.</p>
          </div>
        </div>
        <div className="px-6 pt-4 pb-6 space-y-5">
          <p className="text-sm text-white/50">I&apos;ll reach out within 24 hours to start planning your Bali shoot.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Location</p>
              <p className="text-sm font-medium text-white">{location}</p>
            </div>
            {vibe && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Vibe</p>
                <p className="text-sm font-medium text-white">{vibe}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Duration</p>
              <p className="text-sm font-medium text-white">1&ndash;2 hours</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Your price</p>
              <p className="text-sm font-medium text-emerald-400">{fmtPrice(effectivePrice)}</p>
            </div>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">What to expect</p>
            <div className="space-y-2.5">
              {[
                { icon: '\u{1F4F8}', text: 'Edited photos delivered within 48 hours' },
                { icon: '\u{1F3AF}', text: 'I direct everything \u2014 no experience needed' },
                { icon: '\u{1F45A}', text: 'Bring 2\u20133 outfits or we plan them together' },
                { icon: '\u{1F4AC}', text: 'Direct communication from start to finish' },
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

  // ── Form ──
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:text-white">
          My Works
        </a>
      </div>

      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold leading-[1.05] text-white sm:text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
          Bali photo shoot
        </h1>
        <p className="text-base leading-relaxed text-white/50">
          Choose your location, your vibe, and your price. I&apos;ll handle the rest.
        </p>

        {/* Pay what you want callout */}
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4">
          <p className="text-sm font-semibold text-emerald-400">Pay what you want</p>
          <p className="mt-1 text-xs text-white/50 leading-relaxed">
            There&apos;s no set price. Choose what feels right to you.
            Every shoot gets the same quality, the same effort, the same me.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-7">
        {state && !state.ok && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
            {state.error}
          </div>
        )}

        {/* Step 1: Location */}
        <fieldset ref={locationRef} className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">1</span>
            <legend className="text-sm font-medium text-white/80">Where in Bali?</legend>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {locationOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setLocation(opt.id); clearStatus() }}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                  location === opt.id
                    ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400/30'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                <div className={`text-sm font-semibold ${location === opt.id ? 'text-emerald-300' : 'text-white'}`}>{opt.id}</div>
                <div className="mt-0.5 text-xs text-white/40">{opt.desc}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Step 2: Vibe */}
        <fieldset className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">2</span>
            <legend className="text-sm font-medium text-white/80">What vibe are you going for?</legend>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {vibeOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setVibe(opt.id); clearStatus() }}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                  vibe === opt.id
                    ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400/30'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                <div className={`text-sm font-semibold ${vibe === opt.id ? 'text-emerald-300' : 'text-white'}`}>{opt.id}</div>
                <div className="mt-0.5 text-xs text-white/40">{opt.desc}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Step 3: Price */}
        <fieldset ref={priceRef} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">3</span>
            <legend className="text-sm font-medium text-white/80">Choose your price</legend>
          </div>
          <div className="flex gap-1.5 mb-1">
            {(['idr', 'usd'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setCurrency(c); setPrice(null); setCustomPrice(''); clearStatus() }}
                className={`rounded-full border px-4 py-1 text-xs font-semibold transition-all ${
                  currency === c
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                    : 'border-white/15 bg-white/5 text-white/50 hover:border-white/25'
                }`}
              >
                {c === 'idr' ? 'IDR' : 'USD'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pricePresets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { setPrice(p); setCustomPrice(''); clearStatus() }}
                className={`rounded-xl border py-3 text-center transition-all ${
                  price === p
                    ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400/30'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                <div className={`text-base font-bold ${price === p ? 'text-emerald-300' : 'text-white'}`}>{fmtPrice(p)}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setPrice(-1); clearStatus() }}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                price === -1
                  ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300 ring-2 ring-emerald-400/30'
                  : 'border-white/10 bg-white/[0.03] text-white hover:border-white/25'
              }`}
            >
              Custom
            </button>
            {price === -1 && (
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">{sym}</span>
                <input
                  type="number"
                  min="1"
                  value={customPrice}
                  onChange={e => { setCustomPrice(e.target.value); clearStatus() }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="Your amount"
                  autoFocus
                />
              </div>
            )}
          </div>
          <p className="text-xs text-white/30">Every shoot gets the same quality regardless of price.</p>
        </fieldset>

        {/* Step 4: Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">4</span>
            <label className="text-sm font-medium text-white/80">Anything else? <span className="text-xs text-white/30">(optional)</span></label>
          </div>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); clearStatus() }}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            placeholder="References, ideas, dates you're in Bali, outfits you're bringing..."
          />
        </div>

        {/* Contact */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-white/80">How should I reach you?</legend>
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
            name={contactMethod}
            value={contact}
            onChange={e => { setContact(e.target.value); clearStatus() }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            placeholder={contactMethod === 'whatsapp' ? '+62 812 345 6789' : '@yourhandle'}
          />
          {contactMethod === 'instagram' && (
            <p className="text-xs text-amber-400/80">Follow @madebyaidan so I can message you</p>
          )}
        </fieldset>

        {/* Photo */}
        <div ref={photoRef} className="space-y-1.5">
          <label className="text-sm font-medium text-white/80">
            What you look like <span className="text-xs text-red-400/70">*</span>
          </label>
          <p className="text-xs text-white/40">A selfie or headshot &mdash; you can upload multiple</p>
          <div className="mt-1 flex flex-wrap gap-2">
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50"
          data-cta="sign-up-bali-submit"
        >
          {submitting ? 'Submitting\u2026' : effectivePrice > 0 ? `Book for ${fmtPrice(effectivePrice)}` : 'Book Your Shoot'}
        </button>
      </form>
    </div>
  )
}
