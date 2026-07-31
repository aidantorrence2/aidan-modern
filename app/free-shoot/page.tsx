import FreeShootFaq from '@/components/FreeShootFaq'

export const metadata = {
  title: 'Free Photo Shoot — Everything You Need to Know',
  description:
    'What a free collab photo shoot is, why it costs nothing, what happens on the day, and what you get afterwards.',
  robots: { index: false }
}

export default function FreeShootPage() {
  return (
    <section className="min-h-screen bg-white">
      <FreeShootFaq />
    </section>
  )
}
