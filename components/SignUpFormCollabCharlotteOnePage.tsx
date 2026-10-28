"use client"
import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import { Instrument_Serif } from 'next/font/google'
import CountryCodeSelect from './CountryCodeSelect'
import { detectPhoneCountry } from '@/lib/detectCountry'
import { initPageAnalytics, track, pageElapsedMs, flushNow } from '@/lib/track'

// v7d: the Charlotte form as ONE page. Vibe, contact, photo, (Instagram for
// phone sign-ups) and notes all sit on the landing page under Sign up, with a
// single Finish Sign-Up button. No steps.
//
// Charlotte edition of the v4 "tap-first" form (v7 in data/collab-versions.html).
// Changes from v4: every photo is from new_top_tier_headliners; there is no
// "where are you" step (the shoot is in Charlotte), so the landing card asks
// for the look instead and one tap starts the flow; contact is Instagram
// (default) or phone, and Instagram sign-ups skip the separate handle step.

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap' })
const SERIF = serif.style.fontFamily

type Step = 'location' | 'vibe' | 'notes' | 'photos' | 'instagram' | 'done'

// 'location' is kept as the landing step's name for resume compatibility; it
// now asks for the look.
const BACK_TO: Partial<Record<Step, Step>> = {
  vibe: 'location', photos: 'vibe', instagram: 'photos', notes: 'instagram',
}
const CITY = 'Charlotte'
const CITY_FULL = 'Charlotte, NC'

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

// The hero cycles. It opens on the bubbles frame and crossfades on, so the
// first thing the page does is show more work rather than sit still.
const HERO_SLIDES = [
  '/images/new_top_tier_headliners_web/000014.jpg',
  '/images/new_top_tier_headliners_web/R1-09793-0028.jpg',
  '/images/new_top_tier_headliners_web/R1-00005-0027.jpg',
  '/images/new_top_tier_headliners_web/R1-09798-032A.jpg',
  '/images/new_top_tier_headliners_web/R1-09952-0019.jpg',
]
const heroImage = HERO_SLIDES[0]

const proofImages = [
  '/images/new_top_tier_headliners_web/R1-00008-0005.jpg',
  '/images/new_top_tier_headliners_web/R1-09793-0028.jpg',
  '/images/new_top_tier_headliners_web/R1-09997-0003.jpg',
  '/images/new_top_tier_headliners_web/R1-00009-0021.jpg',
  '/images/new_top_tier_headliners_web/R1-09952-0019.jpg',
  '/images/new_top_tier_headliners_web/R1-09997-0011.jpg',
]

const howItWorks = [
  'Share your preferences',
  'I message you the details — timing, locations, what to wear',
  'We plan the concept together and shoot for 1–2 hours',
  "You get the edited photos — it's 100% free, always",
]

type VibeKey = 'street' | 'nature' | 'indoor' | 'any'

// Frame 1. Real frames from the portfolio, not swatches — the tile IS the
// pitch for that look. No single photograph stands for "any", so that one is a
// quarter-grid of the others: it reads as a bit of everything and still sits in
// the row as an image tile rather than a beige box among photographs.
// Each look is a small moodboard of editorial references from the picker
// library; "No preference" is deliberately blank.
const VIBES: { key: VibeKey; label: string; board: string[] }[] = [
  { key: 'street', label: 'Street', board: ['/images/pinterest/69bb96c034c12146decfa85a0ce55316.jpg', '/images/pinterest/7c00515e28ca183d63ecc24e55be119e.jpg', '/images/pinterest/9a6780eb667fe440ae6f2a15d2dc2496.jpg', '/images/pinterest/ccc14f116eb8ca90fc4464786efc6f1d.jpg'] },
  { key: 'nature', label: 'Nature', board: ['/images/pinterest/24210711b4260f21946c0951d4916f08.jpg', '/images/pinterest/99a3e5dccb2285f0128a9ccac5e4c6fd.jpg', '/images/pinterest/d40856ff2db31b0a67f57e9aaaff9975.jpg', '/images/pinterest/8e7b891866e37079a616f6e0be91d930.jpg'] },
  { key: 'indoor', label: 'Indoor', board: ['/images/pinterest/0abbec603ab8b5d733961ff67a0a782a.jpg', '/images/pinterest/136d123eddd4961d1842f6990f529b7d.jpg', '/images/pinterest/517b708768144f5d53a57d4ed2a9822a.jpg', '/images/pinterest/16e3fdc791b8418141c5d51e527fb695.jpg'] },
  { key: 'any', label: 'No preference', board: [] },
]

// ONE roll of film. Each slide shows a four-frame window into it, two frames
// further on than the last, so moving through the form winds the same roll
// forward. It wraps, so the roll never runs out however many frames there are.
const ROLL = [
  '/images/new_top_tier_headliners_web/R1-00007-025A.jpg',
  '/images/new_top_tier_headliners_web/R1-09997-0005.jpg',
  '/images/new_top_tier_headliners_web/R1-00009-0028.jpg',
  '/images/new_top_tier_headliners_web/000089.jpg',
  '/images/new_top_tier_headliners_web/R1-09997-0009.jpg',
  '/images/new_top_tier_headliners_web/R1-09799-0025.jpg',
  '/images/new_top_tier_headliners_web/R1-00005-0027.jpg',
  '/images/new_top_tier_headliners_web/R1-09953-010A.jpg',
  '/images/new_top_tier_headliners_web/000014.jpg',
  '/images/new_top_tier_headliners_web/R1-09798-032A.jpg',
]

function rollAt(stepNo: number) {
  const offset = (stepNo - 1) * 2
  return {
    frames: Array.from({ length: 4 }, (_, i) => ROLL[(offset + i) % ROLL.length]),
    from: 11 + offset,
  }
}

// ── Resume ──
// A snapshot per move, so a visitor who leaves mid-flow comes back to the frame
// they left holding the row they already made. localStorage, not
// sessionStorage: the way back is usually a fresh tab.
const RESUME_TTL_MS = 24 * 60 * 60 * 1000
const resumeKey = (path: string) => `atf_signup_resume:${path}`

type Channel = 'instagram' | 'phone'

