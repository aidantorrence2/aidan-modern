import SignUpFormCollabCharlotteInline from '@/components/SignUpFormCollabCharlotteInline'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.',
  robots: { index: false },
}

export default function SignUpCollabV7cPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabCharlotteInline analyticsPath="/sign-up-collab-v7c" />
    </section>
  )
}
