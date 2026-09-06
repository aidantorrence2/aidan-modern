'use client'
/* eslint-disable @next/next/no-img-element -- Library files are pre-sized; the next round preloads these exact URLs. */

import { useEffect, useRef, useState } from 'react'
import { libraryImages, makeRounds, MAX_PICKS, PICKER_STORAGE_KEY } from '@/lib/themePicker'
import { initPageAnalytics, track } from '@/lib/track'
import SignUpFormCollabThemes from './SignUpFormCollabThemes'
import styles from './ThemePicker.module.css'

// choices: one entry per round shown — an image id, or null for a skipped round.
// done: the visitor pressed "Sign up" before reaching MAX_PICKS.
type Session = { version: 2; seed: number; choices: (string | null)[]; done?: boolean; updatedAt: number }
const TTL = 7 * 24 * 60 * 60 * 1000

const fresh = (): Session => ({ version: 2, seed: Math.floor(Math.random() * 0xffffffff), choices: [], updatedAt: Date.now() })

export default function ThemePicker() {
  const [session, setSession] = useState<Session | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const lock = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const gridRef = useRef<HTMLDivElement>(null)
  const rounds = session ? makeRounds(session.seed) : []
  const round = session?.choices.length || 0
  const selectedIds = session?.choices.filter((id): id is string => !!id) || []
  const options = libraryImages(rounds[round] || [])
  const complete = !!session?.done || selectedIds.length >= MAX_PICKS || round >= rounds.length

  useEffect(() => {
    initPageAnalytics('/choose-your-theme', { version: 'v3' })
    let restored: Session | null = null
    try {
      const saved = JSON.parse(localStorage.getItem(PICKER_STORAGE_KEY) || 'null') as Session | null
      if (saved?.version === 2 && Number.isInteger(saved.seed) && Array.isArray(saved.choices) && Date.now() - saved.updatedAt < TTL) {
        const savedRounds = makeRounds(saved.seed)
        if (saved.choices.length <= savedRounds.length && saved.choices.every((id, i) => id === null || savedRounds[i].includes(id))) restored = saved
      }
    } catch {}
    setSession(restored || fresh())
    return () => clearTimeout(timer.current)
  }, [])

  useEffect(() => {
    if (!session) return
    try { localStorage.setItem(PICKER_STORAGE_KEY, JSON.stringify(session)) } catch {}
  }, [session])

  // Warm only the next round's images, not the whole library on mobile.
  useEffect(() => {
    if (!session || complete) return
    libraryImages(rounds[round + 1] || []).forEach(image => { const preload = new Image(); preload.src = image.src })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.seed, round, complete])

  function pick(id: string | null) {
    if (!session || lock.current || complete) return
    lock.current = true
    setFlash(id)
    track(id ? 'moodboard_image_picked' : 'moodboard_round_skipped', { round: round + 1, image_id: id })
    const next: Session = { ...session, choices: [...session.choices, id], updatedAt: Date.now() }
    timer.current = setTimeout(() => {
      setSession(next)
      setFlash(null)
      lock.current = false
      gridRef.current?.focus({ preventScroll: true })
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180)
  }

  function back() {
    if (!session || lock.current) return
    setSession(session.done ? { ...session, done: false, updatedAt: Date.now() } : { ...session, choices: session.choices.slice(0, -1), updatedAt: Date.now() })
  }

  const topbar = <div className={styles.topbar}><a href="/" className={styles.wordmark}>Aidan Torrence</a><span>Almaty · Sept 7–9</span></div>

  if (!session) return <section className={styles.page}><div className={styles.shell}>{topbar}</div></section>

  if (complete && selectedIds.length) return <SignUpFormCollabThemes selection={{ theme: 'any', imageIds: selectedIds }} onBack={back} />

  if (complete) return (
    <section className={styles.page}><div className={styles.shell}>
      {topbar}
      <div className={styles.reviewActions} style={{ marginTop: 48 }}><button className={styles.primary} onClick={() => setSession(fresh())}>Start over<span aria-hidden="true">↗</span></button></div>
    </div></section>
  )

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        {topbar}
        <div className={styles.progress} aria-hidden="true"><span style={{ width: `${selectedIds.length / MAX_PICKS * 100}%` }} /></div>
        <div className={styles.choiceGrid} ref={gridRef} tabIndex={-1} aria-label={`Choose one photo, round ${round + 1}`}>
          {options.map(image => <button key={image.id} className={`${styles.choice} ${flash === image.id ? styles.chosen : ''}`} onClick={() => pick(image.id)} aria-label={`Choose ${image.alt}`}>
            <img src={image.src} alt={image.alt} draggable={false} />{flash === image.id && <span className={styles.check} aria-hidden="true">✓</span>}
          </button>)}
        </div>
        <p className={styles.srOnly} role="status" aria-live="polite">Round {round + 1}. {selectedIds.length} of {MAX_PICKS} photos saved.</p>
        <div className={styles.pickerControls}>
          <button className={styles.textButton} onClick={back} disabled={!round}>← Back</button>
          <button className={styles.textButton} onClick={() => pick(null)}>Skip →</button>
        </div>
        {selectedIds.length > 0 && <button className={styles.primary} onClick={() => setSession({ ...session, done: true, updatedAt: Date.now() })}>Sign up<span aria-hidden="true">↗</span></button>}
      </div>
    </section>
  )
}
