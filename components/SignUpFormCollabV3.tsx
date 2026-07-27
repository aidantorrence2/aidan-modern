"use client"
import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import CountryCodeSelect from './CountryCodeSelect'
import { detectCountry } from '@/lib/detectCountry'
import { cityChipsForCountry, cityExamplesForCountry } from '@/lib/cityChips'
import { initPageAnalytics, track, pageElapsedMs, flushNow } from '@/lib/track'

// v3 "capture-first": the lead (LINE number) is captured with a single
// field in the first viewport; everything else (location, concept, photos,
// IG) moves to a post-capture "boost your chances" step. Analytics showed
// 93% of ad clickers bounced at 0% scroll and the required photo upload
// killed 24% of the rest — so nothing may stand between the hero and the
// number field, and no field after it may cost the lead.
//
// The channel is LINE (Thailand) — it's the phone number on their LINE
// account, so the dial-code detection and E.164 normalization the WhatsApp
// flow shipped with all still apply unchanged. WhatsApp remains available as
// a quiet fallback for the minority not on LINE.

type Step = 'capture' | 'photos' | 'location' | 'instagram' | 'notes' | 'done'

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

const heroImage = '/images/faves/000039-3.jpg'

const proofImages = [
  '/images/moodboards/editorial.jpg',
  '/images/proof/000008-3-2.jpg',
  '/images/proof/000041.jpg',
  '/images/proof/000001-8.jpg',
  '/images/proof/000038-4.jpg',
  '/images/proof/DSC_0347.jpg',
]

// The opening step names whichever channel is selected — see CHANNELS.step.
const howItWorks = [
  'I message you the details — timing, locations, what to wear',
  'We plan the concept together and shoot for 1–2 hours',
  "You get the edited photos — it's 100% free, always",
]

// Add-friend link for the "Aidan Torrence Photo" Official Account (@594xieva).
// LINE can't deliver to a non-friend, so this tap is what opens the channel at
// all — on the LINE path it replaces the number field outright. The "@" is
// percent-encoded because some in-app browsers mangle a bare one in the path.
// Empty disables the button and falls the capture card back to a number field.
const LINE_ADD_URL = 'https://line.me/R/ti/p/%40594xieva'

// Both channels are phone numbers, so the dial-code select, the digit
// validation and the E.164 normalization are shared — only the copy and the
// stored contactMethod differ.
type Channel = 'line' | 'whatsapp'

const CHANNELS: Record<Channel, { name: string; placeholder: string; placeholderIntl: string; step: string }> = {
  line: {
    name: 'LINE',
    placeholder: 'LINE number',
    placeholderIntl: 'LINE number, e.g. +66 81 234 5678',
    step: 'Tap "Add me on LINE" below',
  },
  whatsapp: {
    name: 'WhatsApp',
    placeholder: 'WhatsApp number',
    placeholderIntl: 'WhatsApp number, e.g. +66 81 234 5678',
    step: 'Drop your WhatsApp number below',
  },
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.201 2 1.5 5.79 1.5 10.463c0 4.188 3.727 7.696 8.762 8.36.341.073.805.225.923.516.106.264.069.677.034.945l-.15.897c-.045.265-.21 1.037.909.565 1.12-.472 6.036-3.554 8.234-6.084C21.65 13.998 22.5 12.34 22.5 10.463 22.5 5.79 17.799 2 12 2zM7.79 13.19H5.702a.553.553 0 01-.553-.553V8.462a.553.553 0 111.106 0v3.622H7.79a.553.553 0 010 1.106zm2.166-.553a.553.553 0 01-1.106 0V8.462a.553.553 0 111.106 0v4.175zm5.028 0a.553.553 0 01-.995.332l-2.14-2.914v2.582a.553.553 0 01-1.106 0V8.462a.553.553 0 01.995-.332l2.14 2.914V8.462a.553.553 0 111.106 0v4.175zm3.35-2.641a.553.553 0 010 1.106h-1.535v.982h1.535a.553.553 0 010 1.106h-2.088a.553.553 0 01-.553-.553V8.462a.553.553 0 01.553-.553h2.088a.553.553 0 010 1.106h-1.535v.981h1.535z" />
    </svg>
  )
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.25.69-1.44 1.32-1.99 1.4-.53.08-1.2.11-1.94-.12a17.6 17.6 0 01-1.75-.65c-3.08-1.33-5.09-4.43-5.24-4.63-.15-.2-1.25-1.66-1.25-3.17s.79-2.25 1.07-2.56c.28-.31.61-.38.81-.38h.58c.19 0 .44-.07.69.53.25.6.85 2.08.93 2.23.08.15.13.33.02.53-.1.2-.15.33-.3.5l-.45.53c-.15.15-.3.32-.13.62.17.3.76 1.25 1.62 2.03 1.12 1 2.06 1.3 2.35 1.45.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.3.15.5.22.57.35.07.13.07.75-.18 1.44z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
  )
}

