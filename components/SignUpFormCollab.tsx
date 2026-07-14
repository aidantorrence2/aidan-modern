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

const NO_PREFERENCE = 'No preference'
type ConceptOption = { id: string; desc: string }
const preferenceOptions: ConceptOption[] = [
  { id: 'Fashion editorial', desc: 'Dramatic, magazine-style' },
  { id: 'Old city streets', desc: 'Pols, markets, walls, real Ahmedabad texture' },
  { id: 'Stepwell / heritage', desc: 'Architecture, fabric, quiet dramatic light' },
  { id: 'Cafe / indoor', desc: 'Simple, comfortable, controlled light' },
  { id: 'Nature & golden light', desc: 'Riverfront, greenery, soft portraits' },
  { id: NO_PREFERENCE, desc: "You direct it \u2014 I'll design the shoot" },
]

const DEFAULT_CITY = 'Ahmedabad'
const CAMPAIGN_SOURCE = 'Ahmedabad carousel ad'
const locationChips = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat']

const heroImage = '/images/moodboards/editorial.jpg'

export default function SignUpFormCollab() {
  const [state, setState] = useState<State | null>(null)
  const [location, setLocation] = useState(DEFAULT_CITY)
  // No default pre-selection: keeps "what did they actually want" measurable
  // instead of everyone inheriting Fashion editorial.
  const [vibes, setVibes] = useState<string[]>([])
  const [idea, setIdea] = useState('')
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

  function toggleVibe(v: string) {
    // "No preference" is mutually exclusive with the concept tiles.
    setVibes(prev => {
      if (v === NO_PREFERENCE) return prev.includes(v) ? [] : [NO_PREFERENCE]
      const withoutNoPref = prev.filter(x => x !== NO_PREFERENCE)
      return withoutNoPref.includes(v) ? withoutNoPref.filter(x => x !== v) : [...withoutNoPref, v]
    })
    clearStatus()
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
    setSubmitting(true)
    setState(null)
    try {
      const signupCity = location.trim() || DEFAULT_CITY
      const moodboard = [
        'Collab sign-up',
        'Campaign: ' + CAMPAIGN_SOURCE,
        'Variant: ahmedabad-whatsapp-first',
        'Location: ' + signupCity,
        ...(vibes.length > 0 ? ['Preference: ' + vibes.join(', ')] : []),
        ...(idea.trim() ? ['Notes: ' + idea.trim()] : []),
        ...(instagram.trim() ? ['Instagram: ' + instagram.trim()] : []),
        ...(photos.length === 0 ? ['Photos: not uploaded yet'] : []),
      ]
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: signupCity,
          contactMethod: 'whatsapp',
          contact: countryCode + ' ' + whatsappTrim,
          moodboard,
          photos: photos.length > 0 ? photos : null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setState({ ok: true })
      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab', campaign: 'ahmedabad-carousel' })
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
          <NextImage src={heroImage} alt="" width={400} height={192} priority sizes="(max-width: 640px) 100vw, 400px" className="w-full h-full object-cover" style={{ filter: 'brightness(0.5) saturate(1.2)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.95) 100%)' }} />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="font-display text-2xl font-semibold text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>You&apos;re in.</p>
          </div>
        </div>
        <div className="px-6 pt-4 pb-6 space-y-5">
          <p className="text-sm text-white/50">
            I&apos;ll WhatsApp you within 24 hours to confirm the Ahmedabad plan, timing, and location. If you skipped photos, just send a selfie there.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Type</p>
              <p className="text-sm font-medium text-white">TFP Collaboration</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Duration</p>
              <p className="text-sm font-medium text-white">1&ndash;2 hours</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Cost</p>
              <p className="text-sm font-medium text-emerald-400">Free &mdash; no hidden fees</p>
            </div>
            {vibes.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Preference</p>
                <p className="text-sm font-medium text-white">{vibes.join(', ')}</p>
              </div>
            )}
          </div>
          {idea.trim() && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Notes</p>
              <p className="text-sm font-medium leading-relaxed text-white">{idea.trim()}</p>
            </div>
          )}
          <div className="h-px bg-white/[0.06]" />
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">What to expect</p>
            <div className="space-y-2.5">
              {[
                { icon: '\u{1F4F8}', text: 'Edited photos you can use however you want' },
                { icon: '\u{1F3AF}', text: 'I direct posing, angles, and light' },
                { icon: '\u{1F46F}', text: 'Bring a friend if that makes you more comfortable' },
                { icon: '\u{1F4AC}', text: 'We lock the concept together on WhatsApp' },
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
      <div className="space-y-5">
        <h1 className="font-display text-3xl font-semibold leading-[1.05] text-white sm:text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
          Ahmedabad free photo shoot
        </h1>
        <p className="text-base leading-relaxed text-white/50">
          I&apos;m casting a few people in Ahmedabad for a free 35mm film collab. Leave your WhatsApp now; we&apos;ll choose the outfit and location together.
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          {['Free TFP', 'No experience', 'Public shoot'].map(item => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[11px] font-semibold text-white/70">
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Recent work &middot; Shot on film</p>
          <div className="grid grid-cols-4 gap-1">
            {[
              '/images/proof/000001-8.jpg',
              '/images/proof/000019-6.jpg',
              '/images/proof/000038-4.jpg',
              '/images/proof/000041.jpg',
            ].map((src, i) => (
              <div key={i} className="relative overflow-hidden rounded-md aspect-[3/4]">
                <NextImage
                  src={src}
                  alt=""
                  width={200}
                  height={267}
                  sizes="(max-width: 640px) 25vw, 150px"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-7">
        {state && !state.ok && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
            {state.error}
          </div>
        )}

        {/* Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">1</span>
            <label className="text-sm font-medium text-white/80">Where are you located?</label>
          </div>
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

        {/* Preference — selectable concepts, fashion editorial is the default */}
        <fieldset className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">2</span>
            <legend className="text-sm font-medium text-white/80">Choose a shoot concept <span className="text-xs text-white/30">(optional)</span></legend>
          </div>
          <p className="text-xs leading-relaxed text-white/40">
            Tap any that speak to you. Not sure? Pick &ldquo;No preference&rdquo; and I&apos;ll design it for you.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {preferenceOptions.map(opt => {
              const selected = vibes.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleVibe(opt.id)}
                  className={`relative rounded-xl border px-4 py-3 text-left transition-all ${
                    selected ? 'border-emerald-400 bg-emerald-400/10 ring-2 ring-emerald-400/30' : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                  }`}
                >
                  <div className={`text-sm font-semibold ${selected ? 'text-emerald-300' : 'text-white'}`}>{opt.id}</div>
                  <div className="mt-0.5 text-xs text-white/40">{opt.desc}</div>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Notes — open space for their own idea */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">3</span>
            <label htmlFor="collab-idea" className="text-sm font-medium text-white/80">Anything else? <span className="text-xs text-white/30">(optional)</span></label>
          </div>
          <textarea
            id="collab-idea"
            value={idea}
            onChange={e => { setIdea(e.target.value); clearStatus() }}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            placeholder="Your own idea, inspo, references, anything..."
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">4</span>
            <label className="text-sm font-medium text-white/80">WhatsApp</label>
          </div>
          <div className="flex gap-2">
            <CountryCodeSelect value={countryCode} onChange={code => { setCountryCode(code); clearStatus() }} />
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
          <p className="text-xs text-amber-400/80">Fastest path: submit this and I&apos;ll send the shoot details on WhatsApp.</p>
        </div>

        {/* Instagram — optional */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">5</span>
            <label className="text-sm font-medium text-white/80">Instagram <span className="text-xs text-white/30">(optional)</span></label>
          </div>
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
          <p className="text-xs text-amber-400/80">follow @madebyaidan! 😊</p>
        </div>

        {/* Photos */}
        <div ref={photoRef} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">6</span>
            <label className="text-sm font-medium text-white/80">Photos of yourself <span className="text-xs text-white/30">(optional now)</span></label>
          </div>
          <p className="text-xs leading-relaxed text-white/40">
            Helpful, but not required. Selfies are fine &mdash; you can also send them later on WhatsApp.
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

        {/* Honeypot */}
        <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

        <button
          type="submit"
          disabled={submitting || processingPhotos}
          className="w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50"
          data-cta="sign-up-collab-submit"
        >
          {submitting || processingPhotos ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" aria-label="Loading" />
          ) : 'Save my Ahmedabad spot'}
        </button>
      </form>
    </div>
  )
}
