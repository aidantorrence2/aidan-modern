const testimonials = [
  {
    quote: '“Favorite photo from my favorite photographer. Felt like a Vogue cover shoot.”',
    name: 'Jasmine L.',
    role: 'Founder, Studio Aurelia'
  },
  {
    quote: '“He captured the exact energy I wanted for my rebrand. Booking again next quarter.”',
    name: 'Chris M.',
    role: 'DJ & Creative Director'
  },
  {
    quote: '“Professional, calm, and insanely fast turnaround. My team couldn’t believe the results.”',
    name: 'Alex R.',
    role: 'Product Designer'
  }
]

export default function Testimonials(){
  return (
    <section className="bg-white/60 py-12 sm:py-16" id="testimonials">
      <div className="container">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Client Notes</p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-semibold">Photo shoots people keep talking about</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {testimonials.map(item => (
            <figure key={item.name} className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
              <blockquote className="text-sm leading-relaxed text-neutral-700">{item.quote}</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-neutral-900">{item.name}<span className="block text-xs font-normal text-neutral-500">{item.role}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
