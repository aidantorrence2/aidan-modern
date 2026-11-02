import type { Metadata, Viewport } from 'next';
import NewTopTierPortfolio from '@/components/NewTopTierPortfolio';

export const metadata: Metadata = {
  title: 'Aidan Torrence',
  description: 'Fashion and portrait photographs by Aidan Torrence.',
  alternates: { canonical: 'https://www.aidantorrence.com' },
  openGraph: {
    title: 'Aidan Torrence',
    description: 'Fashion and portrait photographs by Aidan Torrence.',
    type: 'website',
    url: 'https://www.aidantorrence.com',
    images: [{
      url: 'https://www.aidantorrence.com/images/large/000040-2.jpg',
      width: 1600,
      height: 2387,
      alt: 'Photograph by Aidan Torrence',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aidan Torrence',
    description: 'Fashion and portrait photographs by Aidan Torrence.',
    images: ['https://www.aidantorrence.com/images/large/000040-2.jpg'],
  },
};

export const viewport: Viewport = { themeColor: '#0b1512' };

export default function HomePage() {
  return <NewTopTierPortfolio />;
}
