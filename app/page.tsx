'use client';

import React, { useEffect, useState } from 'react';

// [filename (no extension), width, height] — shuffled so neighbouring plates come from different shoots
const PHOTOS: [string, number, number][] = [
  ["hk-taiwan-most-beautiful-in-the-world-000039-3", 1072, 1600],
  ["maria-4-000046", 1068, 1600],
  ["china-aita-friend-000016-3", 1091, 1600],
  ["bangkok-val-000042-3", 1070, 1600],
  ["aidanto-r6-039-18", 1072, 1600],
  ["taiwan-philippines-model-0013-13", 1066, 1600],
  ["aidantorre000572-000021", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-fun-000050-6", 1068, 1600],
  ["bangkok-natcha-000049-6", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-fighter-000042-5", 1077, 1600],
  ["hk-taiwan-chinese-in-taipei-000016-7", 1072, 1600],
  ["aidantorre000573-000010", 1070, 1600],
  ["bangkok-lunna-000065-3", 1600, 1070],
  ["hk-taiwan-korean-000007-3", 1072, 1600],
  ["bangkok-dude-000084", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-aussie-000025-2", 1077, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-arisa-000031", 1077, 1600],
  ["manila-gallery-dsc-0190", 992, 1505],
  ["seoul-tokyo-ulaanbaatar-etc-neuroscientist-000007-4", 1077, 1600],
  ["aidantorre000573-000019", 1070, 1600],
  ["r1-05454-0002", 1600, 2392],
  ["seoul-tokyo-ulaanbaatar-etc-ca21e-000050-5", 1068, 1600],
  ["bangkok-dana-000071", 1070, 1600],
  ["manila-gallery-park-001", 1600, 2400],
  ["hk-taiwan-chinese-in-taipei-000018-8", 1072, 1600],
  ["000008-11", 1600, 2361],
  ["seoul-tokyo-ulaanbaatar-etc-fun-000058-6", 1068, 1600],
  ["bangkok-katurina-dsc-0348", 1018, 1600],
  ["hk-taiwan-most-beautiful-in-the-world-000022-4", 1072, 1600],
  ["hk-taiwan-indo-beauty-000001-6", 1072, 1600],
  ["aidanto-r2-067-32", 1072, 1600],
  ["aidantorre001118-000008", 1070, 1600],
  ["000036-5", 1600, 2397],
  ["bangkok-anne-000118", 1600, 1070],
  ["aidanto-r11-052-24a", 1072, 1600],
  ["hk-taiwan-most-beautiful-in-the-world-000030-4", 1072, 1600],
  ["china-gavinxjewel-000021", 1091, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-stunning-amazing-000040-5", 1068, 1600],
  ["manila-gallery-ivy-001", 1600, 1061],
  ["000002", 1600, 1045],
  ["maria-4-000053", 1068, 1600],
  ["bangkok-dana-000061-2", 1070, 1600],
  ["hk-taiwan-most-beautiful-in-the-world-000032-3", 1072, 1600],
  ["aurorienne-000043-2", 1600, 1067],
  ["manila-gallery-garden-002", 1600, 1061],
  ["a-pattaya-angelina-11946-kodak-ultramax-400-6", 1600, 1072],
  ["seoul-tokyo-ulaanbaatar-etc-aussie-000040-2", 1077, 1600],
  ["maria-4-000040", 1068, 1600],
  ["r1-05461-0011", 1600, 2391],
  ["seoul-tokyo-ulaanbaatar-etc-arisa-000057", 1068, 1600],
  ["taiwan-philippines-totally-crazy-0037-e-2", 1066, 1600],
  ["000008", 1600, 2402],
  ["bangkok-pink-old-000041-2", 1070, 1600],
  ["taiwan-philippines-model-0004-4-6", 1066, 1600],
  ["aidanto-r15-021-9", 1600, 1072],
  ["aidantorre001118-000003", 1070, 1600],
  ["maria-4-000005", 1068, 1600],
  ["hk-taiwan-indo-beauty-000039-8", 1600, 1072],
  ["seoul-tokyo-ulaanbaatar-etc-indian-000019-2", 1068, 1600],
  ["bangkok-pink-old-000040-2", 1600, 1070],
  ["hk-taiwan-high-end-philipinno-000001-8", 1072, 1600],
  ["korea-born-in-china-000003", 1068, 1600],
  ["bali-anggreini-2-000039", 1068, 1600],
  ["bangkok-lefroncee-000045-5", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-sumika-000047-12", 1068, 1600],
  ["aidanto-r4-047-22", 1600, 2387],
  ["seoul-tokyo-ulaanbaatar-etc-arisa-000058", 1068, 1600],
  ["bangkok-dana-11777-neon-500t-32", 1072, 1600],
  ["korea-born-in-china-000006", 1068, 1600],
  ["000049820006", 1600, 2413],
  ["maria-3-000005", 1068, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-sumika-000005-12", 1068, 1600],
  ["aidanto-r4-053-25", 1600, 2387],
  ["india-saro-jini-000008690021", 1060, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-fun-000060-6", 1068, 1600],
  ["hk-taiwan-most-beautiful-in-the-world-000026-3", 1072, 1600],
  ["000049740023", 1600, 1061],
  ["bangkok-natcha-000002-3", 1070, 1600],
  ["helen-000037", 1068, 1600],
  ["aidantorre000566-000040", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-stunning-amazing-000062-7", 1600, 1068],
  ["taiwan-philippines-model-0034-32", 1066, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-aussie-000019-6", 1077, 1600],
  ["000072", 1600, 2400],
  ["aidantorre001118-000012", 1070, 1600],
  ["bangkok-thismn-000039-3", 1070, 1600],
  ["manila-gallery-urban-002", 1228, 1818],
  ["r1-05460-0022", 1600, 2392],
  ["bangkok-lunna-000058-3", 1070, 1600],
  ["bangkok-rosie-11893-250d-ahu-11", 1600, 1072],
  ["000034", 1070, 1600],
  ["adian-torrence-0195-32", 1600, 2400],
  ["manila-gallery-purple-001-cropped", 1220, 1620],
  ["seoul-tokyo-ulaanbaatar-etc-stunning-amazing-000059-7", 1068, 1600],
  ["hk-taiwan-nisha-000009", 1072, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-fun-000058-9", 1068, 1600],
  ["bangkok-val-000039-2", 1070, 1600],
  ["000044", 1600, 2400],
  ["manila-gallery-night-001", 1080, 1080],
  ["bangkok-lefroncee-000046-4", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-sumika-000068-2", 1068, 1600],
  ["hk-taiwan-indo-beauty-000044-2", 1072, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-fun-000055-6", 1068, 1600],
  ["bangkok-dude-000016", 1070, 1600],
  ["000048780010", 1600, 1061],
  ["seoul-tokyo-ulaanbaatar-etc-neuroscientist-000013-4", 1077, 1600],
  ["bangkok-lefroncee-000053-4", 1070, 1600],
  ["bangkok-dana-11777-neon-500t-21", 1072, 1600],
  ["aidantorre001118-000013", 1070, 1600],
  ["aidanto-r12-070-33a", 1072, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-sumika-000001-12", 1068, 1600],
  ["000032-7", 1600, 2385],
  ["almaty-convinced-r1-08778-00xa", 1070, 1600],
  ["hk-taiwan-most-beautiful-in-the-world-000021-4", 1072, 1600],
  ["bangkok-dana-000060-2", 1070, 1600],
  ["korea-russian-000029-3", 1091, 1600],
  ["bangkok-lunna-000059-3", 1070, 1600],
  ["maria-3-000041", 1068, 1600],
  ["bangkok-everjjade-000042-2", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-architect-000051-12", 1068, 1600],
  ["manila-gallery-ivy-002", 1600, 2380],
  ["seoul-tokyo-ulaanbaatar-etc-fighter-000040-5", 1077, 1600],
  ["000020", 1600, 2384],
  ["bangkok-lunna-000063-3", 1070, 1600],
  ["hk-taiwan-brought-her-mom-000017-8", 1072, 1600],
  ["maria-3-000006", 1068, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-architect-000001-4", 1068, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-neuroscientist-000012-4", 1077, 1600],
  ["bali-sofiatann-000001-3", 1068, 1600],
  ["000020-7", 1228, 1818],
  ["bangkok-natcha-000062-6", 1070, 1600],
  ["china-aita-friend-000023-3", 1091, 1600],
  ["china-gavinxjewel-000029", 1091, 1600],
  ["bangkok-dana-11777-neon-500t-24", 1072, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-aussie-000011-6", 1077, 1600],
  ["hk-taiwan-korean-000005-3", 1072, 1600],
  ["aidanto-r12-074-35a", 1072, 1600],
  ["bangkok-natcha-000060-6", 1070, 1600],
  ["maria-4-000039", 1068, 1600],
  ["china-gavinxjewel-000041", 1091, 1600],
  ["bangkok-dana-11777-neon-500t-15", 1072, 1600],
  ["aidanto-r2-043-20-1", 1600, 2387],
  ["bali-anggreini-2-000038", 1068, 1600],
  ["aidanto-r12-064-30a", 1072, 1600],
  ["bangkok-natcha-000041-6", 1070, 1600],
  ["bangkok-rosie-11893-250d-ahu-7", 1072, 1600],
  ["almaty-convinced-r1-08778-0xxa", 1070, 1600],
  ["bali-sofiatann2-000004-3", 1068, 1600],
  ["taiwan-philippines-model-0037-35", 1066, 1600],
  ["bangkok-pink-old-000042-2", 1070, 1600],
  ["bangkok-dana-11777-neon-500t-35", 1072, 1600],
  ["bangkok-natcha-000070", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-arisa-000054", 1068, 1600],
  ["manila-gallery-night-002", 1080, 1080],
  ["bangkok-dude-000020", 1070, 1600],
  ["000053-5", 1600, 2362],
  ["seoul-tokyo-ulaanbaatar-etc-model-000047-6", 1068, 1600],
  ["bangkok-dana-11777-neon-500t-14", 1072, 1600],
  ["bangkok-rosie-11893-250d-ahu-10", 1072, 1600],
  ["hk-taiwan-india-south-africa-000020-5", 1072, 1600],
  ["almaty-a-car-r1-08777-001a", 1070, 1600],
  ["aidantorr000053-000040", 1070, 1600],
  ["bali-sofiatann2-000002-3", 1068, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-architect-000068-9", 1068, 1600],
  ["bangkok-dude-000112", 1070, 1600],
  ["seoul-tokyo-ulaanbaatar-etc-russian-000026-4", 1077, 1600]
];


const pad = (n: number) => String(n).padStart(2, '0');

// Place each photo in the currently shortest column so columns stay balanced
// while the sequence still reads left to right.
function toColumns(count: number) {
  const cols: { i: number; p: [string, number, number] }[][] = Array.from({ length: count }, () => []);
  const heights = new Array(count).fill(0);
  PHOTOS.forEach((p, i) => {
    let c = 0;
    for (let k = 1; k < count; k++) if (heights[k] < heights[c] - 0.01) c = k;
    cols[c].push({ i, p });
    heights[c] += p[2] / p[1];
  });
  return cols;
}

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
    --faint: rgba(242,237,228,0.3);
    --rule: rgba(242,237,228,0.14);
    --serif: 'Bodoni Moda', Didot, 'Bodoni 72', Georgia, serif;
    --sans: 'Inter', system-ui, -apple-system, sans-serif;
    --gutter: clamp(10px, 2vw, 28px);
    color: var(--ivory);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  .hf *, .hf *::before, .hf *::after { box-sizing: border-box; }
  .hf img { display: block; width: 100%; height: auto; }

  .hf-eyebrow { font-size: 10px; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; }

  /* Nav */
  .hf-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    padding: 20px var(--gutter);
    color: #fff; mix-blend-mode: difference;
    transition: background 0.5s, padding 0.5s;
  }
  .hf-nav a { color: inherit; text-decoration: none; }
  .hf-nav-mark { font-family: var(--serif); font-size: 15px; letter-spacing: 0.34em; text-transform: uppercase; white-space: nowrap; opacity: 0; transition: opacity 0.5s; }
  .hf-nav-r { justify-self: end; display: flex; gap: 26px; }
  .hf-scrolled .hf-nav {
    mix-blend-mode: normal; color: var(--ivory);
    background: rgba(12,12,12,0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    padding-top: 14px; padding-bottom: 14px;
  }
  .hf-scrolled .hf-nav-mark { opacity: 1; }

  /* Masthead */
  .hf-top { padding: clamp(96px, 13vw, 190px) var(--gutter) clamp(28px, 4vw, 52px); text-align: center; }
  .hf-masthead {
    margin: 0; white-space: nowrap; line-height: 0.85;
    font-family: var(--serif); font-weight: 400; text-transform: uppercase; letter-spacing: -0.02em;
    font-size: clamp(48px, 10.4vw, 200px);
    opacity: 0; animation: hf-rise 1.4s 0.1s cubic-bezier(.2,.7,.2,1) forwards;
  }
  .hf-masthead span + span { margin-left: 0.22em; }
  @keyframes hf-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  .hf-top-meta {
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: baseline; gap: 16px;
    margin-top: clamp(22px, 3vw, 40px); padding-top: 16px; border-top: 1px solid var(--rule);
  }
  .hf-top-meta > :first-child { text-align: left; }
  .hf-top-meta > :last-child { text-align: right; }
  .hf-top-meta .hf-eyebrow { color: var(--dim); }
  .hf-top-line { font-family: var(--serif); font-style: italic; font-size: clamp(18px, 2vw, 26px); margin: 0; }

  /* Grid */
  .hf-grid { display: flex; align-items: flex-start; gap: var(--gap); padding: 0 var(--gutter); --gap: clamp(8px, 1.1vw, 16px); }
  .hf-col { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: var(--gap); }
  .hf-tile { position: relative; display: block; overflow: hidden; background: #151515; cursor: zoom-in; }
  .hf-tile img { transition: transform 1.2s cubic-bezier(.2,.7,.2,1), opacity 0.8s ease; opacity: 0; }
  .hf-tile img.in { opacity: 1; }
  .hf-tile:hover img { transform: scale(1.03); }
  .hf-no {
    position: absolute; left: 8px; bottom: 8px; color: #fff; font-family: var(--sans); font-size: 10px; font-weight: 500;
    letter-spacing: 0.2em; opacity: 0; transition: opacity 0.3s; text-shadow: 0 1px 8px rgba(0,0,0,0.6);
  }
  .hf-tile:hover .hf-no, .hf-tile:focus-visible .hf-no { opacity: 1; }
  .hf-tile:focus-visible { outline: 1px solid var(--ivory); outline-offset: 3px; }

  /* Lightbox (global component) */
  #lb { background: #0c0c0c; border-radius: 0 !important; }
  #lb::backdrop { background: rgba(8,8,8,0.94); }

  /* Closing */
  .hf-close { padding: clamp(110px, 16vw, 220px) var(--gutter) 48px; text-align: center; }
  .hf-close a.hf-cta {
    display: inline-block; color: var(--ivory); text-decoration: none; position: relative;
    font-family: var(--serif); font-style: italic; font-size: clamp(52px, 10vw, 160px); line-height: 0.9; letter-spacing: -0.03em;
    margin: 24px 0 36px;
  }
  .hf-close a.hf-cta::after { content: ''; position: absolute; left: 50%; right: 50%; bottom: -10px; height: 1px; background: var(--ivory); transition: left 0.6s, right 0.6s; }
  .hf-close a.hf-cta:hover::after { left: 0; right: 0; }
  .hf-close .hf-eyebrow { color: var(--faint); }
  .hf-close-links { display: flex; justify-content: center; gap: 34px; flex-wrap: wrap; }
  .hf-close-links a { color: var(--dim); text-decoration: none; }
  .hf-close-links a:hover { color: var(--ivory); }
  .hf-colophon {
    margin-top: clamp(90px, 12vw, 160px); padding-top: 18px; border-top: 1px solid var(--rule);
    display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--faint);
  }

  @media (max-width: 760px) {
    .hf-nav { grid-template-columns: 1fr auto; }
    .hf-nav-l { display: none; }
    .hf-nav-r { gap: 18px; }
    .hf-nav-mark { font-size: 12px; letter-spacing: 0.24em; }
    .hf-masthead { font-size: clamp(48px, 15.5vw, 120px); white-space: normal; }
    .hf-masthead span { display: block; }
    .hf-masthead span + span { margin-left: 0; }
    .hf-top-meta { grid-template-columns: 1fr 1fr; }
    .hf-top-line { display: none; }
    .hf-hide-sm { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .hf-masthead { animation: none; opacity: 1; transform: none; }
    .hf-tile img { opacity: 1; transition: none; }
  }
`;

function useColumnCount() {
  const [n, setN] = useState(4);
  useEffect(() => {
    const pick = () => setN(window.innerWidth < 640 ? 2 : window.innerWidth < 1100 ? 3 : 4);
    pick();
    window.addEventListener('resize', pick);
    return () => window.removeEventListener('resize', pick);
  }, []);
  return n;
}

export default function Page() {
  const cols = toColumns(useColumnCount());

  useEffect(() => {
    const root = document.querySelector('.hf');
    const onScroll = () => root?.classList.toggle('hf-scrolled', window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
      <header className="hf-top" id="index">
        <h1 className="hf-masthead"><span>Aidan</span><span>Torrence</span></h1>
        <div className="hf-top-meta">
          <span className="hf-eyebrow">Portraits on 35mm film</span>
          <p className="hf-top-line">Selected works</p>
          <span className="hf-eyebrow"><span className="hf-hide-sm">Collection {year} · </span>{PHOTOS.length} plates</span>
        </div>
      </header>

      <div className="hf-grid" data-lightbox>
        {cols.map((col, c) => (
          <div className="hf-col" key={c}>
            {col.map(({ i, p: [src, w, h] }) => (
              <a className="hf-tile" key={src} href={`/images/large/${src}.jpg`} aria-label={`Plate ${pad(i + 1)}, view larger`}>
                <img
                  src={`/images/large/${src}.jpg`}
                  width={w}
                  height={h}
                  alt={`Plate ${pad(i + 1)}`}
                  loading={i < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={(e) => e.currentTarget.classList.add('in')}
                  ref={(el) => { if (el?.complete) el.classList.add('in'); }}
                />
                <span className="hf-no">Nº {pad(i + 1)}</span>
              </a>
            ))}
          </div>
        ))}
      </div>

      <section className="hf-close">
        <span className="hf-eyebrow">Now booking worldwide</span>
        <div><a className="hf-cta" href="/sign-up-collab">Sit for me.</a></div>
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
