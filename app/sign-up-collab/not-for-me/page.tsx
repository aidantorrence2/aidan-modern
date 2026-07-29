'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { initPageAnalytics, track } from '@/lib/track'

// The exit interview. Whoever lands here has already decided against signing
// up, so every extra field is a reason to close the tab instead: one textarea,
// and a name only if they want to give one. Anonymous is the default, and
// switching back to it clears the handle rather than keeping what was typed.

type Identity = 'anonymous' | 'instagram'

export default function NotForMePage() {
  const [reason, setReason] = useState('')
  const [identity, setIdentity] = useState<Identity>('anonymous')
  const [instagram, setInstagram] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    initPageAnalytics('/sign-up-collab/not-for-me')
  }, [])

  function fieldStarted() {
    if (startedRef.current) return
    startedRef.current = true
    track('feedback_started')
  }

  function chooseIdentity(next: Identity) {
    setIdentity(next)
    // Withdrawing the handle has to actually withdraw it — see the API, which
    // treats an empty string as anonymous.
    if (next === 'anonymous') setInstagram('')
    track('feedback_identity_chosen', { identity: next })
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return

    const text = reason.trim()
    if (!text) {
      setError('Please enter a message.')
      return
    }

    setBusy(true)
    setError(null)
    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: text,
          instagram: identity === 'instagram' ? instagram.trim() : '',
          source: '/sign-up-collab',
          company: form.get('company') || '',
        }),
      })
      if (!res.ok) throw new Error('save failed')
      track('feedback_sent', { anonymous: identity === 'anonymous', chars: text.length })
      setSent(true)
    } catch {
      track('feedback_error')
      setError('That didn’t send. Try once more?')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-white px-5 pb-16 pt-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h1
          className="mt-5 text-[32px] font-semibold leading-[1.1] text-neutral-900"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
        >
          Thank you — genuinely
        </h1>
        <p className="mx-auto mt-3 max-w-[19rem] text-[14px] leading-relaxed text-neutral-500">
          That&rsquo;s more useful than a sign-up. It goes straight to me and I read every one.
        </p>
        <Link
          href="/sign-up-collab"
          className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition hover:text-neutral-900"
        >
          Back to sign-up
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-md bg-white px-5 pb-16 pt-8">
      <Link
        href="/sign-up-collab"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition hover:text-neutral-900"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to sign-up
      </Link>

      <h1
        className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-[-0.01em] text-neutral-900"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', textWrap: 'balance' }}
      >
        No worries at all
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
        It won&rsquo;t be for everyone. If you&rsquo;ve got a moment, I&rsquo;d love to know why so I can
        tailor future photo sessions accordingly.
      </p>

      <form onSubmit={submit} className="mt-6">
        <textarea
          id="reason"
          aria-label="Your feedback"
          value={reason}
          onChange={e => { fieldStarted(); setReason(e.target.value); setError(null) }}
          rows={6}
          maxLength={4000}
          placeholder="Too good to be true? Bad timing? Anything at all — be blunt."
          className="mt-2 w-full resize-y rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base leading-relaxed text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />

        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Want me to know who this is?
        </p>
        <div className="mt-2 flex gap-2">
          {([
            ['anonymous', 'Stay anonymous'],
            ['instagram', 'Add my Instagram'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => chooseIdentity(key)}
              aria-pressed={identity === key}
              className={`flex-1 rounded-full border px-4 py-2.5 text-[13px] font-bold tracking-[-0.01em] transition-all ${
                identity === key
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_8px_18px_-10px_rgba(5,150,105,0.9)]'
                  : 'border-neutral-200 bg-[#faf9f6] text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {identity === 'instagram' && (
          <div className="mt-2.5 flex items-center rounded-2xl border border-neutral-200 bg-[#faf9f6] px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
            <span className="pr-1 text-[17px] font-semibold text-neutral-300">@</span>
            <input
              value={instagram}
              // The @ is already printed to the left of the field, so a pasted
              // "@handle" would otherwise read as "@ @handle".
              onChange={e => { fieldStarted(); setInstagram(e.target.value.replace(/^@+/, '')) }}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="yourhandle"
              className="w-full bg-transparent py-3.5 text-[17px] text-neutral-900 placeholder-neutral-300 outline-none"
            />
          </div>
        )}

        <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send it'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] leading-relaxed text-neutral-400">
        Changed your mind?{' '}
        <Link href="/sign-up-collab" className="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2">
          Back to the sign-up
        </Link>
      </p>
    </main>
  )
}
