import Link from 'next/link'
import ChiangMaiCTA from '@/components/ChiangMaiCTA'
import ChiangMaiStickyCTA from '@/components/ChiangMaiStickyCTA'

const collageImages = [
  { id: '000048780009', alt: 'Street portrait with neon wash at night', style: { top: '-12%', left: '-8%', width: '36%', transform: 'rotate(-3deg)' } },
  { id: '000023580035', alt: 'Film portrait framed by trailing light leaks', style: { top: '-14%', left: '22%', width: '36%', transform: 'rotate(2deg)' } },
  { id: '000032-8', alt: 'Candid portrait laughing off camera', style: { top: '-12%', left: '52%', width: '36%', transform: 'rotate(-2deg)' } },
  { id: 'aidantorre000579-000029', alt: 'Sunlit portrait with palm shadows', style: { top: '-8%', left: '82%', width: '34%', transform: 'rotate(3deg)' } },
  { id: '000041-6', alt: 'Golden-hour portrait with flare through hair', style: { top: '6%', left: '-12%', width: '36%', transform: 'rotate(2deg)' } },
  { id: '000024-7', alt: 'Portrait surrounded by lush greenery', style: { top: '4%', left: '18%', width: '34%', transform: 'rotate(-2deg)' } },
  { id: 'aidantorre000579-000033', alt: 'Close portrait with cinematic shadow play', style: { top: '8%', left: '46%', width: '34%', transform: 'rotate(1deg)' } },
  { id: '000048750032', alt: 'Portrait with bold color pop and motion blur', style: { top: '5%', left: '74%', width: '34%', transform: 'rotate(-3deg)' } },
  { id: 'r1-05459-0015', alt: 'Twilight profile framed by city blur', style: { top: '22%', left: '-6%', width: '34%', transform: 'rotate(-1deg)' } },
  { id: '000023-5', alt: 'Sun-drenched portrait with palms behind', style: { top: '20%', left: '22%', width: '34%', transform: 'rotate(3deg)' } },
  { id: '000049660027', alt: 'Dramatic close-up with neon edge light', style: { top: '22%', left: '50%', width: '34%', transform: 'rotate(-2deg)' } },
  { id: 'aidanto-r2-023-10', alt: 'Soft portrait with architectural geometry', style: { top: '24%', left: '78%', width: '34%', transform: 'rotate(2deg)' } },
  { id: '000040850004', alt: 'Moody film frame with smeared highlights', style: { top: '38%', left: '-10%', width: '34%', transform: 'rotate(1deg)' } },
  { id: '000010-3', alt: 'Window light portrait with reflective gaze', style: { top: '36%', left: '18%', width: '34%', transform: 'rotate(-2deg)' } },
  { id: '000027-6', alt: 'Portrait with architectural backdrop in shadow', style: { top: '40%', left: '46%', width: '34%', transform: 'rotate(2deg)' } },
  { id: '000034-4', alt: 'Editorial portrait with palms and sun flare', style: { top: '37%', left: '74%', width: '34%', transform: 'rotate(-1deg)' } },
  { id: '000031-6', alt: 'Ambient night portrait beneath street lamps', style: { top: '54%', left: '-4%', width: '36%', transform: 'rotate(-2deg)' } },
  { id: 'r1-05457-0032', alt: 'Backlit portrait with foliage silhouettes', style: { top: '52%', left: '24%', width: '34%', transform: 'rotate(2deg)' } },
  { id: '000040-5', alt: 'Soft focus portrait with color gel highlights', style: { top: '56%', left: '52%', width: '34%', transform: 'rotate(-3deg)' } },
  { id: 'aidantorre000579-000023', alt: 'Center portrait with cinematic gaze', style: { top: '50%', left: '80%', width: '34%', transform: 'rotate(1deg)' } },
  { id: '000048780013', alt: 'Vivid portrait with tropical foliage', style: { top: '68%', left: '8%', width: '34%', transform: 'rotate(3deg)' } },
  { id: '000023-3', alt: 'Candid rooftop portrait at dusk', style: { top: '70%', left: '36%', width: '34%', transform: 'rotate(-2deg)' } },
  { id: 'r1-05455-0020', alt: 'Evening portrait with city lights behind', style: { top: '72%', left: '64%', width: '34%', transform: 'rotate(2deg)' } },
  { id: '000049690037', alt: 'Film frame with cinematic bokeh', style: { top: '34%', left: '36%', width: '32%', transform: 'rotate(0.5deg)', zIndex: 8 } }
]






