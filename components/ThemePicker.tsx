'use client'
/* eslint-disable @next/next/no-img-element -- Library files are pre-sized; the next round preloads these exact URLs. */

import { useEffect, useRef, useState } from 'react'
import { boardPath, imagesForIds, isStartingTheme, makeDeck, MAX_PICKS, PICKER_STORAGE_KEY, THEME_IMAGES, THEMES, themeLabel, type StartingTheme } from '@/lib/themePicker'
import { initPageAnalytics, track } from '@/lib/track'
import styles from './ThemePicker.module.css'

type Session = { version: 1; theme: StartingTheme; seed: number; choices: (string | null)[]; updatedAt: number }
const TTL = 7 * 24 * 60 * 60 * 1000

export default function ThemePicker() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [review, setReview] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const lock = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const gridRef = useRef<HTMLDivElement>(null)
  const deck = session ? makeDeck(session.theme, session.seed) : []
  const round = session?.choices.length || 0
  const selectedIds = session?.choices.filter((id): id is string => !!id) || []
  const selected = imagesForIds(selectedIds)
  const options = imagesForIds(deck.slice(round * 4, round * 4 + 4))
  const complete = round >= MAX_PICKS
  const board = { theme: session?.theme || 'any' as StartingTheme, imageIds: selectedIds }

  useEffect(() => {
    initPageAnalytics('/choose-your-theme', { version: 'codex-v1' })
    try {
      const saved = JSON.parse(localStorage.getItem(PICKER_STORAGE_KEY) || 'null') as Session | null
      if (saved?.version === 1 && isStartingTheme(saved.theme) && Number.isInteger(saved.seed) &&
        Array.isArray(saved.choices) && saved.choices.length <= MAX_PICKS && Date.now() - saved.updatedAt < TTL) {
        const savedDeck = makeDeck(saved.theme, saved.seed)
        if (saved.choices.every((id, i) => id === null || savedDeck.slice(i * 4, i * 4 + 4).includes(id))) setSession(saved)
      }
    } catch {}
    setReady(true)
    return () => clearTimeout(timer.current)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      if (session) localStorage.setItem(PICKER_STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(PICKER_STORAGE_KEY)
    } catch {}
  }, [session, ready])

  // Warm only the next four small images, not the entire library on mobile.
  useEffect(() => {
    if (!session || complete) return
    imagesForIds(deck.slice((round + 1) * 4, (round + 2) * 4)).forEach(image => {
      const preload = new Image(); preload.src = image.src
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.theme, session?.seed, round])

  function start(theme: StartingTheme) {
    setSession({ version: 1, theme, seed: Math.floor(Math.random() * 0xffffffff), choices: [], updatedAt: Date.now() })
    setReview(false)
    track('theme_started', { theme })
  }

  function pick(id: string | null) {
    if (!session || lock.current || complete) return
    lock.current = true
    setFlash(id)
    track(id ? 'moodboard_image_picked' : 'moodboard_round_skipped', { round: round + 1, image_id: id, theme: session.theme })
    timer.current = setTimeout(() => {
      setSession(current => current ? { ...current, choices: [...current.choices, id], updatedAt: Date.now() } : current)
      setFlash(null)
      lock.current = false
      gridRef.current?.focus({ preventScroll: true })
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180)
  }

  function undo() {
    if (lock.current) return
    setSession(current => current ? { ...current, choices: current.choices.slice(0, -1), updatedAt: Date.now() } : current)
    setReview(false)
  }

  function remove(id: string) {
    setSession(current => current ? { ...current, choices: current.choices.map(choice => choice === id ? null : choice), updatedAt: Date.now() } : current)
  }

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topbar}><a href="/" className={styles.wordmark}>Aidan Torrence</a><span>Almaty · Sept 7–9</span></div>
        {!session ? <>
          <div className={styles.heading}><p className={styles.eyebrow}>Let’s make something together</p><h1>Choose your theme.</h1><p>A starting point for your shoot. Then pick the photos that feel like you.</p></div>
          <div className={styles.startGrid}>
            {THEMES.map((theme, index) => <button key={theme.id} disabled={!ready} className={styles.startCard} onClick={() => start(theme.id as StartingTheme)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={theme.image} alt={theme.label} loading={index === 0 ? 'eager' : 'lazy'} />
              <span className={styles.startCaption}><strong>{theme.label}</strong><span>{theme.description}</span></span><span className={styles.arrow} aria-hidden="true">↗</span>
            </button>)}
            <button disabled={!ready} className={`${styles.startCard} ${styles.mixCard}`} onClick={() => start('any')}><span className={styles.mixPhotos}>{THEMES.map(theme => <img key={theme.id} src={theme.image} alt="" />)}</span><span className={styles.startCaption}><strong>A bit of everything</strong><span>Let me discover my look.</span></span><span className={styles.arrow} aria-hidden="true">↗</span></button>
          </div>
          <p className={styles.footnote}>{THEME_IMAGES.length} images to explore · one favourite at a time</p>
        </> : review || complete ? <>
          <div className={styles.heading}><p className={styles.eyebrow}>{themeLabel(session.theme)}</p><h1>Your kind of shoot.</h1><p>{selected.length ? 'These are your references. We’ll plan the shoot around what you love.' : 'Nothing saved yet. Go back and pick a photo you love.'}</p></div>
          <div className={styles.reviewGrid}>{selected.map(image => <div key={image.id} className={styles.reviewCard}><img src={image.src} alt={image.alt} /><button aria-label={`Remove ${image.alt}`} onClick={() => remove(image.id)}>×</button></div>)}</div>
          <div className={styles.reviewActions}>
            {selected.length > 0 && <a className={styles.primary} href={boardPath(board, '/sign-up-collab-themes')}>Sign up with this moodboard <span>↗</span></a>}
            <button className={styles.textButton} onClick={() => complete ? undo() : setReview(false)}>{complete ? 'Back to the last four' : 'Keep picking'}</button>
            <button className={styles.textButton} onClick={() => { setSession(null); setReview(false) }}>Choose a different starting theme</button>
          </div>
        </> : <>
          <div className={styles.pickerHeading}><div><p className={styles.eyebrow}>{themeLabel(session.theme)} · {round + 1} / {MAX_PICKS}</p><h1>Which one feels like you?</h1><p>Tap one. We’ll save it and show you four more.</p></div><button className={styles.counter} onClick={() => setReview(true)} aria-label={`Review moodboard, ${selected.length} ${selected.length === 1 ? 'photo' : 'photos'} saved`}>{selected.length}<span>saved</span></button></div>
          <div className={styles.progress} aria-hidden="true"><span style={{ width: `${round / MAX_PICKS * 100}%` }} /></div>
          <div className={styles.choiceGrid} ref={gridRef} tabIndex={-1} aria-label={`Choose one photo, round ${round + 1}`}>
            {options.map(image => <button key={image.id} className={`${styles.choice} ${flash === image.id ? styles.chosen : ''}`} onClick={() => pick(image.id)} aria-label={`Choose ${image.alt}`}>
              <img src={image.src} alt={image.alt} draggable={false} /><span className={styles.choiceCaption}>{image.alt}</span>{flash === image.id && <span className={styles.check} aria-hidden="true">✓</span>}
            </button>)}
          </div>
          <p className={styles.srOnly} role="status" aria-live="polite">Round {round + 1} of {MAX_PICKS}. {selected.length} photos saved.</p>
          <div className={styles.pickerControls}><button className={styles.textButton} onClick={round ? undo : () => setSession(null)}>{round ? '← Undo last' : '← Themes'}</button><button className={styles.textButton} onClick={() => pick(null)}>Skip these four →</button></div>
          <button className={styles.primary} disabled={!selected.length} onClick={() => setReview(true)}>{selected.length ? `Use my ${selected.length} ${selected.length === 1 ? 'pick' : 'picks'}` : 'Pick a photo to begin'}<span aria-hidden="true">↗</span></button>
          <p className={styles.footnote}>Keep picking, or finish whenever it feels right.</p>
        </>}
        <div className={styles.credits}>Photography by Aidan Torrence · starting references via Pinterest</div>
      </div>
    </section>
  )
}
