'use client'

import { useState } from 'react'

const INSTAGRAM_HANDLE = 'madebyaidan'
const WHATSAPP_NUMBER = '491758966210'
const WHATSAPP_MESSAGE = 'Hi Aidan - I came from the Manila photo sessions page and want to check availability.'

export default function ManilaCTA(){
  const [isSubmitting, setIsSubmitting] = useState(false)

  function trackLead(contentCategory: string){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Manila Photo Sessions',
        content_category: contentCategory
      })
    }
  }

  function openExternal(url: string){
    setIsSubmitting(true)
    window.open(url, '_blank')
    setTimeout(() => {
      setIsSubmitting(false)
    }, 800)
  }

  function handleInstagram(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    if (isSubmitting) return

    trackLead('Instagram Lead')
    openExternal(`https://ig.me/m/${INSTAGRAM_HANDLE}`)
  }

  function handleWhatsApp(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    if (isSubmitting) return

    trackLead('WhatsApp Lead')
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    openExternal(whatsappUrl)
  }

  return (
    <div className="mt-6 space-y-3">
      <button
        onClick={handleInstagram}
        className="btn w-full gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 sm:text-base"
        data-cta="manila-instagram-primary"
        disabled={isSubmitting}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        <span>{isSubmitting ? 'Opening...' : 'Check Manila Availability on Instagram'}</span>
      </button>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-600">
        <button
          onClick={handleWhatsApp}
          className="font-semibold underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-800"
          data-cta="manila-whatsapp-secondary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Opening...' : 'Prefer WhatsApp?'}
        </button>
        <a
          href="mailto:aidan@aidantorrence.com?subject=Manila%20Session%20Inquiry"
          className="font-semibold underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-800"
          data-cta="manila-email-secondary"
        >
          Email instead
        </a>
        <span className="rounded-full border border-neutral-300/80 bg-white px-2.5 py-1 font-medium text-neutral-500">
          Avg reply: under 1 hour
        </span>
      </div>
    </div>
  )
}
