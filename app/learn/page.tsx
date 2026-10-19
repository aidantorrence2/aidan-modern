'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DECKS } from '@/lib/learn/decks'
import { buildQueue, loadStore } from '@/lib/learn/store'
import { CSS } from './styles'

type Summary = { learned: number; due: number; started: boolean }

export default function LearnIndexPage() {
  const [summaries, setSummaries] = useState<Record<string, Summary>>({})

  useEffect(() => {
    const now = Date.now()
    const out: Record<string, Summary> = {}
    for (const deck of DECKS) {
      const store = loadStore(deck.code)
      const q = buildQueue(deck, store, now)
      const cards = Object.values(store.cards)
      out[deck.code] = {
        started: cards.length > 0,
        learned: cards.filter((c) => c.state === 'review').length,
        due: q.reviews.length + q.learning.length + q.fresh.length,
      }
    }
    setSummaries(out)
  }, [])

  return (
    <div className="lx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lx-wrap">
        <div className="lx-hero">
          <h1 className="lx-h1">Learn</h1>
          <p className="lx-sub">Spaced-repetition flashcards with audio. A few minutes a day.</p>
        </div>
        <div className="lx-langs">
          {DECKS.map((deck) => {
            const s = summaries[deck.code]
            const notes = deck.topics.reduce((n, t) => n + t.notes.length, 0)
            return (
              <Link key={deck.code} className="lx-lang" href={`/learn/${deck.code}` as any}>
                <span className="flag">{deck.flag}</span>
                <div>
                  <div className="name">{deck.name}</div>
                  <div className="meta">
                    {s?.started ? `${s.learned} cards learned · ${s.due} to study today` : `${notes} words & phrases · ${deck.topics.length} topics`}
                  </div>
                </div>
                <span className="go">→</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
