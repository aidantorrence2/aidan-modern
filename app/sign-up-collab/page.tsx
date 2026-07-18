import SignUpFormCollab from '@/components/SignUpFormCollab'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will send you the details on WhatsApp.'
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
