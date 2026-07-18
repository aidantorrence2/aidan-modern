"use client"
import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import CountryCodeSelect from './CountryCodeSelect'
import { initPageAnalytics, track, pageElapsedMs, flushNow } from '@/lib/track'

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
  { id: 'Studio & indoor', desc: 'Cozy interiors, cafés, controlled light' },
  { id: 'Culture & everyday life', desc: 'Tradition, dress, temples, real moments' },
  { id: NO_PREFERENCE, desc: "You direct it — I'll design the shoot" },
]

const locationChips = ['Anjuna / Vagator', 'Baga / Calangute', 'Panaji', 'South Goa']

// Same curated set the earlier "recent work" strip used before it was dropped —
// analytics showed engaged readers bail on a proof-free page, so it's back.
const proofImages = [
  '/images/proof/000001-8.jpg',
  '/images/proof/000019-6.jpg',
  '/images/proof/000038-4.jpg',
  '/images/proof/000041.jpg',
]

const checkmarks = [
  "I will send you the photos — it's 100% free",
  '1–2 hour shoot · we plan the concept together',
  'I reply on WhatsApp within 24 hours',
]

const heroImage = '/images/moodboards/editorial.jpg'

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
  )
}

export default function SignUpFormCollab() {
  const [state, setState] = useState<State | null>(null)
  const [location, setLocation] = useState('')
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
  const engagedFields = useRef<Set<string>>(new Set())
  const lastTracked = useRef<Record<string, string>>({})

  useEffect(() => {
    initPageAnalytics('/sign-up-collab', { version: 'white-v2' })
  }, [])

  // First interaction with any field fires form_start; first interaction with
  // each field fires field_engaged — both once, so funnels stay countable.
  function fieldEngaged(field: string) {
    if (engagedFields.current.size === 0) track('form_start', { first_field: field })
    if (!engagedFields.current.has(field)) {
      engagedFields.current.add(field)
      track('field_engaged', { field })
    }
  }

  // Value-bearing events (typed location, notes length…) fire on blur, once
  // per distinct value, so retyping doesn't spam duplicates.
  function trackOnce(event: string, value: string, props: Record<string, string | number | boolean>) {
    if (lastTracked.current[event] === value) return
    lastTracked.current[event] = value
    track(event, props)
  }

  function clearStatus() {
    if (state) setState(null)
  }

  function toggleVibe(v: string) {
    // "No preference" is mutually exclusive with the concept tiles.
    const withoutNoPref = vibes.filter(x => x !== NO_PREFERENCE)
    const next = v === NO_PREFERENCE
      ? (vibes.includes(v) ? [] : [NO_PREFERENCE])
      : (withoutNoPref.includes(v) ? withoutNoPref.filter(x => x !== v) : [...withoutNoPref, v])
    fieldEngaged('concept')
    track('concept_toggled', { concept: v, selected: next.includes(v), total_selected: next.length })
    setVibes(next)
    clearStatus()
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    fieldEngaged('photos')
    clearStatus()
    setProcessingPhotos(true)
    let failures = 0
    const selected = files.length
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
      track('photos_added', { selected, added: selected - failures, failed: failures, total: photos.length + selected - failures })
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
    track('photo_removed', { remaining: photos.length - 1 })
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { track('honeypot_triggered'); setState({ ok: true }); return }

    if (processingPhotos) {
      track('validation_error', { reason: 'photos_processing' })
      setState({ ok: false, error: 'Photos are still processing — hang on a sec and try again.' })
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const whatsappTrim = whatsapp.trim()
    if (!whatsappTrim) {
      track('validation_error', { reason: 'whatsapp_missing' })
      setState({ ok: false, error: 'Please enter your WhatsApp number.' })
      whatsappRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      whatsappRef.current?.focus()
      return
    }
    if (photos.length === 0) {
      track('validation_error', { reason: 'photos_missing' })
      setState({ ok: false, error: 'Upload a few photos of yourself.' })
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    track('submit_attempt', {
      photos: photos.length,
      concepts: vibes.length,
      has_location: location.trim().length > 0,
      has_instagram: instagram.trim().length > 0,
      notes_chars: idea.trim().length,
      country_code: countryCode,
      elapsed_ms: pageElapsedMs(),
    })
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
          contact: countryCode + ' ' + whatsapp.trim(),
          moodboard,
          photos,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setState({ ok: true })
      track('submit_success', { photos: photos.length, concepts: vibes.length, elapsed_ms: pageElapsedMs() })
      flushNow()
      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab' })
      }
    } catch {
      track('submit_error', { elapsed_ms: pageElapsedMs() })
      setState({ ok: false, error: 'Something went wrong. Try again or DM @madebyaidan on IG.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success ──
  if (state?.ok) {
    return (
      <div className="mt-6 space-y-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="relative h-48 overflow-hidden">
          <NextImage src={heroImage} alt="" width={400} height={192} priority sizes="(max-width: 640px) 100vw, 400px" className="w-full h-full object-cover" style={{ filter: 'brightness(0.55) saturate(1.2)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="font-display text-2xl font-semibold text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>You&apos;re in.</p>
          </div>
        </div>
        <div className="px-6 pt-4 pb-6 space-y-5">
          <p className="text-sm text-neutral-500">I&apos;ll reach out within 24 hours. Let&apos;s make something great together.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Type</p>
              <p className="text-sm font-medium text-neutral-900">TFP Collaboration</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Duration</p>
              <p className="text-sm font-medium text-neutral-900">1&ndash;2 hours</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Cost</p>
              <p className="text-sm font-medium text-emerald-600">Free &mdash; we both get content</p>
            </div>
            {vibes.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Preference</p>
                <p className="text-sm font-medium text-neutral-900">{vibes.join(', ')}</p>
              </div>
            )}
          </div>
          {idea.trim() && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Notes</p>
              <p className="text-sm font-medium leading-relaxed text-neutral-900">{idea.trim()}</p>
            </div>
          )}
          <div className="h-px bg-neutral-100" />
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">What to expect</p>
            <div className="space-y-2.5">
              {[
                { icon: '\u{1F4F8}', text: 'Edited photos you can use however you want' },
                { icon: '\u{1F3AF}', text: 'Full creative direction from me' },
                { icon: '\u{1F91D}', text: 'A real collaboration, not a transaction' },
                { icon: '\u{1F4AC}', text: 'We plan the concept together' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-neutral-600">{item.text}</span>
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
      {/* Wordmark */}
      <p className="text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-neutral-900" style={{ fontFamily: 'Georgia, serif' }}>
        Aidan Torrence<br />
        <span className="text-neutral-400">Photography</span>
      </p>

      <div className="mt-6 space-y-5">
        <h1 className="font-display text-3xl font-semibold leading-[1.05] text-neutral-900 sm:text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
          Sign Up for Free Collab Photo Shoot
        </h1>
        <p className="text-base leading-relaxed text-neutral-500">
          Fill out the form below and I&apos;ll send you all the details &mdash; timing, location ideas, what to wear, and next steps.
        </p>

        {/* Checkmarks */}
        <ul className="space-y-2.5">
          {checkmarks.map((c, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span className="text-sm font-medium text-neutral-700">{c}</span>
            </li>
          ))}
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium text-neutral-700">
              <span className="font-semibold text-neutral-900">Why?</span> I&apos;m traveling the world and want to meet new people and capture each place&apos;s beauty
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium text-neutral-700">
              See my work:{' '}
              <a
                href="https://www.instagram.com/madebyaidan"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('handle_clicked', { placement: 'checkmarks' })}
                className="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2"
              >
                @madebyaidan
              </a>
            </span>
          </li>
        </ul>

        {/* How it works */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">How it works</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-700">
            Sign up &rarr; I message you on WhatsApp &rarr; we plan the concept and choose a location, and I will send you the photos &mdash; free.
          </p>
        </div>

        {/* Proof strip */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-1.5">
            {proofImages.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-lg aspect-[3/4] bg-neutral-100">
                <NextImage src={src} alt="Recent photo shoot" width={200} height={267} priority={i < 2} sizes="(max-width: 640px) 25vw, 100px" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Recent work &middot; shot on film</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-7">
        {state && !state.ok && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state.error}
          </div>
        )}

        {/* Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">1</span>
            <label className="text-sm font-medium text-neutral-800">Where are you located?</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {locationChips.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => { fieldEngaged('location'); track('location_selected', { method: 'chip', value: chip }); setLocation(chip); clearStatus() }}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                  location.trim() === chip
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-800'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          <input
            value={location}
            onChange={e => { fieldEngaged('location'); setLocation(e.target.value); clearStatus() }}
            onBlur={() => {
              const v = location.trim()
              if (v && !locationChips.includes(v)) trackOnce('location_selected', v, { method: 'typed', value: v.slice(0, 80) })
            }}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Or type another place — e.g. Margao, Mapusa, Ponda"
          />
        </div>

        {/* Preference — selectable concepts */}
        <fieldset className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">2</span>
            <legend className="text-sm font-medium text-neutral-800">Choose a shoot concept <span className="text-xs text-neutral-400">(optional — pick any)</span></legend>
          </div>
          <p className="text-xs leading-relaxed text-neutral-500">
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
                    selected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className={`text-sm font-semibold ${selected ? 'text-emerald-700' : 'text-neutral-900'}`}>{opt.id}</div>
                  <div className="mt-0.5 text-xs text-neutral-500">{opt.desc}</div>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Notes — open space for their own idea */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">3</span>
            <label htmlFor="collab-idea" className="text-sm font-medium text-neutral-800">Anything else? <span className="text-xs text-neutral-400">(optional)</span></label>
          </div>
          <textarea
            id="collab-idea"
            value={idea}
            onChange={e => { fieldEngaged('notes'); setIdea(e.target.value); clearStatus() }}
            onBlur={() => {
              const v = idea.trim()
              if (v) trackOnce('notes_filled', v, { chars: v.length })
            }}
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Your own idea, inspo, references, anything..."
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">4</span>
            <label className="text-sm font-medium text-neutral-800">WhatsApp</label>
          </div>
          <div className="flex gap-2">
            <CountryCodeSelect value={countryCode} onChange={code => { fieldEngaged('country_code'); track('country_code_changed', { code }); setCountryCode(code); clearStatus() }} />
            <input
              ref={whatsappRef}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              name="whatsapp"
              value={whatsapp}
              onChange={e => { fieldEngaged('whatsapp'); setWhatsapp(e.target.value); clearStatus() }}
              onBlur={() => {
                const digits = whatsapp.replace(/\D/g, '')
                if (digits) trackOnce('whatsapp_filled', digits, { digits: digits.length })
              }}
              className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="98765 43210"
            />
          </div>
          <p className="text-xs text-amber-600">this is how I will contact you</p>
        </div>

        {/* Instagram — optional */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">5</span>
            <label className="text-sm font-medium text-neutral-800">Instagram <span className="text-xs text-neutral-400">(optional)</span></label>
          </div>
          <input
            name="instagram"
            value={instagram}
            onChange={e => { fieldEngaged('instagram'); setInstagram(e.target.value); clearStatus() }}
            onBlur={() => {
              const v = instagram.trim()
              if (v) trackOnce('instagram_filled', v, { chars: v.length })
            }}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="@yourhandle"
          />
          <p className="text-xs text-amber-600">follow @madebyaidan! 😊</p>
        </div>

        {/* Photos */}
        <div ref={photoRef} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">6</span>
            <label className="text-sm font-medium text-neutral-800">Photos of yourself</label>
          </div>
          <p className="text-xs leading-relaxed text-neutral-500">
            Selfies are fine &mdash; just looking to see the real you.
          </p>
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
              <CheckIcon className="h-3.5 w-3.5" />
              Like this &mdash; simple &amp; natural, don&apos;t hide your face
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {['/images/collab-examples/good-1.jpg', '/images/collab-examples/good-2.jpg', '/images/collab-examples/good-3.jpg', '/images/collab-examples/good-4.jpg'].map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg border border-emerald-300 aspect-[3/4]">
                  <NextImage src={src} alt="Good example photo" width={200} height={267} sizes="(max-width: 640px) 25vw, 100px" className="w-full h-full object-cover" />
                  <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-red-500">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
              Not like this &mdash; heavy makeup, filters, face hidden
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {['/images/collab-examples/bad-1.jpg', '/images/collab-examples/bad-2.jpg', '/images/collab-examples/bad-3.jpg', '/images/collab-examples/bad-4.jpg'].map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg border border-red-200 aspect-[3/4]">
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
                <img src={p} alt="Preview" className="h-14 w-14 rounded-lg border border-neutral-200 object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-500 text-xs text-white transition hover:bg-red-500"
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
              className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-4xl font-light text-neutral-400 transition hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-50"
            >
              {processingPhotos ? (
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-emerald-500" aria-label="Processing" />
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
          className="w-full rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
          data-cta="sign-up-collab-submit"
        >
          {submitting || processingPhotos ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" aria-label="Loading" />
          ) : 'Sign Up & Get Details'}
        </button>
      </form>
    </div>
  )
}
