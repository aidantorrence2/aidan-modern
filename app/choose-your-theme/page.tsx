import ThemePicker from '@/components/ThemePicker'

export const metadata = {
  title: 'Almaty free photo shoot · Aidan Torrence',
  description: 'Choose the vibe for your shoot, then sign up. Almaty, Sept 8–9.',
  openGraph: { title: 'Almaty free photo shoot', description: 'Choose the vibe for your shoot, then sign up. Sept 8–9.', images: ['/images/theme-picker/mountain-park-reference.jpg'] },
}

export default function ChooseThemePage() { return <ThemePicker /> }
