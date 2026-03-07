'use client'

const BOOKING_URL = 'https://cal.com/aidantorrence/free-photo-shoot'

export default function ManilaFreeStickyCTA(){
  function trackStickyBooking(){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Manila Free Collab Sessions',
        content_category: 'Intro Call Signup - Sticky'
      })
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur shadow-[0_-12px_30px_rgba(0,0,0,0.12)]">
      <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-neutral-600">
          Free collab sessions - sign up for a spot
        </p>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          onClick={trackStickyBooking}
          className="btn inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 sm:text-sm"
          data-cta="manila-free-sticky-signup"
        >
          Sign up
        </a>
      </div>
    </div>
  )
}
