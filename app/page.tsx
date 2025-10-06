import Gallery from '@/components/Gallery'
import ContactPrompt from '@/components/ContactPrompt'
import StickyCTA from '@/components/StickyCTA'

export default function Page(){
  return (
    <>
      <section className="container mt-6 sm:mt-12 text-neutral-800">
        <h1 className="hidden max-w-5xl text-2xl font-semibold sm:block sm:text-5xl">Trust-first photo shoots for real people</h1>
        <p className="mt-2 hidden max-w-3xl text-sm text-neutral-600 sm:mt-4 sm:block sm:text-lg">Whether it’s your very first shoot or you’ve been on set for years, I’ll guide you through it. Most of the folks below walked in with little to no experience—what they all shared was trust.</p>
        <h2 className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-neutral-600 sm:mt-10">Selected works</h2>
      </section>
      <Gallery />
      <ContactPrompt />
      <StickyCTA />
    </>
  )
}
