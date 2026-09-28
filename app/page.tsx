'use client';

import React, { useEffect } from 'react';

type Plate = { src: string; name: string; city: string };

type Spread =
  | { kind: 'chapter'; num: string; title: string; places: string }
  | { kind: 'full'; plate: Plate }
  | { kind: 'pair'; plates: [Plate, Plate] }
  | { kind: 'trio'; plates: [Plate, Plate, Plate] }
  | { kind: 'feature'; plate: Plate; side: 'left' | 'right'; line: string };

const p = (src: string, name: string, city: string): Plate => ({ src: `manila-gallery-${src}.jpg`, name, city });

const COVER = p('dsc-0075', 'Jill', 'Bali');

const SPREADS: Spread[] = [
  { kind: 'chapter', num: 'I', title: 'Heat', places: 'Bali' },
  { kind: 'feature', plate: p('closeup-001', 'Jill', 'Bali'), side: 'right', line: 'Salt, skin & silver halide.' },
  { kind: 'pair', plates: [p('dsc-0130', 'Jill', 'Bali'), p('shadow-001', 'Josephine', 'Bali')] },
  { kind: 'feature', plate: p('tropical-001', 'Karima', 'Bali'), side: 'left', line: 'The hour before the light goes gold.' },
  { kind: 'pair', plates: [p('dsc-0190', 'Dia', 'Bali'), p('dsc-0911', 'Zarissa', 'Kuala Lumpur')] },

  { kind: 'chapter', num: 'II', title: 'Nocturne', places: 'Tokyo — Saigon' },
  { kind: 'full', plate: p('garden-001', 'Sumika', 'Tokyo') },
  { kind: 'trio', plates: [p('night-001', 'Dorahan', 'Tokyo'), p('night-002', 'Dorahan', 'Saigon'), p('night-003', 'Dorahan', 'Saigon')] },
  { kind: 'full', plate: p('ivy-001', 'Ellie', 'Tokyo') },
  { kind: 'full', plate: p('garden-002', 'Sumika', 'Tokyo') },

  { kind: 'chapter', num: 'III', title: 'Old World', places: 'Vienna — Venice — Rome — Milan' },
  { kind: 'feature', plate: p('white-001', 'Silvia', 'Milan'), side: 'right', line: 'Linen, gravel, a glance over the shoulder.' },
  { kind: 'pair', plates: [p('street-001', 'Soph', 'Vienna'), p('statue-001', 'Linda', 'Vienna')] },
  { kind: 'full', plate: p('canal-002', 'Greta', 'Venice') },
  { kind: 'feature', plate: p('canal-001', 'Hana', 'Bratislava'), side: 'left', line: 'Water remembers every face.' },
  { kind: 'pair', plates: [p('ivy-002', 'Daniela', 'Rome'), p('floor-001', 'Francisca', 'Cascais')] },
  { kind: 'feature', plate: p('park-001', 'Tess', 'Glasgow'), side: 'right', line: 'Northern light, unhurried.' },

  { kind: 'chapter', num: 'IV', title: 'Concrete', places: 'Warsaw — Bangkok' },
  { kind: 'trio', plates: [p('urban-001', 'Yana', 'Warsaw'), p('urban-002', 'Yana', 'Warsaw'), p('urban-003', 'Yana', 'Warsaw')] },
  { kind: 'feature', plate: p('market-001', 'Pharima', 'Bangkok'), side: 'left', line: 'Fluorescent, humid, alive.' },
];

// Assign running plate numbers in reading order
const plateNo = new Map<string, number>();
{
  let n = 1;
  plateNo.set(COVER.src, n++);
  SPREADS.forEach((s) => {
    const list = s.kind === 'pair' || s.kind === 'trio' ? s.plates : s.kind === 'chapter' ? [] : [s.plate];
    list.forEach((pl) => { if (!plateNo.has(pl.src)) plateNo.set(pl.src, n++); });
  });
}
const pad = (n: number) => String(n).padStart(2, '0');
const TOTAL = plateNo.size;

const CITIES = ['Bali', 'Tokyo', 'Saigon', 'Vienna', 'Venice', 'Rome', 'Milan', 'Bratislava', 'Cascais', 'Glasgow', 'Warsaw', 'Bangkok', 'Kuala Lumpur'];

