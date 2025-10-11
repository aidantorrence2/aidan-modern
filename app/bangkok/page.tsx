import Link from 'next/link'
import ChiangMaiCTA from '@/components/ChiangMaiCTA'
import BangkokStickyCTA from '@/components/BangkokStickyCTA'

const collageImages = [
  { id: '000048780009', alt: 'Street portrait with neon wash at night', style: { top: '0%', left: '0%', width: '19%', transform: 'rotate(-2deg)' } },
  { id: '000023580035', alt: 'Film portrait framed by trailing light leaks', style: { top: '0%', left: '21%', width: '19%', transform: 'rotate(1deg)' } },
  { id: '000032-8', alt: 'Candid portrait laughing off camera', style: { top: '0%', left: '42%', width: '19%', transform: 'rotate(-1deg)' } },
  { id: 'aidantorre000579-000029', alt: 'Sunlit portrait with palm shadows', style: { top: '0%', left: '63%', width: '19%', transform: 'rotate(2deg)' } },
  { id: '000041-6', alt: 'Golden-hour portrait with flare through hair', style: { top: '0%', left: '84%', width: '19%', transform: 'rotate(-2deg)' } },
  { id: '000024-7', alt: 'Portrait surrounded by lush greenery', style: { top: '25%', left: '0%', width: '19%', transform: 'rotate(1deg)' } },
  { id: 'aidantorre000579-000033', alt: 'Close portrait with cinematic shadow play', style: { top: '25%', left: '21%', width: '19%', transform: 'rotate(-1deg)' } },
  { id: '000048750032', alt: 'Portrait with bold color pop and motion blur', style: { top: '25%', left: '42%', width: '19%', transform: 'rotate(2deg)' } },
  { id: 'r1-05459-0015', alt: 'Twilight profile framed by city blur', style: { top: '25%', left: '63%', width: '19%', transform: 'rotate(-2deg)' } },
  { id: '000023-5', alt: 'Sun-drenched portrait with palms behind', style: { top: '25%', left: '84%', width: '19%', transform: 'rotate(-2deg)' } },
  { id: '000049660027', alt: 'Dramatic close-up with neon edge light', style: { top: '50%', left: '0%', width: '19%', transform: 'rotate(-1deg)' } },
  { id: 'aidanto-r2-023-10', alt: 'Soft portrait with architectural geometry', style: { top: '50%', left: '21%', width: '19%', transform: 'rotate(2deg)' } },
  { id: '000040850004', alt: 'Moody film frame with smeared highlights', style: { top: '50%', left: '42%', width: '19%', transform: 'rotate(-2deg)', zIndex: 6 } },
  { id: '000010-3', alt: 'Window light portrait with reflective gaze', style: { top: '50%', left: '63%', width: '19%', transform: 'rotate(-2deg)' } },
  { id: '000027-6', alt: 'Portrait with architectural backdrop in shadow', style: { top: '50%', left: '84%', width: '19%', transform: 'rotate(1deg)' } },
  { id: '000034-4', alt: 'Editorial portrait with palms and sun flare', style: { top: '75%', left: '0%', width: '19%', transform: 'rotate(2deg)' } },
  { id: '000031-6', alt: 'Ambient night portrait beneath street lamps', style: { top: '75%', left: '21%', width: '19%', transform: 'rotate(-2deg)' } },
  { id: 'r1-05457-0032', alt: 'Backlit portrait with foliage silhouettes', style: { top: '75%', left: '42%', width: '19%', transform: 'rotate(-2deg)' } },
  { id: '000040-5', alt: 'Soft focus portrait with color gel highlights', style: { top: '75%', left: '63%', width: '19%', transform: 'rotate(1deg)' } },
  { id: 'aidantorre000579-000023', alt: 'Center portrait with cinematic gaze', style: { top: '75%', left: '84%', width: '19%', transform: 'rotate(-1deg)' } },
  { id: '000048780013', alt: 'Vivid portrait with tropical foliage', style: { top: '100%', left: '0%', width: '19%', transform: 'rotate(-2deg)' } }
]




