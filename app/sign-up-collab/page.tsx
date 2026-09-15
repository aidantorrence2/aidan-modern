import ThemePicker from '@/components/ThemePicker'
import { SHOOT } from '@/lib/shoot'

export const metadata = {
  title: 'Free photo shoot · Aidan Torrence',
  description: `Choose the vibe for your shoot, then sign up. ${SHOOT.dates}.`,
  openGraph: { title: 'Free photo shoot', description: `Choose the vibe for your shoot, then sign up. ${SHOOT.dates}.`, images: ['/images/theme-picker/sea-reference.jpg'] },
}

export default function ChooseThemePage() { return <ThemePicker /> }
