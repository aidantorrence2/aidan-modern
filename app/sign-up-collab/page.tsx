import SignUpFormCollab from '@/components/SignUpFormCollab'

export const metadata = {
  title: 'Free Photo Shoot in Goa | Aidan Torrence Photography',
  description:
    'Open for model collaborations in Goa. TFP — you keep the edited photos, free. Sign up and I will send the details on WhatsApp.'
}

export default function SignUpCollabPage() {
  return (
    <section className="min-h-screen bg-white pt-3 pb-10 sm:pt-5 sm:pb-16">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormCollab />
      </div>
    </section>
  )
}
