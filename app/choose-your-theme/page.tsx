import ThemePicker from '@/components/ThemePicker'

export const metadata = {
  title: 'Choose your theme · Almaty, Sept 7–9 · Aidan Torrence',
  description: 'Pick the photos you love, build your moodboard, and sign up for an Almaty collab shoot.',
  openGraph: { title: 'What would your shoot look like?', description: 'Four photos. Pick your favourite. Let’s make something together in Almaty, Sept 7–9.', images: ['/images/theme-picker/mountain-park-reference.jpg'] },
}

export default function ChooseThemePage() { return <ThemePicker /> }
