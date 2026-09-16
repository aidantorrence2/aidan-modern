import { redirect } from 'next/navigation'

// The paid booking flow lives at /sign-up.
export default function PaidSignupRedirect() {
  redirect('/sign-up')
}
