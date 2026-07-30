"use client"
import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import CountryCodeSelect from './CountryCodeSelect'
import { detectCountry, detectPhoneCountry } from '@/lib/detectCountry'
import { cityChipsForCountry, cityExamplesForCountry } from '@/lib/cityChips'
import { initPageAnalytics, track, pageElapsedMs, flushNow } from '@/lib/track'

// v9 "one-tap". The chat IS the funnel: instead of asking for a number, frame 1
// offers a single tap in the channel's own brand color that opens WhatsApp with
// the message already written (or LINE's add-friend sheet), so the visitor
// converts with zero typing. The row is written at the tap, V3-style, before
// there's an identity to put on it — the thread that arrives in the app is the
// identity. A quiet expander underneath keeps V4's number capture as the
// always-works fallback.
//
// The flow collapses to three screens: the tap, one optional enrichment frame
// (vibe + photo + Instagram, all skippable behind one Done), and done. With
// only one real step there's nothing for an n/N kicker to count, so it's gone.

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

// The hero cycles. It opens on the bubbles frame and crossfades on, so the
// first thing the page does is show more work rather than sit still.
const HERO_SLIDES = [
  '/images/faves/000039-3.jpg',
  '/images/proof/000041.jpg',
  '/images/proof/000019-6.jpg',
  '/images/proof/000023.jpg',
  '/images/proof/DSC_0347.jpg',
]
// The done screen's banner is short and full-width, which crops a portrait
// frame to a knee. This one is landscape and holds up at that ratio.
const doneImage = '/images/faves/000062-7.jpg'

const proofImages = [
  '/images/large/000020-7.jpg',
  '/images/large/aidanto-r4-053-25.jpg',
  '/images/faves/000047-4.jpg',
  '/images/faves/000040-5.jpg',
  '/images/large/manila-gallery-tropical-001.jpg',
  '/images/faves/000010-6.jpg',
]

const howItWorks = [
  'Message me — one tap, the text is already written',
  'I reply with the details — timing, locations, what to wear',
  'We plan the concept together and shoot for 1–2 hours',
  "You get the edited photos — it's 100% free, always",
]

const CHIP_ORDER: Record<string, string[]> = {
  TH: ['Bangkok', 'Chiang Mai', 'Pattaya'],
}

type VibeKey = 'street' | 'nature' | 'indoor' | 'any'

// Real frames from the portfolio, not swatches — the tile IS the pitch for
// that look. No single photograph stands for "any", so that one is a grey box
// with something moving inside it, which is what the choice actually is.
const VIBES: { key: VibeKey; label: string; src: string | null }[] = [
  { key: 'street', label: 'Street', src: '/images/faves/000016-3.jpg' },
  { key: 'nature', label: 'Nature', src: '/images/large/manila-gallery-statue-001.jpg' },
  { key: 'indoor', label: 'Indoor', src: '/images/large/000048750034.jpg' },
  { key: 'any', label: 'No preference', src: null },
]

// ONE roll of film. Each slide shows a four-frame window into it, two frames
// further on than the last, so moving through the form winds the same roll
// forward. It wraps, so the roll never runs out however many frames there are.
const ROLL = [
  '/images/proof/000009.jpg',
  '/images/proof/000023.jpg',
  '/images/proof/DSC_0321.jpg',
  '/images/proof/000015-3.jpg',
  '/images/proof/000013-3.jpg',
  '/images/proof/000042-5.jpg',
  '/images/proof/000005-3.jpg',
  '/images/proof/000019-6.jpg',
  '/images/proof/000062.jpg',
  '/images/proof/000012.jpg',
]

function rollAt(stepNo: number) {
  const offset = (stepNo - 1) * 2
  return {
    frames: Array.from({ length: 4 }, (_, i) => ROLL[(offset + i) % ROLL.length]),
    from: 11 + offset,
  }
}

// ── The tap targets ──
// Deliberately NOT the LINE Official Account: LINE shows an "account is not
// verified" caution to anyone adding an unverified OA, which lands on cold ad
// traffic seconds after the tap (same call V3 made).
const LINE_ADD_URL = 'https://line.me/ti/p/XKpsnykVaM'
const WHATSAPP_NUMBER = '491758966210'

