'use client'
/* eslint-disable @next/next/no-img-element -- Library files are pre-sized; the next round preloads these exact URLs. */

import { useEffect, useRef, useState } from 'react'
import { imagesForSubject, libraryImages, makeRounds, MAX_PICKS } from '@/lib/themePicker'
import { PAID_ANALYTICS_PATH, PAID_COPY as copy, PAID_STORAGE_KEY, PAID_SUBJECTS, isSubjectId, startingPrice, type SubjectId } from '@/lib/paidShoot'
import { initPageAnalytics, track } from '@/lib/track'
import SignUpFormPaid from './SignUpFormPaid'
import styles from './ThemePicker.module.css'
import paid from './PaidPicker.module.css'

// The paid flow is the collab picker with a step in front: who the shoot is
// for. That choice picks the pin library the rounds draw from (see
// imagesForSubject) and the packages the form offers.
// choices: one entry per round shown — an image id, or null for a skipped round.
// done: the visitor pressed "Book" before reaching MAX_PICKS.
type Session = { version: 1; subject: SubjectId | null; seed: number; choices: (string | null)[]; done?: boolean; updatedAt: number }
const TTL = 7 * 24 * 60 * 60 * 1000

const fresh = (subject: SubjectId | null = null): Session => ({ version: 1, subject, seed: Math.floor(Math.random() * 0xffffffff), choices: [], updatedAt: Date.now() })

