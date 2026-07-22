"use client"
import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import CountryCodeSelect from './CountryCodeSelect'
import { initPageAnalytics, track, pageElapsedMs, flushNow } from '@/lib/track'

// v3 "capture-first": the lead (WhatsApp number) is captured with a single
// field in the first viewport; everything else (location, concept, photos,
// IG) moves to a post-capture "boost your chances" step. Analytics showed
// 93% of ad clickers bounced at 0% scroll and the required photo upload
// killed 24% of the rest — so nothing may stand between the hero and the
// number field, and no field after it may cost the lead.

type Step = 'capture' | 'enrich' | 'done'

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
  { id: 'Streets & markets', desc: 'Gritty, real city life' },
  { id: 'Nature & outdoors', desc: 'Water, hills, greenery, golden light' },
  { id: 'Studio & indoor', desc: 'Cozy interiors, cafés, controlled light' },
  { id: 'Culture & everyday life', desc: 'Tradition, dress, temples, real moments' },
  { id: NO_PREFERENCE, desc: "You direct it — I'll design the shoot" },
]

const locationChips = ['Anjuna', 'Panjim', 'South Goa']

const heroImage = '/images/proof/000019-6.jpg'

const proofImages = [
  '/images/moodboards/editorial.jpg',
  '/images/proof/000008-3-2.jpg',
  '/images/proof/000041.jpg',
  '/images/proof/000001-8.jpg',
  '/images/proof/000038-4.jpg',
  '/images/proof/DSC_0347.jpg',
]

const howItWorks = [
  'Drop your WhatsApp number below',
  'I message you the details — timing, locations, what to wear',
  'We plan the concept together and shoot for 1–2 hours',
  "You get the edited photos — it's 100% free, always",
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
  )
}