type ResumeState = {
  // Bumped to 2 when v4 took over /sign-up-collab. A v1 snapshot came from v3,
  // where 'capture' was the FIRST frame rather than the fourth — restoring one
  // would drop a returning visitor into the wrong place. Old ones are dropped.
  v: 3
  ts: number
  step: Step
  channel: Channel
  vibe: VibeKey | null
  phone: string
  countryCode: string
  location: string
  idea: string
  instagram: string
  photos: string[]
  lead: { id: number | null; contact: string } | null
  postedContact: string | null
  leadFired: boolean
}

const CHANNELS: Record<Channel, { name: string; doneVia: string }> = {
  instagram: { name: 'Instagram', doneVia: 'on Instagram' },
  phone: { name: 'Phone', doneVia: 'by text' },
}

// Motion for the slides. The card rises as the ribbon winds on, frames catching
// up one at a time, so consecutive steps read as one take.
const slideMotionCss = `
@keyframes atfCardIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
@keyframes atfWindOnBack { from { opacity: 0; translate: 34px 26px } to { opacity: 0.35; translate: none } }
@keyframes atfFrameIn { from { opacity: 0; translate: 26px 18px } to { opacity: 1; translate: none } }
.atf-card { animation: atfCardIn 520ms cubic-bezier(.22,1,.36,1) both }
.atf-ribbon-back { animation: atfWindOnBack 860ms cubic-bezier(.19,1,.28,1) both }
.atf-frame { animation: atfFrameIn 620ms cubic-bezier(.19,1,.28,1) both }
@keyframes atfShimmer { 0% { transform: translateX(-160%) } 55%, 100% { transform: translateX(260%) } }
@keyframes atfWobble { 0%, 84%, 100% { transform: rotate(0deg) scale(1) } 88% { transform: rotate(-7deg) scale(1.06) } 92% { transform: rotate(6deg) scale(1.06) } 96% { transform: rotate(-3deg) scale(1.02) } }
.atf-shimmer { animation: atfShimmer 3s cubic-bezier(.4,0,.2,1) infinite }
.atf-wobble { animation: atfWobble 4.4s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .atf-card, .atf-ribbon-back, .atf-frame, .atf-shimmer, .atf-wobble { animation: none } }
`

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4.5" /><circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
  )
}

