import SignUpFormBusan from '@/components/SignUpFormBusan'

export const metadata = {
  title: 'Busan Photo Shoot — Dramatic, Sexy, Editorial',
  description:
    'Not for casual photos. For dramatic, sexy, editorial photos in Busan — old streets, nature, indoor, standout wardrobe.'
}

export default function SignUpBusanPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormBusan />
      </div>
    </section>
  )
}
