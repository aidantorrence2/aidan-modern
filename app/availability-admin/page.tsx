import { redirect } from 'next/navigation'

// Convenience alias — both /availability-admin and /availability/admin work.
export default function AvailabilityAdminAlias() {
  redirect('/availability/admin')
}
