'use client'
/* eslint-disable @next/next/no-img-element -- Library files are pre-sized. */

import { useEffect, useState } from 'react'
import { DEFAULT_MARKET, PAID_ANALYTICS_PATH, PAID_COPY as copy, PAID_STORAGE_KEY, PAID_SUBJECTS, isSubjectId, marketFromSearch, startingPrice, type Market, type SubjectId } from '@/lib/paidShoot'
import { initPageAnalytics, track } from '@/lib/track'
import SignUpFormPaid from './SignUpFormPaid'
import styles from './ThemePicker.module.css'
import paid from './PaidPicker.module.css'

// The paid flow: pick who the shoot is for, then book. That choice picks the
// packages the form offers. The market (?city=, read once on mount) sets the
// currency.
type Session = { version: 2; subject: SubjectId | null; updatedAt: number }
const TTL = 7 * 24 * 60 * 60 * 1000

const fresh = (subject: SubjectId | null = null): Session => ({ version: 2, subject, updatedAt: Date.now() })

export default function PaidPicker() {
  const [session, setSession] = useState<Session | null>(null)
  const [market, setMarket] = useState<Market>(DEFAULT_MARKET)
  const subject = session?.subject || null

  useEffect(() => {
    const urlMarket = marketFromSearch(window.location.search)
    initPageAnalytics(PAID_ANALYTICS_PATH, { version: 'paid-v2', ...urlMarket.analytics })
    let restored: Session | null = null
    try {
      const saved = JSON.parse(localStorage.getItem(PAID_STORAGE_KEY) || 'null') as Session | null
      if (saved?.version === 2 && Date.now() - saved.updatedAt < TTL && (saved.subject === null || isSubjectId(saved.subject))) restored = saved
    } catch {}
    // ?for=couple on the URL (ad links) skips the first screen.
    let preset: SubjectId | null = null
    try { const fromUrl = new URLSearchParams(window.location.search).get('for'); if (isSubjectId(fromUrl)) preset = fromUrl } catch {}
    setMarket(urlMarket)
    setSession(restored && (!preset || restored.subject === preset) ? restored : fresh(preset))
  }, [])

  useEffect(() => {
    if (!session) return
    try { localStorage.setItem(PAID_STORAGE_KEY, JSON.stringify(session)) } catch {}
  }, [session])

  function chooseSubject(next: SubjectId) {
    track('paid_subject_picked', { subject: next, ...market.analytics })
    setSession(fresh(next))
  }

  const topbar = (
    <div className={styles.topbar}>
      <a href="/" className={styles.wordmark}>{copy.wordmark}</a>
      {/* Hidden until mount, when the market is known, so ?city= never flashes the wrong currency. */}
      <span style={session ? undefined : { visibility: 'hidden' }}>{copy.corner(market)}</span>
    </div>
  )

  // Same page chrome rule as the other custom pages: no site header/footer.
  const chrome = <style dangerouslySetInnerHTML={{ __html: 'body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }' }} />

  if (!session) return <section className={styles.page}>{chrome}<div className={styles.shell}>{topbar}</div></section>

  if (subject) return <SignUpFormPaid subject={subject} market={market} onBack={() => setSession(fresh())} />

  return (
    <section className={styles.page}>
      {chrome}
      <div className={styles.shell}>
        {topbar}
        <h1 className={styles.cta}><strong>{copy.bookTitle}</strong></h1>
        <p className={styles.ctaNote}><strong>{copy.whoFor}</strong> {copy.bookLead}</p>
        <div className={paid.subjects}>
          {PAID_SUBJECTS.map(item => (
            <button key={item.id} className={paid.subject} onClick={() => chooseSubject(item.id)} aria-label={`${item.label}, ${copy.from(startingPrice(item.id), market)}`}>
              <img src={item.cover} alt="" draggable={false} />
              <span className={paid.subjectPrice}>{copy.from(startingPrice(item.id), market)}</span>
              <span className={paid.subjectLabel}><strong>{item.label}</strong><small>{item.hint}</small></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
