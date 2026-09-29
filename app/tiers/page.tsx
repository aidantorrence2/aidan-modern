import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import tiers from '@/data/portfolio-tiers.json';

// Local-only view of both photo tiers. Server component so it can refuse to render
// outside `next dev`; the live site returns 404 here.
export const metadata: Metadata = { title: 'Portfolio tiers', robots: { index: false, follow: false } };

type Photo = [string, number, number];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #0c0c0c !important; height: auto !important; }
  .tr { color: #f2ede4; font-family: system-ui, -apple-system, sans-serif; padding: 40px clamp(16px, 2.5vw, 36px) 80px; }
  .tr h1 { font: italic 400 clamp(40px, 6vw, 72px)/1 Georgia, serif; margin: 0 0 8px; }
  .tr p { color: rgba(242,237,228,0.6); margin: 0; max-width: 70ch; line-height: 1.55; }
  .tr nav { display: flex; gap: 10px; margin: 20px 0 0; }
  .tr nav a { color: #f2ede4; border: 1px solid rgba(242,237,228,0.2); padding: 6px 12px; border-radius: 999px; text-decoration: none; font-size: 12px; }
  .tr section { margin-top: 48px; scroll-margin-top: 16px; }
  .tr h2 { font: italic 400 36px Georgia, serif; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(242,237,228,0.14); display: flex; justify-content: space-between; align-items: baseline; }
  .tr h2 small { font: 500 11px system-ui; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(242,237,228,0.4); }
  .tr .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .tr figure { margin: 0; }
  .tr figure a { display: block; aspect-ratio: 4 / 5; background: #161514; }
  .tr figure img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .tr figcaption { font-size: 10px; color: rgba(242,237,228,0.45); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tr .empty { color: rgba(242,237,228,0.4); font-style: italic; }
`;

function Grid({ photos }: { photos: Photo[] }) {
  if (!photos.length) return <p className="empty">No photos in this tier yet.</p>;
  return (
    <div className="grid">
      {photos.map(([src], i) => (
        <figure key={src}>
          <a href={`/images/large/${src}.jpg`} target="_blank" rel="noreferrer">
            <img src={`/images/large/${src}.jpg`} alt={src} loading="lazy" />
          </a>
          <figcaption title={src}>{String(i + 1).padStart(3, '0')} · {src}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function TiersPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  const t1 = tiers.tier1 as Photo[];
  const t2 = tiers.tier2 as Photo[];
  return (
    <div className="tr">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h1>Portfolio tiers</h1>
      <p>Tier 1 is what the homepage shows, in this order. Tier 2 is the backup set. To move a photo, move its line between the two lists in <code>data/portfolio-tiers.json</code>. This page only exists when the site is running locally.</p>
      <nav><a href="#tier-1">Tier 1 · {t1.length}</a><a href="#tier-2">Tier 2 · {t2.length}</a><a href="/">Homepage</a></nav>
      <section id="tier-1"><h2>Tier 1 <small>On the homepage · {t1.length}</small></h2><Grid photos={t1} /></section>
      <section id="tier-2"><h2>Tier 2 <small>Backup · {t2.length}</small></h2><Grid photos={t2} /></section>
    </div>
  );
}
