import BaliAssistantStickyCTA from '@/components/BaliAssistantStickyCTA'

const heroHighlights = [
  { label: 'Where', value: 'Bali, Indonesia · Canggu / Ubud base' },
  { label: 'Dates', value: 'November 2025 — rolling, 2–4 week sprints' },
  { label: 'Focus', value: 'Creative production, styling, storytelling' }
]

const pillars = [
  {
    title: 'Creative Operations Wingperson',
    description:
      'You keep shoots humming: scout light, prep wardrobe, wrangle props, coordinate talent, grab behind-the-scenes coverage, and capture the micro-moments that make our stories feel alive.'
  },
  {
    title: 'Editorial Brainstorm Partner',
    description:
      'You help pressure-test concepts, build moodboards, and source inspiration that matches the vibe — from brutalist rooftops to jungle villas to cruising scooters at golden hour.'
  },
  {
    title: 'On-Set Producer Energy',
    description:
      'You translate ideas into action, beat-by-beat. You think a few steps ahead, keep logistics tight, and maintain calm, joyful energy that talent can feel.'
  }
]

const vibeChecks = [
  'You love juggling artistry and logistics without losing the plot.',
  'You geek out on film, fashion, design, or spatial storytelling.',
  'You can hold a camera, a steamer, and a client text thread all at once.',
  'You thrive in humid 30°C weather, full days, and spontaneous location swaps.',
  'You care about craft and leaving people feeling seen.'
]

const sprints = [
  {
    title: 'Editorial Shoots',
    focus: 'Support high-touch portrait sessions across Bali.',
    details:
      'Prep styling rails, pull references, scout and test light, reset sets between looks, capture candids and social snippets.'
  },
  {
    title: 'Brand + Founder Stories',
    focus: 'Translate brand narratives into visual systems.',
    details:
      'Build shot lists, organize product, co-direct motion beats, note client preferences in real time, and ensure selects ladder back to strategy.'
  },
  {
    title: 'Personal Creative Labs',
    focus: 'Experiment with new techniques and formats.',
    details:
      'Assist on test shoots (35mm, Super 8, mixed media), catalog learnings, and help turn experiments into publishable case studies.'
  }
]

const sampleWeek = [
  {
    day: 'Monday — Concept Sprint',
    detail: 'Coffee at Crate, align on vision, moodboard & shot list build, pull wardrobe from rental partners, recon drone-friendly rooftops.'
  },
  {
    day: 'Wednesday — Shoot Day',
    detail: '6:00 call time, pack kit, set the tone on set, track frames, capture BTS, handle quick changes, wrap with asset dump + backup.'
  },
  {
    day: 'Friday — Story Delivery',
    detail: 'Curate selects with Aidan, note treatment angles, schedule follow-ups with clients, craft recap decks, plan next experiments.'
  }
]

const perks = [
  {
    title: 'Hands-on mentorship',
    description: 'Work shoulder-to-shoulder with Aidan on real shoots, learn the craft decisions behind lighting, pacing, and editorial direction.'
  },
  {
    title: 'Evolving portfolio',
    description: 'Capture credited BTS, co-create case studies, and leave with tangible work that reflects the level you aspire to book.'
  },
  {
    title: 'Creative community',
    description: 'Tap into Bali\'s global creative network — stylists, set designers, filmmakers, founders — and help shape intimate micro-events.'
  },
  {
    title: 'Paid stipend',
    description: 'Weekly stipend + on-set meals + transport. Housing support available for out-of-island crew.'
  }
]

const applicationSteps = [
  {
    title: 'Send your vibe check',
    description: 'Email or DM with a quick intro, top 3 skills, and the creative project that still lives rent-free in your head.'
  },
  {
    title: 'Jam on a micro-brief',
    description: 'We\'ll hop on a call, co-ideate a mini concept, and feel out the chemistry. Expect a short creative operations prompt.'
  },
  {
    title: 'Shadow a shoot day',
    description: 'If aligned, you\'ll join a live shoot as a paid trial so we can experience the flow together before locking in sprint dates.'
  }
]

export const metadata = {
  title: 'Bali Creative Assistant Residency — Aidan Torrence',
  description:
    'Join Aidan in Bali to assist on editorial shoots, brand stories, and creative experiments. 2–4 week sprints with mentorship, stipend, and portfolio growth.'
}

