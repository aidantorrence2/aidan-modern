const services = [
  {
    title: 'Signature Shoot',
    price: 'From $950',
    details: ['Studio or on-location', '2 wardrobe looks', '8 retouched selects delivered in 72h']
  },
  {
    title: 'Editorial Studio Shoot',
    price: 'From $1,650',
    details: ['Creative direction consult', 'Pro styling + lighting team', '15 retouched selects + contact sheet']
  },
  {
    title: 'On-Location Feature',
    price: 'Custom quote',
    details: ['Full-day coverage', 'Scouting & permitting', 'Team coordination + unlimited looks']
  }
]

export default function PhotoServices(){
  return (
    <section className="py-12 sm:py-16" id="services">
      <div className="container">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Sessions</p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-semibold">Choose the photo shoot that fits your vision</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {services.map(service => (
            <div key={service.title} className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
              <h3 className="text-lg font-semibold text-neutral-900">{service.title}</h3>
              <p className="mt-2 text-sm font-medium text-accent">{service.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                {service.details.map(detail => (
                  <li key={detail}>• {detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
