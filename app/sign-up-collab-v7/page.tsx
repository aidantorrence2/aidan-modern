import SignUpFormCollabV7 from '@/components/SignUpFormCollabV7'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.',
  robots: { index: false }
}

export default function SignUpCollabV7Page() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabV7 />
    </section>
  )
}
