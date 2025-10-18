import Gallery from '@/components/Gallery'
import ContactPrompt from '@/components/ContactPrompt'
import StickyCTA from '@/components/StickyCTA'

export default function Page(){
  return (
    <>
      <section className="container mt-6 sm:mt-12 text-neutral-800">
        <h2 className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-neutral-600 sm:mt-10">Selected works</h2>
      </section>
      <Gallery />
      <ContactPrompt />
      <StickyCTA />
    </>
  )
}
