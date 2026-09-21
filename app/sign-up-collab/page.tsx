import ThemePicker from '@/components/ThemePicker'
import { SHOOT } from '@/lib/shoot'

export const metadata = {
  title: `${SHOOT.city} free photo shoot · Aidan Torrence`,
  description: `Choose the vibe for your shoot, then sign up. ${SHOOT.city}, ${SHOOT.dates}.`,
  openGraph: { title: `${SHOOT.city} free photo shoot`, description: `Choose the vibe for your shoot, then sign up. ${SHOOT.city}, ${SHOOT.dates}.`, images: ['/images/pinterest/0f8b59a7b3d7f295b0316444212cd1b3.jpg'] },
}

export default function ChooseThemePage() { return <ThemePicker /> }
