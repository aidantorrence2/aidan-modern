import AboutPhoto from '@/components/AboutPhoto'
import StickyCTA from '@/components/StickyCTA'

export const metadata = { title: 'About — Aidan Torrence Photography' }

export default function AboutPage(){
  return (
    <main className="py-12 sm:py-16">
      <AboutPhoto />
      <StickyCTA />
    </main>
  )
}
