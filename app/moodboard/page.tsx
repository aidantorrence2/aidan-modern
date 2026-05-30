import type { Metadata } from 'next'

const TITLE = 'Session Moodboard — Aidan Torrence'
const DESCRIPTION = 'Natural light, film, editorial portraiture. A reference moodboard for your shoot.'
const OG_IMAGE = 'https://aidantorrence.com/moodboard/og.jpg'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://aidantorrence.com/moodboard',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1080, height: 1080, alt: 'Session moodboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function MoodboardPage() {
  return (
    <div className="min-h-[100dvh] bg-paper">
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10 sm:px-6">
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Reference
          </p>
          <h1 className="mt-3 text-[30px] leading-[1.05] sm:text-[38px]">Session moodboard</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Natural light · film · relaxed editorial portraits — the look we&apos;re going for.
          </p>
        </header>

        <figure className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/moodboard/nature-moodboard.png"
            alt="Photo session moodboard — natural light film portraits in nature"
            width={1000}
            height={1000}
            className="block h-auto w-full"
          />
        </figure>

        <div className="mt-8 text-center">
          <a href="/availability" className="btn btn-primary">
            See available times
          </a>
          <p className="mt-4 text-[12px] text-muted">
            Aidan Torrence Photography · film &amp; editorial sessions
          </p>
        </div>
      </div>
    </div>
  )
}
