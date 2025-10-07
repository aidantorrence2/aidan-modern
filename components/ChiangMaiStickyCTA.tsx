'use client'

const WHATSAPP_NUMBER = '491758966210'
const WHATSAPP_MESSAGE = "Hey! Interested in the free Chiang Mai shoot"
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export default function ChiangMaiStickyCTA(){
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: 'Chiang Mai Free Photo Shoot',
        content_category: 'WhatsApp Lead - Sticky'
      })
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur shadow-[0_-12px_30px_rgba(0,0,0,0.12)]">
      <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-neutral-600">
          Chiang Mai · Oct 6–11 · Limited slots
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={handleClick}
          className="btn flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white sm:px-6"
          style={{ backgroundColor: '#25D366' }}
          data-cta="chiang-mai-sticky-whatsapp"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5 text-white"
            >
              <path
                fill="currentColor"
                d="M12 2C6.5 2 2 6.4 2 11.8c0 2 .6 3.9 1.7 5.5L2 22l4.8-1.5c1.5.8 3.2 1.2 4.9 1.2 5.5 0 9.9-4.4 9.9-9.8C21.6 6.4 17.3 2 12 2Zm0 17.6c-1.5 0-3-.4-4.3-1.1l-.3-.2-2.9.9.9-2.8-.2-.3C4.3 15.7 3.8 13.8 3.8 12c0-4.5 3.7-8.1 8.2-8.1s8.2 3.6 8.2 8.1-3.7 8-8.2 8Z"
              />
              <path
                fill="currentColor"
                d="M16.6 13.1c-.3-.1-1.8-.9-2-1s-.5-.1-.7.2-.8 1-1 1.1-.4.2-.7.1c-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5-.1-.1-.7-1.8-.9-2.4-.2-.4-.4-.4-.7-.4h-.6c-.2 0-.5.1-.7.3C6.4 5.5 5.8 6.1 5.6 7c-.3 1 .1 2.1.4 2.6.2.5 1.5 3 3.6 4.9 2.5 2.3 4.9 3 5.6 3.3.6.2 1.1.2 1.5.1.5-.1 1.8-.7 2-1.3.2-.6.2-1.1.1-1.3-.1-.2-.2-.2-.4-.3Z"
              />
            </svg>
          </span>
          <span>Send Message</span>
        </a>
      </div>
    </div>
  )
}
