import BaliAssistantStickyCTA from '@/components/BaliAssistantStickyCTA'

const heroHighlights = [
  { label: 'Pay', value: '50k–100k IDR per hour (experience-based)' },
  { label: 'Schedule', value: '4–6 hour shifts · 5 days/week target' },
  { label: 'Where', value: 'Canggu + Seminyak + Ubud runs (in person)' }
]

const coreFocus = [
  {
    title: 'In-person outreach (priority)',
    detail: 'Walk into cafés, studios, hotels, wellness brands, and boutiques daily. Share the pitch, collect contacts, and book meetings for Aidan to follow up. This is the #1 metric.'
  },
  {
    title: 'Content capture',
    detail: 'Film short BTS clips, “day in my life” snippets, and quick interviews on phone/compact camera for Threads, IG Reels, and TikTok.'
  },
  {
    title: 'Pipeline follow-up',
    detail: 'Check Instagram DMs, Facebook groups, and Threads daily for new leads. Keep a simple tracker updated with next steps.'
  }
]

const weeklyHabits = [
  'Schedule one qualified collaboration interview per day (minimum).',
  'Log every new business contact with name, location, and next action.',
  'Research 20 fresh brands each week (Instagram + email) to pitch and track.',
  'Capture recap content after each outreach block for social updates.'
]

const vibeChecks = [
  'You are comfortable introducing yourself to strangers and pitching calmly.',
  'You know Bali neighborhoods well enough to plan smart outreach routes.',
  'You enjoy filming and editing quick vertical clips on your phone.',
  'You are organized—Google Sheets or Notion updates don’t scare you.',
  'You show up on time, communicate clearly, and close loops fast.'
]

const applicationSteps = [
  {
    title: 'Send a quick intro',
    description: 'Message with your availability, Bali base, and short history doing sales, hospitality, or creator support.'
  },
  {
    title: 'Share proof of hustle',
    description: 'Drop 1–2 examples of outreach wins, BTS content you shot, or events you helped coordinate.'
  },
  {
    title: 'Do a walk-through',
    description: 'If it feels aligned, we’ll meet in person for a short test run visiting a few nearby businesses together.'
  }
]

export const metadata = {
  title: 'Bali Creative Runner — 50k–100k IDR/hr Assistant Role',
  description: 'On-ground assistant needed in Bali to pitch local businesses, capture BTS content, book daily interviews, and grow collaboration leads for Aidan Torrence.'
}

export default function BaliAssistantPage(){
  return (
    <>
      <section className="bg-gradient-to-br from-amber-100 via-white to-orange-50 pb-16 pt-14 sm:pb-20 sm:pt-20">
        <div className="container space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-600">Bali assistant role</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">Looking for a grounded hustle partner to knock on doors, capture content, and keep the collab pipeline moving.</h1>
            <p className="text-base text-neutral-700 sm:text-lg">
              This is an hourly role for someone who loves talking to people face to face. You’ll be out in the streets of Bali finding opportunities, booking meetings, and filming quick stories so the brand stays top of mind online.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/491758966210?text=Hi%20Aidan%20—%20I%27m%20interested%20in%20the%2050k-100k%20IDR/hr%20assistant%20role.%20Here%27s%20my%20intro:%20"
                className="btn flex items-center gap-2 px-6 text-sm font-semibold text-white sm:text-base"
                style={{ backgroundColor: '#25D366' }}
                target="_blank"
                rel="noreferrer"
                data-cta="bali-assistant-hero-whatsapp"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>WhatsApp Me</span>
              </a>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Brands & creators — tap the green button. WhatsApp only.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroHighlights.map(item => (
              <div key={item.label} className="rounded-2xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-neutral-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="container space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold sm:text-4xl">Core focus</h2>
            <p className="text-base text-neutral-700">
              Everything ladders back to setting real meetings with Bali businesses. If you love face-to-face strategy with a side of quick content, you’ll thrive here.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {coreFocus.map(item => (
              <div key={item.title} className="rounded-3xl border border-neutral-200 bg-paper p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-3 text-sm text-neutral-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-amber-50/70 py-14 sm:py-20">
        <div className="container space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold sm:text-4xl">Weekly rhythm</h2>
            <p className="text-base text-neutral-700">
              These are the simple habits that keep the pipeline full and the content flowing.
            </p>
          </div>
          <ul className="grid gap-4 text-sm text-neutral-700 sm:grid-cols-2">
            {weeklyHabits.map(item => (
              <li key={item} className="rounded-2xl border border-neutral-200 bg-white/90 p-4">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="container space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold sm:text-4xl">Who fits best</h2>
            <p className="text-base text-neutral-700">
              You don’t need a fancy resume—just proof you can show up, connect with people, and keep things organized.
            </p>
          </div>
          <ul className="grid gap-4 text-sm text-neutral-700 sm:grid-cols-2">
            {vibeChecks.map(item => (
              <li key={item} className="rounded-2xl border border-neutral-200 bg-paper p-4">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-neutral-900 py-16 text-white sm:py-20">
        <div className="container space-y-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">How to start</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Ready to hustle together?</h2>
            <p className="text-base text-white/70">
              I respond fastest when you include timing, location, and examples of the outreach or content you’ve already shipped.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {applicationSteps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Step {index + 1}</span>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-white/80">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/491758966210?text=Hi%20Aidan%20—%20here%27s%20my%20intro%20for%20the%20Bali%20assistant%20role:%20"
              className="btn flex items-center gap-2 px-6 text-sm font-semibold text-white sm:text-base"
              style={{ backgroundColor: '#25D366' }}
              target="_blank"
              rel="noreferrer"
              data-cta="bali-assistant-apply-whatsapp"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>WhatsApp Me</span>
            </a>
          </div>
          <p className="text-xs text-white/60">
            Tell me which neighborhoods you can cover on foot or scooter, how soon you can start knocking on doors, and include any BTS samples you can share.
          </p>
        </div>
      </section>

      <BaliAssistantStickyCTA />
    </>
  )
}

