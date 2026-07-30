import SignUpFormCollabV5 from '@/components/SignUpFormCollabV5'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.',
  robots: { index: false }
}

export default function SignUpCollabV5Page() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabV5 />
    </section>
  )
}
