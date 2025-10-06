import Link from 'next/link'

export default function Hero(){
  return (
    <section className="pt-16 sm:pt-28">
      <div className="container">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-semibold">Editorial photos for people who need to look iconic</h1>
          <p className="mt-4 text-neutral-700">One-on-one shoots with art direction, styling guidance, and selections delivered in 1–2 weeks. For anyone ready to elevate their image.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-primary" data-cta="book-hero">Book Now</Link>
            <a href="#work" className="btn btn-ghost">View Portfolio</a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.28em] text-neutral-500">
            <span>Limited availability</span>
            <span className="h-4 w-px bg-neutral-300" aria-hidden="true" />
            <span>Responds in ~1hr</span>
            <span className="h-4 w-px bg-neutral-300" aria-hidden="true" />
            <span>Featured in Vogue Italia, Hypebeast, WWD</span>
          </div>
        </div>
      </div>
    </section>
  )
}
