import SignUpFormCollabNew from '@/components/SignUpFormCollabNew'

export const metadata = {
  title: 'Free Photo Shoot — Pick an Outfit, Pick a Location, Show Up',
  description:
    'Free photo shoot on 35mm film. No prep, no makeup team, no experience needed — pick an outfit, pick a location, show up. TFP — we both get the photos.'
}

export default function SignUpCollabNewPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormCollabNew />
      </div>
    </section>
  )
}
