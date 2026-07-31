"use client"
import { useEffect, useState } from 'react'
import NextImage from 'next/image'
import { initPageAnalytics, track } from '@/lib/track'

// The v5 opening page with the form taken out. Same hero, same proof grid,
// same how-it-works — but the card answers questions instead of asking for a
// number, the FAQ is the body of the page, and the only ask is at the very
// end: DM me on Instagram. Everything before that is information.

const INSTAGRAM_HANDLE = 'madebyaidan'
const IG_DM_URL = `https://ig.me/m/${INSTAGRAM_HANDLE}`
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
  'Message me on Instagram',
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
  {
    q: 'How do I sign up?',
    a: <>Just DM me on Instagram &mdash; say you&rsquo;re interested and tell me your city. That&rsquo;s it; I&rsquo;ll take it from there.</>,
  },
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
  )
}

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

  useEffect(() => {
    initPageAnalytics(analyticsPath, { version: 'faq-ig' })
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

  function onDmClick(placement: string) {
    track('ig_dm_clicked', { placement })
    const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
    if (typeof fbq === 'function') fbq('track', 'Lead', { source: 'free-shoot-faq' })
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
          <p className="mt-1.5 text-[15px] font-medium text-white/85" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            Everything you need to know, then one DM.
          </p>
        </div>
      </div>

      {/* Opening card — sits where v5's capture card sits, but it answers the
          first question instead of asking one. */}
      <div className="relative z-10 mx-4 -mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
        <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}>
          The short version
        </h2>
        <ul className="mt-3 space-y-2">
          {[
            'A real photo shoot, shot on 35mm film',
            "100% free, always — no fee, no deposit, no catch",
            'You keep the edited photos and use them however you want',
            'No experience needed — I direct the whole shoot',
          ].map((c, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckIcon className="h-2.5 w-2.5" />
              </span>
              <span className="text-[13px] leading-snug font-medium text-neutral-700">{c}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
          The full story is below &mdash; how it works, what to expect, and every question people ask. When you&rsquo;re ready, signing up is one Instagram message.
        </p>
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

        {/* How it works */}
        <div className="mt-8 space-y-2">
          {sectionLabel('How it works')}
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

        {/* The ask — the one and only sign-up step, saved for the end. */}
        <div className="mt-10 rounded-2xl border border-neutral-200 bg-[#faf9f6] p-5 text-center">
          <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.01em] text-neutral-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}>
            Sound good?
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
            Send me a DM &mdash; say you&rsquo;re interested and tell me your city. I reply personally to everyone.
          </p>
          <a
            href={IG_DM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDmClick('bottom_card')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99]"
            data-cta="free-shoot-ig-dm"
          >
            <InstagramIcon className="h-5 w-5" />
            DM me on Instagram
          </a>
          <a
            href={IG_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('handle_clicked', { placement: 'bottom_card' })}
            className="mt-3 inline-block text-[13px] font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2"
          >
            or see my work first: @{INSTAGRAM_HANDLE}
          </a>
        </div>

        {/* The way out, quiet as ever — an exit, not an option being offered. */}
        <p className="mt-8 border-t border-neutral-100 pt-5 text-center text-[13px] text-neutral-400">
          <a
            href="/sign-up-collab/not-for-me"
            onClick={() => track('not_for_me_clicked', { placement: 'page_bottom' })}
            className="underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-700"
          >
            It&rsquo;s not for me
          </a>
        </p>
      </div>
    </div>
  )
}
