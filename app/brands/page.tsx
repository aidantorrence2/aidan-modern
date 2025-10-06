import StickyCTA from '@/components/StickyCTA'

export const metadata = { title: 'Brands — Aidan Torrence' }

export default function BrandsPage(){
  return (
    <main className="py-12 sm:py-16">
      <section className="container max-w-5xl space-y-10">
        <header className="rounded-3xl border border-neutral-200 bg-white/70 p-8 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Campaign production</p>
          <h1 className="mt-3 text-3xl font-semibold">Full-look productions for fashion, beauty, and lifestyle brands</h1>
          <p className="mt-3 text-neutral-700">From concept decks and casting to on-set direction, I partner with creative teams to deliver cohesive campaigns across stills, motion, and social.</p>
          <p className="mt-3 text-neutral-700">Send a quick brief on WhatsApp <a className="underline" href="https://wa.me/491758966210">+49 175 8966210</a> for availability.</p>
        </header>
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Production support</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li>• Creative treatment & storyboard development</li>
              <li>• Casting, glam, and location management</li>
              <li>• Photo + motion delivery with color-managed pipeline</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Ideal for</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li>• Seasonal lookbooks and e-commerce refreshes</li>
              <li>• Content sprints for product drops</li>
              <li>• Integrated campaigns needing consistent stills & motion</li>
            </ul>
          </div>
        </section>
        <footer className="rounded-3xl border border-accent/40 bg-accent/10 p-8 text-center">
          <h2 className="text-xl font-semibold text-neutral-900">Share your brief</h2>
          <p className="mt-2 text-sm text-neutral-700">WhatsApp <a className="underline" href="https://wa.me/491758966210">+49 175 8966210</a> with timeline, deliverables, and budget range.</p>
        </footer>
      </section>
      <StickyCTA />
    </main>
  )
}