const CSS = `
  @font-face { font-family: 'Bodoni Moda'; font-style: normal; font-weight: 400 900; font-display: swap; src: url('/fonts/bodoni-moda.woff2') format('woff2'); }
  @font-face { font-family: 'Bodoni Moda'; font-style: italic; font-weight: 400 900; font-display: swap; src: url('/fonts/bodoni-moda-italic.woff2') format('woff2'); }
  @font-face { font-family: 'Inter'; font-style: normal; font-weight: 100 900; font-display: swap; src: url('/fonts/inter.woff2') format('woff2'); }

  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  .hf {
    --ivory: #f2ede4;
    --dim: rgba(242,237,228,0.55);
    --faint: rgba(242,237,228,0.28);
    --rule: rgba(242,237,228,0.16);
    --serif: 'Bodoni Moda', Didot, 'Bodoni 72', Georgia, serif;
    --sans: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--ivory);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  .hf *, .hf *::before, .hf *::after { box-sizing: border-box; }
  .hf img { display: block; width: 100%; height: auto; }

  .hf-eyebrow {
    font-family: var(--sans);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.32em;
    text-transform: uppercase;
  }

  /* ── Nav ── */
  .hf-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    padding: 22px clamp(16px, 4vw, 48px);
    mix-blend-mode: difference;
    color: #fff;
  }
  .hf-nav a { color: inherit; text-decoration: none; }
  .hf-nav .hf-nav-mark {
    font-family: var(--serif); font-size: 15px; letter-spacing: 0.34em; text-transform: uppercase;
    opacity: 0; transition: opacity 0.5s;
  }
  .hf-scrolled .hf-nav .hf-nav-mark { opacity: 1; }
  .hf-nav { transition: background 0.5s, padding 0.5s; }
  .hf-scrolled .hf-nav {
    mix-blend-mode: normal; color: var(--ivory);
    background: rgba(12,12,12,0.82); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    padding-top: 16px; padding-bottom: 16px;
  }
  .hf-nav-r { justify-self: end; display: flex; gap: 28px; }
  .hf-nav a.hf-eyebrow { position: relative; }
  .hf-nav a.hf-eyebrow::after {
    content: ''; position: absolute; left: 0; right: 100%; bottom: -5px; height: 1px; background: currentColor;
    transition: right 0.4s cubic-bezier(.2,.7,.2,1);
  }
  .hf-nav a.hf-eyebrow:hover::after { right: 0; }

  /* ── Cover ── */
  .hf-cover { position: relative; height: 100svh; min-height: 560px; overflow: hidden; }
  .hf-cover img {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 22%;
    transform: scale(1.08); animation: hf-settle 2.4s cubic-bezier(.2,.7,.2,1) forwards;
    filter: saturate(0.9) contrast(1.04);
  }
  @keyframes hf-settle { to { transform: scale(1); } }
  .hf-cover::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(12,12,12,0.45) 0%, rgba(12,12,12,0) 28%, rgba(12,12,12,0) 55%, rgba(12,12,12,0.85) 100%);
  }
  .hf-masthead {
    position: absolute; left: 0; right: 0; top: clamp(64px, 11vh, 120px); z-index: 2;
    text-align: center; line-height: 0.82;
    font-family: var(--serif); font-weight: 400; letter-spacing: -0.02em; text-transform: uppercase;
    font-size: clamp(56px, 10.4vw, 200px);
    white-space: nowrap;
    margin: 0;
    opacity: 0; animation: hf-rise 1.6s 0.2s cubic-bezier(.2,.7,.2,1) forwards;
  }
  .hf-masthead span { display: inline; }
  .hf-masthead span + span { margin-left: 0.22em; }
  @keyframes hf-rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
  .hf-cover-foot {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; gap: 16px;
    padding: 0 clamp(16px, 4vw, 48px) 28px;
  }
  .hf-cover-foot > :last-child { text-align: right; }
  .hf-cover-line {
    font-family: var(--serif); font-style: italic; font-size: clamp(18px, 2.2vw, 28px); text-align: center; margin: 0;
  }

  /* ── Intro ── */
  .hf-intro {
    max-width: 1100px; margin: 0 auto; padding: clamp(96px, 16vw, 200px) clamp(20px, 5vw, 48px);
    text-align: center;
  }
  .hf-intro p.hf-lede {
    font-family: var(--serif); font-weight: 400; font-size: clamp(28px, 4.6vw, 60px); line-height: 1.12;
    letter-spacing: -0.01em; margin: 28px 0 0;
  }
  .hf-intro em { font-style: italic; color: var(--dim); }

  /* ── Marquee ── */
  .hf-marquee {
    border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
    overflow: hidden; white-space: nowrap; padding: 18px 0;
  }
  .hf-marquee-track { display: inline-flex; animation: hf-marq 60s linear infinite; }
  .hf-marquee span {
    font-family: var(--serif); font-style: italic; font-size: clamp(22px, 3vw, 38px); padding: 0 28px; color: var(--dim);
  }
  .hf-marquee span b { font-style: normal; font-weight: 400; color: var(--faint); padding-left: 28px; }
  @keyframes hf-marq { to { transform: translateX(-50%); } }

  /* ── Chapter ── */
  .hf-chapter {
    padding: clamp(120px, 18vw, 240px) clamp(16px, 4vw, 48px) clamp(64px, 9vw, 120px);
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; gap: 16px;
    border-bottom: 1px solid var(--rule);
  }
  .hf-chapter h2 {
    margin: 0; font-family: var(--serif); font-weight: 400; font-style: italic; text-align: center;
    font-size: clamp(64px, 13vw, 200px); line-height: 0.85; letter-spacing: -0.03em;
  }
  .hf-chapter .hf-eyebrow:last-child { text-align: right; }

  /* ── Plates ── */
  .hf-plate figure { margin: 0; }
  .hf-cap {
    display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
    padding-top: 12px;
  }
  .hf-cap-name { font-family: var(--serif); font-style: italic; font-size: 17px; }
  .hf-cap .hf-eyebrow { color: var(--faint); }
  .hf-frame { overflow: hidden; background: #151515; }
  .hf-frame img { transition: transform 1.6s cubic-bezier(.2,.7,.2,1); }
  .hf-frame:hover img { transform: scale(1.025); }

  .hf-full { padding: clamp(40px, 7vw, 100px) 0; }
  .hf-full .hf-cap { padding-left: clamp(16px, 4vw, 48px); padding-right: clamp(16px, 4vw, 48px); }

  .hf-pair {
    display: grid; grid-template-columns: 1fr 1fr; gap: clamp(12px, 3vw, 48px);
    padding: clamp(48px, 8vw, 120px) clamp(16px, 8vw, 140px);
  }
  .hf-pair > :nth-child(2) { margin-top: clamp(80px, 16vw, 260px); }

  .hf-trio {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(8px, 1.4vw, 20px);
    padding: clamp(48px, 8vw, 120px) clamp(16px, 4vw, 48px);
  }

  .hf-feature {
    display: grid; grid-template-columns: repeat(12, 1fr); gap: clamp(12px, 2vw, 32px); align-items: center;
    padding: clamp(56px, 9vw, 140px) clamp(16px, 4vw, 48px);
  }
  .hf-feature figure { grid-column: 6 / span 6; }
  .hf-feature .hf-feature-text { grid-column: 1 / span 5; grid-row: 1; }
  .hf-feature.left figure { grid-column: 2 / span 6; }
  .hf-feature.left .hf-feature-text { grid-column: 8 / span 5; }
  .hf-feature-no {
    font-family: var(--serif); font-size: clamp(90px, 14vw, 220px); line-height: 0.8; color: var(--faint);
    letter-spacing: -0.04em; margin: 0;
  }
  .hf-feature-name {
    font-family: var(--serif); font-style: italic; font-size: clamp(40px, 6vw, 92px); line-height: 0.95;
    margin: 24px 0 14px; letter-spacing: -0.02em;
  }
  .hf-feature-line { font-family: var(--serif); font-size: clamp(16px, 1.5vw, 20px); color: var(--dim); margin: 22px 0 0; max-width: 26ch; }
  .hf-feature .hf-eyebrow { color: var(--faint); }

  /* ── Reveal ── */
  .hf-reveal { opacity: 0; transform: translateY(48px); transition: opacity 1.2s cubic-bezier(.2,.7,.2,1), transform 1.2s cubic-bezier(.2,.7,.2,1); }
  .hf-reveal.in { opacity: 1; transform: none; }

  /* ── Closing ── */
  .hf-close {
    padding: clamp(140px, 20vw, 260px) clamp(20px, 5vw, 48px) 60px; text-align: center; border-top: 1px solid var(--rule);
  }
  .hf-close a.hf-cta {
    display: inline-block; color: var(--ivory); text-decoration: none;
    font-family: var(--serif); font-style: italic; font-size: clamp(56px, 11vw, 170px); line-height: 0.9; letter-spacing: -0.03em;
    margin: 28px 0 40px; position: relative;
  }
  .hf-close a.hf-cta::after {
    content: ''; position: absolute; left: 50%; right: 50%; bottom: -10px; height: 1px; background: var(--ivory);
    transition: left 0.6s cubic-bezier(.2,.7,.2,1), right 0.6s cubic-bezier(.2,.7,.2,1);
  }
  .hf-close a.hf-cta:hover::after { left: 0; right: 0; }
  .hf-close-links { display: flex; justify-content: center; gap: 36px; flex-wrap: wrap; }
  .hf-close-links a { color: var(--dim); text-decoration: none; }
  .hf-close-links a:hover { color: var(--ivory); }
  .hf-colophon {
    margin-top: clamp(100px, 14vw, 180px); padding-top: 20px; border-top: 1px solid var(--rule);
    display: flex; justify-content: space-between; gap: 16px; color: var(--faint); flex-wrap: wrap;
  }

  /* ── Mobile ── */
  @media (max-width: 760px) {
    .hf-nav { grid-template-columns: 1fr auto; }
    .hf-nav .hf-nav-l { display: none; }
    .hf-nav-r { gap: 18px; }
    .hf-nav .hf-nav-mark { font-size: 12px; letter-spacing: 0.24em; white-space: nowrap; }
    .hf-cover-foot { grid-template-columns: 1fr 1fr; }
    .hf-cover-line { display: none; }
    .hf-masthead { font-size: clamp(48px, 15.5vw, 120px); }
    .hf-masthead span { display: block; }
    .hf-masthead span + span { margin-left: 0; }
    .hf-chapter { grid-template-columns: 1fr 1fr; }
    .hf-chapter h2 { grid-column: 1 / -1; grid-row: 1; text-align: left; margin-bottom: 20px; }
    .hf-pair { grid-template-columns: 1fr; padding-left: 16px; padding-right: 16px; gap: 56px; }
    .hf-pair > :nth-child(1) { width: 82%; }
    .hf-pair > :nth-child(2) { margin-top: 0; width: 82%; justify-self: end; }
    .hf-trio { grid-template-columns: 1fr 1fr; }
    .hf-trio > :first-child { grid-column: 1 / -1; }
    .hf-feature { grid-template-columns: 1fr; }
    .hf-feature figure, .hf-feature.left figure { grid-column: 1; grid-row: 2; }
    .hf-feature .hf-feature-text, .hf-feature.left .hf-feature-text { grid-column: 1; grid-row: 1; margin-bottom: 20px; }
    .hf-feature-name { margin: 12px 0 8px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .hf-reveal { opacity: 1; transform: none; transition: none; }
    .hf-cover img, .hf-masthead { animation: none; opacity: 1; transform: none; }
    .hf-marquee-track { animation: none; }
  }
`;

