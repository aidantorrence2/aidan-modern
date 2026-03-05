'use client'

import { useState } from 'react'

const INSTAGRAM_HANDLE = 'madebyaidan'
const WHATSAPP_NUMBER = '491758966210'
const WHATSAPP_MESSAGE = 'Hi Aidan - I came from your Manila page and want to book a fun photo session.'

export default function ManilaCTA(){
  const [isOpening, setIsOpening] = useState(false)

  function trackLead(channel: 'Instagram' | 'WhatsApp'){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Manila Photo Sessions',
        content_category: `${channel} Lead`
      })
    }
  }

  function openExternal(url: string){
    setIsOpening(true)
    window.open(url, '_blank')
    setTimeout(() => {
      setIsOpening(false)
    }, 800)
  }

  function handleInstagram(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    if (isOpening) return
    trackLead('Instagram')
    openExternal(`https://ig.me/m/${INSTAGRAM_HANDLE}`)
  }

  function handleWhatsApp(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    if (isOpening) return
    trackLead('WhatsApp')
    openExternal(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`)
  }

  return (
    <div className="mt-5 space-y-3">
      <button
        onClick={handleInstagram}
        className="btn w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:text-base"
        data-cta="manila-instagram-primary"
        disabled={isOpening}
      >
        {isOpening ? 'Opening...' : 'Send a quick Instagram message'}
      </button>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-600">
        <button
          onClick={handleWhatsApp}
          className="font-semibold underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-800"
          data-cta="manila-whatsapp-secondary"
          disabled={isOpening}
        >
          Prefer WhatsApp?
        </button>
        <a
          href="mailto:aidan@aidantorrence.com?subject=Manila%20Session%20Inquiry"
          className="font-semibold underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-800"
          data-cta="manila-email-secondary"
        >
          Email instead
        </a>
        <span className="rounded-full border border-neutral-300/80 bg-white px-2.5 py-1 font-medium text-neutral-500">
          Fast replies
        </span>
      </div>
    </div>
  )
}