// The row is written at the tap, before there's anything to identify it by —
// they tapped through, so the contact column can only say so. Everything after
// (vibe, photos, Instagram) PATCHes onto it. The cost is a row per tap,
// bounces included; the alternative is waiting for an identity most of these
// visitors only ever present inside the chat app.
const LINE_ROW_CONTACT = 'LINE — added me'
const WA_ROW_CONTACT = 'WhatsApp — tapped through'

// ── Resume ──
// The tap hands the visitor to the chat app, and on mobile the browser goes to
// the background — often for good, sometimes with the tab discarded outright.
// A snapshot per move, in localStorage rather than sessionStorage: the way
// back is usually a fresh tab.
const RESUME_TTL_MS = 24 * 60 * 60 * 1000
const resumeKey = (path: string) => `atf_signup_resume:${path}`

type Channel = 'line' | 'whatsapp'

type ResumeState = {
  // v3 is the one-tap shape. Snapshots are already keyed by analyticsPath so a
  // V4 snapshot can't reach this page, but the version guard keeps it honest.
  v: 3
  ts: number
  step: Step
  channel: Channel
  vibe: VibeKey | null
  phone: string
  countryCode: string
  instagram: string
  photos: string[]
  lead: { id: number | null; contact: string } | null
  postedContact: string | null
  leadFired: boolean
  tappedThrough: boolean
}

// ── Which channel the tap opens ──
// LINE is Thailand, Japan and Taiwan; the rest of the world runs on WhatsApp.
// Language decides and timezone breaks the tie, because they answer different
// questions: the timezone says where the phone is (a Berliner reports
// Asia/Bangkok the day they land), the language says whose phone it is.
const LINE_COUNTRIES = new Set(['TH', 'JP', 'TW'])

function localeParts(tag: string) {
  const parts = (tag || '').split('-')
  return {
    lang: (parts[0] || '').toLowerCase(),
    region: parts.slice(1).find(p => /^[A-Za-z]{2}$/.test(p))?.toUpperCase() ?? null,
  }
}

function preferredChannel(iso: string | null): Channel {
  let tags: string[] = []
  try {
    tags = (navigator.languages?.length ? [...navigator.languages] : [navigator.language]).filter(Boolean)
  } catch {}

  const speaksLineLanguage = tags.some(t => {
    const { lang, region } = localeParts(t)
    return lang === 'th' || lang === 'ja' || (lang === 'zh' && region === 'TW')
  })
  if (speaksLineLanguage) return 'line'

  const { lang, region } = localeParts(tags[0] ?? '')
  if (lang && lang !== 'en') return 'whatsapp'
  // en-TH is a Thai phone switched to English; en-GB is a tourist. en-US is the
  // factory default the world over and says nothing either way.
  if (region && region !== 'US') return LINE_COUNTRIES.has(region) ? 'line' : 'whatsapp'
  return iso && LINE_COUNTRIES.has(iso) ? 'line' : 'whatsapp'
}

