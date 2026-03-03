'use client'

import { useEffect, useRef } from 'react'

export default function ManilaTracking(){
  const trackedViewRef = useRef(false)
  const trackedScrollRef = useRef(false)

  useEffect(() => {
    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      if (trackedViewRef.current) {
        window.clearInterval(timer)
        return
      }

      if ((window as any).fbq) {
        ;(window as any).fbq('track', 'ViewContent', {
          content_name: 'Manila Photo Sessions Landing',
          content_category: 'Instagram Ads Landing'
        })
        trackedViewRef.current = true
        window.clearInterval(timer)
      }

      if (attempts >= 10) {
        window.clearInterval(timer)
      }
    }, 300)

    const handleScroll = () => {
      if (trackedScrollRef.current) return

      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollableHeight <= 0) return

      const scrollRatio = window.scrollY / scrollableHeight
      if (scrollRatio >= 0.5) {
        if ((window as any).fbq) {
          ;(window as any).fbq('trackCustom', 'LandingScroll50', {
            content_name: 'Manila Photo Sessions Landing'
          })
        }
        trackedScrollRef.current = true
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}
