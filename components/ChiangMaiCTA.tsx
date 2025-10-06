'use client'

import { useState } from 'react'

const WHATSAPP_NUMBER = '491758966210'

export default function ChiangMaiCTA(){
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClick(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    if (isSubmitting) return
    const message = "Hi Aidan, I'm ready for the complimentary Chiang Mai photo shoot (Oct 6–11)."
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    setIsSubmitting(true)
    window.open(whatsappUrl, '_blank')
    setTimeout(() => {
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <div className="mt-6 grid gap-4">
      <button
        onClick={handleClick}
        className="btn px-6 text-white"
        style={{ backgroundColor: '#25D366' }}
        data-cta="chiang-mai-whatsapp"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Opening WhatsApp…' : 'Claim Your Spot via WhatsApp'}
      </button>
      <p className="text-xs text-neutral-500">
        Opens WhatsApp in a new tab. I’ll reply instantly with available times.
      </p>
    </div>
  )
}
