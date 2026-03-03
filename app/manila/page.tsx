import Link from 'next/link'
import ManilaCTA from '@/components/ManilaCTA'
import ManilaStickyCTA from '@/components/ManilaStickyCTA'
import ManilaTracking from '@/components/ManilaTracking'

const collageImages = [
  { id: '000048780009', alt: 'Neon-lit portrait in the city', style: { top: '0%', left: '0%', width: '24%', transform: 'rotate(-2deg)' } },
  { id: '000023580035', alt: 'Editorial portrait with film texture', style: { top: '0%', left: '25%', width: '24%', transform: 'rotate(1deg)' } },
  { id: '000032-8', alt: 'Natural laughing portrait', style: { top: '0%', left: '50%', width: '24%', transform: 'rotate(-1deg)' } },
  { id: 'aidantorre000579-000029', alt: 'Golden light portrait', style: { top: '0%', left: '75%', width: '24%', transform: 'rotate(2deg)' } },
  { id: '000024-7', alt: 'Portrait in tropical surroundings', style: { top: '33%', left: '0%', width: '24%', transform: 'rotate(1deg)' } },
  { id: 'aidantorre000579-000033', alt: 'Close portrait with shadow detail', style: { top: '33%', left: '25%', width: '24%', transform: 'rotate(-1deg)' } },
  { id: '000048750032', alt: 'Dynamic portrait with motion blur', style: { top: '33%', left: '50%', width: '24%', transform: 'rotate(2deg)' } },
  { id: 'r1-05459-0015', alt: 'Low light editorial profile portrait', style: { top: '33%', left: '75%', width: '24%', transform: 'rotate(-2deg)' } },
  { id: '000049660027', alt: 'Dramatic close-up portrait', style: { top: '66%', left: '0%', width: '24%', transform: 'rotate(-1deg)' } },
  { id: 'aidanto-r2-023-10', alt: 'Soft portrait with clean framing', style: { top: '66%', left: '25%', width: '24%', transform: 'rotate(2deg)' } },
  { id: '000010-3', alt: 'Window light portrait', style: { top: '66%', left: '50%', width: '24%', transform: 'rotate(-2deg)' } },
  { id: '000027-6', alt: 'Architectural portrait composition', style: { top: '66%', left: '75%', width: '24%', transform: 'rotate(1deg)' } }
]

const quickHits = ['MANILA', 'LIMITED MONTHLY SLOTS', '7-DAY DELIVERY']

const deliverables = [
  '60-90 minute guided session in Manila (BGC, Makati, Intramuros, or your chosen area).',
  '20+ edited selects with an editorial, cinematic look.',
  'Direction on poses and movement so you never feel awkward.',
  'Private gallery delivery within 7 days.'
]

const bestFor = [
  'Creators and founders who need stronger personal-brand photos.',
  'People who want profile photos that stand out immediately.',
  'Anyone who wants to look natural but elevated on camera.'
]

const bookingSteps = [
  'Tap the Instagram button and send a quick message.',
  'Get location + time recommendations based on your vibe.',
  'Shoot, then receive your edited gallery within 7 days.'
]

export const metadata = {
  title: 'Manila Photo Sessions - Aidan Torrence Photography',
  description:
    'Editorial portrait sessions in Manila for Instagram, personal brand, and profile upgrades. Limited monthly slots with 7-day delivery.'
}

export default function ManilaPage(){
  return (
    <>
      <ManilaTracking />

      <section className="bg-amber-50/70 pb-16 pt-4 sm:pt-10">
        <div className="container space-y-12 sm:space-y-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="order-2 space-y-6 text-neutral-900 lg:order-1 lg:max-w-xl">
              <p className="text-sm font-medium italic text-neutral-600 sm:text-base">
                &quot;I&apos;ve never seen myself like this in photos.&quot; - PJ
              </p>

              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                  Manila Photo Sessions
                </h1>
                <p className="mt-2 text-xl font-medium text-neutral-800 sm:text-2xl">
                  Built to make people stop scrolling.
                </p>
              </div>

              <p className="text-sm text-neutral-700 sm:text-base">
                You get a directed shoot with polished edits that are ready for Instagram, dating profiles, and personal brand use.
                This is optimized for one goal: strong photos that convert attention into opportunities.
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-neutral-600">
                {quickHits.map(hit => (
                  <span
                    key={hit}
                    className="rounded border border-neutral-700/15 bg-white/80 px-3 py-1 text-[0.65rem] shadow-sm"
                  >
                    {hit}
                  </span>
                ))}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-neutral-900">Check availability</h2>
                <p className="mt-2 text-sm text-neutral-700">
                  If your style fits, I&apos;ll send next available times and best location options in Manila.
                </p>
                <ManilaCTA />
              </div>

              <Link
                href="/#work"
                className="inline-flex rounded-lg border-2 border-neutral-900 bg-neutral-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                data-cta="manila-portfolio"
              >
                View Portfolio
              </Link>
            </div>

            <div className="order-1 flex flex-col items-center gap-8 lg:order-2 lg:items-end">
              <div className="relative aspect-[5/4] w-full max-w-none overflow-hidden sm:aspect-[6/4] lg:aspect-[4/3]">
                {collageImages.map(image => (
                  <div
                    key={image.id}
                    className="absolute border border-white bg-white shadow-[0_10px_38px_-22px_rgba(0,0,0,0.65)]"
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

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-white/85 p-7 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">What you get</h2>
              <ul className="mt-4 grid gap-2 text-sm text-neutral-700">
                {deliverables.map(item => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white/85 p-7 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">Best fit for</h2>
              <ul className="mt-4 grid gap-2 text-sm text-neutral-700">
                {bestFor.map(item => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white/85 p-7 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">Client feedback</h2>
              <div className="mt-4 space-y-4 text-sm text-neutral-700">
                <p>&quot;Thanks for today. It was a huge confidence boost.&quot;</p>
                <p>&quot;You made posing easy, and the photos looked expensive.&quot;</p>
                <p>&quot;People noticed the new photos immediately.&quot;</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white/85 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">How booking works</h2>
              <ol className="mt-4 grid gap-2 text-sm text-neutral-700 sm:text-base">
                {bookingSteps.map((step, index) => (
                  <li key={step}>{`${index + 1}. ${step}`}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-accent/30 bg-accent/10 p-8">
              <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Limited slots this month</h2>
              <p className="mt-3 text-sm text-neutral-700 sm:text-base">
                I keep sessions limited so each shoot is fully directed and intentionally edited. Message now to lock your preferred time window.
              </p>
              <ManilaCTA />
              <p className="mt-6 text-xs text-neutral-600">
                Prefer email? Send a note to{' '}
                <a href="mailto:aidan@aidantorrence.com?subject=Manila%20Session%20Inquiry" className="underline">
                  aidan@aidantorrence.com
                </a>{' '}
                with &quot;Manila Session&quot; in the subject.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-amber-50/70 pb-36 pt-4 text-neutral-900 sm:pb-40">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            The goal is simple: photos that feel true to you, but strong enough to elevate how people see you online.
          </h2>
        </div>
      </section>

      <ManilaStickyCTA />
    </>
  )
}
