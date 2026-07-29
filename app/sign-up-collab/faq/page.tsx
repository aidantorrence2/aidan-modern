import Link from 'next/link'
import FaqAskWhatsApp from '@/components/FaqAskWhatsApp'

export const metadata = {
  title: 'Free Collab Photo Shoot — FAQ',
  description:
    'What a free collab shoot is, why it costs nothing, what happens on the day, and what you get afterwards.'
}

// Answers here are the same promises the sign-up flow makes on the way through
// — free always, 1–2 hours, we plan it together, you keep the edited photos —
// so a visitor who leaves to read this comes back to a form that agrees with it.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is it really free?',
    a: <>Yes — 100% free, always. There is no session fee, no deposit, and nothing to buy afterwards. You keep the edited photos.</>
  },
  {
    q: 'Why is it free?',
    a: <>I&rsquo;m traveling the world, and this is how I meet new people and photograph beautiful places. You get photos you love; I get to keep shooting somewhere new.</>
  },
  {
    q: 'What’s the catch?',
    a: <>There isn&rsquo;t one. It&rsquo;s a collaboration: I may share some of the photos on my Instagram and in my portfolio. If you&rsquo;d rather I didn&rsquo;t, just tell me and I won&rsquo;t.</>
  },
  {
    q: 'Do I need modeling experience?',
    a: <>No. I direct you through the whole shoot — where to stand, what to do with your hands, where to look — so you don&rsquo;t need to know how to pose.</>
  },
  {
    q: 'How long does it take?',
    a: <>We shoot for one to two hours. We&rsquo;ll plan the concept together beforehand over WhatsApp, Instagram, or LINE, so the time on the day is spent shooting.</>
  },
  {
    q: 'Where do we shoot?',
    a: <>We&rsquo;ll decide together based on the vibe of the shoot, quality of shoot location, and convenience for traveling.</>
  },
  {
    q: 'What should I wear?',
    a: <>I will send over a moodboard and I would love to know your ideas as well. Once everything is decided, you can choose outfit options accordingly.</>
  },
  {
    q: 'When do I get the photos?',
    a: <>I will send you the final photos after the film is developed and scanned. The whole process is usually completed within 2 weeks. I will send you the photos in full resolution over Google Drive.</>
  }
]

export default function CollabFaqPage() {
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
        Questions, answered
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
        Everything people ask before signing up for a free collab shoot.
      </p>

      <dl className="mt-7 divide-y divide-neutral-200 border-y border-neutral-200">
        {FAQS.map(({ q, a }, i) => (
          <div key={i} className="py-4">
            <dt
              className="text-[17px] font-semibold leading-snug text-neutral-900"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
            >
              {q}
            </dt>
            <dd className="mt-1.5 text-[14px] leading-relaxed text-neutral-600">{a}</dd>
          </div>
        ))}
      </dl>

      <FaqAskWhatsApp />

      <Link
        href="/sign-up-collab"
        className="mt-7 block w-full rounded-full bg-emerald-600 py-4 text-center text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99]"
      >
        Sign Up For Free Photo Shoot
      </Link>

      {/* Answers didn't land — this is the other honest ending to this page. */}
      <p className="mt-5 text-center text-[13px] text-neutral-400">
        <Link
          href="/sign-up-collab/not-for-me"
          className="underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-700"
        >
          It&rsquo;s not for me
        </Link>
      </p>
    </main>
  )
}
