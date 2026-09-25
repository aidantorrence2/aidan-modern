import PaidPicker from '@/components/PaidPicker'
import { PAID_SUBJECTS } from '@/lib/paidShoot'

const description = 'Film portraits from $100. Say who the shoot is for, choose a package, and I’ll message you to confirm.'

export const metadata = {
  title: 'Book a shoot · Aidan Torrence',
  description,
  openGraph: { title: 'Book a shoot — portraits from $100', description, images: [PAID_SUBJECTS[1].cover] },
}

export default function PaidSignUpPage() { return <PaidPicker /> }