const CHANNELS: Record<Channel, { name: string; placeholder: string; placeholderIntl: string }> = {
  line: { name: 'LINE', placeholder: 'LINE number', placeholderIntl: 'LINE number, e.g. +66 81 234 5678' },
  whatsapp: { name: 'WhatsApp', placeholder: 'WhatsApp number', placeholderIntl: 'WhatsApp number, e.g. +66 81 234 5678' },
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

export default function SignUpFormCollabV9({ analyticsPath = '/sign-up-collab-v9' }: { analyticsPath?: string }) {
  const [step, setStep] = useState<Step>('capture')
  const [error, setError] = useState<string | null>(null)

  const [vibe, setVibe] = useState<VibeKey | null>(null)
  const [channel, setChannel] = useState<Channel>('line')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [countryIso, setCountryIso] = useState<string | null>(null)
  const [instagram, setInstagram] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [tappedThrough, setTappedThrough] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
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
  // A ref alongside the state: the tap fires the Lead and starts the POST in
  // the same handler, so the POST's .then would see a stale `leadFired` and
  // count the same person twice without it.
  const leadFiredRef = useRef(false)
  // The channel we opened on. Drives segment ORDER only — it stays put when
  // they toggle, because a control that reorders itself under the thumb is
  // horrible to use.
  const [defaultChannel, setDefaultChannel] = useState<Channel>('line')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    initPageAnalytics(analyticsPath, { version: 'v9-one-tap' })

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
      setStep(resumed.step)
      setChannel(resumed.channel)
      setVibe(resumed.vibe)
      setPhone(resumed.phone)
      setCountryCode(resumed.countryCode)
      setInstagram(resumed.instagram)
      setPhotos(resumed.photos)
      setPostedContact(resumed.postedContact)
      setLeadFired(resumed.leadFired)
      leadFiredRef.current = resumed.leadFired
      setTappedThrough(resumed.tappedThrough)
      if (resumed.lead) {
        setLeadRecord(resumed.lead)
        leadRef.current = Promise.resolve(resumed.lead)
      }
      setDefaultChannel(resumed.channel)
      track('flow_resumed', { slide: resumed.step, has_row: !!resumed.lead, away_ms: Date.now() - resumed.ts })
    }

    // The chips answer "where will the shoot be" and want the timezone. The
    // dial code answers "whose number is this" and wants the locale region.
    const country = detectCountry()
    const phoneCountry = detectPhoneCountry()
    if (country) setCountryIso(country.iso)
    if (phoneCountry && !resumed?.countryCode) setCountryCode(phoneCountry.dial)
    if (country || phoneCountry) {
      track('country_detected', { iso: country?.iso ?? null, dial_iso: phoneCountry?.iso ?? null })
    }

    if (!resumed) {
      const preferred = preferredChannel(country?.iso ?? null)
      setChannel(preferred)
      setDefaultChannel(preferred)
      let primaryLang: string | null = null
      try { primaryLang = navigator.languages?.[0] ?? navigator.language ?? null } catch {}
      track('channel_defaulted', { to: preferred, iso: country?.iso ?? null, lang: primaryLang })
    }
    setHydrated(true)
  }, [analyticsPath])

  function persistResume() {
    const touched = step !== 'capture' || tappedThrough || !!phone || !!vibe
    if (!touched) return
    const base: Omit<ResumeState, 'photos'> = {
      v: 3, ts: Date.now(), step, channel, vibe, phone, countryCode,
      instagram, lead: leadRecord, postedContact, leadFired, tappedThrough,
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
  useEffect(() => { if (hydrated) persistResume() }, [hydrated, step, channel, vibe, photos, leadRecord, postedContact, leadFired, tappedThrough])
  useEffect(() => {
    if (!hydrated) return
    const t = setTimeout(persistResume, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, phone, countryCode, instagram])

  // Hero crossfade. Stopped entirely for anyone who asked for less motion —
  // they get the opening frame and nothing moves.
  useEffect(() => {
    if (step !== 'capture') return
    let reduced = false
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch {}
    if (reduced) return
    const t = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 4200)
    return () => clearInterval(t)
  }, [step])

  // Pattaya earns a chip ahead of Phuket for this audience. Scoped here rather
  // than in lib/cityChips, which still feeds the live page and shouldn't shift
  // under it. There's no location frame on this flow — the first chip stands
  // in as the detected city for the drafted message and the row.
  const allCities = [...cityChipsForCountry(countryIso), ...cityExamplesForCountry(countryIso)]
  const chips = (countryIso && CHIP_ORDER[countryIso]) || allCities.slice(0, 3)
  const detectedCity = chips[0] ?? null

  // The prefilled draft. The 📸 tags threads from this page, so a thread that
  // arrives with it is attributable even though the row has no number on it.
  const waDraft = detectedCity
    ? `Hi Aidan — I'm in ${detectedCity}, I want the free collab shoot 📸`
    : `Hi Aidan — I want the free collab shoot 📸`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waDraft)}`

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

  // Once only, wherever the Lead is earned first — the tap, or the fallback
  // POST resolving. Backing up and converting again is the same lead.
  function fireLeadOnce() {
    if (leadFiredRef.current) return
    leadFiredRef.current = true
    setLeadFired(true)
    if (typeof window === 'undefined') return
    const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
    if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v9' })
  }

  function moodboardSoFar(o?: { vibe?: VibeKey | null }): string[] {
    const vibeVal = o && 'vibe' in o ? o.vibe : vibe
    const vibeLabel = VIBES.find(v => v.key === vibeVal)?.label
    return [
      'Collab sign-up',
      'Signup flow: v9-one-tap',
      ...(detectedCity ? ['Location: ' + detectedCity] : []),
      ...(vibeLabel ? ['Look: ' + vibeLabel] : []),
      ...(instagram.trim() ? ['Instagram: ' + instagram.trim()] : []),
    ]
  }

  // ── The lead ──
  // On the tap path the row is provisional (V3's pattern): contact says only
  // that they tapped through, and the thread arriving in the app carries the
  // identity. On the fallback path it's the typed number, V4-style. Either way
  // the POST runs in the background with one silent retry so nothing waits.
  function startLeadPost(contact: string) {
    setPostedContact(contact)
    const attempt = async (): Promise<{ id: number | null; contact: string }> => {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: detectedCity ?? '', contactMethod: channel, contact, moodboard: moodboardSoFar() }),
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
        fireLeadOnce()
        return lead
      })
      .catch(() => {
        track('submit_error', { elapsed_ms: pageElapsedMs() })
        return null
      })
  }

  // ── The tap ──
  // The last thing a good share of these visitors ever do on this page: the
  // chat app takes the foreground and the browser doesn't get it back. So
  // everything fires here, at the tap — the Lead, the provisional row — and
  // the deep link opens synchronously so pop-up blockers treat it as
  // user-initiated; the POST is already in flight and doesn't need to finish.
  function onChatTap() {
    const provisional = channel === 'line' ? LINE_ROW_CONTACT : WA_ROW_CONTACT
    const url = channel === 'line' ? LINE_ADD_URL : waUrl
    track('chat_cta_tapped', { channel, has_city: !!detectedCity })
    flushNow()
    fireLeadOnce()
    // Guarded so backing up to this card and tapping again enriches the row
    // they already have instead of writing a second one.
    if (!leadRef.current) startLeadPost(provisional)
    setTappedThrough(true)
    window.open(url, '_blank', 'noopener,noreferrer')
    advance('enrich')
  }

  // ── The fallback ──
  // V4's capture, unchanged: typed number, honeypot, same reuse rule — backing
  // up and coming through again re-uses the row, unless the number itself
  // changed. A visitor converting here never writes the provisional row; the
  // typed contact IS the row.
  function onCapture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (data.company) { track('honeypot_triggered'); advance('enrich'); return }

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 7) {
      track('validation_error', { reason: `${channel}_invalid` })
      setError(`Please enter your ${CHANNELS[channel].name} number.`)
      phoneRef.current?.focus()
      return
    }

    track('submit_attempt', { channel, country_code: countryCode, digits: digits.length, elapsed_ms: pageElapsedMs() })
    setError(null)
    const typed = countryCode ? countryCode + ' ' + phone.trim() : phone.trim()
    if (!leadRef.current || postedContact !== typed) startLeadPost(typed)
    advance('enrich')
  }

  // Every enrichment input saves in the background. PATCHes are chained so
  // they can never land out of order. The API APPENDS photos to the row, so
  // each photo is sent in exactly one PATCH — the batch that added it.
  function queuePatch(withPhotos?: string[], o?: { vibe?: VibeKey | null }) {
    const payload = {
      city: detectedCity ?? '',
      moodboard: moodboardSoFar(o),
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

  function advance(next: Step) {
    track('slide_shown', { slide: next })
    setError(null)
    setStep(next)
    window.scrollTo({ top: 0 })
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
    leadFiredRef.current = false
    setLeadRecord(null)
    setPostedContact(null)
    setLeadFired(false)
    setTappedThrough(false)
    setShowFallback(false)
    setVibe(null)
    setPhone('')
    setInstagram('')
    setPhotos([])
    setError(null)
    setStep('capture')
    window.scrollTo({ top: 0 })
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    fieldEngaged('photos')
    setError(null)
    setProcessingPhotos(true)
    let failures = 0
    const selected = files.length
    const added: string[] = []
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
          added.push(resized)
          setPhotos(prev => [...prev, resized])
        } catch { failures++ }
      }
    } finally {
      setProcessingPhotos(false)
      if (fileRef.current) fileRef.current.value = ''
      track('photos_added', { selected, added: added.length, failed: failures, total: photos.length + added.length })
      if (failures > 0) {
        setError(failures === 1
          ? 'One photo could not be added (too large or unsupported format — try a JPG/PNG under 20 MB).'
          : `${failures} photos could not be added (too large or unsupported format — try JPG/PNG under 20 MB).`)
      }
    }

    // No advance on this flow — the frame holds everything. The batch that
    // just landed is patched onto the row at once (and only this batch: the
    // API appends, so re-sending earlier photos would duplicate them).
    if (added.length > 0) queuePatch(added)
  }

  function removePhoto(index: number) {
    track('photo_removed', { remaining: photos.length - 1 })
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  function finishEnrich() {
    track('enrich_attempt', {
      vibe: vibe ?? 'none',
      photos: photos.length,
      has_instagram: instagram.trim().length > 0,
      elapsed_ms: pageElapsedMs(),
    })
    queuePatch()

    // Only one case lands here with no row: the tap/capture POST failed,
    // twice. Save everything in one shot rather than lose it.
    const saveInOneShot = () => {
      fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: detectedCity ?? '',
          contactMethod: channel,
          contact: postedContact ?? (channel === 'line' ? LINE_ROW_CONTACT : WA_ROW_CONTACT),
          moodboard: moodboardSoFar(),
          photos,
        }),
      }).then(res => {
        if (!res.ok) return
        track('submit_success', { channel, recovered: true, elapsed_ms: pageElapsedMs() })
        fireLeadOnce()
      }).catch(() => {})
    }

    if (leadRef.current) leadRef.current.then(lead => { if (lead === null) saveInOneShot() })
    else saveInOneShot()
    track('enrich_success', { photos: photos.length, elapsed_ms: pageElapsedMs() })
    flushNow()
    setStep('done')
    window.scrollTo({ top: 0 })
  }

  const inputCls = 'w-full rounded-2xl border border-neutral-200 bg-[#faf9f6] px-4 py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'

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
        <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f4f2ee] to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f4f2ee] to-transparent" />
      </div>
    )
  }

  // ── The shell the enrichment and done frames share ──
  const slideShell = (stepNo: number, children: React.ReactNode) => (
    <div className="min-h-screen bg-[#f4f2ee]">
      <style dangerouslySetInnerHTML={{ __html: slideMotionCss }} />
      <div key={stepNo} className="mx-auto max-w-md px-4 pb-10 pt-7">
        <div className="atf-card overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_24px_60px_-34px_rgba(23,21,15,0.55)] px-5 pb-6 pt-5">
          {children}
        </div>
        {ribbon(stepNo)}
      </div>
    </div>
  )

  const slideTitle = (t: string, optional = false) => (
    <h1 className="mt-1 text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}>
      {t}{optional && <span className="ml-2 align-middle text-[17px] font-normal not-italic text-neutral-400" style={{ fontFamily: 'system-ui, sans-serif' }}>optional</span>}
    </h1>
  )

  const errorBox = error ? (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</div>
  ) : null

  // ── Frame 1 · the tap ──
  // Full-bleed hero and headline, proof grid and how-it-works below the fold.
  // The card opens on a single tap in the channel's own brand color; the
  // number field lives behind a quiet expander as the always-works fallback.
  if (step === 'capture') {
    const brandColor = channel === 'line' ? '#06C755' : '#25D366'
    const ChatIcon = channel === 'line' ? LineIcon : WhatsappIcon
    const tapLabel = channel === 'line' ? 'Add me on LINE' : 'Message me on WhatsApp'
    const tapHint = channel === 'line'
      ? 'opens LINE — one tap to add me, and I’ll take it from there.'
      : 'opens WhatsApp with a message already written — just hit send.'

    const segment = (c: Channel) => {
      const on = channel === c
      const Icon = c === 'line' ? LineIcon : WhatsappIcon
      return (
        <button
          key={c}
          type="button"
          onClick={() => {
            if (on) return
            track('channel_switched', { from: channel, to: c, had_digits: phone.replace(/\D/g, '').length > 0 })
            setChannel(c)
            setError(null)
            requestAnimationFrame(() => phoneRef.current?.focus())
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition ${
            on ? 'bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.16)]' : 'text-neutral-500 hover:text-neutral-800'
          }`}
          data-cta={`v9-channel-${c}`}
          aria-pressed={on}
        >
          <Icon className={`h-4 w-4 ${on ? (c === 'line' ? 'text-[#06C755]' : 'text-[#25D366]') : 'text-neutral-400'}`} />
          {CHANNELS[c].name}
        </button>
      )
    }
    return (
      <div className="mx-auto w-full max-w-md bg-white">
        <style dangerouslySetInnerHTML={{ __html: slideMotionCss }} />
        {/* Hero — the proof IS the pitch */}
        <div className="relative h-[56vh] min-h-[420px] max-h-[600px] w-full overflow-hidden bg-black">
          {HERO_SLIDES.map((src, i) => (
            <NextImage
              key={src}
              src={src}
              alt={i === 0 ? 'Photo shoot on 35mm film' : ''}
              fill
              priority={i === 0}
              sizes="(max-width: 640px) 100vw, 448px"
              className={`object-cover object-top transition-opacity duration-[1200ms] ease-in-out ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
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

        {/* Opening card — one tap, zero typing */}
        <div className="relative z-10 mx-4 -mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
          {/* h2, not h1 — the hero headline above is the page's h1. */}
          <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}>
            Grab your free shoot
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
            One tap and we&rsquo;re talking on {CHANNELS[channel].name} &mdash; I&rsquo;ll send the details: timing, location ideas, what to wear, and next steps.{' '}
            {/* In the card, not below the fold: the "is this really free?" doubt
                is what the first frame has to answer, and most ad clickers
                never scroll far enough to find an answer further down. */}
            <a
              href="/sign-up-collab/faq"
              onClick={() => track('faq_opened', { slide: 'capture' })}
              className="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2"
            >
              Questions?
            </a>
          </p>

          {/* THE tap. The channel's own green, chosen by locale routing. */}
          <button
            type="button"
            onClick={onChatTap}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-base font-bold text-white transition hover:brightness-105 active:scale-[0.99]"
            style={{ backgroundColor: brandColor, boxShadow: `0 12px 26px -12px ${brandColor}` }}
            data-cta="v9-chat-cta"
          >
            <ChatIcon className="h-5 w-5" />
            {tapLabel}
          </button>
          <p className="mt-2 text-center text-[12px] leading-snug text-neutral-400">{tapHint}</p>

          {/* The always-works fallback, folded away so the card stays one ask. */}
          {!showFallback ? (
            <button
              type="button"
              onClick={() => {
                track('fallback_opened', { channel })
                setShowFallback(true)
                requestAnimationFrame(() => phoneRef.current?.focus())
              }}
              className="mt-3 w-full text-center text-[13px] font-semibold text-neutral-400 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-600"
              data-cta="v9-fallback-toggle"
            >
              or leave your number and I&rsquo;ll message you
            </button>
          ) : (
            <form onSubmit={onCapture} className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
              {/* Same number either way — the segment only says which app it's
                  on (and re-aims the big button above). */}
              <div className="grid grid-cols-2 gap-1 rounded-2xl border border-neutral-200 bg-[#f5f5f4] p-1">
                {segment(defaultChannel)}
                {segment(defaultChannel === 'line' ? 'whatsapp' : 'line')}
              </div>
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
                  onBlur={() => { const digits = phone.replace(/\D/g, ''); if (digits) trackOnce(`${channel}_filled`, digits, { digits: digits.length }) }}
                  className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-[#faf9f6] px-4 py-3.5 text-base text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  placeholder={countryCode ? CHANNELS[channel].placeholder : CHANNELS[channel].placeholderIntl}
                />
              </div>
              {errorBox}
              {/* Honeypot */}
              <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
              <button
                type="submit"
                className="w-full rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99]"
                data-cta="v9-submit"
              >
                Get Started
              </button>
            </form>
          )}

          {/* Same quiet exit as the page bottom, for the majority who never
              scroll past the card. */}
          <p className="mt-3 text-center text-[13px] text-neutral-400">
            <a
              href="/sign-up-collab/not-for-me"
              onClick={() => track('not_for_me_clicked', { placement: 'first_frame_card' })}
              className="underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-700"
            >
              It&rsquo;s not for me
            </a>
          </p>
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
              <span className="font-semibold text-neutral-700">Why free?</span> I&rsquo;m traveling the world &mdash; this is how I meet new people and capture beautiful places. See my work:{' '}
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

          {/* The way out, at the bottom where someone who has read everything
              and still isn't sold will be. Deliberately quiet. */}
          <p className="mt-8 border-t border-neutral-100 pt-5 text-center text-[13px] text-neutral-400">
            <a
              href="/sign-up-collab/not-for-me"
              onClick={() => track('not_for_me_clicked', { placement: 'first_frame' })}
              className="underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-700"
            >
              It&rsquo;s not for me
            </a>
          </p>

          {/* Bottom CTA — part of the page, not a floating bar. Whoever read
              this far scrolled past the card; this is the same tap. */}
          <button
            type="button"
            onClick={() => {
              track('sticky_cta_clicked', { placement: 'inline_bottom' })
              onChatTap()
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition hover:brightness-105"
            style={{ backgroundColor: brandColor, boxShadow: `0 12px 26px -14px ${brandColor}` }}
            data-cta="v9-chat-cta-bottom"
          >
            <ChatIcon className="h-4 w-4" />
            {tapLabel}
          </button>
        </div>
      </div>
    )
  }

  // ── Frame 2 · enrichment ──
  // One optional screen, everything on it skippable behind a single Done.
  // Every input PATCHes the provisional row as it lands, because the visitor
  // may never press Done — the chat app already has them.
  if (step === 'enrich') {
    const sheet = (srcs: string[], good: boolean) => (
      <div className="grid grid-cols-4 gap-[3px] rounded-xl bg-[#17150f] p-[3px]">
        {srcs.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden bg-black">
            <NextImage src={src} alt="" width={200} height={200} sizes="(max-width: 640px) 25vw, 100px" className={`h-full w-full object-cover ${good ? '' : 'opacity-[0.62] grayscale'}`} />
            <span className={`absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full ${good ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
              {good ? <CheckIcon className="h-2.5 w-2.5" />
                : <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>}
            </span>
          </div>
        ))}
      </div>
    )
    const sheetLabel = (good: boolean, text: string, note: string) => (
      <p className="flex flex-wrap items-baseline gap-x-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
        <span className={`inline-flex items-center gap-1.5 ${good ? 'text-emerald-600' : 'text-red-500'}`}>
          <span className={`h-1 w-1 rounded-full ${good ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {text}
        </span>
        <span className="font-semibold tracking-[0.12em] text-neutral-400">{note}</span>
      </p>
    )
    return slideShell(2, (
      <>
        {slideTitle('While you’re here', true)}
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">10 seconds, helps me plan. Everything here is optional &mdash; tap Done whenever.</p>

        {/* The look */}
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">What&rsquo;s your vibe?</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {VIBES.map(v => {
            const on = vibe === v.key
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  setVibe(v.key)
                  track('vibe_selected', { value: v.key })
                  fieldEngaged('vibe')
                  // State hasn't committed yet in this handler, so the fresh
                  // pick rides along explicitly.
                  queuePatch(undefined, { vibe: v.key })
                }}
                className={`relative aspect-square overflow-hidden rounded-2xl border-2 text-left transition active:scale-[0.98] ${
                  on ? 'border-emerald-600 shadow-[0_0_0_3px_rgba(5,150,105,0.16)]' : 'border-transparent'
                }`}
                data-cta={`v9-vibe-${v.key}`}
              >
                {v.src ? (
                  <NextImage src={v.src} alt="" fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(145deg, #423e38, #22201b)' }}>
                    <span className="atf-shimmer absolute inset-y-0 w-1/2" style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.14), transparent)' }} />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="atf-wobble flex h-11 w-11 items-center justify-center rounded-[14px] border-2 border-white/30 text-[20px] font-bold text-white/75">?</span>
                    </span>
                  </span>
                )}
                <span className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.72))' }} />
                <span className="absolute bottom-2.5 left-3 right-3 text-[13px] font-bold text-white" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.9)' }}>
                  {v.label}
                </span>
                {on && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Your photo */}
        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Your photo</p>
        <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">Selfies are fine &mdash; just looking to see the real you.</p>

        <div className="mt-3 space-y-2">
          {sheetLabel(true, 'Like this', "simple & natural, don't hide your face")}
          {sheet(['/images/collab-examples/good-1.jpg', '/images/collab-examples/good-2.jpg', '/images/collab-examples/good-3.jpg', '/images/collab-examples/good-4.jpg'], true)}
        </div>
        <div className="mt-3 space-y-2">
          {sheetLabel(false, 'Not like this', 'heavy makeup, filters, face hidden')}
          {sheet(['/images/collab-examples/bad-1.jpg', '/images/collab-examples/bad-2.jpg', '/images/collab-examples/bad-3.jpg', '/images/collab-examples/bad-4.jpg'], false)}
        </div>

        {photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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
          className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-emerald-500/50 bg-emerald-50/70 py-5 text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
          data-cta="v9-upload"
        >
          {processingPhotos ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" aria-label="Processing" />
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_16px_-8px_rgba(5,150,105,0.9)] transition group-hover:bg-emerald-500">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 16V4m0 0L7 9m5-5l5 5" /><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                </svg>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{photos.length > 0 ? 'Add another' : 'Upload'}</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />

        {/* Instagram */}
        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">Your Instagram</p>
        <div className="mt-2 flex items-center rounded-2xl border border-neutral-200 bg-[#faf9f6] px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
          <span className="pr-1 text-[17px] font-semibold text-neutral-300">@</span>
          <input
            value={instagram}
            onChange={e => { fieldEngaged('instagram'); setInstagram(e.target.value) }}
            onBlur={() => {
              const v = instagram.trim()
              if (v) { trackOnce('instagram_filled', v, { chars: v.length }); queuePatch() }
            }}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-transparent py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none"
            placeholder="yourhandle"
          />
        </div>

        <div className="mt-6 space-y-3">
          {errorBox}
          <button
            type="button"
            onClick={finishEnrich}
            disabled={processingPhotos}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-[15px] font-bold tracking-[-0.01em] text-white shadow-[0_12px_26px_-12px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50"
            data-cta="v9-done"
          >
            Done
          </button>
        </div>
      </>
    ))
  }

  // ── Done ──
  // Lands on the same paper as the enrichment frame. The copy sends them back
  // to the chat app, because the draft the tap opened may still be sitting
  // there unsent.
  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <style dangerouslySetInnerHTML={{ __html: slideMotionCss }} />
      <div className="mx-auto max-w-md px-4 pb-10 pt-7">
        {/* Mirrored to the right — there's nothing to go back to here, only to
            begin again (a shared phone, or a friend signing up next). */}
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={startOver}
            className="-mr-1 flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 py-2.5 pl-4 pr-3.5 text-[12px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500 active:scale-95"
            data-cta="v9-start-over"
          >
            Start over
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 2v6h6" /><path d="M3.5 13a9 9 0 106-9.7L3 8" />
            </svg>
          </button>
        </div>
        <div className="atf-card overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_24px_60px_-34px_rgba(23,21,15,0.55)]">
          <div className="relative h-48">
            <NextImage src={doneImage} alt="" fill priority sizes="(max-width: 640px) 100vw, 448px" className="object-cover object-center" style={{ filter: 'brightness(0.72) saturate(1.1)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
            <p className="absolute bottom-4 left-5 right-5 text-2xl font-semibold text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>You&apos;re in.</p>
          </div>
          <div className="space-y-5 px-6 pb-6 pt-4">
            <p className="text-sm text-neutral-500">
              {tappedThrough
                ? <>Check {CHANNELS[channel].name} &mdash; if the message didn&rsquo;t send, just hit send. I reply within 24 hours.</>
                : <>I&rsquo;ll message you on {CHANNELS[channel].name} within 24 hours. Let&rsquo;s make something great together.</>}
            </p>
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
        {ribbon(3)}
      </div>
    </div>
  )
}
