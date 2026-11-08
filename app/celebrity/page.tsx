'use client';

import { useEffect, useRef, useState } from 'react';
import portraits from '@/data/celebrity-portraits.json';

const email = 'mailto:aidan@aidantorrence.com?subject=New%20York%20portrait%20session';
const css = `
body > header, body > footer, .fixed.inset-x-0.bottom-0 { display:none!important }
html,body{margin:0!important;padding:0!important;background:#0c0c0c;color:#eee9e1}
.portrait-edit{--paper:#eee9e1;--muted:#a9a69f;font:400 14px/1.5 system-ui,sans-serif;max-width:1720px;margin:auto;padding:0 5vw}
.portrait-edit a{color:inherit;text-decoration:none}.portrait-edit a:hover{text-decoration:underline;text-underline-offset:5px}
.portrait-nav{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:28px 0;border-bottom:1px solid #34332f}
.portrait-name{font-size:16px;letter-spacing:-.04em}.portrait-nav nav{display:flex;gap:24px;font-size:12px}
.portrait-hero{display:grid;grid-template-columns:.85fr 1fr;gap:7vw;align-items:center;padding:58px 0 88px}
.portrait-kicker{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.portrait-hero h1{font:400 clamp(55px,6.4vw,100px)/.98 Georgia,serif;letter-spacing:-.06em;margin:25px 0 30px}
.portrait-hero h1 em{font-weight:400}.portrait-intro{max-width:270px;color:var(--muted);font-size:14px;line-height:1.7}
.portrait-trip{margin-top:50px;font-size:12px;line-height:1.9}.portrait-trip a{display:inline-block;margin-top:18px;border-bottom:1px solid #888;padding-bottom:4px}
.portrait-photo{display:block;border:0;padding:0;background:transparent;cursor:zoom-in;width:100%;color:inherit}
.portrait-photo img{display:block;width:100%;height:auto;object-fit:contain}.portrait-hero .portrait-photo{max-width:610px;margin-left:auto}
.portrait-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px 7vw;align-items:start;padding-bottom:100px}
.portrait-grid figure{margin:0}.portrait-grid figure:nth-child(4n+2){padding-top:90px}.portrait-grid .portrait-wide{grid-column:1/-1;width:76%;justify-self:center;padding:0!important}
.portrait-caption{display:flex;justify-content:space-between;color:#8c8b85;font-size:10px;letter-spacing:.08em;text-transform:uppercase;margin-top:12px}
.portrait-end{border-top:1px solid #34332f;padding:55px 0 32px;display:flex;justify-content:space-between;align-items:flex-end;gap:30px}
.portrait-end h2{font:400 clamp(30px,4vw,55px)/1.1 Georgia,serif;letter-spacing:-.035em;margin:12px 0 20px}
.portrait-end small{color:var(--muted);font-size:11px}.portrait-credit{padding:30px 0;color:#777;font-size:11px}
.portrait-dialog{border:0;padding:0;width:100vw;height:100dvh;max-width:none;max-height:none;background:#0c0c0c;color:var(--paper)}
.portrait-dialog::backdrop{background:#0c0c0c}.portrait-dialog img{width:100%;height:100%;object-fit:contain;padding:55px 64px;box-sizing:border-box}
.portrait-dialog button{position:absolute;background:#111b;color:white;border:1px solid #666;padding:12px 18px;font:inherit;cursor:pointer}.portrait-close{right:15px;top:15px}.portrait-prev{left:15px;top:50%}.portrait-next{right:15px;top:50%}
.portrait-edit :focus-visible{outline:2px solid var(--paper);outline-offset:6px}
@media(max-width:700px){.portrait-edit{padding:0 20px}.portrait-nav{padding:22px 0}.portrait-nav nav{gap:16px}.portrait-hero{display:flex;flex-direction:column;align-items:stretch;gap:30px;padding:35px 0 45px}.portrait-hero h1{font-size:58px;margin:18px 0}.portrait-intro{max-width:100%}.portrait-trip{margin-top:22px}.portrait-trip a{margin-top:8px}.portrait-grid{gap:38px 18px;padding-bottom:45px}.portrait-grid figure:nth-child(4n+2){padding-top:36px}.portrait-grid .portrait-wide{width:100%}.portrait-caption{font-size:9px}.portrait-end{display:block;padding-top:32px}.portrait-end small{display:block;margin-top:25px}.portrait-dialog img{padding:64px 12px}.portrait-dialog button{padding:10px}.portrait-prev,.portrait-next{top:auto!important;bottom:15px}}
`;

