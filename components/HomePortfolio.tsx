'use client';

/* Homepage (Nov 2026). The photographs carry the page: small type, justified
   rows (every frame in a row shares one height), generous space between rows.
   Photos: public/images/new_website → /images/opt/<size>/rio-nw-*.webp.
   Previous homepage: components/PhotographicPortfolio.tsx (unchanged). */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './HomePortfolio.module.css';

type P = { id: string; w: number; h: number };
const p = (id: string, w = 1070, h = 1600): P => ({ id: 'rio-nw-' + id, w, h });

// One entry per row. `align` nudges single frames off-centre for rhythm.
const ROWS: { photos: P[]; align?: 'left' | 'right' }[] = [
  { photos: [p('2025-12-08-000055-2', 1067), p('000052-6'), p('maria-s-000008-11', 1051)] },
  { photos: [p('zarissa-2-0019-3', 1067)], align: 'right' },
  { photos: [p('r1-00005-0013'), p('r1-00005-0014')] },
  { photos: [p('r1-09793-0029', 1600, 1070)] },
  { photos: [p('r1-09793-0013'), p('r1-09793-0019'), p('r1-09952-0019')] },
  { photos: [p('r1-09953-010a')], align: 'left' },
  { photos: [p('aloyouiii-000055400001', 1061), p('2025-12-08-000041-2', 1067)] },
  { photos: [p('r1-09799-0025'), p('r1-09799-0034')] },
  { photos: [p('r1-09793-0028'), p('r1-00009-0033'), p('r1-09799-0007')] },
  { photos: [p('r1-00006-001a'), p('r1-09996-0028')] },
  { photos: [p('r1-00009-0004'), p('r1-09794-021a')] },
  { photos: [p('r1-09997-0003'), p('r1-09997-0009')] },
];
const ALL = ROWS.flatMap(r => r.photos);
const indexOf = new Map(ALL.map((ph, i) => [ph.id, i]));

const url = (id: string, size: number | 'full') => `/images/opt/${size}/${id}.webp`;
const srcSet = (ph: P) => [384, 640, 1080].map(s => `${url(ph.id, s)} ${s}w`).concat(`${url(ph.id, 'full')} ${ph.w}w`).join(', ');
const pad = (n: number) => String(n).padStart(2, '0');

export default function HomePortfolio() {
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    for (const d of [-1, 1]) { const im = new Image(); im.src = url(ALL[(open + d + ALL.length) % ALL.length].id, 'full'); }
  }, [open]);

  const show = (i: number) => { setOpen(i); if (!dialog.current?.open) dialog.current?.showModal(); document.documentElement.style.overflow = 'hidden'; };
  const move = (d: number) => setOpen(i => (i === null ? null : (i + d + ALL.length) % ALL.length));
  const active = open === null ? null : ALL[open];

  return (
    <div className={styles.site} id="top">
      <header className={styles.mast}>
        <a href="#top">Aidan Torrence</a>
        <nav aria-label="Contact">
          <a href="mailto:aidan@aidantorrence.com">Email</a>
          <a href="https://wa.me/491758966210" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer">Instagram</a>
        </nav>
      </header>

      <main className={styles.work} aria-label="Photographs by Aidan Torrence">
        {ROWS.map((row, r) => {
          const sum = row.photos.reduce((s, ph) => s + ph.w / ph.h, 0);
          return (
            <div key={r} className={`${styles.row} ${r === 0 ? styles.first : ''} ${row.photos.length === 3 ? styles.three : ''} ${row.align ? styles[row.align] : ''}`}
              style={{ '--sum': sum } as CSSProperties}>
              {row.photos.map(ph => {
                const i = indexOf.get(ph.id)!;
                return (
                  <a key={ph.id} className={styles.ph} href={url(ph.id, 'full')} style={{ '--ar': ph.w / ph.h } as CSSProperties}
                    onClick={e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); show(i); }}
                    aria-label={`Open photograph ${pad(i + 1)}`}>
                    <img src={url(ph.id, 640)} srcSet={srcSet(ph)} width={ph.w} height={ph.h} alt=""
                      sizes={row.photos.length === 1 ? '(max-width: 760px) 100vw, 60vw' : `(max-width: 760px) 50vw, ${Math.round(100 / row.photos.length)}vw`}
                      loading={r === 0 ? 'eager' : 'lazy'} {...(r === 0 ? { fetchPriority: 'high' as const } : {})} decoding="async" />
                  </a>
                );
              })}
            </div>
          );
        })}
      </main>

      <footer className={styles.foot}>
        <span>© Aidan Torrence</span>
        <nav aria-label="Contact">
          <a href="mailto:aidan@aidantorrence.com">Email</a>
          <a href="https://wa.me/491758966210" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer">Instagram</a>
        </nav>
        <a href="#top" aria-label="Back to top">Top ↑</a>
      </footer>

      <dialog ref={dialog} className={styles.box} aria-label="Photograph viewer"
        onClose={() => { setOpen(null); document.documentElement.style.overflow = ''; }}
        onKeyDown={e => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}
        onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}
        onTouchStart={e => { touch.current = e.changedTouches[0].clientX; }}
        onTouchEnd={e => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1); touch.current = null; }}>
        <div className={styles.boxTop}>
          <span>{open !== null ? `${pad(open + 1)} / ${pad(ALL.length)}` : ''}</span>
          <button type="button" onClick={() => dialog.current?.close()}>Close</button>
        </div>
        {active && <img key={active.id} src={url(active.id, 'full')} alt="" width={active.w} height={active.h} onClick={() => move(1)} />}
        <div className={styles.boxNav}>
          <button type="button" onClick={() => move(-1)}>Previous</button>
          <button type="button" onClick={() => move(1)}>Next</button>
        </div>
      </dialog>
    </div>
  );
}
