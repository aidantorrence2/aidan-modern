import SignUpForm from '@/components/SignUpForm'

export const metadata = {
  title: 'Design Your Ulaanbaatar Photo Shoot — Free',
  description:
    'Design your free photo shoot in Ulaanbaatar. Pick your vibe, choose a concept, and sign up.'
}

const ulaanbaatarThemes = [
  { id: 'Nature', img: '/images/moodboards/ulaanbaatar-nature.jpg' },
  { id: 'Street', img: '/images/moodboards/ulaanbaatar-street.jpg' },
  { id: 'Indoor', img: '/images/moodboards/indoor.jpg' },
]

const ulaanbaatarOutfits = [
  { id: 'Sexy', img: '/images/moodboards/sexy.jpg' },
  { id: 'Dramatic Fashion', img: '/images/moodboards/dramatic-fashion.jpg' },
  { id: 'Editorial', img: '/images/moodboards/editorial.jpg' },
]

export default function SignUpUlaanbaatarPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpForm
          moodboardOptions={ulaanbaatarThemes}
          outfitOptions={ulaanbaatarOutfits}
          cityPlaceholder="e.g. Ulaanbaatar"
          successVariant="next-steps"
          showRecommendations
        />
      </div>
    </section>
  )
}
