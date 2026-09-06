import ThemePicker from '@/components/ThemePicker'

export const metadata = {
  title: 'Almaty free photo shoot · Aidan Torrence',
  description: 'Choose your preference, then sign up. Almaty, Sept 7–9.',
  openGraph: { title: 'Almaty free photo shoot', description: 'Choose your preference, then sign up. Sept 7–9.', images: ['/images/theme-picker/mountain-park-reference.jpg'] },
}

export default function ChooseThemePage() { return <ThemePicker /> }