export default function BaliAssistantPage(){
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100/80 via-white to-orange-50/70 pb-20 pt-14 sm:pb-28 sm:pt-24">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-16 bottom-8 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="container relative">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-600">Bali Assistant Residency</p>
              <h1 className="text-4xl font-semibold sm:text-6xl">Looking for a creative accomplice to build, produce, and elevate every project in Bali.</h1>
              <p className="text-base text-neutral-700 sm:text-lg">
                We&apos;re crafting editorial stories for founders, artists, and brands between Canggu and Ubud. I need a detail-obsessed assistant who can bring ideas to life, hold down operations, and spark unexpected magic on set.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:aidan@aidantorrence.com?subject=Bali Assistant Residency Intro&body=Hey Aidan — I saw the Bali assistant residency. Here's who I am:"
                  className="btn btn-primary px-6"
                  data-cta="bali-assistant-hero-email"
                >
                  Pitch Yourself
                </a>
                <a
                  href="https://wa.me/491758966210?text=Hi%20Aidan%20—%20I%27m%20interested%20in%20assisting%20on%20the%20Bali%20creative%20projects!"
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noreferrer"
                  data-cta="bali-assistant-hero-whatsapp"
                >
                  WhatsApp Intro
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map(highlight => (
                  <div key={highlight.label} className="rounded-2xl border border-neutral-200/80 bg-white/70 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">{highlight.label}</p>
                    <p className="mt-2 text-sm font-medium text-neutral-800">{highlight.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 rounded-3xl border border-neutral-200/80 bg-white/80 p-8 shadow-xl shadow-amber-100/50">
              <h2 className="text-2xl font-semibold text-neutral-900">The assistant energy we&apos;re obsessed with</h2>
              <ul className="space-y-3 text-sm text-neutral-700">
                {vibeChecks.map(point => (
                  <li key={point} className="flex gap-3">
                    <span aria-hidden="true" className="mt-1.5 h-2 w-2 rounded-full bg-accent" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-700">Bonus</p>
                <p className="mt-2 text-sm text-neutral-700">
                  Comfortable shooting BTS on iPhone / Fuji / Super 8? Editing Reels or short motion loops? Let&apos;s build a small creative lab together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-3xl font-semibold sm:text-4xl">What you&apos;ll help build</h2>
            <p className="text-base text-neutral-700">
              We&apos;re shipping cinematic stories for founders, creatives, and modern hospitality brands. Expect a blend of documentary, editorial, and design-forward storytelling.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map(pillar => (
              <div key={pillar.title} className="flex h-full flex-col justify-between rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">{pillar.title}</h3>
                  <p className="mt-3 text-sm text-neutral-600">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 py-16 text-white sm:py-24">
        <div className="container space-y-12">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Creative sprint menu</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Where you plug in</h2>
            <p className="text-base text-white/80">
              Each sprint mixes high-touch client work with experimental labs. You&apos;ll touch every part of the journey — from Pinterest chaos to final delivery decks.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {sprints.map(sprint => (
              <div key={sprint.title} className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div>
                  <h3 className="text-xl font-semibold text-white">{sprint.title}</h3>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-white/50">{sprint.focus}</p>
                  <p className="mt-4 text-sm text-white/70">{sprint.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="container space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold sm:text-4xl">A week together might look like</h2>
            <p className="text-base text-neutral-700">
              We move fast, stay flexible, and document everything. Here&apos;s a sample cadence — your fingerprints will be on every deliverable.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {sampleWeek.map(block => (
              <div key={block.day} className="rounded-3xl border border-neutral-200 bg-paper p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-500">{block.day}</p>
                <p className="mt-3 text-sm text-neutral-700">{block.detail}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-neutral-900">You&apos;ll leave with</h3>
            <ul className="mt-4 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
              {perks.map(perk => (
                <li key={perk.title} className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-neutral-800">{perk.title}</p>
                  <p className="mt-2 text-sm text-neutral-600">{perk.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-amber-50/70 py-16 sm:py-24">
        <div className="container space-y-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-600">Application flow</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Let&apos;s make this real</h2>
            <p className="text-base text-neutral-700">
              We care more about your taste, grit, and point of view than fancy titles. If you have receipts from past creative chaos, show them off.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {applicationSteps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-500">Step {index + 1}</span>
                <h3 className="mt-4 text-xl font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-3 text-sm text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:aidan@aidantorrence.com?subject=Bali Assistant Residency Intro&body=Hey Aidan — here's why I'm excited to assist:"
              className="btn btn-primary px-6"
              data-cta="bali-assistant-apply-email"
            >
              Email Your Intro
            </a>
            <a
              href="https://ig.me/m/madebyaidan"
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
              data-cta="bali-assistant-apply-instagram"
            >
              DM on Instagram
            </a>
          </div>
          <p className="text-xs text-neutral-600">
            If you&apos;re not sure you&apos;re ready, still reach out. We keep a roster of collaborators for future productions across Southeast Asia and Europe.
          </p>
        </div>
      </section>

      <section className="bg-neutral-900 py-20 text-white">
        <div className="container space-y-6 text-center sm:space-y-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Still reading?</p>
          <h2 className="mx-auto max-w-4xl text-3xl font-semibold sm:text-4xl">
            Send me something you&apos;ve made that feels risky, messy, or joyfully overproduced. That&apos;s the energy we&apos;re looking for.
          </h2>
          <p className="text-sm text-white/70">
            Bonus points for a 60-second voice note or a quick deck showing how you think. Surprise me.
          </p>
          <a
            href="mailto:aidan@aidantorrence.com?subject=Creative assistant application&body=Hey Aidan,%20attached%20is%20the%20work%20I%27m%20most%20proud%20of%20and%20why%20I%27d%20be%20a%20great%20fit..."
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            data-cta="bali-assistant-final-email"
          >
            Drop Your Work
          </a>
        </div>
      </section>

      <BaliAssistantStickyCTA />
    </>
  )
}

