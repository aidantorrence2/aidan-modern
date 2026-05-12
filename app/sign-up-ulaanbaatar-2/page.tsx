import SignUpFormUlaanbaatar2 from '@/components/SignUpFormUlaanbaatar2'

export const metadata = {
  title: 'Ulaanbaatar Photo Shoot — Dramatic, Sexy, Editorial',
  description:
    'Not for casual photos. For dramatic, sexy, editorial photos in Ulaanbaatar — gers, old streets, standout wardrobe.'
}

export default function SignUpUlaanbaatar2Page() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormUlaanbaatar2 />
      </div>
    </section>
  )
}
