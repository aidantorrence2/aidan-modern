"use client"
import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import CountryCodeSelect from './CountryCodeSelect'
import { detectCountry, detectPhoneCountry } from '@/lib/detectCountry'
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

// ONE roll of film, not four galleries. Each slide shows a four-frame window
// into it, two frames further on than the last — so moving through the form
// winds the same roll forward. Frame numbers advance with it.
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
  '/images/proof/DSC_0526.jpg',
]

/** Window into the roll for a given step (2–5), plus its frame numbering. */
function rollAt(stepNo: number) {
  const offset = (stepNo - 2) * 2
  return { frames: ROLL.slice(offset, offset + 4), from: 11 + offset }
}

// The opening step names whichever channel is selected — see CHANNELS.step.
const howItWorks = [
  'I message you the details — timing, locations, what to wear',
  'We plan the concept together and shoot for 1–2 hours',
  "You get the edited photos — it's 100% free, always",
]

// Personal add-friend link. LINE can't deliver to a non-friend, so this tap is
// what opens the channel at all — on the LINE path it replaces the number field
// outright. Empty disables the button and falls the capture card back to a
// number field.
//
// Deliberately NOT the Official Account (@693bfnuc): LINE shows an "account is
// not verified" caution to anyone adding an unverified OA, which lands on cold
// ad traffic seconds after the tap. Worth revisiting once the OA is verified —
// the greeting message and the follow webhook only exist on that side.
const LINE_ADD_URL = 'https://line.me/ti/p/XKpsnykVaM'

// The row is written at the tap, before there's anything to identify it by —
// they tapped the add link, so the contact column can only say so. Everything
// after (location, photos, Instagram) PATCHes onto it. Their handle lands in
// the moodboard as it does on every other signup, and admin surfaces it from
// there.
//
// The cost is a row per tap, bounces included; the alternative was waiting for
// a slide they mostly never came back to, which lost the lead outright.
const LINE_ROW_CONTACT = 'LINE — added me'

// ── Resume ──
// The add-friend tap hands the visitor to the LINE app, and on mobile the
// browser goes to the background — often for good, sometimes with the tab
// discarded outright. Whatever they'd filled in was lost with it, and coming
// back meant starting at the hero again (and re-tapping a button that had
// already added them). A snapshot per change puts them back on the slide they
// left, holding the row they already created, so the return trip costs one tap
// and still enriches a single entry.
//
// localStorage, not sessionStorage: the way back is usually a fresh tab — a
// re-tapped ad, a reopened browser — which a session store can't reach.
const RESUME_TTL_MS = 24 * 60 * 60 * 1000

const resumeKey = (path: string) => `atf_signup_resume:${path}`

type ResumeState = {
  v: 1
  ts: number
  step: Step
  channel: Channel
  phone: string
  countryCode: string
  location: string
  idea: string
  instagram: string
  photos: string[]
  lead: { id: number | null; contact: string } | null
  // What was last sent to POST, so re-submitting an unchanged capture card
  // re-uses the row instead of writing a second one.
  postedContact: string | null
  leadFired: boolean
}

// Both channels are phone numbers, so the dial-code select, the digit
// validation and the E.164 normalization are shared — only the copy and the
// stored contactMethod differ.
type Channel = 'line' | 'whatsapp'

// ── Which channel to open on ──
// LINE is Thailand, Japan and Taiwan; the rest of the world runs on WhatsApp.
// So the question on load isn't "are they European" — it's whether there's a
// positive reason to think this person has LINE at all, with WhatsApp as the
// answer when there isn't.
//
// Language decides and timezone breaks the tie, because they answer different
// questions: the timezone says where the phone is (a Berliner on holiday
// reports Asia/Bangkok the day they land), while the language says whose phone
// it is and survives the flight.
const LINE_COUNTRIES = new Set(['TH', 'JP', 'TW'])

function localeParts(tag: string) {
  const parts = (tag || '').split('-')
  return {
    lang: (parts[0] || '').toLowerCase(),
    // Skips script subtags, so zh-Hant-TW reads as TW.
    region: parts.slice(1).find(p => /^[A-Za-z]{2}$/.test(p))?.toUpperCase() ?? null,
  }
}

