import type { Metadata, Viewport } from 'next';
import NewTopTierPortfolio from '@/components/NewTopTierPortfolio';

export const metadata: Metadata = {
  title: 'Aidan Torrence',
  description: 'Fashion, editorial and portrait photography by Aidan Torrence. Miami: October 30–November 3, 2026. Rio de Janeiro, Brazil: November 5–December 4, 2026.',
  alternates: { canonical: 'https://www.aidantorrence.com' },
  openGraph: {
    title: 'Aidan Torrence',
    description: 'Fashion, editorial and portrait photography by Aidan Torrence. Miami: October 30–November 3, 2026. Rio de Janeiro, Brazil: November 5–December 4, 2026.',
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
    description: 'Fashion, editorial and portrait photography by Aidan Torrence. Miami: October 30–November 3, 2026. Rio de Janeiro, Brazil: November 5–December 4, 2026.',
    images: ['https://www.aidantorrence.com/images/new_top_tier_headliners_web/R1-00007-025A.jpg'],
  },
};

export const viewport: Viewport = { themeColor: '#0b1512' };

export default function HomePage() {
  return <NewTopTierPortfolio />;
}
