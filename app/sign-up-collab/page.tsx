import SignUpFormCollabCharlotteOnePage from '@/components/SignUpFormCollabCharlotteOnePage'
import { SHOOT } from '@/lib/shoot'

export const metadata = {
  title: `${SHOOT.city} free photo shoot · Aidan Torrence`,
  description: `Choose the vibe for your shoot, then sign up. ${SHOOT.city}, ${SHOOT.dates}.`,
  openGraph: { title: `${SHOOT.city} free photo shoot`, description: `Choose the vibe for your shoot, then sign up. ${SHOOT.city}, ${SHOOT.dates}.`, images: ['/images/pinterest/0f8b59a7b3d7f295b0316444212cd1b3.jpg'] },
}

// The photo-vibe picker (components/ThemePicker) ran here until 28 Oct 2026,
// then the step-by-step Charlotte form (v7b). Since 28 Oct it is the one-page
// form; /sign-up-collab-v7d is the same form under its own path.
export default function SignUpCollabPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabCharlotteOnePage analyticsPath="/sign-up-collab" />
    </section>
  )
}
