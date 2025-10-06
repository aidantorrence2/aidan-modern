'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function MetaPixelEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!META_PIXEL_ID) return
    if (typeof window === 'undefined') return
    const fbq = (window as typeof window & { fbq?: any }).fbq as
      | ((...args: unknown[]) => void)
      | undefined
    if (typeof fbq !== 'function') return

    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname

    fbq('track', 'PageView', { page_path: url })
    console.info('[Meta Pixel] SPA PageView', { page_path: url })
  }, [pathname, searchParams])

  return null
}
