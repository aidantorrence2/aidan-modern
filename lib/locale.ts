'use client'
// Which language the collab sign-up flow speaks. Nothing here is geo-based on
// purpose: the visitor's browser language is the better signal (a Russian
// resident of Antalya carries a Russian phone; a Turkish student a Turkish one),
// and the first-party analytics show browser locale predicts conversion.
//
// Priority: ?lang= on the URL (ad links) → the toggle the visitor last pressed
// → the browser's languages → English.
import { useCallback, useEffect, useState } from 'react'

// Every language any collab page speaks. Each page passes the subset it has
// copy for (Turkey: en/tr/ru; Miami: en/es; Rio: en/pt), so a saved or browser language the
// page can't speak is skipped rather than shown as missing strings.
export type AnyLang = 'en' | 'tr' | 'ru' | 'es' | 'pt'
export type Lang = 'en' | 'tr' | 'ru'
export const LANGS: readonly Lang[] = ['en', 'tr', 'ru']
export const MIAMI_LANGS = ['en', 'es'] as const
export type MiamiLang = (typeof MIAMI_LANGS)[number]
export const RIO_LANGS = ['en', 'pt'] as const
export type RioLang = (typeof RIO_LANGS)[number]
export const LANG_STORAGE_KEY = 'aidan:lang'
const CHANGE_EVENT = 'aidan:langchange'

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'tr' || value === 'ru'
}

function isOneOf<L extends AnyLang>(supported: readonly L[], value: unknown): value is L {
  return typeof value === 'string' && (supported as readonly string[]).includes(value)
}

export function detectLangFrom<L extends AnyLang>(supported: readonly L[]): L {
  const fallback = supported[0]
  if (typeof window === 'undefined') return fallback
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')?.toLowerCase()
    if (isOneOf(supported, fromUrl)) {
      try { localStorage.setItem(LANG_STORAGE_KEY, fromUrl) } catch {}
      return fromUrl
    }
  } catch {}
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (isOneOf(supported, saved)) return saved
  } catch {}
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    const code = (tag || '').toLowerCase().slice(0, 2)
    if (isOneOf(supported, code)) return code
  }
  return fallback
}

export function detectLang(): Lang {
  return detectLangFrom(LANGS)
}

// Shared by every component on the page: one toggle press re-renders all of them.
export function useLangFrom<L extends AnyLang>(supported: readonly L[]): [L, (next: L) => void] {
  const [lang, setLangState] = useState<L>(supported[0])

  useEffect(() => {
    setLangState(detectLangFrom(supported))
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<L>).detail
      if (isOneOf(supported, next)) setLangState(next)
    }
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CHANGE_EVENT, onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const setLang = useCallback((next: L) => {
    try { localStorage.setItem(LANG_STORAGE_KEY, next) } catch {}
    window.dispatchEvent(new CustomEvent<L>(CHANGE_EVENT, { detail: next }))
  }, [])

  return [lang, setLang]
}

export function useLang(): [Lang, (next: Lang) => void] {
  return useLangFrom(LANGS)
}