export default function SignUpFormCollabCharlotteOnePage({ analyticsPath = '/sign-up-collab-v7d' }: { analyticsPath?: string }) {
  const [step, setStep] = useState<Step>('location')
  const [error, setError] = useState<string | null>(null)

  const [vibe, setVibe] = useState<VibeKey | null>(null)
  const location = CITY_FULL
  const [idea, setIdea] = useState('')
  const [channel, setChannel] = useState<Channel>('instagram')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('')
    const [instagram, setInstagram] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processingPhotos, setProcessingPhotos] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const pickerCardRef = useRef<HTMLDivElement>(null)
  const vibeRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const engagedFields = useRef<Set<string>>(new Set())
  const lastTracked = useRef<Record<string, string>>({})

  // The row this visitor owns. The ref is what the PATCH chain awaits; the
  // state mirror is what gets snapshotted, so a resumed visitor enriches the
  // same entry rather than creating a second one.
  const leadRef = useRef<Promise<{ id: number | null; contact: string } | null> | null>(null)
  const patchChain = useRef<Promise<unknown> | null>(null)
  const [leadRecord, setLeadRecord] = useState<{ id: number | null; contact: string } | null>(null)
  const [postedContact, setPostedContact] = useState<string | null>(null)
  const [leadFired, setLeadFired] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    initPageAnalytics(analyticsPath, { version: 'v7d-charlotte-onepage' })

    let resumed: ResumeState | null = null
    try {
      const raw = localStorage.getItem(resumeKey(analyticsPath))
      if (raw) {
        const saved = JSON.parse(raw) as ResumeState
        if (saved?.v === 3 && Date.now() - saved.ts < RESUME_TTL_MS) resumed = saved
        else localStorage.removeItem(resumeKey(analyticsPath))
      }
    } catch {}

    if (resumed) {
      setStep(resumed.step === 'done' ? 'done' : 'location')
      setChannel(resumed.channel)
      setVibe(resumed.vibe)
      setPhone(resumed.phone)
      setCountryCode(resumed.countryCode)
      setIdea(resumed.idea)
      setInstagram(resumed.instagram)
      setPhotos(resumed.photos)
      setPostedContact(resumed.postedContact)
      setLeadFired(resumed.leadFired)
      if (resumed.lead) {
        setLeadRecord(resumed.lead)
        leadRef.current = Promise.resolve(resumed.lead)
      }
      track('flow_resumed', { slide: resumed.step, has_row: !!resumed.lead, away_ms: Date.now() - resumed.ts })
    }

    // Dial code from the locale region; Charlotte visitors default to +1.
    const phoneCountry = detectPhoneCountry()
    if (!resumed?.countryCode) setCountryCode(phoneCountry?.dial ?? '+1')
    if (phoneCountry) track('country_detected', { dial_iso: phoneCountry.iso })
    setHydrated(true)
  }, [analyticsPath])

  function persistResume() {
    const touched = step !== 'location' || !!vibe
    if (!touched) return
    const base: Omit<ResumeState, 'photos'> = {
      v: 3, ts: Date.now(), step, channel, vibe, phone, countryCode,
      location, idea, instagram, lead: leadRecord, postedContact, leadFired,
    }
    const write = (withPhotos: string[]) =>
      localStorage.setItem(resumeKey(analyticsPath), JSON.stringify({ ...base, photos: withPhotos }))
    try {
      // resizeImage caps each photo at 300 KB, so a realistic set fits the
      // ~5 MB quota several times over; the catch covers the outliers.
      write(photos)
    } catch {
      try { write([]) } catch {}
    }
  }

  // Discrete moves are written at once; typing coalesces.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (hydrated) persistResume() }, [hydrated, step, channel, vibe, photos, leadRecord, postedContact, leadFired])
  useEffect(() => {
    if (!hydrated) return
    const t = setTimeout(persistResume, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, phone, countryCode, idea, instagram])

  // The sticky CTA appears only while the picker is scrolled out of view.
  useEffect(() => {
    if (!pickerCardRef.current) return
    const obs = new IntersectionObserver(entries => setShowStickyCta(!entries[0].isIntersecting), { threshold: 0.1 })
    obs.observe(pickerCardRef.current)
    return () => obs.disconnect()
  }, [])

  // Hero crossfade. Stopped entirely for anyone who asked for less motion —
  // they get the opening frame and nothing moves.
  useEffect(() => {
    let reduced = false
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch {}
    if (reduced) return
    const t = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 4200)
    return () => clearInterval(t)
  }, [])

  const totalSlides = channel === 'instagram' ? 4 : 5
  const slideNo: Record<Exclude<Step, 'done'>, number> = { location: 1, vibe: 2, photos: 3, instagram: 4, notes: channel === 'instagram' ? 4 : 5 }

  // The card swaps in place, so a move scrolls the card (not the page top) into view.
  function scrollToCard() {
    requestAnimationFrame(() => pickerCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

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

  function moodboardSoFar(): string[] {
    const vibeLabel = VIBES.find(v => v.key === vibe)?.label
    return [
      'Collab sign-up',
      'Signup flow: v7d-charlotte-onepage',
      ...(vibeLabel ? ['Look: ' + vibeLabel] : []),
      'Location: ' + location,
      ...(idea.trim() ? ['Notes: ' + idea.trim()] : []),
      ...(instagram.trim() && channel !== 'instagram' ? ['Instagram: ' + instagram.trim()] : []),
    ]
  }

  // ── The lead ──
  // Nothing is written until frame 4, because until then there's no way to
  // reach anyone. The POST runs in the background with one silent retry so the
  // advance to frame 5 is instant.
  function startLeadPost(contact: string) {
    setPostedContact(contact)
    const attempt = async (): Promise<{ id: number | null; contact: string }> => {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: CITY, contactMethod: channel, contact, moodboard: moodboardSoFar() }),
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
        setLeadRecord(lead)
        if (typeof window !== 'undefined' && !leadFired) {
          const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
          if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v7d' })
          setLeadFired(true)
        }
        return lead
      })
      .catch(() => {
        track('submit_error', { elapsed_ms: pageElapsedMs() })
        return null
      })
  }

  // One submit for the whole page: everything goes in a single POST.
  async function onSubmitAll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { track('honeypot_triggered'); setStep('done'); return }

    if (!vibe) {
      track('validation_error', { reason: 'vibe_missing' })
      setError('Please pick a vibe.')
      vibeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    let typed: string
    if (channel === 'instagram') {
      const handle = instagram.trim().replace(/^@+/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/.*$/, '')
      if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
        track('validation_error', { reason: 'instagram_invalid' })
        setError('Please enter your Instagram username.')
        pickerCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        phoneRef.current?.focus({ preventScroll: true })
        return
      }
      typed = '@' + handle
    } else {
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 7) {
        track('validation_error', { reason: 'phone_invalid' })
        setError('Please enter your phone number.')
        pickerCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        phoneRef.current?.focus({ preventScroll: true })
        return
      }
      typed = countryCode ? countryCode + ' ' + phone.trim() : phone.trim()
    }
    if (photos.length === 0) {
      track('validation_error', { reason: 'photo_missing' })
      setError("Add one photo of yourself so I know who I'm shooting.")
      photoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setError(null)
    setSubmitting(true)
    track('submit_attempt', { channel, photos: photos.length, elapsed_ms: pageElapsedMs() })
    const send = async () => {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: CITY, contactMethod: channel, contact: typed, moodboard: moodboardSoFar(), photos }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error('Failed')
    }
    try {
      await send().catch(() => new Promise(r => setTimeout(r, 1500)).then(send))
      track('submit_success', { channel, elapsed_ms: pageElapsedMs() })
      flushNow()
      const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
      if (typeof fbq === 'function' && !leadFired) { fbq('track', 'Lead', { source: 'sign-up-collab-v7d' }); setLeadFired(true) }
      setStep('done')
      scrollToCard()
    } catch {
      track('submit_error', { elapsed_ms: pageElapsedMs() })
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function onCapture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { track('honeypot_triggered'); advance('vibe'); return }

    let typed: string
    if (channel === 'instagram') {
      const handle = instagram.trim().replace(/^@+/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/.*$/, '')
      if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
        track('validation_error', { reason: 'instagram_invalid' })
        setError('Please enter your Instagram username.')
        phoneRef.current?.focus()
        return
      }
      typed = '@' + handle
      track('submit_attempt', { channel, chars: handle.length, elapsed_ms: pageElapsedMs() })
    } else {
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 7) {
        track('validation_error', { reason: 'phone_invalid' })
        setError('Please enter your phone number.')
        phoneRef.current?.focus()
        return
      }
      typed = countryCode ? countryCode + ' ' + phone.trim() : phone.trim()
      track('submit_attempt', { channel, country_code: countryCode, digits: digits.length, elapsed_ms: pageElapsedMs() })
    }
    setError(null)
    // Backing up and coming through again re-uses the row — unless the contact
    // itself changed, in which case the old row holds one they've corrected.
    if (!leadRef.current || postedContact !== typed) startLeadPost(typed)
    advance('vibe')
  }

  // Each advance past the ask saves in the background. PATCHes are chained so
  // they can never land out of order; photos are sent exactly once.
  function queuePatch(withPhotos?: string[]) {
    const payload = {
      city: CITY,
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

  function advance(next: Step, save = false, withPhotos?: string[]) {
    if (save) queuePatch(withPhotos)
    track('slide_shown', { slide: next })
    setError(null)
    setStep(next)
    scrollToCard()
  }

  // Back never saves — they're on their way to change something, and the PATCH
  // for whatever they change lands on the next forward move.
  function goBack(prev: Step) {
    track('slide_back', { from: step, to: prev })
    setError(null)
    setStep(prev)
    scrollToCard()
  }

  // A finished sign-up is held for a day, so returning shows the done screen
  // rather than a blank form. This is the way past it — a shared phone, or a
  // friend signing up next. Clears the snapshot and everything tied to the row
  // so the next run starts a genuinely new one.
  function startOver() {
    track('start_over_clicked', { from: step })
    try { localStorage.removeItem(resumeKey(analyticsPath)) } catch {}
    leadRef.current = null
    patchChain.current = null
    engagedFields.current = new Set()
    lastTracked.current = {}
    setLeadRecord(null)
    setPostedContact(null)
    setLeadFired(false)
    setVibe(null)
    setPhone('')
    setIdea('')
    setInstagram('')
    setPhotos([])
    setError(null)
    setStep('location')
    scrollToCard()
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
        if (file.size > 20 * 1024 * 1024) { failures++; continue }
        try {
          const raw = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(new Error('Could not read file'))
            reader.readAsDataURL(file)
          })
          const resized = await resizeImage(raw, 300 * 1024)
          setPhotos(prev => [...prev, resized])
        } catch { failures++ }
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

  function finishSignup() {
    track('enrich_attempt', {
      photos: photos.length,
      has_instagram: instagram.trim().length > 0,
      elapsed_ms: pageElapsedMs(),
    })
    queuePatch()

    // Only one case lands here with no row: the capture POST failed, twice.
    // Save everything in one shot rather than lose it.
    const saveInOneShot = () => {
      fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: CITY,
          contactMethod: channel,
          contact: channel === 'instagram' ? '@' + instagram.trim().replace(/^@+/, '') : (countryCode ? countryCode + ' ' + phone.trim() : phone.trim()),
          moodboard: moodboardSoFar(),
          photos,
        }),
      }).then(res => {
        if (!res.ok) return
        track('submit_success', { channel, recovered: true, elapsed_ms: pageElapsedMs() })
        if (leadFired) return
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v7d' })
      }).catch(() => {})
    }

    if (leadRef.current) leadRef.current.then(lead => { if (lead === null) saveInOneShot() })
    else saveInOneShot()
    track('enrich_success', { photos: photos.length, elapsed_ms: pageElapsedMs() })
    flushNow()
    setStep('done')
    scrollToCard()
  }

  const inputCls = 'w-full rounded-[3px] border border-neutral-300 bg-white px-4 py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-800 focus:bg-white focus:ring-4 focus:ring-neutral-900/10'

  // ── The roll ──
  // He shoots film, so the proof is film, and the roll doesn't lie flat. Each
  // frame sits on a sine, tilted to the tangent and overlapped with its
  // neighbours. The phase shifts by step, so the ribbon is caught mid-travel at
  // a different point on every frame.
  const sprockets = (small = false) => (
    <div className={small ? 'h-[5px] w-full' : 'h-[6px] w-full'} aria-hidden="true" style={{
      backgroundImage: 'repeating-linear-gradient(to right, #d9d3c6 0 7px, transparent 7px 18px)',
      backgroundSize: '18px 3px',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat-x',
    }} />
  )
  const cell = (src: string, no: number, i: number, small: boolean) => (
    <div className={`bg-[#17150f] px-[3px] ${small ? 'py-[3px]' : 'py-[4px]'} shadow-[0_18px_30px_-20px_rgba(23,21,15,0.95)]`}>
      {sprockets(small)}
      <div className="relative overflow-hidden bg-black" style={{ height: small ? 92 : 124 }}>
        <NextImage src={src} alt="" width={260} height={340} sizes={small ? '88px' : '128px'} className="h-full w-full object-cover" />
      </div>
      {sprockets(small)}
      <div className="flex justify-start pl-1 pt-[1px]">
        <span className="text-[6px] font-bold tracking-[0.22em] text-[#e0a13f]">{no}{i % 2 === 0 ? 'A' : ''}</span>
      </div>
    </div>
  )
  const ribbon = (stepNo: number) => {
    const { frames, from } = rollAt(stepNo)
    const phase = (stepNo - 1) * 0.75
    const trail = ROLL.slice(6, 9)
    return (
      <div className="relative mt-2 -mx-4 h-[214px] select-none overflow-hidden" aria-hidden="true">
        {trail.map((src, i) => {
          const t = i + phase + 2.4
          return (
            <div key={`t-${src}`} className="atf-ribbon-back absolute w-[86px] opacity-[0.35]" style={{
              left: `${4 + i * 27}%`,
              top: 74 + Math.sin(t * 0.8) * 28,
              transform: `rotate(${Math.cos(t * 0.8) * 9}deg)`,
              animationDelay: `${i * 80}ms`,
            }}>
              {cell(src, from + 6 + i, i, true)}
            </div>
          )
        })}
        {frames.map((src, i) => {
          const t = i + phase
          return (
            <div key={`${src}-${i}`} className="atf-frame absolute w-[118px]" style={{
              left: `${-9 + i * 25}%`,
              top: 22 + Math.sin(t * 0.8) * 32,
              transform: `rotate(${Math.cos(t * 0.8) * 8}deg)`,
              animationDelay: `${120 + i * 90}ms`,
            }}>
              {cell(src, from + i, i, false)}
            </div>
          )
        })}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f4f1ec] to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f4f1ec] to-transparent" />
      </div>
    )
  }

  // ── The shell every frame shares ──
  // Frame 1 included: it used to be a white page with a full-bleed hero and its
  // own card, which announced that it wasn't part of the set.
  // Every step renders inside the landing page's sign-up card.
  const slideShell = (_stepNo: number, children: React.ReactNode) => page(
    <div key={step} className="atf-card">{children}</div>
  )

  const kicker = (n: number, back?: Step) => (
    <div className="flex items-center gap-2.5">
      {back ? (
        <button
          type="button"
          onClick={() => goBack(back)}
          className="-ml-1 flex shrink-0 items-center gap-1 py-2 pr-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
          data-cta="v7d-back"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      ) : null}
      <p className="shrink-0 text-[11px] font-semibold tabular-nums tracking-[0.16em] text-neutral-400">{n}/{totalSlides}</p>
      <span className="flex flex-1 gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSlides }, (_, i) => (
          <span key={i} className={`h-[2px] flex-1 transition-colors duration-300 ${i < n ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
        ))}
      </span>
    </div>
  )

  const slideTitle = (t: string, optional = false) => (
    <h1 className="mt-5 text-[38px] leading-[1.02] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: SERIF, textWrap: 'balance' }}>
      {t}{optional && <span className="ml-2 align-middle text-[12px] font-semibold uppercase tracking-[0.2em] text-neutral-400" style={{ fontFamily: 'system-ui, sans-serif' }}>optional</span>}
    </h1>
  )

  const nextBtn = (onClick: () => void, label = 'Next', busy = false) => (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="group flex w-full items-center justify-between rounded-[3px] bg-neutral-900 px-5 py-[18px] text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black active:scale-[0.995] disabled:opacity-50"
      data-cta="v7d-next"
    >
      {busy ? <span className="mx-auto inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Loading" /> : <><span>{label}</span><svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>}
    </button>
  )
  const skipBtn = (onClick: () => void) => (
    <button type="button" onClick={onClick} className="w-full text-center text-[13px] font-semibold text-neutral-400 transition hover:text-neutral-600" data-cta="v7d-skip">
      Skip
    </button>
  )
  const errorBox = error ? (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</div>
  ) : null

    const segment = (c: Channel) => {
      const on = channel === c
      const Icon = c === 'instagram' ? InstagramIcon : PhoneIcon
      return (
        <button
          key={c}
          type="button"
          onClick={() => {
            if (on) return
            track('channel_switched', { from: channel, to: c })
            setChannel(c)
            setError(null)
            requestAnimationFrame(() => phoneRef.current?.focus())
          }}
          className={`flex items-center justify-center gap-2 rounded-[3px] border py-3 text-[14px] font-semibold transition ${
            on ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900'
          }`}
          data-cta={`v7d-channel-${c}`}
          aria-pressed={on}
        >
          <Icon className={`h-[18px] w-[18px] ${on ? 'text-white' : 'text-neutral-500'}`} />
          {CHANNELS[c].name}
        </button>
      )
    }

  // Numbered, so the page reads as one form with parts to fill out.
  const sectionTitle = (t: string, optional = false, n?: number) => (
    <h3 className="flex items-baseline gap-3 text-[28px] leading-[1.05] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: SERIF }}>
      {n !== undefined && <span className="w-7 shrink-0 text-[20px] tabular-nums text-neutral-400">{String(n).padStart(2, '0')}</span>}
      <span>{t}{optional && <span className="ml-2 align-middle text-[12px] font-semibold uppercase tracking-[0.2em] text-neutral-400" style={{ fontFamily: 'system-ui, sans-serif' }}>optional</span>}</span>
    </h3>
  )

  const sheet = (srcs: string[], good: boolean) => (
      <div className="grid grid-cols-4 gap-[3px] rounded-xl bg-[#17150f] p-[3px]">
        {srcs.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden bg-black">
            <NextImage src={src} alt="" width={200} height={200} sizes="(max-width: 640px) 25vw, 100px" className={`h-full w-full object-cover ${good ? '' : 'opacity-[0.62] grayscale'}`} />
            <span className={`absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full ${good ? 'bg-neutral-800' : 'bg-red-500'} text-white`}>
              {good ? <CheckIcon className="h-2.5 w-2.5" />
                : <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>}
            </span>
          </div>
        ))}
      </div>
    )
  const sheetLabel = (good: boolean, text: string, note: string) => (
      <p className="flex flex-wrap items-baseline gap-x-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
        <span className={`inline-flex items-center gap-1.5 ${good ? 'text-neutral-900' : 'text-red-500'}`}>
          <span className={`h-1 w-1 rounded-full ${good ? 'bg-neutral-800' : 'bg-red-500'}`} />
          {text}
        </span>
        <span className="font-semibold tracking-[0.12em] text-neutral-400">{note}</span>
      </p>
    )

  // ── The page every step lives on ──
  // Hero, the card (whatever step it holds), recent shoots, how it works.
  const page = (panel: React.ReactNode) => (
      <div className="mx-auto w-full max-w-md bg-[#f4f1ec] text-neutral-900">
        <style dangerouslySetInnerHTML={{ __html: slideMotionCss }} />
        {/* Hero: under half the screen, so the vibe picker shows on the first screen. */}
        <div className="relative h-[44svh] min-h-[260px] max-h-[420px] w-full overflow-hidden bg-black">
          {HERO_SLIDES.map((src, i) => (
            <NextImage
              key={src}
              src={src}
              alt={i === 0 ? 'Portrait shot on 35mm film' : ''}
              fill
              priority={i === 0}
              sizes="(max-width: 640px) 100vw, 448px"
              className={`object-cover object-[50%_22%] transition-opacity duration-[1400ms] ease-in-out ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-x-0 top-0 h-28" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent)' }} />
          <div className="absolute inset-x-0 bottom-0 h-[55%]" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.85))' }} />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 text-white">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">Aidan Torrence</span>
            <a
              href="https://www.instagram.com/madebyaidan"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('handle_clicked', { placement: 'hero' })}
              className="flex items-center gap-1.5 text-[12px] font-medium text-white/90"
            >
              <InstagramIcon className="h-4 w-4" />
              madebyaidan
            </a>
          </div>
          <div className="absolute inset-x-0 bottom-0 px-5 pb-4 text-white">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">Free photo shoot</p>
                <h1 className="mt-1 text-[68px] leading-[0.9] tracking-[-0.02em]" style={{ fontFamily: SERIF }}>
                  {CITY}
                </h1>
              </div>
              <span className="mb-2 flex gap-1.5" aria-hidden="true">
                {HERO_SLIDES.map((_, i) => (
                  <span key={i} className={`h-[2px] w-4 rounded-full transition-colors duration-500 ${i === heroIndex ? 'bg-white' : 'bg-white/30'}`} />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* The form: vibe first, then contact, photo, notes. */}
        <div ref={pickerCardRef} className="scroll-mt-4 px-5 pb-4 pt-5">
          {panel}
        </div>

        {/* Recent work: full-height frames, swipeable. */}
        <div className="pt-10">
          <div className="flex items-baseline justify-between px-5">
            <h3 className="text-[24px] leading-none" style={{ fontFamily: SERIF }}>Recent shoots</h3>
            <a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer" onClick={() => track('handle_clicked', { placement: 'recent_work' })} className="text-[12px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4">@madebyaidan</a>
          </div>
          <div className="mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            {proofImages.map((src, i) => (
              <div key={i} className="relative h-[300px] w-[210px] shrink-0 snap-start overflow-hidden rounded-[3px] bg-neutral-200">
                <NextImage src={src} alt="Portrait shot on 35mm film" fill sizes="210px" className="object-cover object-top" />
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="px-5 pb-28 pt-12">
          <h3 className="text-[28px] leading-none" style={{ fontFamily: SERIF }}>How it works</h3>
          <ol className="mt-5 divide-y divide-neutral-300/70 border-y border-neutral-300/70">
            {howItWorks.map((c, i) => (
              <li key={i} className="flex items-baseline gap-4 py-3.5">
                <span className="w-6 shrink-0 text-[20px] leading-none text-neutral-400" style={{ fontFamily: SERIF }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[14px] leading-snug text-neutral-800">{c}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14px] leading-relaxed text-neutral-600">
            <span className="font-semibold text-neutral-900">Why free?</span> I&rsquo;m just doing a few free shoots while I&rsquo;m in town for a short period &mdash; I want to create awesome content while I travel.
          </p>
        </div>

        {/* Sticky CTA, only once the look picker has scrolled away */}
        {showStickyCta && step !== 'done' && (
          <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3" style={{ background: 'linear-gradient(180deg, rgba(244,241,236,0), rgba(244,241,236,0.96) 35%)' }}>
            <div className="mx-auto max-w-md">
              <button
                type="button"
                onClick={() => {
                  track('sticky_cta_clicked')
                  pickerCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="w-full rounded-[3px] bg-neutral-900 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black"
              >
                Sign up
              </button>
            </div>
          </div>
        )}
      </div>
  )

  // ── Frame 1 · sign up ──
  if (step === 'location') {
    return page(
      <div key="location" className="atf-card">
        <form onSubmit={onSubmitAll} noValidate className="space-y-2.5">
          <div className="mb-7 border-b border-neutral-900 pb-4">
            <h2 className="text-[40px] leading-[0.98] tracking-[-0.015em] text-neutral-900" style={{ fontFamily: SERIF, textWrap: 'balance' }}>Fill out the form to sign up</h2>
          </div>
          <section ref={vibeRef} className="scroll-mt-4">
            {sectionTitle("What's your vibe?", false, 1)}
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5" role="radiogroup" aria-label="What's your vibe?">
              {VIBES.map(v => {
                const on = vibe === v.key
                return (
                  <button
                    key={v.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setVibe(v.key)
                      track('vibe_selected', { value: v.key })
                      fieldEngaged('vibe')
                      setError(null)
                    }}
                    className={`group relative text-left transition active:scale-[0.98] ${on ? '[&>span:first-child]:ring-2 [&>span:first-child]:ring-neutral-900 [&>span:first-child]:ring-offset-2' : ''}`}
                    data-cta={`v7d-vibe-${v.key}`}
                  >
                    <span className={`relative block aspect-[4/5] overflow-hidden rounded-[4px] ${v.board.length ? 'bg-neutral-200' : 'bg-[#17150f]'}`}>
                      {v.board.length === 0 && (
                        // An unexposed frame: film base, sprockets, nothing on it yet.
                        <span className="absolute inset-0 flex flex-col px-[6px]" aria-hidden="true">
                          <span className="h-[14px] w-full shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(to right, #d9d3c6 0 9px, transparent 9px 22px)', backgroundSize: '22px 6px', backgroundPosition: 'center', backgroundRepeat: 'repeat-x' }} />
                          <span className="relative flex-1 rounded-[2px]" style={{ background: 'radial-gradient(120% 90% at 50% 45%, #3a3226 0%, #241f17 55%, #1a1610 100%)' }}>
                            <span className="absolute bottom-1.5 left-2 text-[9px] font-bold tracking-[0.22em] text-[#e0a13f]">00</span>
                          </span>
                          <span className="h-[14px] w-full shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(to right, #d9d3c6 0 9px, transparent 9px 22px)', backgroundSize: '22px 6px', backgroundPosition: 'center', backgroundRepeat: 'repeat-x' }} />
                        </span>
                      )}
                      {v.board.length > 0 && (
                        <span className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[2px]">
                          {v.board.map(src => (
                            <span key={src} className="relative overflow-hidden">
                              <NextImage src={src} alt="" fill sizes="(max-width: 640px) 23vw, 100px" className="object-cover object-top" />
                            </span>
                          ))}
                        </span>
                      )}
                      <span className={`absolute right-2 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${v.board.length ? (on ? 'border-white bg-white text-neutral-900' : 'border-white bg-black/25') : (on ? 'border-white bg-white text-neutral-900' : 'border-white/80 bg-black/20')}`} aria-hidden="true">
                        {on && <CheckIcon className="h-3.5 w-3.5" />}
                      </span>
                    </span>
                    <span className="mt-2 block text-[22px] leading-none text-neutral-900" style={{ fontFamily: SERIF }}>
                      {v.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="pt-8">{sectionTitle('How should I message you?', false, 2)}</div>
          <div className="grid grid-cols-2 gap-2">
            {segment('instagram')}
            {segment('phone')}
          </div>
          {channel === 'instagram' ? (
            <>
              <div className="flex items-center rounded-[3px] border border-neutral-300 bg-white px-4 transition focus-within:border-neutral-800 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-900/10">
                <span className="pr-1 text-[17px] font-semibold text-neutral-300">@</span>
                <input
                  ref={phoneRef}
                  name="instagram"
                  value={instagram}
                  onChange={e => { fieldEngaged('instagram'); setInstagram(e.target.value); setError(null) }}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent py-3.5 text-base text-neutral-900 placeholder-neutral-400 outline-none"
                  placeholder="yourusername"
                />
              </div>
              <p className="text-[12px] leading-snug text-neutral-500">
                Please follow{' '}
                <a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer" onClick={() => track('handle_clicked', { placement: 'capture' })} className="font-semibold text-neutral-900 underline decoration-neutral-400 underline-offset-2">@madebyaidan</a>
                {' '}or I won&rsquo;t be able to message you.
              </p>
            </>
          ) : (
            <div className="flex gap-2">
              {countryCode && <CountryCodeSelect light value={countryCode} onChange={code => { fieldEngaged('country_code'); track('country_code_changed', { code }); setCountryCode(code); setError(null) }} />}
              <input
                ref={phoneRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                name="phone"
                value={phone}
                onChange={e => { fieldEngaged('phone'); setPhone(e.target.value); setError(null) }}
                onBlur={() => { const digits = phone.replace(/\D/g, ''); if (digits) trackOnce('phone_filled', digits, { digits: digits.length }) }}
                className="min-w-0 flex-1 rounded-[3px] border border-neutral-300 bg-white px-4 py-3.5 text-base text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-800 focus:bg-white focus:ring-4 focus:ring-neutral-900/10"
                placeholder="Phone number, e.g. 704 555 0123"
              />
            </div>
          )}

          <section ref={photoRef} className="scroll-mt-4 pt-8">
            {sectionTitle('Your photo', false, 3)}
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">Selfies are fine &mdash; just looking to see the real you.</p>
            <div className="mt-5 space-y-2">
              {sheetLabel(true, 'Like this', "simple & natural, don't hide your face")}
              {sheet(['/images/collab-examples/good-1.jpg', '/images/collab-examples/good-2.jpg', '/images/collab-examples/good-3.jpg', '/images/collab-examples/good-4.jpg'], true)}
            </div>
            <div className="mt-3 space-y-2">
              {sheetLabel(false, 'Not like this', 'heavy makeup, filters, face hidden')}
              {sheet(['/images/collab-examples/bad-1.jpg', '/images/collab-examples/bad-2.jpg', '/images/collab-examples/bad-3.jpg', '/images/collab-examples/bad-4.jpg'], false)}
            </div>

            {photos.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="Preview" className="h-[72px] w-[72px] rounded-xl object-cover shadow-[0_8px_18px_-10px_rgba(23,21,15,0.7)] ring-1 ring-black/10" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white shadow transition hover:bg-red-500" aria-label="Remove photo">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={processingPhotos}
              className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-neutral-400 bg-neutral-100 py-5 text-neutral-900 transition hover:border-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
            >
              {processingPhotos ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" aria-label="Processing" />
              ) : (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white shadow-[0_8px_16px_-8px_rgba(0,0,0,0.9)] transition group-hover:bg-neutral-800">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 16V4m0 0L7 9m5-5l5 5" /><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{photos.length > 0 ? 'Add another' : 'Upload'}</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />

          </section>

          {channel === 'phone' && (
            <section className="pt-8">
              {sectionTitle('Your Instagram', true, 4)}
              <div className="mt-4 flex items-center rounded-[3px] border border-neutral-300 bg-white px-4 transition focus-within:border-neutral-800 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-900/10">
                <span className="pr-1 text-[17px] font-semibold text-neutral-300">@</span>
                <input
                  value={instagram}
                  onChange={e => { fieldEngaged('instagram'); setInstagram(e.target.value) }}
                  onBlur={() => { const v = instagram.trim(); if (v) trackOnce('instagram_filled', v, { chars: v.length }) }}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-transparent py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none"
                  placeholder="yourhandle"
                />
              </div>
            </section>
          )}

          <section className="pt-8">
            {sectionTitle('Any notes or questions?', true, channel === 'phone' ? 5 : 4)}
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">Your own idea, inspo, references &mdash; anything.</p>
            <textarea
              id="collab-idea"
              value={idea}
              onChange={e => { fieldEngaged('notes'); setIdea(e.target.value) }}
              onBlur={() => { const v = idea.trim(); if (v) trackOnce('notes_filled', v, { chars: v.length }) }}
              rows={4}
              className={`${inputCls} mt-4 resize-none leading-relaxed`}
              placeholder="Totally optional..."
            />
          </section>

          <div className="space-y-3 pt-6">
            {errorBox}
            {/* Honeypot */}
            <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
            <button
              type="submit"
              disabled={submitting || processingPhotos}
              className="group flex w-full items-center justify-between rounded-[3px] bg-neutral-900 px-5 py-[18px] text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black active:scale-[0.995] disabled:opacity-50"
              data-cta="v7d-submit"
            >
              {submitting ? <span className="mx-auto inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Loading" /> : <><span>Finish Sign-Up</span><svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── Frame 3 · notes ──
  if (step === 'notes') {
    return slideShell(2, (
      <>
        {kicker(slideNo.notes, channel === 'instagram' ? 'photos' : 'instagram')}
        {slideTitle('Any notes or questions?', true)}
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">Your own idea, inspo, references &mdash; anything.</p>
        <textarea
          id="collab-idea"
          value={idea}
          onChange={e => { fieldEngaged('notes'); setIdea(e.target.value) }}
          onBlur={() => { const v = idea.trim(); if (v) trackOnce('notes_filled', v, { chars: v.length }) }}
          rows={4}
          className={`${inputCls} mt-4 resize-none leading-relaxed`}
          placeholder="Totally optional..."
        />
        <div className="mt-6 space-y-3">
          {nextBtn(finishSignup, 'Finish Sign-Up')}
        </div>
      </>
    ))
  }

  // ── Frame 2 · the look ──
  if (step === 'vibe') {
    return slideShell(2, (
      <>
        {kicker(slideNo.vibe, BACK_TO.vibe)}
        {slideTitle("What's your vibe?")}
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5" role="radiogroup" aria-label="What's your vibe?">
          {VIBES.map(v => {
            const on = vibe === v.key
            return (
              <button
                key={v.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setVibe(v.key)
                  track('vibe_selected', { value: v.key })
                  fieldEngaged('vibe')
                  setTimeout(() => advance('photos', true), 220)
                }}
                className={`group relative text-left transition active:scale-[0.98] ${on ? '[&>span:first-child]:ring-2 [&>span:first-child]:ring-neutral-900 [&>span:first-child]:ring-offset-2' : ''}`}
                data-cta={`v7d-vibe-${v.key}`}
              >
                <span className={`relative block aspect-[4/5] overflow-hidden rounded-[4px] ${v.board.length ? 'bg-neutral-200' : 'bg-[#17150f]'}`}>
                  {v.board.length === 0 && (
                    // An unexposed frame: film base, sprockets, nothing on it yet.
                    <span className="absolute inset-0 flex flex-col px-[6px]" aria-hidden="true">
                      <span className="h-[14px] w-full shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(to right, #d9d3c6 0 9px, transparent 9px 22px)', backgroundSize: '22px 6px', backgroundPosition: 'center', backgroundRepeat: 'repeat-x' }} />
                      <span className="relative flex-1 rounded-[2px]" style={{ background: 'radial-gradient(120% 90% at 50% 45%, #3a3226 0%, #241f17 55%, #1a1610 100%)' }}>
                        <span className="absolute bottom-1.5 left-2 text-[9px] font-bold tracking-[0.22em] text-[#e0a13f]">00</span>
                      </span>
                      <span className="h-[14px] w-full shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(to right, #d9d3c6 0 9px, transparent 9px 22px)', backgroundSize: '22px 6px', backgroundPosition: 'center', backgroundRepeat: 'repeat-x' }} />
                    </span>
                  )}
                  {v.board.length > 0 && (
                    <span className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[2px]">
                      {v.board.map(src => (
                        <span key={src} className="relative overflow-hidden">
                          <NextImage src={src} alt="" fill sizes="(max-width: 640px) 23vw, 100px" className="object-cover object-top" />
                        </span>
                      ))}
                    </span>
                  )}
                  <span className={`absolute right-2 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${v.board.length ? (on ? 'border-white bg-white text-neutral-900' : 'border-white bg-black/25') : (on ? 'border-white bg-white text-neutral-900' : 'border-white/80 bg-black/20')}`} aria-hidden="true">
                    {on && <CheckIcon className="h-3.5 w-3.5" />}
                  </span>
                </span>
                <span className="mt-2 block text-[22px] leading-none text-neutral-900" style={{ fontFamily: SERIF }}>
                  {v.label}
                </span>
              </button>
            )
          })}
        </div>
      </>
    ))
  }

  // ── Frame 5 · your photo ──
  if (step === 'photos') {
    const sheet = (srcs: string[], good: boolean) => (
      <div className="grid grid-cols-4 gap-[3px] rounded-xl bg-[#17150f] p-[3px]">
        {srcs.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden bg-black">
            <NextImage src={src} alt="" width={200} height={200} sizes="(max-width: 640px) 25vw, 100px" className={`h-full w-full object-cover ${good ? '' : 'opacity-[0.62] grayscale'}`} />
            <span className={`absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full ${good ? 'bg-neutral-800' : 'bg-red-500'} text-white`}>
              {good ? <CheckIcon className="h-2.5 w-2.5" />
                : <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>}
            </span>
          </div>
        ))}
      </div>
    )
    const sheetLabel = (good: boolean, text: string, note: string) => (
      <p className="flex flex-wrap items-baseline gap-x-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
        <span className={`inline-flex items-center gap-1.5 ${good ? 'text-neutral-900' : 'text-red-500'}`}>
          <span className={`h-1 w-1 rounded-full ${good ? 'bg-neutral-800' : 'bg-red-500'}`} />
          {text}
        </span>
        <span className="font-semibold tracking-[0.12em] text-neutral-400">{note}</span>
      </p>
    )
    return slideShell(4, (
      <>
        {kicker(slideNo.photos, BACK_TO.photos)}
        {slideTitle('Your photo')}
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">Selfies are fine &mdash; just looking to see the real you.</p>

        <div className="mt-5 space-y-2">
          {sheetLabel(true, 'Like this', "simple & natural, don't hide your face")}
          {sheet(['/images/collab-examples/good-1.jpg', '/images/collab-examples/good-2.jpg', '/images/collab-examples/good-3.jpg', '/images/collab-examples/good-4.jpg'], true)}
        </div>
        <div className="mt-3 space-y-2">
          {sheetLabel(false, 'Not like this', 'heavy makeup, filters, face hidden')}
          {sheet(['/images/collab-examples/bad-1.jpg', '/images/collab-examples/bad-2.jpg', '/images/collab-examples/bad-3.jpg', '/images/collab-examples/bad-4.jpg'], false)}
        </div>

        {photos.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="Preview" className="h-[72px] w-[72px] rounded-xl object-cover shadow-[0_8px_18px_-10px_rgba(23,21,15,0.7)] ring-1 ring-black/10" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white shadow transition hover:bg-red-500" aria-label="Remove photo">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={processingPhotos}
          className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-neutral-400 bg-neutral-100 py-5 text-neutral-900 transition hover:border-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
        >
          {processingPhotos ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" aria-label="Processing" />
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white shadow-[0_8px_16px_-8px_rgba(0,0,0,0.9)] transition group-hover:bg-neutral-800">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 16V4m0 0L7 9m5-5l5 5" /><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                </svg>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{photos.length > 0 ? 'Add another' : 'Upload'}</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />

        <div className="mt-6 space-y-3">
          {errorBox}
          {nextBtn(() => {
            if (photos.length === 0) {
              track('validation_error', { reason: 'photo_missing' })
              setError("Add one photo of yourself so I know who I'm shooting.")
              return
            }
            advance(channel === 'instagram' ? 'notes' : 'instagram', true, photos)
          }, channel === 'instagram' ? 'Finish Sign-Up' : 'Next', processingPhotos)}
        </div>
      </>
    ))
  }

  // ── Frame 6 · instagram ──
  if (step === 'instagram') {
    return slideShell(5, (
      <>
        {kicker(slideNo.instagram, BACK_TO.instagram)}
        {slideTitle('Your Instagram', true)}
        <div className="mt-5 flex items-center rounded-[3px] border border-neutral-300 bg-white px-4 transition focus-within:border-neutral-800 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-900/10">
          <span className="pr-1 text-[17px] font-semibold text-neutral-300">@</span>
          <input
            value={instagram}
            onChange={e => { fieldEngaged('instagram'); setInstagram(e.target.value) }}
            onBlur={() => { const v = instagram.trim(); if (v) trackOnce('instagram_filled', v, { chars: v.length }) }}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-transparent py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none"
            placeholder="yourhandle"
          />
        </div>
        <div className="mt-6 space-y-3">
          {nextBtn(() => advance('notes', true))}
          {skipBtn(() => advance('notes', true))}
        </div>
      </>
    ))
  }

  // ── Done ──
  return page(
    <div key="done" className="atf-card">
      <div className="relative -mx-5 h-48 overflow-hidden">
        <NextImage src={heroImage} alt="" fill sizes="(max-width: 640px) 100vw, 448px" className="object-cover object-top" style={{ filter: 'brightness(0.6) saturate(1.15)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
        <p className="absolute bottom-4 left-5 right-5 text-[44px] leading-none text-white" style={{ fontFamily: SERIF }}>You&apos;re in.</p>
      </div>
      <div className="space-y-5 pt-4">
        <p className="text-sm text-neutral-500">I&apos;ll message you {CHANNELS[channel].doneVia} within 24 hours to plan your Charlotte shoot. Let&apos;s make something great together.</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">What to expect</p>
        <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
          {['Edited photos you can use however you want', 'Full creative direction from me', 'A real collaboration, not a transaction', 'We plan the concept together'].map((t, i) => (
            <li key={i} className="flex items-baseline gap-4 py-3">
              <span className="w-6 shrink-0 text-[18px] leading-none text-neutral-400" style={{ fontFamily: SERIF }}>{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[14px] text-neutral-700">{t}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={startOver}
          className="mx-auto flex items-center gap-1.5 rounded-full border border-neutral-200 bg-[#faf9f6] py-2.5 pl-4 pr-3 text-[12px] font-bold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 active:scale-95"
          data-cta="v7d-start-over"
        >
          Start over
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 2v6h6" /><path d="M3.5 13a9 9 0 106-9.7L3 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
