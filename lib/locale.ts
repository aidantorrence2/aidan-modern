'use client'
// Which language the collab sign-up flow speaks. Nothing here is geo-based on
// purpose: the visitor's browser language is the better signal (a Russian
// resident of Antalya carries a Russian phone; a Turkish student a Turkish one),
// and the first-party analytics show browser locale predicts conversion.
//
// Priority: ?lang= on the URL (ad links) → the toggle the visitor last pressed
// → the browser's languages → English.
import { useCallback, useEffect, useState } from 'react'

export type Lang = 'en' | 'tr' | 'ru'
export const LANGS: readonly Lang[] = ['en', 'tr', 'ru']
export const LANG_STORAGE_KEY = 'aidan:lang'
const CHANGE_EVENT = 'aidan:langchange'

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'tr' || value === 'ru'
}

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')?.toLowerCase()
    if (isLang(fromUrl)) {
      try { localStorage.setItem(LANG_STORAGE_KEY, fromUrl) } catch {}
      return fromUrl
    }
  } catch {}
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {}
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    const code = (tag || '').toLowerCase().slice(0, 2)
    if (isLang(code)) return code
  }
  return 'en'
}

// Shared by every component on the page: one toggle press re-renders all of them.
export function useLang(): [Lang, (next: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(detectLang())
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Lang>).detail
      if (isLang(next)) setLangState(next)
    }
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CHANGE_EVENT, onChange)
  }, [])

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const setLang = useCallback((next: Lang) => {
    try { localStorage.setItem(LANG_STORAGE_KEY, next) } catch {}
    window.dispatchEvent(new CustomEvent<Lang>(CHANGE_EVENT, { detail: next }))
  }, [])

  return [lang, setLang]
}
