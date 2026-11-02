import type { Metadata, Viewport } from 'next';
import NewTopTierPortfolio from '@/components/NewTopTierPortfolio';

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
      url: 'https://www.aidantorrence.com/images/new_top_tier_headliners_web/R1-00007-025A.jpg',
      width: 1070,
      height: 1600,
      alt: 'Photograph by Aidan Torrence',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aidan Torrence',
    description: 'Photographs by Aidan Torrence.',
    images: ['https://www.aidantorrence.com/images/new_top_tier_headliners_web/R1-00007-025A.jpg'],
  },
};

export const viewport: Viewport = { themeColor: '#0b1512' };

export default function HomePage() {
  return <NewTopTierPortfolio />;
}
