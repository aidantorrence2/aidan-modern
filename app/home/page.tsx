'use client';

import Link from 'next/link';

const versions = [
  { num: 1, title: 'Image Burst Intro', desc: 'Animated intro with images flying around, then settling into the portfolio' },
  { num: 2, title: 'Film Roll Animation', desc: 'Intro with images on a scrolling film strip, then transitions to portfolio' },
  { num: 3, title: 'Realistic Film Scan', desc: 'Every image styled as an authentic 35mm film scan with sprocket holes & edge markings' },
  { num: 4, title: 'Auto-Scroll', desc: 'Current layout with smooth automatic scrolling, pause on interaction' },
  { num: 5, title: 'Crossfade Replace', desc: 'Single viewport — images crossfade in place with Ken Burns effect' },
  { num: 6, title: 'Film Strip Scroll', desc: 'Vertical scrolling through a continuous strip of realistic 35mm film' },
  { num: 7, title: 'Cinematic Contact Sheet', desc: 'All images as a contact sheet grid — click to expand cinematically' },
  { num: 8, title: 'Horizontal Parallax', desc: 'Horizontal scroll with 3D parallax depth layers — gallery exhibition feel' },
  { num: 9, title: 'Magnetic Mosaic', desc: 'Asymmetric mosaic with mouse-reactive tilt — interactive art gallery' },
  { num: 10, title: 'Split-Screen Storyteller', desc: 'Split-screen editorial — image left, typography right, cinematic transitions' },
  { num: 11, title: 'Polaroid Scatter', desc: 'Photos scattered like polaroids on a dark table — click to pick up and view' },
  { num: 12, title: 'Darkroom Reveal', desc: 'Photos develop from red silhouettes to full color as you scroll — darkroom simulation' },
  { num: 13, title: '3D Gallery Walk', desc: 'Walk through a 3D corridor with photos on the walls — CSS perspective depth' },
  { num: 14, title: 'Typewriter Sequence', desc: 'Dramatic typing animation intro, photos appear with typewriter-click reveals' },
  { num: 15, title: 'Constellation Map', desc: 'Photos as glowing nodes in a star map — connected by constellation lines' },
  { num: 16, title: 'Magazine Flip Book', desc: 'Luxury magazine with 3D page-turn animations — editorial spreads' },
  { num: 17, title: 'Card Stack Swipe', desc: 'Tinder-style card stack — swipe or drag to dismiss and reveal next photo' },
  { num: 18, title: 'Sine Wave Gallery', desc: 'Photos arranged along a flowing sine wave — horizontal scroll with rhythm' },
  { num: 19, title: 'Curtain Reveal', desc: 'Theater curtains part to reveal each photo — scroll-linked dramatic unveiling' },
  { num: 20, title: 'Film Projector', desc: 'Vintage projector simulation — light flicker, grain, dust particles, auto-advance' },
  { num: 21, title: 'Dual Counter-Scroll', desc: 'Two columns scrolling in opposite directions — mesmerizing counter-motion' },
  { num: 22, title: 'Infinite Zoom', desc: 'Continuous zoom through nested photos — each image reveals the next inside it' },
  { num: 23, title: '3D Carousel', desc: 'Photos on a rotating 3D carousel with reflection — spin to browse' },
  { num: 24, title: 'Mood Board Collage', desc: 'Overlapping photos with washi tape, torn edges, handwritten notes — creative chaos' },
  { num: 25, title: 'Journey Timeline', desc: 'Vertical timeline with photos alternating left/right — travel story narrative' },
  { num: 26, title: 'Spotlight Explorer', desc: 'Dark page with a cursor spotlight — discover hidden photos by exploring' },
  { num: 27, title: 'Grid to Fullscreen', desc: 'Starts as tight grid, expands as you scroll until each photo fills the viewport' },
  { num: 28, title: 'Cinematic Letterbox', desc: 'Ultra-wide letterbox format with slow pans — documentary film aesthetic' },
  { num: 29, title: 'Gravity Drop', desc: 'Photos fall from above and stack up — satisfying physics-based interaction' },
  { num: 30, title: 'Morphing Portraits', desc: 'Organic blob-shaped transitions between fullscreen photos — liquid reveals' },
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .home-index {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 24px 80px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .home-index h1 {
    color: #fff;
    font-family: Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    letter-spacing: 0.06em;
    margin: 0 0 8px;
  }
  .home-index .subtitle {
    color: rgba(255,255,255,0.4);
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin: 0 0 48px;
  }
  .home-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    width: 100%;
    max-width: 1100px;
  }
  .home-card {
    display: block;
    padding: 24px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .home-card:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.16);
    transform: translateY(-2px);
  }
  .home-card .num {
    color: rgba(255,255,255,0.25);
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    margin: 0 0 8px;
  }
  .home-card .title {
    color: #fff;
    font-family: Georgia, serif;
    font-size: 18px;
    margin: 0 0 6px;
  }
  .home-card .desc {
    color: rgba(255,255,255,0.45);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
  .home-back {
    margin-top: 48px;
    color: rgba(255,255,255,0.4);
    font-size: 13px;
    text-decoration: none;
    letter-spacing: 0.1em;
    transition: color 0.2s;
  }
  .home-back:hover { color: #fff; }
`;

export default function HomeIndex() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="home-index">
        <h1>Homepage Variations</h1>
        <p className="subtitle">30 Design Explorations</p>
        <div className="home-grid">
          {versions.map((v) => (
            <Link key={v.num} href={`/home/v${v.num}` as any} className="home-card">
              <p className="num">V{String(v.num).padStart(2, '0')}</p>
              <p className="title">{v.title}</p>
              <p className="desc">{v.desc}</p>
            </Link>
          ))}
        </div>
        <Link href="/" className="home-back">← Back to current homepage</Link>
      </div>
    </>
  );
}
