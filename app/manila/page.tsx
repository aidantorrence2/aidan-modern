import Link from 'next/link'
import ManilaCTA from '@/components/ManilaCTA'
import ManilaStickyCTA from '@/components/ManilaStickyCTA'
import ManilaTracking from '@/components/ManilaTracking'

const heroCollageImages = [
  { id: '000048780009', alt: 'Neon portrait in Manila streets', style: { top: '0%', left: '2%', width: '31%', transform: 'rotate(-3deg)' } },
  { id: '000023580035', alt: 'Film portrait with vivid colors', style: { top: '2%', left: '35%', width: '30%', transform: 'rotate(2deg)' } },
  { id: '000032-8', alt: 'Natural portrait with smile', style: { top: '0%', left: '67%', width: '31%', transform: 'rotate(-2deg)' } },
  { id: 'aidantorre000579-000029', alt: 'Golden light close portrait', style: { top: '35%', left: '1%', width: '31%', transform: 'rotate(2deg)' } },
  { id: '000024-7', alt: 'Portrait with tropical texture', style: { top: '35%', left: '34%', width: '32%', transform: 'rotate(-1deg)', zIndex: 2 } },
  { id: 'aidantorre000579-000033', alt: 'Editorial close portrait with shadows', style: { top: '35%', left: '67%', width: '31%', transform: 'rotate(2deg)' } },
  { id: '000048750032', alt: 'Creative portrait with movement', style: { top: '69%', left: '2%', width: '31%', transform: 'rotate(-2deg)' } },
  { id: 'r1-05459-0015', alt: 'Night profile portrait', style: { top: '69%', left: '35%', width: '30%', transform: 'rotate(2deg)' } },
  { id: '000049660027', alt: 'Cinematic close-up portrait', style: { top: '69%', left: '67%', width: '31%', transform: 'rotate(-1deg)' } }
]

const proofTiles = [
  {
    id: '000010-3',
    quote: 'I had no idea I could look like this in photos.',
    source: 'Manila client'
  },
  {
    id: '000027-6',
    quote: 'Posing felt easy and the edits looked premium.',
    source: 'Bangkok session'
  },
  {
    id: 'aidanto-r2-023-10',
    quote: 'People noticed the new photos immediately.',
    source: 'Portrait client'
  },
  {
    id: '000040-5',
    quote: 'The direction was clear, fast, and confidence boosting.',
    source: 'Lifestyle shoot'
  },
  {
    id: 'r1-05457-0032',
    quote: 'I got both natural and strong hero shots in one session.',
    source: 'Creator session'
  }
]

const offerCards = [
  {
    title: 'Directed session',
    body: 'You get clear pose and movement direction, so there is no awkward guesswork on camera.'
  },
  {
    title: 'Manila location strategy',
    body: 'We pick location and light based on your goal: creator content, profile upgrade, or personal brand.'
  },
  {
    title: '7-day delivery',
    body: 'Final edited gallery is delivered quickly so you can publish while momentum is high.'
  }
]

const faqItems = [
  {
    question: 'How long is the session?',
    answer: 'Most sessions run 60 to 90 minutes. This is enough for varied looks without fatigue.'
  },
  {
    question: 'Do I need to know how to pose?',
    answer: 'No. Direction is built into the process and designed for people who are not used to professional shoots.'
  },
  {
    question: 'What locations do you shoot in Manila?',
    answer: 'BGC, Makati, Intramuros, and nearby areas depending on the look you want.'
  },
  {
    question: 'How do I book fast from the ad?',
    answer: 'Tap the Instagram button, paste the ready message, and I will reply with available slots and next steps.'
  }
]

export const metadata = {
  title: 'Manila Photo Sessions for Instagram Ads Traffic - Aidan Torrence Photography',
  description:
    'High-conversion Manila portrait landing page for Instagram traffic. Fast booking flow, guided shoot direction, and 7-day delivery.'
}

