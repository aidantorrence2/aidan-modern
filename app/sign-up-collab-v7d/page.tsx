import SignUpFormCollabCharlotteOnePage from '@/components/SignUpFormCollabCharlotteOnePage'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.',
  robots: { index: false },
}

export default function SignUpCollabV7dPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabCharlotteOnePage analyticsPath="/sign-up-collab-v7d" />
    </section>
  )
}
