'use client'

import { useEffect, useRef, useState } from 'react'
import { initPageAnalytics, track, flushNow } from '@/lib/track'
import type { Offer } from '@/lib/offers'

// Hosted offer page for the money flywheel. One honest pre-launch page: the
// result, three bullets, the price, and three signals we can count — an email
// for early access, an "I'd pay this" click, and (once a link exists) a real
// pre-order. The ?src= tag on the link tells us which post or pitch sent them.

type Props = { offer: Offer; preorderUrl: string | null }

type Intent = 'signup' | 'would_pay' | 'preorder'

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref']

function readAttribution(): { src: string; utm: Record<string, string> } {
  let src = ''
  const utm: Record<string, string> = {}
  try {
    const url = new URL(window.location.href)
    src = url.searchParams.get('src') || ''
    for (const k of ATTR_KEYS) {
      const v = url.searchParams.get(k)
      if (v) utm[k] = v.slice(0, 100)
    }
    if (src) sessionStorage.setItem('offer_src', src)
    else src = sessionStorage.getItem('offer_src') || ''
  } catch {}
  return { src: src.slice(0, 100), utm }
}

function ids(): { sessionId: string; visitorId: string } {
  try {
    return { sessionId: sessionStorage.getItem('at_sid') || '', visitorId: localStorage.getItem('at_vid') || '' }
  } catch {
    return { sessionId: '', visitorId: '' }
  }
}

