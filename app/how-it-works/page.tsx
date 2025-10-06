import StickyCTA from '@/components/StickyCTA'

export const metadata = { title: 'How It Works — Aidan Torrence Photography' }

export default function HowItWorksPage(){
  return (
    <main className="py-12 sm:py-16">
      <section className="container max-w-4xl text-neutral-800">
        <h1 className="text-3xl font-semibold sm:text-5xl">How your shoot unfolds</h1>
        <p className="mt-4 text-sm sm:text-lg text-neutral-600">A simple process designed to keep you comfortable and confident—whether it’s your first shoot or your fiftieth.</p>
        <ol className="mt-10 space-y-6 text-neutral-700">
          <li>
            <h2 className="text-lg font-semibold sm:text-xl">01. Request & quick call</h2>
            <p className="mt-2 text-sm sm:text-base">Send a request and I’ll WhatsApp back within an hour. We’ll align on mood, styling, and what you want the photos to say.</p>
          </li>
          <li>
            <h2 className="text-lg font-semibold sm:text-xl">02. Shoot day</h2>
            <p className="mt-2 text-sm sm:text-base">I shoot on 35mm film with digital backups when needed. I’ll direct you through posing and expression so it feels natural—not stiff.</p>
          </li>
          <li>
            <h2 className="text-lg font-semibold sm:text-xl">03. Delivery in 1–2 weeks</h2>
            <p className="mt-2 text-sm sm:text-base">You’ll receive a curated gallery with finished selects within two weeks.</p>
          </li>
        </ol>
      </section>
      <StickyCTA />
    </main>
  )
}
