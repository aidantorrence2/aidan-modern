'use client'

import { useEffect, useRef } from 'react'

export default function ManilaFreeTracking(){
  const trackedViewRef = useRef(false)
  const trackedScrollDepthsRef = useRef<Set<number>>(new Set())
  const trackedExitRef = useRef(false)

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
          content_name: 'Manila Free Collab Sessions Landing',
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
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollableHeight <= 0) return

      const scrollRatio = window.scrollY / scrollableHeight
      const checkpoints = [25, 50, 75]

      checkpoints.forEach(depth => {
        const threshold = depth / 100
        if (scrollRatio >= threshold && !trackedScrollDepthsRef.current.has(depth)) {
          if ((window as any).fbq) {
            ;(window as any).fbq('trackCustom', 'LandingScrollDepth', {
              content_name: 'Manila Free Collab Sessions Landing',
              depth_percent: depth
            })
          }
          trackedScrollDepthsRef.current.add(depth)
        }
      })

      if (trackedScrollDepthsRef.current.size === checkpoints.length) {
        window.removeEventListener('scroll', handleScroll)
      }
    }

    const handleVisibility = () => {
      if (trackedExitRef.current) return
      if (document.visibilityState !== 'hidden') return
      if ((window as any).fbq) {
        ;(window as any).fbq('trackCustom', 'LandingEngaged', {
          content_name: 'Manila Free Collab Sessions Landing'
        })
        trackedExitRef.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('visibilitychange', handleVisibility)
    handleScroll()

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return null
}
