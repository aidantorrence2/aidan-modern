import SignUpFormBali from '@/components/SignUpFormBali'

export const metadata = {
  title: 'Bali Photo Shoot — Book Your Session',
  description:
    'Book a photo shoot in Bali. Pick your package, pick your vibe, and get incredible photos.'
}

export default function SignUpBaliPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormBali />
      </div>
    </section>
  )
}
