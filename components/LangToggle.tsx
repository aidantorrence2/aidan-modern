'use client'
import { LANGS, type Lang } from '@/lib/locale'
import { track } from '@/lib/track'
import styles from './ThemePicker.module.css'

const LABEL: Record<Lang, string> = { en: 'EN', tr: 'TR', ru: 'RU' }
const NAME: Record<Lang, string> = { en: 'English', tr: 'Türkçe', ru: 'Русский' }

// EN · TR · RU in the picker's top bar. The visitor's press is remembered
// (lib/locale.ts) and every component on the page re-renders in that language.
export default function LangToggle({ lang, onChange }: { lang: Lang; onChange: (next: Lang) => void }) {
  return (
    <div className={styles.lang} role="group" aria-label="Language">
      {LANGS.map(item => (
        <button
          key={item}
          type="button"
          lang={item}
          aria-pressed={lang === item}
          aria-label={NAME[item]}
          onClick={() => {
            if (item === lang) return
            track('lang_toggled', { from: lang, to: item })
            onChange(item)
          }}
        >
          {LABEL[item]}
        </button>
      ))}
    </div>
  )
}
