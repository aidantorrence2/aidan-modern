'use client'

import { useState } from 'react'

// Freeform ask box: they type their question here, then the button opens
// WhatsApp with that exact question autofilled — no fixed prefill to delete.
const FALLBACK_TEXT = 'Hi Aidan! I have a question about the free photo shoot: '

export default function FaqAskWhatsApp() {
  const [question, setQuestion] = useState('')

  const openWhatsApp = () => {
    const text = question.trim() || FALLBACK_TEXT
    const url = 'https://wa.me/491758966210?text=' + encodeURIComponent(text)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="mt-6">
      <p className="text-[13px] leading-relaxed text-neutral-500">Got a different question? Ask me anything:</p>
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        rows={3}
        placeholder="Type your question…"
        className="mt-2.5 w-full rounded-xl border border-neutral-300 px-4 py-3 text-[14px] leading-relaxed text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
      <button
        type="button"
        onClick={openWhatsApp}
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-600 py-3.5 text-[15px] font-bold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.99]"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.9-1.4A10 10 0 1012 2zm5.5 14.1c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.2-3.4-.7-2.8-1.2-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.7.8 2 .9.3.2.5.2.5.4.1.1.1.6-.3 1.1z" />
        </svg>
        Ask on WhatsApp
      </button>
    </div>
  )
}
