import type { Metadata } from 'next'

const TITLE = 'Session Moodboard — Aidan Torrence'
const DESCRIPTION = 'Natural light, film, editorial portraiture. A reference moodboard for your shoot.'
const OG_IMAGE = 'https://aidantorrence.com/moodboard/og-v2.jpg'

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
    <>
      {/* This page is just the moodboard — hide the global header/footer chrome.
          Use dangerouslySetInnerHTML so the CSS isn't HTML-escaped (a plain
          JSX text child would render `body &gt; header`, which is invalid CSS). */}
      <style
        dangerouslySetInnerHTML={{
          __html: 'body > header, body > footer { display: none !important; }',
        }}
      />
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/moodboard/nature-moodboard-v2.png"
          alt="Photo session moodboard — natural light film portraits in nature"
          width={2399}
          height={2399}
          className="h-auto max-h-[100dvh] w-full max-w-[100vw] object-contain"
        />
      </div>
    </>
  )
}
