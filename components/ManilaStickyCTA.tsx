'use client'

import { useState } from 'react'

const INSTAGRAM_HANDLE = 'madebyaidan'

export default function ManilaStickyCTA(){
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleInstagram(event: React.MouseEvent<HTMLAnchorElement>){
    event.preventDefault()
    if (isSubmitting) return

    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Manila Photo Sessions',
        content_category: 'Instagram Lead - Sticky'
      })
    }

    setIsSubmitting(true)
    window.open(`https://ig.me/m/${INSTAGRAM_HANDLE}`, '_blank')
    setTimeout(() => {
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur shadow-[0_-12px_30px_rgba(0,0,0,0.12)]">
      <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-neutral-600">
          Manila sessions - message on Instagram to book
        </p>
        <a
          href={`https://ig.me/m/${INSTAGRAM_HANDLE}`}
          target="_blank"
          rel="noreferrer"
          onClick={handleInstagram}
          className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 sm:text-sm"
          data-cta="manila-sticky-instagram"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>{isSubmitting ? 'Opening...' : 'Open Instagram DM'}</span>
        </a>
      </div>
    </div>
  )
}
