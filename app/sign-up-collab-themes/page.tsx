import SignUpFormCollabThemes from '@/components/SignUpFormCollabThemes'
import { selectionFromQuery } from '@/lib/themePicker'

export const metadata = { title: 'Your Almaty collab shoot · Aidan Torrence', robots: { index: false } }

export default function ThemeSignupPage({ searchParams }: { searchParams: { theme?: string; images?: string } }) {
  return <SignUpFormCollabThemes selection={selectionFromQuery(searchParams)} />
}
