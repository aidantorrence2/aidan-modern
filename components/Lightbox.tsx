"use client"
import { useEffect } from 'react'

export default function Lightbox(){
  useEffect(()=>{
    const on = (e: MouseEvent)=>{
      const a = (e.target as HTMLElement).closest('a[href$=".jpg"]') as HTMLAnchorElement | null
      if(!a) return
      const container = a.closest('section#work, [data-lightbox]') as HTMLElement | null
      if(!container) return
      e.preventDefault()
      const src = a.href
      const dlg = document.getElementById('lb') as HTMLDialogElement
      const img = document.getElementById('lb-img') as HTMLImageElement
      img.src = src
      dlg.showModal()
    }
    const close = (e: MouseEvent)=>{
      const btn = (e.target as HTMLElement).closest('#lb-close')
      const dlg = document.getElementById('lb') as HTMLDialogElement
      if(btn && dlg?.open){ dlg.close() }
    }
    document.addEventListener('click', on)
    document.addEventListener('click', close)
    return ()=>{
      document.removeEventListener('click', on)
      document.removeEventListener('click', close)
    }
  },[])
  return (
    <dialog id="lb" className="backdrop:bg-black/90 p-0 border-0 rounded-xl">
      <button id="lb-close" aria-label="Close" className="absolute right-2 top-2 z-10 bg-black/70 text-white rounded-full h-10 w-10 text-xl">×</button>
      <img id="lb-img" alt="Selected work" className="max-h-[85vh] max-w-[90vw] object-contain"/>
      <form method="dialog" className="hidden"><button>Close</button></form>
    </dialog>
  )
}