export default function PaidPicker() {
  const [session, setSession] = useState<Session | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const lock = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const gridRef = useRef<HTMLDivElement>(null)
  const subject = session?.subject || null
  const pool = subject ? imagesForSubject(subject) : []
  const rounds = session && subject ? makeRounds(session.seed, pool, true) : []
  const round = session?.choices.length || 0
  const selectedIds = session?.choices.filter((id): id is string => !!id) || []
  const options = libraryImages(rounds[round] || [])
  const complete = !!subject && (!!session?.done || selectedIds.length >= MAX_PICKS || round >= rounds.length)

  useEffect(() => {
    initPageAnalytics(PAID_ANALYTICS_PATH, { version: 'paid-v1' })
    let restored: Session | null = null
    try {
      const saved = JSON.parse(localStorage.getItem(PAID_STORAGE_KEY) || 'null') as Session | null
      if (saved?.version === 1 && Number.isInteger(saved.seed) && Array.isArray(saved.choices) && Date.now() - saved.updatedAt < TTL && (saved.subject === null || isSubjectId(saved.subject))) {
        const savedRounds = saved.subject ? makeRounds(saved.seed, imagesForSubject(saved.subject), true) : []
        if (saved.choices.length <= savedRounds.length && saved.choices.every((id, i) => id === null || savedRounds[i].includes(id))) restored = saved
      }
    } catch {}
    // ?for=couple on the URL (ad links) skips the first screen.
    let preset: SubjectId | null = null
    try { const fromUrl = new URLSearchParams(window.location.search).get('for'); if (isSubjectId(fromUrl)) preset = fromUrl } catch {}
    setSession(restored && (!preset || restored.subject === preset) ? restored : fresh(preset))
    return () => clearTimeout(timer.current)
  }, [])

  useEffect(() => {
    if (!session) return
    try { localStorage.setItem(PAID_STORAGE_KEY, JSON.stringify(session)) } catch {}
  }, [session])

  // Warm only the next round's images, not the whole library on mobile.
  useEffect(() => {
    if (!session || !subject || complete) return
    libraryImages(rounds[round + 1] || []).forEach(image => { const preload = new Image(); preload.src = image.src })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.seed, subject, round, complete])

  function chooseSubject(next: SubjectId) {
    if (!session) return
    track('paid_subject_picked', { subject: next })
    setSession({ ...fresh(next), seed: session.seed })
  }

  function pick(id: string | null) {
    if (!session || lock.current || complete) return
    lock.current = true
    setFlash(id)
    track(id ? 'moodboard_image_picked' : 'moodboard_round_skipped', { round: round + 1, image_id: id, subject })
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
    if (session.done) return setSession({ ...session, done: false, updatedAt: Date.now() })
    if (!session.choices.length) return setSession({ ...session, subject: null, updatedAt: Date.now() })
    setSession({ ...session, choices: session.choices.slice(0, -1), updatedAt: Date.now() })
  }

  const topbar = (
    <div className={styles.topbar}>
      <a href="/" className={styles.wordmark}>{copy.wordmark}</a>
      <span>{copy.corner}</span>
    </div>
  )

  // Same page chrome rule as the other custom pages: no site header/footer.
  const chrome = <style dangerouslySetInnerHTML={{ __html: 'body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }' }} />

  if (!session) return <section className={styles.page}>{chrome}<div className={styles.shell}>{topbar}</div></section>

  if (!subject) return (
    <section className={styles.page}>
      {chrome}
      <div className={styles.shell}>
        {topbar}
        <h1 className={styles.cta}><strong>{copy.bookTitle}</strong></h1>
        <p className={styles.ctaNote}><strong>{copy.whoFor}</strong> {copy.bookLead}</p>
        <div className={paid.subjects}>
          {PAID_SUBJECTS.map(item => (
            <button key={item.id} className={paid.subject} onClick={() => chooseSubject(item.id)} aria-label={`${item.label}, ${copy.from(startingPrice(item.id))}`}>
              <img src={item.cover} alt="" draggable={false} />
              <span className={paid.subjectPrice}>{copy.from(startingPrice(item.id))}</span>
              <span className={paid.subjectLabel}><strong>{item.label}</strong><small>{item.hint}</small></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )

  if (complete && selectedIds.length) return (
    <SignUpFormPaid
      subject={subject}
      selection={{ theme: 'any', imageIds: selectedIds }}
      onBack={back}
      onRestart={() => setSession(fresh())}
    />
  )

  if (complete) return (
    <section className={styles.page}>{chrome}<div className={styles.shell}>
      {topbar}
      <div className={styles.reviewActions} style={{ marginTop: 48 }}><button className={styles.primary} onClick={() => setSession(fresh())}>{copy.startOver}<span aria-hidden="true">↗</span></button></div>
    </div></section>
  )

  return (
    <section className={styles.page}>
      {chrome}
      <div className={styles.shell}>
        {topbar}
        <h1 className={styles.cta}><strong>{copy.pickTitle}</strong><span>{PAID_SUBJECTS.find(item => item.id === subject)?.label}</span></h1>
        <p className={styles.ctaNote}><strong>{copy.pickNote.lead}</strong>{copy.pickNote.rest}</p>
        <div className={styles.segments} aria-hidden="true">{Array.from({ length: MAX_PICKS }, (_, i) => <i key={i} className={i < selectedIds.length ? styles.segmentOn : undefined} />)}</div>
        <div className={styles.choiceGrid} ref={gridRef} tabIndex={-1} data-round={round + 1} aria-label={copy.chooseRound(round + 1)}>
          {options.map(image => <button key={image.id} className={`${styles.choice} ${flash === image.id ? styles.chosen : ''}`} onClick={() => pick(image.id)} aria-label={copy.chooseImage(image.alt)}>
            <img src={image.src} alt={image.alt} draggable={false} />{flash === image.id && <span className={styles.check} aria-hidden="true">✓</span>}
          </button>)}
          <button className={styles.skipTile} onClick={() => pick(null)} aria-label={copy.skip}>{copy.skip}<span aria-hidden="true">→</span></button>
        </div>
        <p className={styles.srOnly} role="status" aria-live="polite">{copy.status(round + 1, selectedIds.length, MAX_PICKS)}</p>
        <div className={styles.pickerControls}>
          <button className={styles.textButton} onClick={back}>{round ? copy.back : copy.startOver}</button>
        </div>
      </div>
    </section>
  )
}
