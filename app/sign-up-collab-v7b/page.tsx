import SignUpFormCollabCharlotte from '@/components/SignUpFormCollabCharlotte'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.',
  robots: { index: false },
}

export default function SignUpCollabV7bPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabCharlotte analyticsPath="/sign-up-collab-v7b" />
    </section>
  )
}
