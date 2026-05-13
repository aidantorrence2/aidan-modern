import SignUpFormSingapore from '@/components/SignUpFormSingapore'

export const metadata = {
  title: 'Singapore Photo Shoot — Dramatic, Sexy, Editorial',
  description:
    'Not for casual photos. For dramatic, sexy, editorial photos in Singapore — Marina Bay, shophouses, gardens, standout wardrobe.'
}

export default function SignUpSingaporePage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormSingapore />
      </div>
    </section>
  )
}