function preferredChannel(iso: string | null): Channel {
  let tags: string[] = []
  try {
    tags = (navigator.languages?.length ? [...navigator.languages] : [navigator.language]).filter(Boolean)
  } catch {}

  // A LINE-country language anywhere in their list is the strongest signal
  // available.
  const speaksLineLanguage = tags.some(t => {
    const { lang, region } = localeParts(t)
    return lang === 'th' || lang === 'ja' || (lang === 'zh' && region === 'TW')
  })
  if (speaksLineLanguage) return 'line'

  const { lang, region } = localeParts(tags[0] ?? '')

  // Any other non-English phone in Thailand belongs to a visitor, and visitors
  // don't have LINE.
  if (lang && lang !== 'en') return 'whatsapp'

  // English carries a region on iOS and most Androids, and that region is the
  // tell: en-TH is a Thai phone switched to English, en-GB is a tourist.
  // en-US is the factory default the world over and says nothing either way.
  if (region && region !== 'US') return LINE_COUNTRIES.has(region) ? 'line' : 'whatsapp'

  // Nothing left to go on but where they physically are.
  return iso && LINE_COUNTRIES.has(iso) ? 'line' : 'whatsapp'
}

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

// Motion for the post-capture slides. The card rises as the ribbon winds on,
// frames catching up one at a time, so consecutive steps read as one take.
const slideMotionCss = `
@keyframes atfCardIn {
  from { opacity: 0; transform: translateY(12px) }
  to   { opacity: 1; transform: none }
}
@keyframes atfWindOn {
  from { opacity: 0; transform: translateX(13%) }
  to   { opacity: 1; transform: none }
}
@keyframes atfWindOnBack {
  from { opacity: 0; translate: 34px 26px }
  to   { opacity: 0.35; translate: none }
}
@keyframes atfFrameIn {
  from { opacity: 0; translate: 26px 18px }
  to   { opacity: 1; translate: none }
}
.atf-card { animation: atfCardIn 520ms cubic-bezier(.22,1,.36,1) both }
.atf-ribbon { animation: atfWindOn 780ms cubic-bezier(.19,1,.28,1) 90ms both }
.atf-ribbon-back { animation: atfWindOnBack 860ms cubic-bezier(.19,1,.28,1) both }
.atf-frame { animation: atfFrameIn 620ms cubic-bezier(.19,1,.28,1) both }
@media (prefers-reduced-motion: reduce) {
  .atf-card, .atf-ribbon, .atf-ribbon-back, .atf-frame { animation: none }
}
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

  // The row this visitor owns. The ref is what the PATCH chain awaits; the
  // state mirror is what gets snapshotted, so a resumed visitor enriches the
  // same entry rather than creating a second one.
  const leadRef = useRef<Promise<{ id: number | null; contact: string } | null> | null>(null)
  const patchChain = useRef<Promise<unknown> | null>(null)
  const [leadRecord, setLeadRecord] = useState<{ id: number | null; contact: string } | null>(null)
  const [postedContact, setPostedContact] = useState<string | null>(null)
  // The Meta Lead has been counted for this visitor. Backing up to the capture
  // card and submitting again must not count a second one.
  const [leadFired, setLeadFired] = useState(false)
  // Nothing is written to storage until the restore pass has run, or the empty
  // first render would clobber the snapshot it's about to read.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    initPageAnalytics(analyticsPath, { version: 'v3-capture-first' })

    let resumed: ResumeState | null = null
    try {
      const raw = localStorage.getItem(resumeKey(analyticsPath))
      if (raw) {
        const saved = JSON.parse(raw) as ResumeState
        if (saved?.v === 1 && Date.now() - saved.ts < RESUME_TTL_MS) resumed = saved
        else localStorage.removeItem(resumeKey(analyticsPath))
      }
    } catch {}

    if (resumed) {
      setStep(resumed.step)
      setChannel(resumed.channel)
      setPhone(resumed.phone)
      setCountryCode(resumed.countryCode)
      setLocation(resumed.location)
      setIdea(resumed.idea)
      setInstagram(resumed.instagram)
      setPhotos(resumed.photos)
      setPostedContact(resumed.postedContact)
      setLeadFired(resumed.leadFired)
      if (resumed.lead) {
        setLeadRecord(resumed.lead)
        leadRef.current = Promise.resolve(resumed.lead)
      }
      track('flow_resumed', {
        slide: resumed.step,
        has_row: !!resumed.lead,
        away_ms: Date.now() - resumed.ts,
        photos: resumed.photos.length,
      })
    }

    // Same detection the old form shipped with (PRs #27–#30): timezone →
    // country, chips + dial localized, nothing shown until detection succeeds.
    // The two answer different questions, so they're detected separately: the
    // chips are about the place they'll be photographed in, the dial code about
    // whose phone number is going in the field.
    const country = detectCountry()
    const phoneCountry = detectPhoneCountry()
    if (country) setCountryIso(country.iso)
    // A restored dial code is the visitor's own pick — detection must not
    // overwrite it.
    if (phoneCountry && !resumed?.countryCode) setCountryCode(phoneCountry.dial)
    if (country || phoneCountry) {
      track('country_detected', { iso: country?.iso ?? null, dial_iso: phoneCountry?.iso ?? null })
    }

    // Open on whichever channel they're likely to have. Skipped entirely for a
    // resumed visitor: the snapshot's channel is one they've already lived
    // with, and may have picked by hand. Pair channel_defaulted with the
    // channel_switched that follows it to see how often this guesses wrong.
    if (!resumed) {
      const preferred = preferredChannel(country?.iso ?? null)
      setChannel(preferred)
      let primaryLang: string | null = null
      try { primaryLang = navigator.languages?.[0] ?? navigator.language ?? null } catch {}
      track('channel_defaulted', { to: preferred, iso: country?.iso ?? null, lang: primaryLang })
    }
    setHydrated(true)
  }, [analyticsPath])

  // Snapshot of everything needed to put them back. Called from the two
  // effects below rather than on every render — with photos in the payload
  // this serializes megabytes, which is not something to do per keystroke.
  function persistResume() {
    const touched = step !== 'capture' || !!phone || !!location || !!idea || !!instagram || photos.length > 0
    if (!touched) return
    const base: Omit<ResumeState, 'photos'> = {
      v: 1,
      ts: Date.now(),
      step,
      channel,
      phone,
      countryCode,
      location,
      idea,
      instagram,
      lead: leadRecord,
      postedContact,
      leadFired,
    }
    const write = (withPhotos: string[]) =>
      localStorage.setItem(resumeKey(analyticsPath), JSON.stringify({ ...base, photos: withPhotos }))
    try {
      // resizeImage already caps each photo at 300 KB, so a realistic set fits
      // the ~5 MB quota several times over. If an outlier does blow it, the
      // typed fields are worth far more than the previews — and anything past
      // the photos slide is uploaded to the row regardless.
      write(photos)
    } catch {
      try { write([]) } catch {}
    }
  }

  // Discrete moves — a slide change, an upload, the row landing. Written at
  // once: the LINE tap advances the slide and hands the browser off in the
  // same beat, so a debounce window here could be the last thing that ever
  // happens on this page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (hydrated) persistResume() }, [hydrated, step, channel, photos, leadRecord, postedContact, leadFired])

  // Typing coalesces. Nothing is lost by a keystroke going unsaved — the next
  // Next/Back writes the field anyway.
  useEffect(() => {
    if (!hydrated) return
    const t = setTimeout(persistResume, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, phone, countryCode, location, idea, instagram])

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

  // The other channel is a real control, not small print. It sits under the
  // primary CTA as an outlined button in that channel's own green: unmissable
  // for anyone the default guessed wrong, while the filled/outlined split keeps
  // one obvious primary so the capture step still reads as a single ask.
  const switchButton = (
    <button
      type="button"
      onClick={() => switchChannel(channel === 'line' ? 'whatsapp' : 'line')}
      className={`flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] py-3.5 text-[15px] font-bold transition active:scale-[0.99] ${
        channel === 'line'
          ? 'border-[#25D366]/55 bg-[#25D366]/[0.06] text-[#1a7f47] hover:border-[#25D366] hover:bg-[#25D366]/[0.11]'
          : 'border-[#06C755]/55 bg-[#06C755]/[0.06] text-[#05803a] hover:border-[#06C755] hover:bg-[#06C755]/[0.11]'
      }`}
      data-cta="sign-up-collab-v3-switch"
    >
      {channel === 'line'
        ? <><WhatsappIcon className="h-5 w-5" />Use WhatsApp instead</>
        : <><LineIcon className="h-5 w-5" />Add me on LINE instead</>}
    </button>
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
    track('channel_switched', { from: channel, to: next, had_digits: phone.replace(/\D/g, '').length > 0 })
    setChannel(next)
    setError(null)
    // Coming from LINE there's no field on screen yet, so the focus has to wait
    // for the number channel to render it.
    requestAnimationFrame(() => phoneRef.current?.focus())
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
  function startLeadPost(contact: string, extra?: { city?: string; moodboard?: string[] }) {
    setPostedContact(contact)
    const attempt = async (): Promise<{ id: number | null; contact: string }> => {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: extra?.city ?? '',
          contactMethod: channel,
          contact,
          moodboard: extra?.moodboard ?? ['Collab sign-up', 'Signup flow: v3-capture-first'],
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
        setLeadRecord(lead)
        // The LINE path already counted its Lead at the add-friend tap, and a
        // visitor who backed up and re-submitted has been counted once too.
        if (typeof window !== 'undefined' && !opensLine && !leadFired) {
          const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
          if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v3' })
          setLeadFired(true)
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

    // LINE path: nothing is typed, so the tap itself is the conversion — and
    // it's the last thing a good share of these visitors ever do on this page,
    // because LINE takes the foreground and the browser doesn't get it back.
    // So the row goes in here, at the tap, with everything they fill in
    // afterwards PATCHing onto it. LINE opens synchronously, so pop-up blockers
    // treat it as user-initiated; the POST is already in flight by then and
    // doesn't need to finish first.
    if (opensLine) {
      track('line_add_clicked', { placement: 'capture', repeat: leadFired })
      track('submit_attempt', { channel, digits: 0, elapsed_ms: pageElapsedMs() })
      flushNow()
      // Fired here rather than on a POST: on this path the tap is the lead, so
      // without it the ad account would see no conversions at all. Once only —
      // backing up to this card and tapping again is the same lead.
      if (!leadFired) {
        const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
        if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'sign-up-collab-v3' })
        setLeadFired(true)
      }
      // Guarded so backing up to this card and tapping again enriches the row
      // they already have instead of writing a second one.
      if (!leadRef.current) startLeadPost(LINE_ROW_CONTACT)
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
    // Backing up and coming through again re-uses the row — unless the number
    // itself changed, in which case the old row holds one they've corrected and
    // a fresh POST is the only way to record the new one.
    const typed = countryCode ? countryCode + ' ' + phone.trim() : phone.trim()
    if (!leadRef.current || postedContact !== typed) startLeadPost(typed)
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
    // Both paths POST at capture, so by here the row exists. This is the net
    // for the one case that skips it: a channel switched to LINE after the
    // capture card was already behind them.
    if (!leadRef.current && opensLine) {
      startLeadPost(LINE_ROW_CONTACT, { city: location.trim(), moodboard: moodboardSoFar() })
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

  // Back never saves: they're on their way to change something, and the PATCH
  // for whatever they change lands on the next forward move.
  function goBack(prev: Step) {
    track('slide_back', { from: step, to: prev })
    setError(null)
    setStep(prev)
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

    // Only one case lands here with no row now that both paths POST at
    // capture: that POST failed, twice. Save everything in one shot. On the
    // LINE path there's no number, so the Instagram handle is the only contact
    // there is — and when that's blank too, the row is still worth writing for
    // the location and photos.
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

  const inputCls = 'w-full rounded-2xl border border-neutral-200 bg-[#faf9f6] px-4 py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'

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
  // Slides sit on a warm paper ground with the form on a raised card — the
  // stark white pages were the reason the flow fell off a cliff after the hero.
  const slideShell = (stepNo: number, children: React.ReactNode) => (
    <div className="min-h-screen bg-[#f4f2ee]">
      <style dangerouslySetInnerHTML={{ __html: slideMotionCss }} />
      {/* key forces the enter animation to replay on every step, so the five
          slides read as one continuous sequence rather than five hard cuts. */}
      <div key={stepNo} className="mx-auto max-w-md px-4 pb-10 pt-7">
        <div className="atf-card rounded-[26px] border border-black/[0.06] bg-white px-5 pb-6 pt-5 shadow-[0_24px_60px_-34px_rgba(23,21,15,0.55)]">
          {children}
        </div>
        {ribbon(stepNo)}
      </div>
    </div>
  )
  const slideKicker = (n: number, back: Step) => (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => goBack(back)}
        aria-label="Back"
        className="-my-2 -ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <p className="shrink-0 text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">{n} / 5</p>
      <span className="flex flex-1 gap-1.5" aria-hidden="true">
        {[2, 3, 4, 5].map(i => (
          <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${i <= n ? 'bg-emerald-600' : 'bg-neutral-200'}`} />
        ))}
      </span>
    </div>
  )
  const slideTitle = (t: string) => (
    <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}>{t}</h1>
  )
  // He shoots film, so the proof is film — and the roll doesn't lie flat. Each
  // frame is placed on a sine, tilted to the tangent and overlapped with its
  // neighbours, so the strip genuinely rises and falls across the slide instead
  // of being a rotated bar. The phase shifts by step, so the ribbon is caught
  // mid-travel at a different point every time.
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
        <NextImage src={src} alt="" width={260} height={340} sizes="128px" className="h-full w-full object-cover" />
      </div>
      {sprockets(small)}
      <div className="flex justify-start pl-1 pt-[1px]">
        <span className="text-[6px] font-bold tracking-[0.22em] text-[#e0a13f]">{no}{i % 2 === 0 ? 'A' : ''}</span>
      </div>
    </div>
  )
  const ribbon = (stepNo: number) => {
    const { frames, from } = rollAt(stepNo)
    const phase = (stepNo - 2) * 0.75
    // Trailing frames from further down the roll, smaller and set back.
    const trail = ROLL.slice(6, 9)
    return (
      <div className="relative mt-2 -mx-4 h-[214px] select-none overflow-hidden" aria-hidden="true">
        {trail.map((src, i) => {
          const t = i + phase + 2.4
          return (
            <div
              key={`t-${src}`}
              className="atf-ribbon-back absolute w-[86px] opacity-[0.35]"
              style={{
                left: `${4 + i * 27}%`,
                top: 74 + Math.sin(t * 0.8) * 28,
                transform: `rotate(${Math.cos(t * 0.8) * 9}deg)`,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {cell(src, from + 6 + i, i, true)}
            </div>
          )
        })}
        {frames.map((src, i) => {
          const t = i + phase
          return (
            <div
              key={src}
              className="atf-frame absolute w-[118px]"
              style={{
                left: `${-9 + i * 25}%`,
                top: 22 + Math.sin(t * 0.8) * 32,
                transform: `rotate(${Math.cos(t * 0.8) * 8}deg)`,
                animationDelay: `${120 + i * 90}ms`,
              }}
            >
              {cell(src, from + i, i, false)}
            </div>
          )
        })}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f4f2ee] to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f4f2ee] to-transparent" />
      </div>
    )
  }
  const nextBtn = (onClick: () => void, label = 'Next', busy = false) => (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="w-full rounded-2xl bg-emerald-600 py-4 text-[15px] font-bold tracking-[-0.01em] text-white shadow-[0_12px_26px_-12px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50"
      data-cta="sign-up-collab-v3-next"
    >
      {busy ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" aria-label="Loading" />
      ) : label}
    </button>
  )
  const skipBtn = (onClick: () => void) => (
    <button type="button" onClick={onClick} className="w-full text-center text-[13px] font-semibold text-neutral-400 transition hover:text-neutral-600">
      Skip
    </button>
  )
  const errorBox = error ? (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</div>
  ) : null

  if (step === 'photos') {
    // The examples are a contact sheet: two rows of frames, marked up the way
    // you'd mark up a proof print — a grease-pencil tick or cross in the corner.
    const sheet = (srcs: string[], good: boolean) => (
      <div className="grid grid-cols-4 gap-[3px] rounded-xl bg-[#17150f] p-[3px]">
        {srcs.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden bg-black">
            <NextImage
              src={src}
              alt=""
              width={200}
              height={200}
              sizes="(max-width: 640px) 25vw, 100px"
              className={`h-full w-full object-cover ${good ? '' : 'opacity-[0.62] grayscale'}`}
            />
            <span className={`absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full ${good ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
              {good
                ? <CheckIcon className="h-2.5 w-2.5" />
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
    return slideShell(3,
      <>
        {slideKicker(3, 'location')}
        {slideTitle('Your photo')}
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">Selfies are fine &mdash; just looking to see the real you.</p>

        <div className="mt-5 space-y-2">
          {sheetLabel(true, "Like this", "simple & natural, don't hide your face")}
          {sheet(['/images/collab-examples/good-1.jpg', '/images/collab-examples/good-2.jpg', '/images/collab-examples/good-3.jpg', '/images/collab-examples/good-4.jpg'], true)}
        </div>
        <div className="mt-3 space-y-2">
          {sheetLabel(false, "Not like this", "heavy makeup, filters, face hidden")}
          {sheet(['/images/collab-examples/bad-1.jpg', '/images/collab-examples/bad-2.jpg', '/images/collab-examples/bad-3.jpg', '/images/collab-examples/bad-4.jpg'], false)}
        </div>

        {photos.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="Preview" className="h-[72px] w-[72px] rounded-xl object-cover shadow-[0_8px_18px_-10px_rgba(23,21,15,0.7)] ring-1 ring-black/10" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white shadow transition hover:bg-red-500"
                  aria-label="Remove photo"
                >
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
          className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-emerald-500/50 bg-emerald-50/70 py-5 text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
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

        <div className="mt-6 space-y-3">
          {errorBox}
          {nextBtn(() => {
            if (photos.length === 0) {
              track('validation_error', { reason: 'photo_missing' })
              setError("Add one photo of yourself so I know who I'm shooting.")
              return
            }
            advance('instagram', true, photos)
          }, 'Next', processingPhotos)}
        </div>
      </>,
    )
  }

  if (step === 'location') {
    return slideShell(2,
      <>
        {slideKicker(2, 'capture')}
        {slideTitle('Where are you located?')}
        {chips.length > 0 && <div className="mt-5 flex flex-wrap gap-2">
          {chips.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => { fieldEngaged('location'); track('location_selected', { method: 'chip', value: chip }); setLocation(chip); setError(null) }}
              className={`rounded-full border px-4 py-2 text-[13px] font-bold tracking-[-0.01em] transition-all ${
                location.trim() === chip
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_8px_18px_-10px_rgba(5,150,105,0.9)]'
                  : 'border-neutral-200 bg-[#faf9f6] text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>}
        <input
          value={location}
          onChange={e => { fieldEngaged('location'); setLocation(e.target.value); setError(null) }}
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
        <div className="mt-6 space-y-3">
          {errorBox}
          {nextBtn(() => {
            if (!location.trim()) {
              track('validation_error', { reason: 'location_missing' })
              setError('Let me know where you are so I can plan the shoot.')
              return
            }
            advance('photos', true)
          })}
        </div>
      </>,
    )
  }

  if (step === 'instagram') {
    return slideShell(4,
      <>
        {slideKicker(4, 'photos')}
        <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}>
          Your Instagram <span className="text-[17px] font-normal not-italic text-neutral-400">optional</span>
        </h1>
        <div className="mt-5 flex items-center rounded-2xl border border-neutral-200 bg-[#faf9f6] px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
          <span className="pr-1 text-[17px] font-semibold text-neutral-300">@</span>
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
            className="w-full bg-transparent py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none"
            placeholder="yourhandle"
          />
        </div>
        <div className="mt-6 space-y-3">
          {nextBtn(() => advance('notes', instagram.trim().length > 0))}
          {skipBtn(() => advance('notes', false))}
        </div>
      </>,
    )
  }

  if (step === 'notes') {
    return slideShell(5,
      <>
        {slideKicker(5, 'instagram')}
        {slideTitle('Anything else?')}
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">Your own idea, inspo, references &mdash; anything.</p>
        <textarea
          id="collab-idea"
          value={idea}
          onChange={e => { fieldEngaged('notes'); setIdea(e.target.value) }}
          onBlur={() => {
            const v = idea.trim()
            if (v) trackOnce('notes_filled', v, { chars: v.length })
          }}
          rows={4}
          className={`${inputCls} mt-4 resize-none leading-relaxed`}
          placeholder="Totally optional..."
        />
        <div className="mt-6 space-y-3">
          {nextBtn(finishSignup, 'Finish Sign-Up')}
        </div>
      </>,
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
          {switchButton}
          {opensLine && (
            <p className="text-center text-sm text-neutral-500">&hellip;then finish signing up :)</p>
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
