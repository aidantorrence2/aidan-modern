'use client'

const BOOKING_URL = 'https://cal.com/aidantorrence/manila-free-photo-shoot'

export default function ManilaFreeCTA(){
  function trackBookingClick(source: string){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Manila Free Collab Sessions',
        content_category: 'Intro Call Signup',
        source
      })
    }
  }

  return (
    <div className="mt-5 space-y-3">
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackBookingClick('primary-cta')}
        className="btn w-full rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800 sm:text-base"
        data-cta="manila-free-apply-primary"
      >
        Apply for a free session
      </a>

      <p className="text-xs text-neutral-600">
        Takes less than a minute. Choose a time for a quick intro call.
      </p>
    </div>
  )
}
