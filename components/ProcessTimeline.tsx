const steps = [
  {
    title: '01. Discovery call',
    description: 'Share your vision over a quick call. We align on aesthetic, wardrobe, and desired mood.'
  },
  {
    title: '02. Shoot day',
    description: 'Guided posing, expert lighting, and music to match the vibe. Expect a calm, confidence-building set.'
  },
  {
    title: '03. Delivery in 72h',
    description: 'Receive a curated gallery, retouched selects, and usage guidance for socials, press, and personal branding.'
  }
]

export default function ProcessTimeline(){
  return (
    <section className="bg-white/60 py-12 sm:py-16" id="process">
      <div className="container">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">How it works</p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-semibold">A guided path from first hello to final edit</h2>
        <ol className="mt-8 space-y-6">
          {steps.map(step => (
            <li key={step.title} className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-500">{step.title}</h3>
              <p className="mt-3 text-base text-neutral-700">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
