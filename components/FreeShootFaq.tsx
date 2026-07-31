"use client"
import { useEffect, useState } from 'react'
import NextImage from 'next/image'
import { initPageAnalytics, track, pageElapsedMs, flushNow } from '@/lib/track'

// Info page for people who have ALREADY signed up — the v5 opening page with
// the sign-up flow taken out. Proof, what happens next, and the full FAQ. The
// only input is at the very end: their Instagram handle, collected purely so
// this visit can be matched to the sign-up they already made.

const INSTAGRAM_HANDLE = 'madebyaidan'
const IG_PROFILE_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`

const HERO_SLIDES = [
  '/images/faves/000039-3.jpg',
  '/images/proof/000041.jpg',
  '/images/proof/000019-6.jpg',
  '/images/proof/000023.jpg',
  '/images/proof/DSC_0347.jpg',
]

const proofImages = [
  '/images/large/000020-7.jpg',
  '/images/large/aidanto-r4-053-25.jpg',
  '/images/faves/000047-4.jpg',
  '/images/faves/000040-5.jpg',
  '/images/large/manila-gallery-tropical-001.jpg',
  '/images/faves/000010-6.jpg',
]

const howItWorks = [
  'I send you the details — timing, locations, what to wear',
  'We plan the concept together and shoot for 1–2 hours',
  "You get the edited photos — it's 100% free, always",
]

// Same promises the sign-up flows make on the way through — free always,
// 1–2 hours, we plan it together, you keep the edited photos — so whichever
// page someone read first, this one agrees with it.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is it really free?',
    a: <>Yes &mdash; 100% free, always. There is no session fee, no deposit, and nothing to buy afterwards. You keep the edited photos.</>,
  },
  {
    q: 'Why is it free?',
    a: <>I&rsquo;m traveling the world, and this is how I meet new people and photograph beautiful places. You get photos you love; I get to keep shooting somewhere new.</>,
  },
  {
    q: 'What’s the catch?',
    a: <>There isn&rsquo;t one. It&rsquo;s a collaboration: I may share some of the photos on my Instagram and in my portfolio. If you&rsquo;d rather I didn&rsquo;t, just tell me and I won&rsquo;t.</>,
  },
  {
    q: 'Do I need modeling experience?',
    a: <>No. I direct you through the whole shoot &mdash; where to stand, what to do with your hands, where to look &mdash; so you don&rsquo;t need to know how to pose.</>,
  },
  {
    q: 'What if I’m nervous in front of the camera?',
    a: <>Totally normal &mdash; most people I shoot with have never done a photo shoot before. We start slow, I direct every frame, and it usually stops feeling like a photo shoot within the first fifteen minutes.</>,
  },
  {
    q: 'How long does it take?',
    a: <>We shoot for one to two hours. We&rsquo;ll plan the concept together beforehand over Instagram, WhatsApp, or LINE, so the time on the day is spent shooting.</>,
  },
  {
    q: 'Where do we shoot?',
    a: <>We&rsquo;ll decide together based on the vibe of the shoot, quality of the location, and convenience for traveling.</>,
  },
  {
    q: 'What should I wear?',
    a: <>I will send over a moodboard and I would love to know your ideas as well. Once everything is decided, you can choose outfit options accordingly.</>,
  },
  {
    q: 'What do you shoot on?',
    a: <>35mm film. It&rsquo;s the look you see across my Instagram and in the photos on this page &mdash; real grain, real color, nothing over-processed.</>,
  },
  {
    q: 'When do I get the photos?',
    a: <>I will send you the final photos after the film is developed and scanned. The whole process is usually completed within 2 weeks. I will send you the photos in full resolution over Google Drive.</>,
  },
  {
    q: 'Can I use the photos however I want?',
    a: <>Yes &mdash; they&rsquo;re yours. Post them, print them, use them for whatever you like.</>,
  },
]

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function FreeShootFaq({ analyticsPath = '/free-shoot' }: { analyticsPath?: string }) {
  const [heroIndex, setHeroIndex] = useState(0)
  const [instagram, setInstagram] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initPageAnalytics(analyticsPath, { version: 'faq-info' })
  }, [analyticsPath])

  // Hero crossfade, same cadence as v5. Stopped entirely for anyone who asked
  // for less motion — they get the opening frame and nothing moves.
  useEffect(() => {
    let reduced = false
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch {}
    if (reduced) return
    const t = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 4200)
    return () => clearInterval(t)
  }, [])

  // The handle is only for matching this page's reader to the sign-up they
  // already made — it writes a row tagged with the info page so it's easy to
  // pair up in /admin, not a new lead.
  async function submitInstagram(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const handle = instagram.trim().replace(/^@+/, '')
    if (!handle) {
      track('validation_error', { reason: 'instagram_missing' })
      setError('Enter your Instagram handle so I can match you to your sign-up.')
      return
    }
    setError(null)
    setSubmitting(true)
    track('instagram_submit_attempt', { chars: handle.length, elapsed_ms: pageElapsedMs() })
    try {
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: '',
          contactMethod: 'instagram',
          contact: '@' + handle,
          moodboard: ['Info page: ' + analyticsPath, 'Instagram: @' + handle],
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error('Failed')
      track('instagram_submit_success', { elapsed_ms: pageElapsedMs() })
      flushNow()
      setSubmitted(true)
    } catch {
      track('instagram_submit_error', { elapsed_ms: pageElapsedMs() })
      setError('Something went wrong — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const sectionLabel = (text: string) => (
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">{text}</p>
  )

  return (
    <div className="mx-auto w-full max-w-md bg-white">
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
          href={IG_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('handle_clicked', { placement: 'hero' })}
          className="absolute right-5 top-4 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-white/90"
        >
          <InstagramIcon className="h-4 w-4" />
          @{INSTAGRAM_HANDLE}
        </a>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
          <h1 className="font-display text-[40px] font-bold leading-[1.05] text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textShadow: '0 2px 8px rgba(0,0,0,0.85), 0 12px 50px rgba(0,0,0,0.6)' }}>
            Free Photo Shoot
          </h1>
        </div>
      </div>

      <div className="px-5 pb-24 pt-8">
        {/* Proof */}
        <div className="space-y-1.5">
          {sectionLabel('Recent shoots · shot on film')}
          <div className="grid grid-cols-3 gap-1.5">
            {proofImages.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-lg aspect-[3/4] bg-neutral-100">
                <NextImage src={src} alt="Recent photo shoot" width={200} height={267} sizes="(max-width: 640px) 33vw, 150px" className="w-full h-full object-cover object-top" />
              </div>
            ))}
          </div>
        </div>

        {/* What happens next — they've signed up already; this is the process
            from here. */}
        <div className="mt-8 space-y-2">
          {sectionLabel('What happens next')}
          <ul className="space-y-2">
            {howItWorks.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600">
                  {i + 1}
                </span>
                <span className="text-[13px] leading-snug font-medium text-neutral-700">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ — the body of the page */}
        <div className="mt-10">
          <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}>
            Questions, answered
          </h2>
          <dl className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="py-4">
                <dt
                  className="text-[17px] font-semibold leading-snug text-neutral-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
                >
                  {q}
                </dt>
                <dd className="mt-1.5 text-[14px] leading-relaxed text-neutral-600">{a}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The only input on the page — the handle that pairs this reader with
            the sign-up they already made. */}
        <div className="mt-10 rounded-2xl border border-neutral-200 bg-[#faf9f6] p-5">
          {submitted ? (
            <div className="text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              </span>
              <h2 className="mt-3 text-[26px] font-semibold leading-[1.15] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}>
                Got it
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
                You&rsquo;re matched up. I&rsquo;ll be in touch on Instagram.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}>
                Your Instagram
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
                So I can match you to your sign-up &mdash; that&rsquo;s all it&rsquo;s for.
              </p>
              <form onSubmit={submitInstagram} className="mt-4 space-y-3">
                <div className="flex items-center rounded-2xl border border-neutral-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <span className="pr-1 text-[17px] font-semibold text-neutral-300">@</span>
                  <input
                    value={instagram}
                    onChange={e => { setInstagram(e.target.value); setError(null) }}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full bg-transparent py-3.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none"
                    placeholder="yourhandle"
                  />
                </div>
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50"
                  data-cta="free-shoot-ig-submit"
                >
                  {submitting ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Sending" />
                  ) : (
                    <>
                      <InstagramIcon className="h-5 w-5" />
                      Submit
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
