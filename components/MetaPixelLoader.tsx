'use client'

import { useEffect } from 'react'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function MetaPixelLoader(){
  useEffect(() => {
    if (!META_PIXEL_ID) return
    if (typeof window === 'undefined') return

    const w = window as typeof window & { fbq?: any; _fbq?: any }

    if (typeof w.fbq !== 'function') {
      ;(function(f: typeof w, b: Document, e: string, v: string){
        if (f.fbq) return
        const fbq: any = function(){
          fbq.callMethod ? fbq.callMethod.apply(fbq, arguments as any) : fbq.queue.push(arguments)
        }
        fbq.queue = []
        fbq.loaded = true
        fbq.version = '2.0'
        const t = b.createElement(e) as HTMLScriptElement
        t.async = true
        t.src = v
        const s = b.getElementsByTagName(e)[0] as HTMLScriptElement
        s.parentNode?.insertBefore(t, s)
        f.fbq = fbq
        f._fbq = fbq
      })(w, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
      w.fbq?.('init', META_PIXEL_ID)
      w.fbq?.('track', 'PageView')
      console.info('[Meta Pixel] base PageView fired (loader fallback)')
    }
  }, [])

  return null
}