function Caption({ plate }: { plate: Plate }) {
  return (
    <figcaption className="hf-cap">
      <span className="hf-cap-name">{plate.name}</span>
      <span className="hf-eyebrow">{plate.city} &nbsp;·&nbsp; Nº {pad(plateNo.get(plate.src)!)}</span>
    </figcaption>
  );
}

function Figure({ plate, eager }: { plate: Plate; eager?: boolean }) {
  return (
    <figure className="hf-reveal">
      <div className="hf-frame">
        <img src={`/images/large/${plate.src}`} alt={`${plate.name}, ${plate.city}`} loading={eager ? 'eager' : 'lazy'} />
      </div>
      <Caption plate={plate} />
    </figure>
  );
}

function renderSpread(s: Spread, i: number) {
  switch (s.kind) {
    case 'chapter':
      return (
        <header className="hf-chapter" key={i}>
          <span className="hf-eyebrow">Chapter {s.num}</span>
          <h2 className="hf-reveal">{s.title}</h2>
          <span className="hf-eyebrow">{s.places}</span>
        </header>
      );
    case 'full':
      return (
        <section className="hf-full hf-plate" key={i}>
          <Figure plate={s.plate} />
        </section>
      );
    case 'pair':
      return (
        <section className="hf-pair hf-plate" key={i}>
          {s.plates.map((pl) => <Figure plate={pl} key={pl.src} />)}
        </section>
      );
    case 'trio':
      return (
        <section className="hf-trio hf-plate" key={i}>
          {s.plates.map((pl) => <Figure plate={pl} key={pl.src} />)}
        </section>
      );
    case 'feature':
      return (
        <section className={`hf-feature hf-plate ${s.side}`} key={i}>
          <Figure plate={s.plate} />
          <div className="hf-feature-text hf-reveal">
            <p className="hf-feature-no">{pad(plateNo.get(s.plate.src)!)}</p>
            <p className="hf-feature-name">{s.plate.name}</p>
            <span className="hf-eyebrow">{s.plate.city} &nbsp;·&nbsp; 35mm</span>
            <p className="hf-feature-line">{s.line}</p>
          </div>
        </section>
      );
  }
}

