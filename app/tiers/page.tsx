import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import tiers from '@/data/portfolio-tiers.json';
import TiersEditor from './TiersEditor';

// Local-only photo arranger. Server component so it can refuse to render outside
// `next dev`; the live site returns 404 here.
export const metadata: Metadata = { title: 'Arrange photos', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Entry = [string, number, number];

export default function TiersPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <TiersEditor initial={{ tier1: tiers.tier1 as Entry[], tier2: tiers.tier2 as Entry[] }} />;
}