const quickHits = ['BANGKOK', 'OCT 12', 'LIMITED SLOTS']

const howItWorksSteps = [
  'Message me letting me know you are interested.',
  'We\'ll coordinate on the details.',
  'We meet up, shoot for 1–2 hours, and you get your photos in 1–2 weeks.'
]

export const metadata = {
  title: 'Free Bangkok Photo Shoot — Aidan Torrence Photography',
  description:
    'Complimentary 1–2 hour analog photo shoot in Bangkok, Oct 12 only. Limited slots, 35mm film imagery. Book via Instagram or WhatsApp.'
}

export default function BangkokPage(){
  return (
    <>
      <section className="bg-amber-50/60 pb-12 pt-4 sm:pb-16 sm:pt-10">
        <div className="container space-y-12 sm:space-y-16">
          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div className="order-1 flex flex-col items-center gap-8 lg:order-2 lg:items-end">
              <div className="self-start lg:self-end">
                <p className="font-display text-3xl font-semibold uppercase tracking-[0.02em] text-neutral-900 sm:text-5xl">Bangkok</p>
                <p className="font-display text-3xl font-semibold uppercase tracking-[0.02em] text-neutral-900 sm:text-5xl">Free Photo Shoot</p>
              </div>
              <div
                className="relative aspect-[5/4] max-w-none overflow-hidden sm:aspect-[6/4] lg:aspect-[4/3]"
                style={{ width: '100%' }}
              >
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
              <Link href="/#work" className="rounded-lg border-2 border-neutral-900 bg-neutral-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 self-start lg:self-end" data-cta="bangkok-portfolio">
                View Portfolio
              </Link>
            </div>

            <div className="order-2 space-y-5 text-neutral-900 lg:order-1 lg:max-w-xl">
              <p className="text-sm font-medium italic text-neutral-600 sm:text-base">"I've never seen myself like this." — PJ</p>
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
              <div className="rounded-2xl border border-neutral-200 bg-white/85 p-6 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-neutral-900">How it works</h2>
                <ol className="mt-3 grid gap-2 text-sm text-neutral-700">
                  {howItWorksSteps.map((step, index) => (
                    <li key={step}>{`${index + 1}. ${step}`}</li>
                  ))}
                </ol>
                <ChiangMaiCTA />
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
            <div className="rounded-3xl border border-neutral-200 bg-white/75 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">What's the catch?</h2>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                There's no catch! I just have the unique opportunity to take portraits while I'm in Bangkok, so I might as well make the most of it 🙂
              </p>
            </div>

            <div className="rounded-3xl border border-accent/30 bg-accent/10 p-8">
              <h3 className="text-lg font-semibold text-neutral-900">See the full portfolio</h3>
              <p className="mt-2 text-sm text-neutral-600">Browse complete sessions from Bangkok, Saigon, and beyond.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/#work" className="btn btn-primary px-6" data-cta="bangkok-portfolio">View Portfolio</Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Book your session</h2>
            <p className="mt-3 text-sm text-neutral-600 sm:text-base">
              Limited availability during my time in Bangkok. Message me to secure your session quickly.
            </p>
            <ChiangMaiCTA />
            <p className="mt-6 text-xs text-neutral-500">
              Prefer email? Send a note to <a href="mailto:hello@aidantorrence.com" className="underline">hello@aidantorrence.com</a> with "Bangkok Session" in the subject.
            </p>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-amber-50/60 py-12 pb-32 text-neutral-900 sm:py-16 sm:pb-36">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">"Thanks for today. It was a good confidence/social experience for me. I think your personality really suits photography 😌💙"</h2>
          <p className="mt-3 text-sm text-neutral-600">Angelique — Bangkok session</p>
        </div>
      </section>

      <BangkokStickyCTA />
    </>
  )
}