export default function SignUpFormCollabV3({ analyticsPath = '/sign-up-collab' }: { analyticsPath?: string }) {
  const [step, setStep] = useState<Step>('capture')
  const [error, setError] = useState<string | null>(null)

  // Step 1 — the lead
  const [whatsapp, setWhatsapp] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [submitting, setSubmitting] = useState(false)
  const [leadId, setLeadId] = useState<number | null>(null)
  const [leadContact, setLeadContact] = useState('')

  // Step 2 — the boost profile
  const [location, setLocation] = useState('')
  const [vibes, setVibes] = useState<string[]>([])
  const [idea, setIdea] = useState('')
  const [instagram, setInstagram] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const [saving, setSaving] = useState(false)

  // The hero city is swappable per ad set via ?loc= so one page serves every
  // campaign; Goa is the current default target.
  const [heroCity, setHeroCity] = useState('Goa')

  const fileRef = useRef<HTMLInputElement>(null)
  const whatsappRef = useRef<HTMLInputElement>(null)
  const captureCardRef = useRef<HTMLDivElement>(null)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const engagedFields = useRef<Set<string>>(new Set())
  const lastTracked = useRef<Record<string, string>>({})

  useEffect(() => {
    initPageAnalytics(analyticsPath, { version: 'v3-capture-first' })
    try {
      const loc = new URLSearchParams(window.location.search).get('loc')
      if (loc && loc.trim()) {
        setHeroCity(loc.trim().replace(/\b\w/g, c => c.toUpperCase()).slice(0, 40))
      }
    } catch { /* hero keeps its default city */ }
  }, [analyticsPath])

  // The sticky CTA appears only while the capture card is scrolled out of view.
  useEffect(() => {
    if (step !== 'capture' || !captureCardRef.current) return
    const obs = new IntersectionObserver(
      entries => setShowStickyCta(!entries[0].isIntersecting),
      { threshold: 0.1 }
    )
    obs.observe(captureCardRef.current)
    return () => obs.disconnect()
  }, [step])

  function fieldEngaged(field: string) {
    if (engagedFields.current.size === 0) track('form_start', { first_field: field })
    if (!engagedFields.current.has(field)) {
      engagedFields.current.add(field)
      track('field_engaged', { field })
    }
  }

  function trackOnce(event: string, value: string, props: Record<string, string | number | boolean>) {
    if (lastTracked.current[event] === value) return
    lastTracked.current[event] = value
    track(event, props)
  }

  function jumpToCapture() {
    track('sticky_cta_clicked')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    whatsappRef.current?.focus({ preventScroll: true })
  }

  // ── Step 1: capture the lead ──
  async function onCapture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { track('honeypot_triggered'); setStep('enrich'); return }

    const digits = whatsapp.replace(/\D/g, '')
    if (digits.length < 7) {
      track('validation_error', { reason: 'whatsapp_invalid' })
      setError('Please enter your full WhatsApp number.')
      whatsappRef.current?.focus()
      return
    }

    track('submit_attempt', { country_code: countryCode, digits: digits.length, elapsed_ms: pageElapsedMs() })
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: '',
          contactMethod: 'whatsapp',
          contact: countryCode + ' ' + whatsapp.trim(),
          moodboard: ['Collab sign-up', 'Signup flow: v3-capture-first'],
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error('Failed')
      if (typeof json.id === 'number') setLeadId(json.id)
      if (typeof json.contact === 'string') setLeadContact(json.contact)
      track('submit_success', { elapsed_ms: pageElapsedMs() })
      flushNow()
      if (typeof window !== 'undefined') {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v3' })
      }
      setStep('enrich')
      track('enrich_shown')
      window.scrollTo({ top: 0 })
    } catch {
      track('submit_error', { elapsed_ms: pageElapsedMs() })
      setError('Something went wrong. Try again or DM @madebyaidan on IG.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2 helpers ──
  function toggleVibe(v: string) {
    const withoutNoPref = vibes.filter(x => x !== NO_PREFERENCE)
    const next = v === NO_PREFERENCE
      ? (vibes.includes(v) ? [] : [NO_PREFERENCE])
      : (withoutNoPref.includes(v) ? withoutNoPref.filter(x => x !== v) : [...withoutNoPref, v])
    fieldEngaged('concept')
    track('concept_toggled', { concept: v, selected: next.includes(v), total_selected: next.length })
    setVibes(next)
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    fieldEngaged('photos')
    setError(null)
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
        setError(failures === 1
          ? 'One photo could not be added (too large or unsupported format — try a JPG/PNG under 20 MB).'
          : `${failures} photos could not be added (too large or unsupported format — try JPG/PNG under 20 MB).`)
      }
    }
  }

  function removePhoto(index: number) {
    track('photo_removed', { remaining: photos.length - 1 })
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // ── Step 2: enrich the lead (never blocks — the lead is already saved) ──
  async function onEnrichSave() {
    if (processingPhotos) {
      setError('Photos are still processing — hang on a sec and try again.')
      return
    }
    const hasAnything = location.trim() || vibes.length > 0 || idea.trim() || instagram.trim() || photos.length > 0
    if (!hasAnything || leadId === null) {
      track('enrich_skipped', { reason: hasAnything ? 'no_lead_id' : 'empty' })
      setStep('done')
      window.scrollTo({ top: 0 })
      return
    }
    track('enrich_attempt', {
      photos: photos.length,
      concepts: vibes.length,
      has_location: location.trim().length > 0,
      has_instagram: instagram.trim().length > 0,
      notes_chars: idea.trim().length,
      elapsed_ms: pageElapsedMs(),
    })
    setSaving(true)
    setError(null)
    try {
      const moodboard = [
        'Collab sign-up',
        'Signup flow: v3-capture-first',
        ...(location.trim() ? ['Location: ' + location.trim()] : []),
        ...(vibes.length > 0 ? ['Preference: ' + vibes.join(', ')] : []),
        ...(idea.trim() ? ['Notes: ' + idea.trim()] : []),
        ...(instagram.trim() ? ['Instagram: ' + instagram.trim()] : []),
      ]
      const res = await fetch('/api/sign-up', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          contact: leadContact,
          city: location.trim(),
          moodboard,
          photos,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error('Failed')
      track('enrich_success', { photos: photos.length, elapsed_ms: pageElapsedMs() })
      flushNow()
      setStep('done')
      window.scrollTo({ top: 0 })
    } catch {
      track('enrich_error', { elapsed_ms: pageElapsedMs() })
      setError("Couldn't save the extra details — your sign-up itself is safe. Try again, or just skip.")
    } finally {
      setSaving(false)
    }
  }

  function onEnrichSkip() {
    track('enrich_skipped', { reason: 'user_skip' })
    flushNow()
    setStep('done')
    window.scrollTo({ top: 0 })
  }

  const inputCls = 'w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'

  // ── Done ──
  if (step === 'done') {
    return (
      <div className="mx-auto max-w-md px-5 py-10">
        <div className="space-y-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative h-48 overflow-hidden">
            <NextImage src={heroImage} alt="" width={400} height={192} priority sizes="(max-width: 640px) 100vw, 400px" className="w-full h-full object-cover" style={{ filter: 'brightness(0.55) saturate(1.2)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="font-display text-2xl font-semibold text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>You&apos;re in.</p>
            </div>
          </div>
          <div className="px-6 pt-4 pb-6 space-y-5">
            <p className="text-sm text-neutral-500">I&apos;ll message you on WhatsApp within 24 hours. Let&apos;s make something great together.</p>
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
      </div>
    )
  }

  // ── Step 2: enrich ──
  if (step === 'enrich') {
    return (
      <div className="mx-auto max-w-md px-5 py-8">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckIcon className="h-4 w-4" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold text-neutral-900" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>You&apos;re in.</h1>
            <p className="mt-1 text-sm text-neutral-500">I&apos;ll message you on WhatsApp within 24 hours.</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">Want priority? Complete your shoot profile.</p>
          <p className="mt-0.5 text-xs text-emerald-700">Sign-ups with photos get scheduled first &mdash; takes about a minute.</p>
        </div>

        <div className="mt-7 space-y-7">
          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-800">Where are you located?</label>
            <div className="flex flex-wrap gap-2">
              {locationChips.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => { fieldEngaged('location'); track('location_selected', { method: 'chip', value: chip }); setLocation(chip) }}
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
              onChange={e => { fieldEngaged('location'); setLocation(e.target.value) }}
              onBlur={() => {
                const v = location.trim()
                if (v && !locationChips.includes(v)) trackOnce('location_selected', v, { method: 'typed', value: v.slice(0, 80) })
              }}
              className={inputCls}
              placeholder="Or type another place — e.g. Margao, Mapusa, Ponda"
            />
          </div>

          {/* Photos — first among the optionals: it's the one that matters most */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-800">Photos of yourself <span className="text-xs text-neutral-400">(selfies are fine)</span></label>
            <p className="text-xs leading-relaxed text-neutral-500">Simple &amp; natural, don&apos;t hide your face &mdash; just looking to see the real you. No heavy filters.</p>
            <div className="flex flex-wrap gap-1.5">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                className="flex h-24 w-32 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                {processingPhotos ? (
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" aria-label="Processing" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 16V4m0 0L7 9m5-5l5 5" /><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wide">Add photos</span>
                  </>
                )}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
          </div>

          {/* Concept */}
          <fieldset className="space-y-2.5">
            <legend className="text-sm font-medium text-neutral-800">Choose a shoot concept <span className="text-xs text-neutral-400">(pick any)</span></legend>
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

          {/* Instagram */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-800">Instagram</label>
            <input
              value={instagram}
              onChange={e => { fieldEngaged('instagram'); setInstagram(e.target.value) }}
              onBlur={() => {
                const v = instagram.trim()
                if (v) trackOnce('instagram_filled', v, { chars: v.length })
              }}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className={inputCls}
              placeholder="@yourhandle"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="collab-idea" className="text-sm font-medium text-neutral-800">Anything else?</label>
            <textarea
              id="collab-idea"
              value={idea}
              onChange={e => { fieldEngaged('notes'); setIdea(e.target.value) }}
              onBlur={() => {
                const v = idea.trim()
                if (v) trackOnce('notes_filled', v, { chars: v.length })
              }}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Your own idea, inspo, references, anything..."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={onEnrichSave}
              disabled={saving || processingPhotos}
              className="w-full rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
              data-cta="sign-up-collab-v3-enrich"
            >
              {saving || processingPhotos ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" aria-label="Loading" />
              ) : 'Complete My Profile'}
            </button>
            <button type="button" onClick={onEnrichSkip} className="w-full text-center text-sm font-medium text-neutral-400 underline-offset-2 hover:underline">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: capture ──
  return (
    <div className="mx-auto w-full max-w-md">
      {/* Hero — the proof IS the pitch */}
      <div className="relative h-[56vh] min-h-[420px] max-h-[600px] w-full overflow-hidden">
        <NextImage src={heroImage} alt="Photo shoot on 35mm film" fill priority sizes="(max-width: 640px) 100vw, 448px" className="object-cover object-top" />
        <div className="absolute inset-x-0 top-0 h-24" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-3/5" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.88))' }} />
        <div className="absolute left-5 top-4 text-[10px] font-semibold uppercase leading-snug tracking-[0.22em] text-white/85" style={{ fontFamily: 'Georgia, serif' }}>
          Aidan Torrence<br />
          <span className="text-white/55">Photography</span>
        </div>
        <a
          href="https://www.instagram.com/madebyaidan"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('handle_clicked', { placement: 'hero' })}
          className="absolute right-5 top-4 text-[11px] font-semibold tracking-wide text-white/85"
        >
          @madebyaidan
        </a>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Traveling photographer &middot; shot on 35mm film</p>
          <h1 className="mt-1 font-display text-6xl font-semibold leading-none text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {heroCity}
          </h1>
          <p className="mt-1.5 text-2xl font-semibold leading-tight text-white">Free Photo Shoot</p>
          <p className="mt-2 text-sm text-white/85">1&ndash;2 hours &middot; you keep every edited photo &middot; costs nothing</p>
        </div>
      </div>

      {/* Capture card — one field, one button */}
      <div ref={captureCardRef} className="relative z-10 mx-4 -mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
        <form onSubmit={onCapture} className="space-y-3">
          <label className="block text-sm font-medium text-neutral-800">Where can I WhatsApp you the details?</label>
          <div className="flex gap-2">
            <CountryCodeSelect light value={countryCode} onChange={code => { fieldEngaged('country_code'); track('country_code_changed', { code }); setCountryCode(code); setError(null) }} />
            <input
              ref={whatsappRef}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              name="whatsapp"
              value={whatsapp}
              onChange={e => { fieldEngaged('whatsapp'); setWhatsapp(e.target.value); setError(null) }}
              onBlur={() => {
                const digits = whatsapp.replace(/\D/g, '')
                if (digits) trackOnce('whatsapp_filled', digits, { digits: digits.length })
              }}
              className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="98765 43210"
            />
          </div>
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          {/* Honeypot */}
          <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50"
            data-cta="sign-up-collab-v3-submit"
          >
            {submitting ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" aria-label="Loading" />
            ) : 'Get My Free Shoot'}
          </button>
          <p className="text-center text-xs text-neutral-400">Free forever &middot; I reply on WhatsApp within 24 hrs</p>
        </form>
      </div>

      {/* Below the fold — proof and how it works, for the scrollers */}
      <div className="px-5 pb-24 pt-8">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Recent shoots &middot; shot on film</p>
          <div className="grid grid-cols-3 gap-1.5">
            {proofImages.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-lg aspect-[3/4] bg-neutral-100">
                <NextImage src={src} alt="Recent photo shoot" width={200} height={267} sizes="(max-width: 640px) 33vw, 150px" className="w-full h-full object-cover object-top" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">How it works</p>
          <ul className="space-y-2">
            {howItWorks.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon className="h-2.5 w-2.5" />
                </span>
                <span className="text-[13px] leading-snug font-medium text-neutral-700">{c}</span>
              </li>
            ))}
          </ul>
          <p className="pt-2 text-[13px] leading-snug text-neutral-500">
            <span className="font-semibold text-neutral-700">Why free?</span> I&apos;m traveling the world &mdash; this is how I meet new people and capture beautiful places. See my work:{' '}
            <a
              href="https://www.instagram.com/madebyaidan"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('handle_clicked', { placement: 'how_it_works' })}
              className="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2"
            >
              @madebyaidan
            </a>
          </p>
        </div>

        <button
          type="button"
          onClick={jumpToCapture}
          className="mt-8 w-full rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
        >
          Get My Free Shoot
        </button>
      </div>

      {/* Sticky CTA — only while the capture card is off-screen */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto max-w-md">
            <button
              type="button"
              onClick={jumpToCapture}
              className="w-full rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
            >
              Get My Free Shoot
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
