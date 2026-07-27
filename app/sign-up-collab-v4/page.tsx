import SignUpFormCollabV4 from '@/components/SignUpFormCollabV4'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.',
  robots: { index: false }
}

export default function SignUpCollabV4Page() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabV4 />
    </section>
  )
}
