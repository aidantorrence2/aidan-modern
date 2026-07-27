import SignUpFormCollabV4 from '@/components/SignUpFormCollabV4'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.'
}

export default function SignUpCollabPage() {
  return (
    <section className="min-h-screen bg-white">
      {/* Keeps the original analytics path so the funnel is continuous across
          the v3 → v4 switch; initPageAnalytics tags the version separately. */}
      <SignUpFormCollabV4 analyticsPath="/sign-up-collab" />
    </section>
  )
}
