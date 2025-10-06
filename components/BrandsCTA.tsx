import Link from 'next/link'

export default function BrandsCTA(){
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white/70 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">For teams & campaigns</p>
            <h3 className="mt-2 text-xl font-semibold text-neutral-900">Want multi-look production for your brand?</h3>
            <p className="mt-2 text-sm text-neutral-600">Explore full-scale campaign support, pre-production, and travel availability.</p>
          </div>
          <Link href="/brands" className="btn btn-ghost" data-cta="brands-cta">Brands — View Services</Link>
        </div>
      </div>
    </section>
  )
}
