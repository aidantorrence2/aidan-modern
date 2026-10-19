'use client'

import Link from 'next/link'
import { getDeck } from '@/lib/learn/decks'
import LearnApp from '../LearnApp'
import { CSS } from '../styles'

export default function LearnLanguagePage({ params }: { params: { lang: string } }) {
  const deck = getDeck(params.lang)
  if (!deck) {
    return (
      <div className="lx">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="lx-wrap">
          <h1 className="lx-h1">Language not found</h1>
          <Link className="lx-link" href={'/learn' as any}>
            ← All languages
          </Link>
        </div>
      </div>
    )
  }
  return <LearnApp deck={deck} />
}
