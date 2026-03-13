import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aidan Torrence — Photography',
  description: 'Editorial portrait sessions. No experience needed.',
}

export default function EpicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