export default function OfferPage({ offer, preorderUrl }: Props) {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<Intent | null>(null)
  const [done, setDone] = useState<Intent | null>(null)
  const [reasonSaved, setReasonSaved] = useState(false)
  const [error, setError] = useState('')
  const attr = useRef<{ src: string; utm: Record<string, string> }>({ src: '', utm: {} })

  useEffect(() => {
    attr.current = readAttribution()
    initPageAnalytics(`/offers/${offer.slug}`, { offer: offer.slug, src: attr.current.src || null, price_usd: offer.priceUsd })
  }, [offer.slug, offer.priceUsd])

  async function send(intent: Intent, withReason = false): Promise<boolean> {
    if (busy) return false
    setError('')
    const trimmed = email.trim()
    if (intent === 'signup' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Add an email so we can send early access.')
      return false
    }
    setBusy(intent)
    track('offer_cta', { intent, has_email: !!trimmed, src: attr.current.src || null })
    try {
      const res = await fetch('/api/offers/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer: offer.slug,
          intent,
          email: trimmed,
          reason: withReason ? reason.trim() : '',
          src: attr.current.src,
          utm: attr.current.utm,
          referrer: document.referrer || '',
          ...ids(),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) {
        setError(json?.error || 'Could not save. Try again.')
        return false
      }
      track('offer_interest', { intent, has_email: !!trimmed, src: attr.current.src || null })
      flushNow()
      return true
    } catch {
      setError('Network error. Try again.')
      return false
    } finally {
      setBusy(null)
    }
  }

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (data.get('company')) return
    if (await send('signup')) setDone('signup')
  }

  async function onWouldPay() {
    if (await send('would_pay')) setDone('would_pay')
  }

  async function onPreorder() {
    if (!preorderUrl) return
    const ok = await send('preorder')
    if (ok) setDone('preorder')
    window.open(preorderUrl, '_blank', 'noopener')
  }

  async function onReason(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!reason.trim()) return
    if (await send(done || 'would_pay', true)) setReasonSaved(true)
  }

  const reasonPrompt = offer.reasonPrompt || 'What would make you buy this? One line is plenty.'

  return (
    <div className="offer">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <main className="offer-main">
        <p className="offer-kicker">Pre-launch · from Aidan Torrence</p>
        <h1>{offer.headline}</h1>
        <p className="offer-buyer">For {offer.buyer}.</p>
        <ul className="offer-bullets">
          {offer.bullets.map(b => <li key={b}>{b}</li>)}
        </ul>
        <div className="offer-price">
          <span className="offer-price-main">{offer.price}</span>
          {offer.priceNote && <span className="offer-price-note">{offer.priceNote}</span>}
        </div>
        <p className="offer-honest">
          Honest note: this is a pre-launch page. The product is not built yet. I build the ones people ask for,
          in the order they ask. Leaving your email or clicking &ldquo;I&rsquo;d pay&rdquo; costs nothing and tells me what to build first.
        </p>

        {done ? (
          <section className="offer-done" aria-live="polite">
            <p className="offer-done-title">
              {done === 'signup' && 'You’re on the list.'}
              {done === 'would_pay' && `Noted: you’d pay ${offer.price}.`}
              {done === 'preorder' && 'Thanks. The payment page opened in a new tab.'}
            </p>
            {!reasonSaved ? (
              <form onSubmit={onReason} className="offer-reason">
                <label htmlFor="reason">{reasonPrompt}</label>
                <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={2} maxLength={1000} />
                <button type="submit" disabled={!!busy || !reason.trim()}>Send</button>
              </form>
            ) : (
              <p className="offer-muted">Got it. Thank you.</p>
            )}
            {done === 'would_pay' && !email.trim() && (
              <form onSubmit={onSignup} className="offer-form" style={{ marginTop: 16 }}>
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="offer-hp" aria-hidden="true" />
                <input type="email" inputMode="email" placeholder="Email for early access (optional)" value={email} onChange={e => setEmail(e.target.value)} />
                <button type="submit" disabled={!!busy}>Get early access</button>
              </form>
            )}
          </section>
        ) : (
          <section className="offer-actions">
            <form onSubmit={onSignup} className="offer-form">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="offer-hp" aria-hidden="true" />
              <input type="email" inputMode="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              <button type="submit" disabled={!!busy}>{busy === 'signup' ? 'Saving…' : 'Get early access'}</button>
            </form>
            <div className="offer-pay">
              {preorderUrl ? (
                <button type="button" className="offer-pay-btn" onClick={onPreorder} disabled={!!busy}>
                  Pre-order for {offer.price}
                </button>
              ) : (
                <button type="button" className="offer-pay-btn" onClick={onWouldPay} disabled={!!busy}>
                  {busy === 'would_pay' ? 'Saving…' : `I’d pay ${offer.price}`}
                </button>
              )}
              <span className="offer-muted">
                {preorderUrl ? 'Charged now, refunded in full if it never ships.' : 'Not a charge. Just a count that decides what gets built.'}
              </span>
            </div>
            {error && <p className="offer-error" role="alert">{error}</p>}
          </section>
        )}

        {offer.faq && offer.faq.length > 0 && (
          <section className="offer-faq">
            {offer.faq.map(f => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        )}

        <footer className="offer-foot">
          <a href="/offers">All pre-launch offers</a>
          <span>·</span>
          <a href="https://aidantorrence.com">aidantorrence.com</a>
          <span>·</span>
          <a href="https://www.instagram.com/madebyaidan" rel="noopener">@madebyaidan</a>
        </footer>
      </main>
    </div>
  )
}

const css = `
body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
body { background: #0c0c0c; }
.offer { min-height: 100vh; background: #0c0c0c; color: #fff; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
.offer-main { max-width: 640px; margin: 0 auto; padding: 56px 20px 80px; }
.offer-kicker { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #9a9a9a; margin: 0 0 18px; }
.offer h1 { font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: clamp(30px, 5.5vw, 44px); line-height: 1.12; margin: 0 0 14px; letter-spacing: -.01em; }
.offer-buyer { color: #c9c9c9; font-size: 17px; margin: 0 0 26px; }
.offer-bullets { list-style: none; padding: 0; margin: 0 0 28px; display: grid; gap: 12px; }
.offer-bullets li { padding-left: 22px; position: relative; font-size: 17px; line-height: 1.45; color: #ececec; }
.offer-bullets li::before { content: ''; position: absolute; left: 0; top: .62em; width: 10px; height: 1px; background: #fff; }
.offer-price { display: flex; align-items: baseline; gap: 12px; margin: 0 0 20px; }
.offer-price-main { font-family: Georgia, serif; font-size: 30px; }
.offer-price-note { color: #9a9a9a; font-size: 14px; }
.offer-honest { border-left: 2px solid #3a3a3a; padding: 4px 0 4px 14px; color: #b5b5b5; font-size: 14.5px; line-height: 1.55; margin: 0 0 30px; }
.offer-form { display: flex; gap: 8px; flex-wrap: wrap; }
.offer-form input[type=email] { flex: 1 1 220px; background: #161616; border: 1px solid #333; color: #fff; padding: 13px 14px; border-radius: 8px; font-size: 16px; }
.offer-form input:focus, .offer-reason textarea:focus { outline: none; border-color: #777; }
.offer-form button, .offer-pay-btn, .offer-reason button { background: #fff; color: #0c0c0c; border: 0; padding: 13px 18px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
.offer-form button:disabled, .offer-pay-btn:disabled, .offer-reason button:disabled { opacity: .55; cursor: default; }
.offer-pay { margin-top: 14px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.offer-pay-btn { background: transparent; color: #fff; border: 1px solid #fff; }
.offer-muted { color: #8f8f8f; font-size: 13.5px; }
.offer-error { color: #ff8a80; font-size: 14px; margin: 12px 0 0; }
.offer-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.offer-done { border: 1px solid #2c2c2c; border-radius: 12px; padding: 18px; }
.offer-done-title { font-family: Georgia, serif; font-size: 22px; margin: 0 0 12px; }
.offer-reason { display: grid; gap: 8px; }
.offer-reason label { color: #c9c9c9; font-size: 14.5px; }
.offer-reason textarea { background: #161616; border: 1px solid #333; color: #fff; padding: 10px 12px; border-radius: 8px; font-size: 15px; resize: vertical; font-family: inherit; }
.offer-reason button { justify-self: start; }
.offer-faq { margin-top: 44px; border-top: 1px solid #222; padding-top: 10px; }
.offer-faq details { border-bottom: 1px solid #222; padding: 12px 0; }
.offer-faq summary { cursor: pointer; font-size: 16px; color: #ececec; }
.offer-faq p { color: #b5b5b5; font-size: 15px; line-height: 1.5; margin: 8px 0 0; }
.offer-foot { margin-top: 56px; display: flex; gap: 10px; color: #6f6f6f; font-size: 13px; flex-wrap: wrap; }
.offer-foot a { color: #9a9a9a; text-decoration: none; }
.offer-foot a:hover { color: #fff; }
`
