import Link from 'next/link'
import ManilaCTA from '@/components/ManilaCTA'
import ManilaStickyCTA from '@/components/ManilaStickyCTA'
import ManilaTracking from '@/components/ManilaTracking'

const heroImage = '000049660027'

const galleryImages = [
  '000048780009',
  '000023580035',
  '000032-8',
  'aidantorre000579-000029',
  '000024-7',
  'aidanto-r2-023-10'
]

const deliverables = [
  '60 to 90 minute directed session in Manila',
  '20+ edited photos ready for IG, dating, and personal brand use',
  'Location and outfit guidance before we shoot',
  'Final gallery in 7 days'
]

const process = [
  'Message me on Instagram',
  'Choose time and location',
  'Shoot and receive your edited gallery'
]

const faqs = [
  {
    q: 'How much is it?',
    a: 'PHP 7,990 for outdoor sessions, PHP 11,990 for studio sessions.'
  },
  {
    q: 'Do I need modeling experience?',
    a: 'No. I direct you throughout the session so you do not need to know how to pose.'
  },
  {
    q: 'Where do you shoot in Manila?',
    a: 'BGC, Makati, Intramuros, and nearby spots depending on the look you want.'
  },
  {
    q: 'How fast can we book?',
    a: 'If a slot is open, we can usually confirm within the same day.'
  }
]

export const metadata = {
  title: 'Manila Photo Sessions - Aidan Torrence Photography',
  description:
    'Editorial portrait sessions in Manila with guided direction, strong social-media-ready photos, and 7-day delivery.'
}

export default function ManilaPage(){
  return (
    <>
      <ManilaTracking />

      <section className="bg-paper pb-14 pt-6 sm:pb-16 sm:pt-10">
        <div className="container grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-neutral-700">
              Manila Sessions
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-4xl font-semibold leading-[1.02] text-neutral-900 sm:text-6xl">
                Get photos that make people stop scrolling.
              </h1>
              <p className="max-w-xl text-base text-neutral-700 sm:text-lg">
                Clean, editorial portraits with full direction so you look confident and natural on camera.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-neutral-600">
              <span className="rounded-full border border-neutral-300 bg-white px-3 py-1">Limited monthly slots</span>
              <span className="rounded-full border border-neutral-300 bg-white px-3 py-1">PHP 7,990 Outdoor</span>
              <span className="rounded-full border border-neutral-300 bg-white px-3 py-1">PHP 11,990 Studio</span>
              <span className="rounded-full border border-neutral-300 bg-white px-3 py-1">Guided posing</span>
              <span className="rounded-full border border-neutral-300 bg-white px-3 py-1">7-day delivery</span>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Book your Manila session</h2>
              <p className="mt-2 text-sm text-neutral-700">
                Start with one message and I will send available times.
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">Pricing: PHP 7,990 for outdoor / PHP 11,990 for studio</p>
              <ManilaCTA />
            </div>

            <Link
              href="/#work"
              className="inline-flex rounded-lg border-2 border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              data-cta="manila-portfolio"
            >
              View full portfolio
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.45)]">
            <img
              src={`/images/thumbs/${heroImage}.jpg`}
              alt="Manila editorial portrait"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="container space-y-7">
          <h2 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Recent Portrait Work</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map(id => (
              <div key={id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                <img
                  src={`/images/thumbs/${id}.jpg`}
                  alt="Portrait sample"
                  className="h-[260px] w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-12 pb-36 sm:py-16 sm:pb-40">
        <div className="container space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">What you get</h2>
              <ul className="mt-4 grid gap-2 text-sm text-neutral-700 sm:text-base">
                {deliverables.map(item => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">How it works</h2>
              <ol className="mt-4 grid gap-2 text-sm text-neutral-700 sm:text-base">
                {process.map((step, index) => (
                  <li key={step}>{`${index + 1}. ${step}`}</li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-neutral-500">Simple flow, no long forms.</p>
            </article>
          </div>

          <article className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">FAQ</h2>
            <div className="mt-4 space-y-3">
              {faqs.map(item => (
                <details key={item.q} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 open:bg-white">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-900">{item.q}</summary>
                  <p className="mt-2 text-sm text-neutral-700">{item.a}</p>
                </details>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-accent/35 bg-accent/10 p-8">
            <h2 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Ready to lock a Manila slot?
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-700 sm:text-base">
              Message me and I will reply with available schedule options.
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">PHP 7,990 for outdoor / PHP 11,990 for studio</p>
            <div className="max-w-2xl">
              <ManilaCTA />
            </div>
          </article>
        </div>
      </section>

      <ManilaStickyCTA />
    </>
  )
}