const quickHits = ['CHIANG MAI', 'OCT 6–11', 'LIMITED SLOTS']

const howItWorksSteps = [
  'Tap the WhatsApp button and say you want the Chiang Mai shoot.',
  'I reply immediately with available times and location options.',
  'We lock the vibe, meet up, and shoot — gallery arrives within 1–2 weeks.'
]

export const metadata = {
  title: 'Free Chiang Mai Photo Shoot — Aidan Torrence Photography',
  description:
    'Complimentary 1–2 hour analog photo shoot in Chiang Mai, Oct 6–11 only. Limited slots, 35mm film imagery, WhatsApp-first booking.'
}

export default function ChiangMaiFreePage(){
  return (
    <>
      <section className="bg-amber-50/60 pb-12 pt-4 sm:pb-14 sm:pt-10">
        <div className="container grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="order-1 flex flex-col items-center gap-3 lg:order-2 lg:items-end">
            <p className="font-display text-3xl font-semibold uppercase tracking-[0.02em] text-neutral-900 sm:text-5xl self-start lg:self-end">Chiang Mai</p>
            <div
              className="relative aspect-[5/6] max-w-none overflow-visible sm:aspect-[6/5] lg:aspect-square"
              style={{ width: '210%', marginLeft: '-60%', marginTop: '-6%' }}
            >
              {collageImages.map(image => (
                <div
                  key={image.id}
                  className="absolute border border-neutral-200 bg-white shadow-[0_10px_38px_-22px_rgba(0,0,0,0.65)]"
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
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-neutral-500 text-center">Images from recent sessions</p>
          </div>

          <div className="order-2 space-y-5 text-neutral-900 lg:order-1 lg:max-w-xl">
            <p className="text-sm font-medium italic text-neutral-600 sm:text-base">"I've never seen myself like this." — PJ</p>
            <h1 className="whitespace-nowrap text-3xl font-semibold uppercase tracking-[0.02em] sm:text-5xl">FREE PHOTO SHOOT</h1>
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
      </section>

      <section className="pb-12 pt-6 sm:pb-16 sm:pt-10">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="rounded-3xl border border-neutral-200 bg-white/75 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Bring a friend or come solo</h2>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                Sessions stay conversational and guided so you never feel stiff. I direct posing but keep it human the entire time.
              </p>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                Everything is photographed on 35mm film—no digital safety net—so you walk away with tangible, timeless frames.
              </p>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base">
                Expect 8–12 edited selects in a private gallery within 1–2 weeks.
              </p>
            </div>

            <div className="rounded-3xl border border-accent/30 bg-accent/10 p-8">
              <h3 className="text-lg font-semibold text-neutral-900">Need to see more work?</h3>
              <p className="mt-2 text-sm text-neutral-600">Browse full sessions from Bangkok, Saigon, and beyond.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/#work" className="btn btn-primary px-6" data-cta="chiang-mai-portfolio">View Portfolio</Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Reserve your complimentary slot</h2>
            <p className="mt-3 text-sm text-neutral-600 sm:text-base">
              Only a handful of shoots fit before I leave Chiang Mai. WhatsApp me and we’ll lock it in within minutes.
            </p>
            <ChiangMaiCTA />
            <p className="mt-6 text-xs text-neutral-500">
              Prefer email? Send a note to <a href="mailto:hello@aidantorrence.com" className="underline">hello@aidantorrence.com</a> with “Chiang Mai Session” in the subject.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 py-12 pb-32 text-neutral-100 sm:py-16 sm:pb-36">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">“Thanks for today. It was a good confidence/social experience for me. I think your personality really suits photography 😌💙”</h2>
          <p className="mt-3 text-sm text-neutral-300">Angelique — Bangkok session</p>
        </div>
      </section>

      <ChiangMaiStickyCTA />
    </>
  )
}
