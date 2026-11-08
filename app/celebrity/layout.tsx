import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selected Portraits — Aidan Torrence',
  description: 'A curated selection of intimate portraits and expressive fashion imagery by Aidan Torrence. New York portrait sessions, October 21–28, 2026.',
  alternates: { canonical: 'https://www.aidantorrence.com/celebrity' },
  openGraph: {
    title: 'Selected Portraits — Aidan Torrence',
    description: 'Film and digital portraiture. New York · October 21–28, 2026.',
    url: 'https://www.aidantorrence.com/celebrity',
    images: [{ url: 'https://www.aidantorrence.com/images/opt/full/seoul-tokyo-ulaanbaatar-etc-arisa-000031.webp', width: 1077, height: 1600, alt: 'Portrait by Aidan Torrence' }],
  },
  twitter: {
    card: 'summary_large_image', title: 'Selected Portraits — Aidan Torrence',
    description: 'Film and digital portraiture. New York · October 21–28, 2026.',
    images: ['https://www.aidantorrence.com/images/opt/full/seoul-tokyo-ulaanbaatar-etc-arisa-000031.webp'],
  },
};

export default function PortraitLayout({ children }: { children: React.ReactNode }) { return children; }
