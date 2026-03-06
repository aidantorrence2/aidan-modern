import Link from 'next/link'
import ManilaCTA from '@/components/ManilaCTA'
import ManilaStickyCTA from '@/components/ManilaStickyCTA'
import ManilaTracking from '@/components/ManilaTracking'

const heroImage = 'manila-hero-dsc-0898'

const galleryImages = [
  'manila-gallery-dsc-0075',
  'manila-gallery-dsc-0130',
  'manila-gallery-dsc-0911',
  'manila-gallery-dsc-0190'
]

const goodFor = [
  {
    title: 'First-time shoots',
    body: 'Never done a photoshoot before? Perfect. I guide everything so it feels easy and natural.'
  },
  {
    title: 'Life moments',
    body: 'Great for birthdays, confidence boosts, profile refreshes, or just doing something fun for yourself.'
  },
  {
    title: 'Couples or friends',
    body: 'You can come solo or bring someone with you and still get strong individual portraits.'
  }
]

const deliverables = [
  '60 to 90 minute directed session in Manila',
  '20+ edited photos ready for IG, dating, and personal brand use',
  'Location and outfit guidance before we shoot',
  'Final gallery in 7 days'
]

const process = [
  'Sign up to learn more and pick a time',
  'Jump on a quick intro call to plan your shoot',
  'Choose your package, then show up and have fun'
]

const faqs = [
  {
    q: 'How much is it?',
    a: 'PHP 2,990 for outdoor sessions, PHP 5,990 for studio sessions.'
  },
  {
    q: 'Do I need modeling experience?',
    a: 'No. I direct you throughout the session so you do not need to know how to pose.'
  },
  {
    q: 'Can I bring a friend?',
    a: 'Yes. You can bring a friend for support, and we can also take a few photos together.'
  },
  {
    q: 'Where do you shoot in Manila?',
    a: 'BGC, Makati, Intramuros, and nearby spots depending on the look you want.'
  },
  {
    q: 'What happens on the intro call?',
    a: 'It is a quick call to understand your vibe, answer questions, and recommend the best package/location before you book.'
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
          <div className="order-2 space-y-6 lg:order-1">
            <p className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-neutral-700">
              Manila Sessions
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-4xl font-semibold leading-[1.02] text-neutral-900 sm:text-6xl">
                Get photos you&apos;ll actually want to post.
              </h1>
              <p className="max-w-xl text-base text-neutral-700 sm:text-lg">
                No modeling experience needed. I guide you the whole time so your shoot feels fun, easy, and natural.
              </p>
              <p className="max-w-xl text-sm font-semibold text-neutral-800 sm:text-base">
                Outdoor: PHP 2,990 | Studio: PHP 5,990
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Sign up to learn more</h2>
              <p className="mt-2 text-sm text-neutral-700">
                Pick a time for a quick intro call. We&apos;ll answer questions and help you choose your best session option.
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">Pricing: PHP 2,990 for outdoor / PHP 5,990 for studio</p>
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

          <div className="order-1 overflow-hidden border border-neutral-200 bg-neutral-100 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.45)] lg:order-2 lg:self-start">
            <img
              src={`/images/thumbs/${heroImage}.jpg`}
              alt="Manila editorial portrait"
              className="h-[34vh] min-h-[220px] max-h-[320px] w-full object-cover sm:h-[400px] sm:max-h-[400px] lg:h-[520px] lg:max-h-[520px]"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="container space-y-7">
          <h2 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Photos from Real Sessions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map(id => (
              <div key={id} className="overflow-hidden border border-neutral-200 bg-neutral-100">
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
          <div className="grid gap-4 lg:grid-cols-3">
            {goodFor.map(item => (
              <article key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-700">{item.body}</p>
              </article>
            ))}
          </div>

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
              <p className="mt-4 text-xs text-neutral-500">Simple flow, no long forms, no pressure.</p>
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
              Ready to see if this is the right fit?
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-700 sm:text-base">
              Sign up to learn more and choose a quick intro call slot. We&apos;ll keep it simple.
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">PHP 2,990 for outdoor / PHP 5,990 for studio</p>
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
