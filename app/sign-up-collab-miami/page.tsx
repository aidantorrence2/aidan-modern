import type { Metadata } from 'next'
import SignUpFormCollabCharlotteOnePage from '@/components/SignUpFormCollabCharlotteOnePage'

const title = 'Miami free photo shoot · Aidan Torrence'
const description = 'Free portrait shoots in Miami: beach, city streets, tropical greenery or indoors. Choose your look and plan a creative collaboration with Aidan Torrence.'
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
    images: ['/images/new_top_tier_headliners_web/R1-00007-025A.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/new_top_tier_headliners_web/R1-00007-025A.jpg'],
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
        formTitle="Your Miami shoot"
        introduction="A free portrait shoot while I’m in Miami. Pick your setting below — we’ll choose the spot, outfits and timing together."
        vibePrompt="Where would you like to shoot?"
        compactNoPreference
        heroSlides={[
          '/images/new_top_tier_headliners_web/R1-00007-025A.jpg',
          '/images/new_top_tier_headliners_web/R1-00006-015A.jpg',
          '/images/new_top_tier_headliners_web/R1-09952-0019.jpg',
          '/images/new_top_tier_headliners_web/R1-09799-0025.jpg',
          '/images/new_top_tier_headliners_web/R1-00005-0027.jpg',
        ]}
        vibes={[
          { key: 'beach', label: 'Beach & water', description: 'Sand, open sky and soft coastal light.', board: [
            '/images/pinterest/60566e91c9ec385606927957a272bc3d.jpg',
            '/images/pinterest/8a407843eec6e9a03cd59876a807f1cb.jpg',
            '/images/pinterest/951b0b858b787bf679ccfd1a1916a236.jpg',
            '/images/pinterest/2c84944ddf31ea26bf27bdb3a1d1b07c.jpg',
          ] },
          { key: 'street', label: 'City streets', description: 'Pastel walls, architecture and strong shadows.', board: [
            '/images/pinterest/582781ab225fea2e5f91b969a77a3eec.jpg',
            '/images/pinterest/7c00515e28ca183d63ecc24e55be119e.jpg',
            '/images/pinterest/9a6780eb667fe440ae6f2a15d2dc2496.jpg',
            '/images/pinterest/ccc14f116eb8ca90fc4464786efc6f1d.jpg',
          ] },
          { key: 'nature', label: 'Tropical greenery', description: 'Palms, leafy backdrops and quiet shade.', board: [
            '/images/pinterest/60566e91c9ec385606927957a272bc3d.jpg',
            '/images/pinterest/24210711b4260f21946c0951d4916f08.jpg',
            '/images/pinterest/99a3e5dccb2285f0128a9ccac5e4c6fd.jpg',
            '/images/pinterest/b404f668106f2efa1f58900719796111.jpg',
          ] },
          { key: 'indoor', label: 'Indoors', description: 'Window light and a simple, intimate setting.', board: [
            '/images/pinterest/0abbec603ab8b5d733961ff67a0a782a.jpg',
            '/images/pinterest/136d123eddd4961d1842f6990f529b7d.jpg',
            '/images/pinterest/517b708768144f5d53a57d4ed2a9822a.jpg',
            '/images/pinterest/16e3fdc791b8418141c5d51e527fb695.jpg',
          ] },
          { key: 'any', label: 'No preference', board: [] },
        ]}
        howItWorksSteps={[
          'Choose your Miami setting and share your contact details',
          'I message you to plan the location, timing and outfits',
          'We shoot for 1–2 hours — I help with posing and direction',
          'You get the edited photos to keep and share — completely free',
        ]}
        whyFree="I’m doing a few creative collaborations while I’m in Miami. I want to make new work with people here — there’s no charge for the shoot or the edited photos."
        notesHint="Tell me which part of Miami works for you, when you’re free, or any looks you have in mind."
        notesPlaceholder="Your area, availability, outfit ideas..."
        successMessage="We’ll confirm a Miami location, the best time for the light and what to wear together."
      />
    </section>
  )
}