export default function SignUpFormCollabV3({ analyticsPath = '/sign-up-collab' }: { analyticsPath?: string }) {
  const [step, setStep] = useState<Step>('capture')
  const [error, setError] = useState<string | null>(null)

  // Step 1 — the lead. LINE is the default; WhatsApp is the fallback for the
  // minority who aren't on it.
  const [channel, setChannel] = useState<Channel>('line')
  const [phone, setPhone] = useState('')
  // Empty until detection succeeds — with no detected country there's no
  // dial-code dropdown at all and the visitor types the intl code themselves.
  const [countryCode, setCountryCode] = useState('')
  const [countryIso, setCountryIso] = useState<string | null>(null)

  // Step 2 — the boost profile
  const [location, setLocation] = useState('')
  const [idea, setIdea] = useState('')
  const [instagram, setInstagram] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processingPhotos, setProcessingPhotos] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const captureCardRef = useRef<HTMLDivElement>(null)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const engagedFields = useRef<Set<string>>(new Set())
  const lastTracked = useRef<Record<string, string>>({})

  useEffect(() => {
    initPageAnalytics(analyticsPath, { version: 'v3-capture-first' })
    // Same detection the old form shipped with (PRs #27–#30): timezone →
    // country, chips + dial localized, nothing shown until detection succeeds.
    const country = detectCountry()
    if (country) {
      setCountryIso(country.iso)
      setCountryCode(country.dial)
      track('country_detected', { iso: country.iso })
    }
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

  const chips = cityChipsForCountry(countryIso)
  const cityExamples = cityExamplesForCountry(countryIso)

  // The capture CTA doubles as the add-friend tap on the LINE channel.
  const opensLine = channel === 'line' && !!LINE_ADD_URL

  // Quiet on purpose: the capture step is built to put no decision in front of
  // the ask for the LINE majority.
  const fallbackSwitch = (
    <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-neutral-400">
      {channel === 'line' ? (
        <>
          <span>No LINE?</span>
          <button type="button" onClick={() => switchChannel('whatsapp')} className="font-semibold text-neutral-600 underline underline-offset-2 transition hover:text-neutral-900">
            Use WhatsApp
          </button>
        </>
      ) : (
        <>
          <span>Sending to WhatsApp.</span>
          <button type="button" onClick={() => switchChannel('line')} className="font-semibold text-neutral-600 underline underline-offset-2 transition hover:text-neutral-900">
            Back to LINE
          </button>
        </>
      )}
    </p>
  )

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

  // Switching keeps whatever they've typed — it's the same phone number either
  // way, so re-typing it would be the only cost of changing their mind.
  function switchChannel(next: Channel) {
    track('channel_switched', { to: next, had_digits: phone.replace(/\D/g, '').length > 0 })
    setChannel(next)
    setError(null)
    phoneRef.current?.focus()
  }

  function jumpToCapture() {
    track('sticky_cta_clicked')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    phoneRef.current?.focus({ preventScroll: true })
  }

  // ── Step 1: capture the lead ──
  // The transition to step 2 is instant; the POST runs in the background with
  // one silent retry. If it still fails, onEnrichSave/Skip fall back to a
  // fresh full-payload POST — the lead can be delayed but never lost.
  const leadRef = useRef<Promise<{ id: number | null; contact: string } | null> | null>(null)
  const patchChain = useRef<Promise<unknown> | null>(null)

  function startLeadPost(contact: string) {
    const attempt = async (): Promise<{ id: number | null; contact: string }> => {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: '',
          contactMethod: channel,
          contact,
          moodboard: ['Collab sign-up', 'Signup flow: v3-capture-first'],
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error('Failed')
      return {
        id: typeof json.id === 'number' ? json.id : null,
        contact: typeof json.contact === 'string' ? json.contact : contact,
      }
    }
    leadRef.current = attempt()
      .catch(() => new Promise(r => setTimeout(r, 1500)).then(attempt))
      .then(lead => {
        track('submit_success', { channel, elapsed_ms: pageElapsedMs() })
        flushNow()
        if (typeof window !== 'undefined') {
          const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
          if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v3' })
        }
        return lead
      })
      .catch(() => {
        track('submit_error', { elapsed_ms: pageElapsedMs() })
        return null
      })
  }

  function onCapture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { track('honeypot_triggered'); setStep('location'); return }

    // LINE path: nothing is typed, so the tap itself is the conversion. LINE
    // opens (synchronously, so pop-up blockers treat it as user-initiated) and
    // the flow carries on in this tab — the row is written at the end from
    // whatever they fill in on the way.
    if (opensLine) {
      track('line_add_clicked', { placement: 'capture' })
      track('submit_attempt', { channel, digits: 0, elapsed_ms: pageElapsedMs() })
      flushNow()
      // Fired here rather than on a POST: on this path the tap is the lead, so
      // without it the ad account would see no conversions at all.
      const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
      if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v3' })
      window.open(LINE_ADD_URL, '_blank', 'noopener,noreferrer')
      setError(null)
      setStep('location')
      track('slide_shown', { slide: 'location' })
      window.scrollTo({ top: 0 })
      return
    }

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 7) {
      track('validation_error', { reason: `${channel}_invalid` })
      setError(`Please enter your ${CHANNELS[channel].name} number.`)
      phoneRef.current?.focus()
      return
    }

    track('submit_attempt', { channel, country_code: countryCode, digits: digits.length, elapsed_ms: pageElapsedMs() })
    setError(null)
    startLeadPost(countryCode ? countryCode + ' ' + phone.trim() : phone.trim())
    setStep('location')
    track('slide_shown', { slide: 'location' })
    window.scrollTo({ top: 0 })
  }

  // ── Step 2 helpers ──
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

  function moodboardSoFar(): string[] {
    return [
      'Collab sign-up',
      'Signup flow: v3-capture-first',
      ...(location.trim() ? ['Location: ' + location.trim()] : []),
      ...(idea.trim() ? ['Notes: ' + idea.trim()] : []),
      ...(instagram.trim() ? ['Instagram: ' + instagram.trim()] : []),
    ]
  }

  // Each slide advance saves progress in the background. PATCHes are chained
  // so they can never land out of order; photos are sent exactly once (the
  // server appends them).
  function queuePatch(withPhotos?: string[]) {
    const payload = {
      city: location.trim(),
      moodboard: moodboardSoFar(),
      ...(withPhotos && withPhotos.length > 0 ? { photos: withPhotos } : {}),
    }
    patchChain.current = (patchChain.current ?? Promise.resolve())
      .then(async () => {
        const lead = leadRef.current ? await leadRef.current : null
        if (!lead || lead.id === null) return
        const res = await fetch('/api/sign-up', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lead.id, contact: lead.contact, ...payload }),
        })
        if (!res.ok) track('patch_error', { slide: step })
      })
      .catch(() => track('patch_error', { slide: step }))
  }

  function advance(next: Step, save: boolean, withPhotos?: string[]) {
    if (save) queuePatch(withPhotos)
    track('slide_shown', { slide: next })
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  function finishSignup() {
    track('enrich_attempt', {
      photos: photos.length,
      has_location: location.trim().length > 0,
      has_instagram: instagram.trim().length > 0,
      notes_chars: idea.trim().length,
      elapsed_ms: pageElapsedMs(),
    })
    queuePatch()

    // Two cases land here with no row yet: a capture POST that failed, and the
    // LINE path, which never had a number to POST in the first place. Both save
    // everything in one shot. With no number, the Instagram handle is the only
    // contact there is — and when that's blank too, the row is still worth
    // writing for the location and photos.
    const saveInOneShot = () => {
      const typedNumber = countryCode ? countryCode + ' ' + phone.trim() : phone.trim()
      const contact = opensLine
        ? (instagram.trim() || 'LINE — added, no handle given')
        : typedNumber
      fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: location.trim(),
          contactMethod: channel,
          contact,
          moodboard: moodboardSoFar(),
          photos,
        }),
      }).then(res => {
        if (!res.ok) return
        track('submit_success', { channel, recovered: true, elapsed_ms: pageElapsedMs() })
        // Already counted at the tap on the LINE path — don't double-count.
        if (opensLine) return
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v3' })
      }).catch(() => {})
    }

    if (leadRef.current) leadRef.current.then(lead => { if (lead === null) saveInOneShot() })
    else saveInOneShot()
    track('enrich_success', { photos: photos.length, elapsed_ms: pageElapsedMs() })
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
            {/* LINE can't deliver to a non-friend, so this is the tap that
                actually opens the channel — offered at peak intent, right
                after the lead is already saved. */}
            {channel === 'line' && LINE_ADD_URL ? (
              <div className="space-y-2">
                <a
                  href={LINE_ADD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { track('line_add_clicked', { placement: 'done' }); flushNow() }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06C755] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#06C755]/25 transition hover:bg-[#05b34c]"
                  data-cta="sign-up-collab-v3-line-add"
                >
                  <LineIcon className="h-5 w-5" />
                  Add me on LINE
                </a>
                <p className="text-center text-xs text-neutral-400">One tap &mdash; then I can message you straight away.</p>
              </div>
            ) : null}
            <p className="text-sm text-neutral-500">I&apos;ll message you on {CHANNELS[channel].name} within 24 hours. Let&apos;s make something great together.</p>
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

  // ── Slides 2–6: one field per page, instant transitions ──
  const slideKicker = (n: number) => (
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Step {n} of 5</p>
  )
  const slideTitle = (t: string) => (
    <h1 className="mt-1 font-display text-3xl font-semibold text-neutral-900" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{t}</h1>
  )
  const nextBtn = (onClick: () => void, label = 'Next', busy = false) => (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="w-full rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
      data-cta="sign-up-collab-v3-next"
    >
      {busy ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" aria-label="Loading" />
      ) : label}
    </button>
  )
  const skipBtn = (onClick: () => void) => (
    <button type="button" onClick={onClick} className="w-full text-center text-sm font-medium text-neutral-400 underline-offset-2 hover:underline">
      Skip
    </button>
  )
  const errorBox = error ? (
    <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
  ) : null

  if (step === 'photos') {
    return (
      <div className="mx-auto max-w-md px-5 py-8">
        {slideKicker(3)}
        {slideTitle('Photos of yourself')}
        <p className="mt-1.5 text-sm text-neutral-500">Selfies are fine &mdash; just looking to see the real you.</p>
        <div className="mt-4 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
            <CheckIcon className="h-3.5 w-3.5" />
            Like this &mdash; simple &amp; natural, don&apos;t hide your face
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {['/images/collab-examples/good-1.jpg', '/images/collab-examples/good-2.jpg', '/images/collab-examples/good-3.jpg', '/images/collab-examples/good-4.jpg'].map((src, i) => (
              <div key={i} className="relative overflow-hidden rounded-lg border border-emerald-300 aspect-square">
                <NextImage src={src} alt="Good example photo" width={200} height={267} sizes="(max-width: 640px) 25vw, 100px" className="w-full h-full object-cover" />
                <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2.5 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-red-500">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            Not like this &mdash; heavy makeup, filters, face hidden
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {['/images/collab-examples/bad-1.jpg', '/images/collab-examples/bad-2.jpg', '/images/collab-examples/bad-3.jpg', '/images/collab-examples/bad-4.jpg'].map((src, i) => (
              <div key={i} className="relative overflow-hidden rounded-lg border border-red-200 aspect-square">
                <NextImage src={src} alt="Bad example photo" width={150} height={200} sizes="(max-width: 640px) 25vw, 100px" className="w-full h-full object-cover opacity-70 saturate-[0.85]" />
                <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="Preview" className="h-20 w-20 rounded-lg border border-neutral-200 object-cover" />
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
            className="flex h-24 w-full flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
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
        <div className="mt-5 space-y-3">
          {errorBox}
          {nextBtn(() => advance('instagram', photos.length > 0, photos), 'Next', processingPhotos)}
          {skipBtn(() => advance('instagram', false))}
        </div>
      </div>
    )
  }

  if (step === 'location') {
    return (
      <div className="mx-auto max-w-md px-5 py-8">
        {slideKicker(2)}
        {slideTitle('Where are you located?')}
        {chips.length > 0 && <div className="mt-6 flex flex-wrap gap-2">
          {chips.map(chip => (
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
        </div>}
        <input
          value={location}
          onChange={e => { fieldEngaged('location'); setLocation(e.target.value) }}
          onBlur={() => {
            const v = location.trim()
            if (v && !chips.includes(v)) trackOnce('location_selected', v, { method: 'typed', value: v.slice(0, 80) })
          }}
          className={`${inputCls} mt-3`}
          placeholder={
            cityExamples.length > 0
              ? `Or type another place — e.g. ${cityExamples.join(', ')}`
              : chips.length > 0
                ? 'Or type another place'
                : 'Type your city or town'
          }
        />
        <div className="mt-8 space-y-3">
          {errorBox}
          {nextBtn(() => advance('photos', location.trim().length > 0))}
          {skipBtn(() => advance('photos', false))}
        </div>
      </div>
    )
  }

  if (step === 'instagram') {
    return (
      <div className="mx-auto max-w-md px-5 py-8">
        {slideKicker(4)}
        <h1 className="mt-1 font-display text-3xl font-semibold text-neutral-900" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Your Instagram <span className="text-lg font-normal text-neutral-400">(optional)</span>
        </h1>
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
          className={`${inputCls} mt-6`}
          placeholder="@yourhandle"
        />
        <div className="mt-8 space-y-3">
          {nextBtn(() => advance('notes', instagram.trim().length > 0))}
          {skipBtn(() => advance('notes', false))}
        </div>
      </div>
    )
  }

  if (step === 'notes') {
    return (
      <div className="mx-auto max-w-md px-5 py-8">
        {slideKicker(5)}
        {slideTitle('Anything else?')}
        <p className="mt-1.5 text-sm text-neutral-500">Your own idea, inspo, references &mdash; anything.</p>
        <textarea
          id="collab-idea"
          value={idea}
          onChange={e => { fieldEngaged('notes'); setIdea(e.target.value) }}
          onBlur={() => {
            const v = idea.trim()
            if (v) trackOnce('notes_filled', v, { chars: v.length })
          }}
          rows={4}
          className={`${inputCls} mt-6 resize-none`}
          placeholder="Totally optional..."
        />
        <div className="mt-8 space-y-3">
          {nextBtn(finishSignup, 'Finish Sign-Up')}
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
          className="absolute right-5 top-4 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-white/90"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          @madebyaidan
        </a>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
          <h1 className="font-display text-[40px] font-bold leading-[1.05] text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textShadow: '0 2px 8px rgba(0,0,0,0.85), 0 12px 50px rgba(0,0,0,0.6)' }}>
            Sign Up For Free Photo Shoot
          </h1>
        </div>
      </div>

      {/* Capture card — one field, one button */}
      <div ref={captureCardRef} className="relative z-10 mx-4 -mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
        <form onSubmit={onCapture} className="space-y-3">
          <p className="flex items-start gap-2 text-sm leading-snug text-neutral-600">
            {channel === 'line'
              ? <LineIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#06C755]" />
              : <WhatsappIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />}
            <span>I&apos;ll message you on <span className="font-semibold text-neutral-800">{CHANNELS[channel].name}</span> with all the details &mdash; timing, location ideas, what to wear, and next steps.</span>
          </p>
          {/* On LINE the tap replaces the field entirely — nothing to type. */}
          {!opensLine && (
            <>
              <div className="flex gap-2">
                {countryCode && <CountryCodeSelect light value={countryCode} onChange={code => { fieldEngaged('country_code'); track('country_code_changed', { code }); setCountryCode(code); setError(null) }} />}
                <input
                  ref={phoneRef}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  name={channel}
                  value={phone}
                  onChange={e => { fieldEngaged(channel); setPhone(e.target.value); setError(null) }}
                  onBlur={() => {
                    const digits = phone.replace(/\D/g, '')
                    if (digits) trackOnce(`${channel}_filled`, digits, { digits: digits.length })
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder={countryCode ? CHANNELS[channel].placeholder : CHANNELS[channel].placeholderIntl}
                />
              </div>
              {fallbackSwitch}
            </>
          )}
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          {/* Honeypot */}
          <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
          <button
            type="submit"
            className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white shadow-lg transition ${
              opensLine
                ? 'bg-[#06C755] shadow-[#06C755]/25 hover:bg-[#05b34c]'
                : 'bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-500'
            }`}
            data-cta="sign-up-collab-v3-submit"
          >
            {opensLine ? <><LineIcon className="h-5 w-5" />Add me on LINE</> : 'Get Started'}
          </button>
          {opensLine && (
            <>
              <p className="text-center text-sm text-neutral-500">&hellip;then finish signing up :)</p>
              {fallbackSwitch}
            </>
          )}
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
            {[CHANNELS[channel].step, ...howItWorks].map((c, i) => (
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
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
