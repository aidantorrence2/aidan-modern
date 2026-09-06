import SignUpFormCollabV4 from '@/components/SignUpFormCollabV4'

export const metadata = {
  title: 'Free Collab Photo Shoot',
  description:
    'Sign up for a free collab photo shoot — you keep the edited photos. I will message you with the details.'
}

export default function SignUpCollabPage() {
  return (
    <section className="min-h-screen bg-white">
      {/* The previous /sign-up-collab form, kept reachable at /sign-up-collab-old
          since 2026-09-07; /sign-up-collab is now the photo-vibe picker. */}
      <SignUpFormCollabV4 analyticsPath="/sign-up-collab-old" />
    </section>
  )
}
