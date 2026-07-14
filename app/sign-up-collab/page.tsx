import SignUpFormCollab from '@/components/SignUpFormCollab'

export const metadata = {
  title: 'Ahmedabad Free Photo Shoot Collab',
  description:
    'Free 35mm film photo shoot collaboration in Ahmedabad. No modeling experience needed — sign up with WhatsApp and get the details.'
}

export default function SignUpCollabPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormCollab />
      </div>
    </section>
  )
}
