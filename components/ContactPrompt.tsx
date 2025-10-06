export default function ContactPrompt(){
  return (
    <section className="py-12 sm:py-16" id="contact">
      <div className="container">
        <div className="rounded-3xl border border-accent/40 bg-accent/10 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-semibold text-neutral-900">Ready for film photos that feel like you?</h2>
          <p className="mt-3 text-sm text-neutral-700">Share a quick note and I’ll reply ASAP with next steps and available film dates.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/book" className="btn btn-primary px-6" data-cta="contact-book">Get Started</a>
            <a href="https://wa.me/491758966210" className="btn bg-green-600 text-white px-6" data-cta="contact-whatsapp">WhatsApp</a>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.28em] text-neutral-500">Responds quickly</p>
        </div>
      </div>
    </section>
  )
}
