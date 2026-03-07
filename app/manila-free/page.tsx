import Link from 'next/link'
import ManilaFreeCTA from '@/components/ManilaFreeCTA'
import ManilaFreeStickyCTA from '@/components/ManilaFreeStickyCTA'
import ManilaFreeTracking from '@/components/ManilaFreeTracking'

const heroImage = 'manila-hero-dsc-0898'

const galleryImages = [
  'manila-gallery-dsc-0075',
  'manila-gallery-dsc-0130',
  'manila-gallery-dsc-0911',
  'manila-gallery-dsc-0190'
]

const goodFor = [
  {
    title: 'Build your portfolio',
    body: 'Need fresh content for social media or your portfolio? This is a no-cost way to get high-quality photos.'
  },
  {
    title: 'First-time shoots',
    body: 'Never done a photoshoot before? Perfect. I guide everything so it feels easy and natural.'
  },
  {
    title: 'Creative collaboration',
    body: 'We both walk away with great work. You get amazing photos, I get to create something new for my portfolio.'
  }
]

const deliverables = [
  'Directed photo session in Manila',
  '10+ edited photos for your portfolio',
  'Location and outfit guidance before we shoot',
  'Final gallery in 7 days'
]

const process = [
  'Sign up below and pick a time for a quick intro call',
  'We chat to make sure it is a good fit for both of us',
  'Show up, have fun, and get great photos at no cost'
]

const faqs = [
  {
    q: 'Is it really free?',
    a: 'Yes. This is a collab / TFP (time for prints) shoot. You give your time, I give you edited photos. No hidden fees.'
  },
  {
    q: 'Why are you offering free shoots?',
    a: 'I am building my Manila portfolio and looking for people with interesting style or energy. It is a win-win.'
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
    a: 'It is a quick call to see if we are a good fit, answer questions, and plan the shoot details.'
  }
]

export const metadata = {
  title: 'Free Photo Shoot in Manila - Aidan Torrence Photography',
  description:
    'Sign up for a free collaborative portrait session in Manila. No cost, no catch - just great photos with guided direction and 7-day delivery.'
}

export default function ManilaFreePage(){
  return (
    <>
      <ManilaFreeTracking />

      <section className="bg-paper pb-14 pt-6 sm:pb-16 sm:pt-10">
        <div className="container grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 space-y-6 lg:order-1">
            <p className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-neutral-700">
              Free Collab Sessions
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-4xl font-semibold leading-[1.02] text-neutral-900 sm:text-6xl">
                Get amazing photos for free.
              </h1>
              <p className="max-w-xl text-base text-neutral-700 sm:text-lg">
                I&apos;m looking for people to collaborate with in Manila. You get edited photos at no cost. No modeling experience needed - I guide you the whole time.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Sign up to learn more</h2>
              <p className="mt-2 text-sm text-neutral-700">
                Pick a time for a quick intro call. We&apos;ll chat to see if it&apos;s a good fit and plan your shoot.
              </p>
              <p className="mt-2 text-sm font-semibold text-green-700">100% free</p>
              <ManilaFreeCTA />
            </div>

            <Link
              href="/#work"
              className="inline-flex rounded-lg border-2 border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              data-cta="manila-free-portfolio"
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
                  className="w-full"
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
              Want free photos? Let&apos;s make it happen.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-700 sm:text-base">
              Pick a time for a quick intro call. Spots are limited.
            </p>
            <p className="mt-2 text-sm font-semibold text-green-700">100% free</p>
            <div className="max-w-2xl">
              <ManilaFreeCTA />
            </div>
          </article>
        </div>
      </section>

      <ManilaFreeStickyCTA />
    </>
  )
}
