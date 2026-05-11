import SignUpForm from '@/components/SignUpForm'

export const metadata = {
  title: 'Design Your Ulaanbaatar Photo Shoot — Free',
  description:
    'Design your free photo shoot in Ulaanbaatar. Pick your vibe, choose a concept, and sign up.'
}

const ulaanbaatarMoodboards = [
  { id: 'Street', img: '/images/moodboards/ulaanbaatar-street.jpg' },
  { id: 'Nature', img: '/images/moodboards/ulaanbaatar-nature.jpg' },
]

export default function SignUpUlaanbaatarPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpForm
          moodboardOptions={ulaanbaatarMoodboards}
          cityPlaceholder="e.g. Ulaanbaatar"
          successVariant="next-steps"
        />
      </div>
    </section>
  )
}
