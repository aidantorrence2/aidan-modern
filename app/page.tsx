import type { Metadata, Viewport } from 'next';
import PhotographicPortfolio from '@/components/PhotographicPortfolio';

export const metadata: Metadata = {
  title: 'Aidan Torrence',
  description: 'Photographs by Aidan Torrence.',
  alternates: { canonical: 'https://www.aidantorrence.com' },
  openGraph: {
    title: 'Aidan Torrence',
    description: 'Photographs by Aidan Torrence.',
    type: 'website',
    url: 'https://www.aidantorrence.com',
    images: [{
      url: 'https://www.aidantorrence.com/images/opt/full/phoenix-ii-3-r1-09797-0005.webp',
      width: 1070,
      height: 1600,
      alt: 'Photograph by Aidan Torrence',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aidan Torrence',
    description: 'Photographs by Aidan Torrence.',
    images: ['https://www.aidantorrence.com/images/opt/full/phoenix-ii-3-r1-09797-0005.webp'],
  },
};

export const viewport: Viewport = { themeColor: '#0b1512' };

export default function HomePage() {
  return <PhotographicPortfolio />;
}
