import { notFound } from 'next/navigation';

// Design explorations are local-only; the live site returns 404 for /designs/*.
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default function DesignsLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  return children;
}