export default function ManilaPage(){
  return (
    <>
      <ManilaTracking />

      <section
        className="relative overflow-hidden pb-16 pt-6 sm:pt-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 14% 10%, rgba(191,160,106,0.25), transparent 42%), radial-gradient(circle at 86% 20%, rgba(0,0,0,0.09), transparent 34%), linear-gradient(180deg, #f7f6f2 0%, #f2f0ea 100%)'
        }}
      >
        <div className="container relative z-10 space-y-12 sm:space-y-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            <div className="order-2 space-y-6 lg:order-1 lg:max-w-xl">
              <p className="inline-flex rounded-full border border-neutral-300 bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-neutral-700">
                Instagram Ad Landing - Manila
              </p>

              <div className="space-y-3">
                <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-neutral-900 sm:text-6xl">
                  Manila portraits that make people pause.
                </h1>
                <p className="text-base text-neutral-700 sm:text-lg">
                  Built for ad traffic: fast clarity, real proof, one-click booking path.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-neutral-600">
                <span className="rounded-full border border-neutral-300 bg-white/85 px-3 py-1">Limited monthly slots</span>
                <span className="rounded-full border border-neutral-300 bg-white/85 px-3 py-1">Directed posing</span>
                <span className="rounded-full border border-neutral-300 bg-white/85 px-3 py-1">7-day delivery</span>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white/92 p-6 shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)]">
                <h2 className="text-lg font-semibold text-neutral-900">Check availability now</h2>
                <p className="mt-2 text-sm text-neutral-700">
                  Select your shoot goal, then open Instagram DM and send the ready message.
                </p>
                <ManilaCTA />
                <p className="mt-4 text-xs text-neutral-500">
                  No long forms. No back-and-forth just to get date options.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#work"
                  className="inline-flex items-center rounded-lg border-2 border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  data-cta="manila-portfolio"
                >
                  View full portfolio
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="rounded-[2rem] border border-neutral-200/70 bg-white/75 p-3 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-neutral-100">
                  {heroCollageImages.map(image => (
                    <div
                      key={image.id}
                      className="absolute border border-white bg-white shadow-[0_12px_25px_-18px_rgba(0,0,0,0.7)]"
                      style={image.style}
                    >
                      <img
                        src={`/images/thumbs/${image.id}.jpg`}
                        alt={image.alt}
                        className="block h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 py-12 text-neutral-50 sm:py-14">
        <div className="container space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Proof From Real Sessions</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-300">Swipe on mobile</p>
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {proofTiles.map(tile => (
              <article
                key={tile.id}
                className="min-w-[240px] max-w-[260px] snap-start rounded-2xl border border-neutral-700/80 bg-neutral-900/80 p-3"
              >
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={`/images/thumbs/${tile.id}.jpg`}
                    alt={tile.quote}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-3 text-sm text-neutral-100">&quot;{tile.quote}&quot;</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-neutral-400">{tile.source}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-12 pb-40 sm:py-16 sm:pb-44">
        <div className="container space-y-10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              Conversion-first session offer
            </h2>
            <p className="max-w-3xl text-sm text-neutral-700 sm:text-base">
              Every part of this flow is designed to reduce friction and increase qualified replies from Instagram traffic.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {offerCards.map(card => (
              <article key={card.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900">{card.title}</h3>
                <p className="mt-2 text-sm text-neutral-700">{card.body}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
              <h3 className="text-2xl font-semibold text-neutral-900">Booking flow</h3>
              <ol className="mt-4 grid gap-3 text-sm text-neutral-700 sm:text-base">
                <li>1. Choose your shoot goal and timeline.</li>
                <li>2. Tap Instagram and paste the ready message.</li>
                <li>3. Receive slot options and confirm quickly.</li>
              </ol>
              <p className="mt-4 text-xs text-neutral-500">
                Designed to feel easy on mobile where your ad traffic lands.
              </p>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
              <h3 className="text-2xl font-semibold text-neutral-900">Quick FAQ</h3>
              <div className="mt-4 space-y-3">
                {faqItems.map(item => (
                  <details key={item.question} className="group rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 open:bg-white">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-900">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm text-neutral-700">{item.answer}</p>
                  </details>
                ))}
              </div>
            </article>
          </div>

          <article
            className="rounded-3xl border border-accent/40 p-8 text-neutral-900"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(191,160,106,0.22) 0%, rgba(255,255,255,0.9) 58%, rgba(191,160,106,0.16) 100%)'
            }}
          >
            <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              If the style fits, I will send matching Manila slots.
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-neutral-700 sm:text-base">
              Best next step is one message in Instagram DM. You will get availability, location ideas, and a clear path to book.
            </p>
            <div className="max-w-3xl">
              <ManilaCTA />
            </div>
          </article>
        </div>
      </section>

      <ManilaStickyCTA />
    </>
  )
}
