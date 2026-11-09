// Private planning page: reachable by link, kept out of search.
export const metadata = { title: 'Picks', robots: { index: false, follow: false } };

export default function PicksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