export default function Page() {
  useEffect(() => {
    const root = document.querySelector('.hf');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    document.querySelectorAll('.hf-reveal').forEach((el) => io.observe(el));

    const onScroll = () => root?.classList.toggle('hf-scrolled', window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="hf">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="hf-nav">
        <a className="hf-eyebrow hf-nav-l" href="#index">Index</a>
        <a className="hf-nav-mark" href="/">Aidan Torrence</a>
        <div className="hf-nav-r">
          <a className="hf-eyebrow" href="/sign-up-collab">Collaborate</a>
          <a className="hf-eyebrow" href="mailto:aidan@aidantorrence.com">Contact</a>
        </div>
      </nav>

      {/* Cover */}
      <section className="hf-cover">
        <img src={`/images/large/${COVER.src}`} alt={`${COVER.name}, ${COVER.city}`} />
        <h1 className="hf-masthead"><span>Aidan</span><span>Torrence</span></h1>
        <div className="hf-cover-foot">
          <span className="hf-eyebrow">Nº 01 &nbsp;—&nbsp; {COVER.name}, {COVER.city}</span>
          <p className="hf-cover-line">Portraits on film</p>
          <span className="hf-eyebrow">Collection {year}</span>
        </div>
      </section>

      {/* Intro */}
      <section className="hf-intro" id="index">
        <span className="hf-eyebrow" style={{ color: 'var(--faint)' }}>Selected Works &nbsp;·&nbsp; {pad(TOTAL)} Plates</span>
        <p className="hf-lede hf-reveal">
          Editorial portraiture shot on 35mm film <em>across thirteen cities.</em> Slow, intimate, made to last.
        </p>
      </section>

      <div className="hf-marquee" aria-hidden="true">
        <div className="hf-marquee-track">
          {[0, 1].map((k) => (
            <React.Fragment key={k}>
              {CITIES.map((c) => <span key={c + k}>{c}<b>✦</b></span>)}
            </React.Fragment>
          ))}
        </div>
      </div>

      {SPREADS.map(renderSpread)}

      {/* Closing */}
      <section className="hf-close">
        <span className="hf-eyebrow" style={{ color: 'var(--faint)' }}>Now booking — worldwide</span>
        <div>
          <a className="hf-cta" href="/sign-up-collab">Sit for me.</a>
        </div>
        <div className="hf-close-links">
          <a className="hf-eyebrow" href="/sign-up-collab">Collaborate</a>
          <a className="hf-eyebrow" href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="hf-eyebrow" href="mailto:aidan@aidantorrence.com">Email</a>
        </div>
        <div className="hf-colophon">
          <span className="hf-eyebrow">© {year} Aidan Torrence</span>
          <span className="hf-eyebrow">Shot on 35mm film</span>
        </div>
      </section>
    </div>
  );
}
