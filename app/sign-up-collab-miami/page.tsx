import type { Metadata } from 'next'
import SignUpFormCollabCharlotteOnePage from '@/components/SignUpFormCollabCharlotteOnePage'

const title = 'Miami free photo shoot · Aidan Torrence'
const description = 'Sign up for a free photo shoot in Miami. Choose your vibe, share your contact details, and plan a creative collaboration with Aidan Torrence.'
const url = 'https://aidantorrence.com/sign-up-collab-miami'

export const metadata: Metadata = {
  metadataBase: new URL('https://aidantorrence.com'),
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    images: ['/images/new_top_tier_headliners_web/000014.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/new_top_tier_headliners_web/000014.jpg'],
  },
}

export default function SignUpCollabMiamiPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabCharlotteOnePage
        analyticsPath="/sign-up-collab-miami"
        city="Miami"
        cityFull="Miami, FL"
        phoneExample="305 555 0123"
        analyticsVersion="v7d-miami-onepage"
        leadSource="sign-up-collab-miami"
      />
    </section>
  )
}
