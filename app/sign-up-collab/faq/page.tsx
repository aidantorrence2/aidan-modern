import Link from 'next/link'

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
    a: <>I will send you the final photos after the film is developed and scanned. The whole process is usually completed within 2 weeks. I will send you the photos in full resolution over Google Drive.</>
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
    a: <>You&rsquo;ll get a gallery of edited photos after the shoot. I&rsquo;ll tell you the timing when we lock in the date.</>
  }
]

// Opens WhatsApp with the question already started, so asking is one tap and
// they finish the sentence there instead of hunting for a contact route.
const ASK_HREF =
  'https://wa.me/491758966210?text=' +
  encodeURIComponent('Hi Aidan! I have a question about the free photo shoot: ')

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

      <div className="mt-6">
        <p className="text-[13px] leading-relaxed text-neutral-500">Got a different question? Ask me anything:</p>
        <a
          href={ASK_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-600 py-3.5 text-[15px] font-bold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.99]"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.9-1.4A10 10 0 1012 2zm5.5 14.1c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.2-3.4-.7-2.8-1.2-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.7.8 2 .9.3.2.5.2.5.4.1.1.1.6-.3 1.1z" />
          </svg>
          Ask on WhatsApp
        </a>
      </div>

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
