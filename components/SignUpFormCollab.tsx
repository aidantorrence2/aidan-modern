"use client"
import { useRef, useState } from 'react'
import NextImage from 'next/image'

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

// Concept tiles. The redesign collapsed the seven low-traction culture/personal
// options into a single "Culture & everyday life" tile and re-added Nature and
// Studio (proven demand from the prior form). "No preference" sits in the grid
// as a regular tile but is mutually exclusive with the others.
const NO_PREFERENCE = 'No preference'
type ConceptOption = { id: string; desc: string }
const preferenceOptions: ConceptOption[] = [
  { id: 'Fashion editorial', desc: 'Dramatic, magazine-style' },
  { id: 'Streets & markets', desc: 'Gritty, real city life' },
  { id: 'Nature & outdoors', desc: 'Lakes, hills, greenery, golden light' },
  { id: 'Studio & indoor', desc: 'Cozy interiors, caf\u00e9s, controlled light' },
  { id: 'Culture & everyday life', desc: 'Tradition, dress, temples, real moments' },
  { id: NO_PREFERENCE, desc: "You direct it \u2014 I'll design the shoot" },
]

const locationChips = ['Kolkata', 'Varanasi', 'Agra', 'Jaipur']

const heroImage = '/images/moodboards/editorial.jpg'

export default function SignUpFormCollab() {
  const [state, setState] = useState<State | null>(null)
  const [location, setLocation] = useState('')
  // No default pre-selection: keeps "what did they actually want" measurable
  // instead of everyone inheriting Fashion editorial.
  const [vibes, setVibes] = useState<string[]>([])
  const [idea, setIdea] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
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
    if (photos.length === 0) {
      setState({ ok: false, error: 'Upload a few photos of yourself.' })
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setState(null)
    try {
      const moodboard = [
        'Collab sign-up',
        ...(location.trim() ? ['Location: ' + location.trim()] : []),
        ...(vibes.length > 0 ? ['Preference: ' + vibes.join(', ')] : []),
        ...(idea.trim() ? ['Notes: ' + idea.trim()] : []),
        ...(instagram.trim() ? ['Instagram: ' + instagram.trim()] : []),
      ]
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: location.trim(),
          contactMethod: 'whatsapp',
          contact: whatsappTrim,
          moodboard,
          photos,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setState({ ok: true })
      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab' })
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
          <p className="text-sm text-white/50">I&apos;ll reach out within 24 hours. Let&apos;s make something great together.</p>
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
              <p className="text-sm font-medium text-emerald-400">Free &mdash; we both get content</p>
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
                { icon: '\u{1F3AF}', text: 'Full creative direction from me' },
                { icon: '\u{1F91D}', text: 'A real collaboration, not a transaction' },
                { icon: '\u{1F4AC}', text: 'We plan the concept together' },
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
          Sign Up for Free Collab Photo Shoot
        </h1>
        <p className="text-base leading-relaxed text-white/50">
          Fill out the form below and I&apos;ll send you all the details &mdash; timing, location ideas, what to wear, and next steps.
        </p>

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

      <form onSubmit={onSubmit} className="mt-8 space-y-7">
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
            placeholder="Or type another place — e.g. Mumbai, Goa, Bangalore"
          />
        </div>

        {/* Preference — selectable concepts, fashion editorial is the default */}
        <fieldset className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">2</span>
            <legend className="text-sm font-medium text-white/80">Choose a shoot concept <span className="text-xs text-white/30">(optional — pick any)</span></legend>
          </div>
          <p className="text-xs leading-relaxed text-white/40">
            Tap any that speak to you &mdash; mix as many as you like. Not sure? Pick &ldquo;No preference&rdquo; and I&apos;ll design it for you.
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
          <input
            ref={whatsappRef}
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            name="whatsapp"
            value={whatsapp}
            onChange={e => { setWhatsapp(e.target.value); clearStatus() }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            placeholder="+91 98765 43210"
          />
          <p className="text-xs text-amber-400/80">this is how I will contact you</p>
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
            <label className="text-sm font-medium text-white/80">Photos of yourself</label>
          </div>
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
          ) : 'Sign Up & Get Details'}
        </button>
      </form>

      {/* How it works — same four beats as the ads */}
      <div className="mt-12 space-y-4 border-t border-white/[0.06] pt-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">How it works</p>
        {[
          ['1', 'Sign up.', 'The form above — takes a minute.'],
          ['2', 'Pick your outfit & location.', 'One quick call to lock the time. That’s all the planning.'],
          ['3', 'Show up. We shoot.', 'About an hour. I direct every frame — posing, angles, light.'],
          ['4', 'You get the photos.', 'Edited 35mm scans, yours to keep. Free — we both get content.'],
        ].map(([n, t, d]) => (
          <div key={n} className="flex gap-4">
            <span className="w-5 text-xl font-bold" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#e9c986' }}>{n}</span>
            <div>
              <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{t}</p>
              <p className="text-xs text-white/45">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