function photoSrc(index: number, size: '384' | 'full' = 'full') {
  return `/images/opt/${size}/${portraits[index].src}.webp`;
}

export default function CelebrityPortraits() {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected === null) return;
    const el = dialog.current;
    if (!el?.open) el?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setSelected(i => ((i ?? 0) + 1) % portraits.length);
      if (event.key === 'ArrowLeft') setSelected(i => ((i ?? 0) + portraits.length - 1) % portraits.length);
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [selected]);

  const photo = (index: number, eager = false) => (
    <button className="portrait-photo" onClick={() => setSelected(index)} aria-label={`View photograph ${index + 1}: ${portraits[index].alt}`}>
      {/* Existing, pre-generated portfolio files preserve the original framing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoSrc(index)} srcSet={`${photoSrc(index, '384')} 384w, ${photoSrc(index)} ${Math.min(portraits[index].width, 1920)}w`}
        sizes="(max-width:700px) 90vw, 45vw" width={portraits[index].width} height={portraits[index].height}
        alt={portraits[index].alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </button>
  );

  return <div className="portrait-edit">
    <style dangerouslySetInnerHTML={{ __html: css }} />
    <header className="portrait-nav"><a className="portrait-name" href="/">Aidan Torrence</a><nav aria-label="Portrait navigation"><a href="/#">All work</a><a href={email}>Contact</a></nav></header>
    <section className="portrait-hero">
      <div><p className="portrait-kicker">Selected work · 01—16</p><h1>Presence.<br /><em>Personality.</em><br />Portraits.</h1>
        <p className="portrait-intro">Intimate portraits and expressive fashion imagery. Photographed on film and digital.</p>
        <div className="portrait-trip">New York · October 21–28, 2026<br />Portrait collaborations &amp; commissions<br /><a href={email}>Discuss a portrait session ↗</a></div>
      </div><figure style={{ margin: 0 }}>{photo(0, true)}<figcaption className="portrait-caption"><span>Selected portraits</span><span>01 / 16</span></figcaption></figure>
    </section>
    <section className="portrait-grid" aria-label="Selected portrait photographs">
      {portraits.slice(1).map((p, n) => <figure key={p.src} className={p.width > p.height ? 'portrait-wide' : undefined}>
        {photo(n + 1)}<figcaption className="portrait-caption"><span>Aidan Torrence</span><span>{String(n + 2).padStart(2, '0')} / 16</span></figcaption>
      </figure>)}
    </section>
    <footer className="portrait-end"><div><p className="portrait-kicker">New York · October 21–28, 2026</p><h2>Let’s make a portrait.</h2><a href={email}>aidan@aidantorrence.com ↗</a></div><small>Film &amp; digital · On location<br />For artists, performers and creative teams</small></footer>
    <p className="portrait-credit">© Aidan Torrence</p>
    {selected !== null && <dialog ref={dialog} className="portrait-dialog" aria-label="Enlarged portrait" onClose={() => setSelected(null)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={photoSrc(selected)} alt={portraits[selected].alt} />
      <button className="portrait-close" onClick={() => dialog.current?.close()} autoFocus>Close ×</button>
      <button className="portrait-prev" aria-label="Previous photograph" onClick={() => setSelected((selected + portraits.length - 1) % portraits.length)}>←</button>
      <button className="portrait-next" aria-label="Next photograph" onClick={() => setSelected((selected + 1) % portraits.length)}>→</button>
    </dialog>}
  </div>;
}
