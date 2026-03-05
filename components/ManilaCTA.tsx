'use client'

const BOOKING_URL = 'https://cal.com/aidantorrence/manila-photo-shoot'

export default function ManilaCTA(){
  function trackBookingClick(source: string){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Manila Photo Sessions',
        content_category: 'Calendar Booking',
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
        data-cta="manila-booking-primary"
      >
        Book your time slot now
      </a>

      <p className="text-xs text-neutral-600">
        Takes less than a minute. Pick your preferred date and time directly.
      </p>
    </div>
  )
}
