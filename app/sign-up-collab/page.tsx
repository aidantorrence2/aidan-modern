import SignUpFormCollabV3 from '@/components/SignUpFormCollabV3'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will send you the details on WhatsApp.'
}

export default function SignUpCollabPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabV3 />
    </section>
  )
}
