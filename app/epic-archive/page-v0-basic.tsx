'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const img = (f: string) => `/images/large/${f}`
const thumb = (f: string) => `/images/thumbs/${f}.jpg`

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, 'Segoe UI', sans-serif"

const HERO_IMAGES = [
  img('manila-gallery-canal-001.jpg'),
  img('manila-gallery-dsc-0190.jpg'),
  img('manila-gallery-garden-002.jpg'),
  img('manila-gallery-urban-003.jpg'),
  img('manila-gallery-night-001.jpg'),
]

const GALLERY = [
  { src: img('manila-gallery-dsc-0190.jpg'), alt: 'Editorial portrait' },
  { src: img('manila-gallery-closeup-001.jpg'), alt: 'Close-up portrait' },
  { src: img('manila-gallery-canal-002.jpg'), alt: 'Canal session' },
  { src: img('manila-gallery-garden-002.jpg'), alt: 'Garden editorial' },
  { src: img('manila-gallery-urban-003.jpg'), alt: 'Urban portrait' },
  { src: img('manila-gallery-night-001.jpg'), alt: 'Night session' },
  { src: img('manila-gallery-ivy-001.jpg'), alt: 'Ivy editorial' },
  { src: img('manila-gallery-rocks-001.jpg'), alt: 'Rocks session' },
  { src: img('manila-gallery-shadow-001.jpg'), alt: 'Shadow portrait' },
  { src: img('manila-gallery-street-001.jpg'), alt: 'Street editorial' },
  { src: img('manila-gallery-dsc-0911.jpg'), alt: 'Editorial portrait' },
  { src: img('manila-gallery-ivy-002.jpg'), alt: 'Ivy session' },
  { src: img('manila-gallery-tropical-001.jpg'), alt: 'Tropical editorial' },
  { src: img('manila-gallery-market-001.jpg'), alt: 'Market session' },
  { src: img('manila-gallery-night-002.jpg'), alt: 'Night portrait' },
  { src: img('manila-gallery-garden-001.jpg'), alt: 'Garden portrait' },
  { src: img('manila-gallery-statue-001.jpg'), alt: 'Statue editorial' },
  { src: img('manila-gallery-urban-001.jpg'), alt: 'Urban session' },
]

const CSS = `
  html, body {
    background: #060606 !important;
    color: #e8e4de !important;
    margin: 0; padding: 0;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden !important;
  }
  body > header, body > footer, .fixed.inset-x-0.bottom-0 {
    display: none !important;
  }
  ::selection { background: rgba(191,160,106,0.3); color: #fff; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  a { color: inherit; text-decoration: none; }

  @keyframes heroFadeIn {
    from { opacity: 0; transform: scale(1.05); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes titleReveal {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes subtitleReveal {
    from { opacity: 0; letter-spacing: 0.8em; }
    to { opacity: 0.5; letter-spacing: 0.35em; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes crossfade1 { 0%,20% { opacity:1; } 25%,100% { opacity:0; } }
  @keyframes crossfade2 { 0%,20% { opacity:0; } 25%,40% { opacity:1; } 45%,100% { opacity:0; } }
  @keyframes crossfade3 { 0%,40% { opacity:0; } 45%,60% { opacity:1; } 65%,100% { opacity:0; } }
  @keyframes crossfade4 { 0%,60% { opacity:0; } 65%,80% { opacity:1; } 85%,100% { opacity:0; } }
  @keyframes crossfade5 { 0%,80% { opacity:0; } 85%,100% { opacity:1; } }

  .hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hero-img:nth-child(1) { animation: crossfade1 20s infinite; }
  .hero-img:nth-child(2) { animation: crossfade2 20s infinite; }
  .hero-img:nth-child(3) { animation: crossfade3 20s infinite; }
  .hero-img:nth-child(4) { animation: crossfade4 20s infinite; }
  .hero-img:nth-child(5) { animation: crossfade5 20s infinite; }

  .gallery-item {
    overflow: hidden;
    position: relative;
    break-inside: avoid;
    margin-bottom: 12px;
  }
  .gallery-item img {
    width: 100%;
    display: block;
    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .gallery-item:hover img {
    transform: scale(1.04);
  }

  .epic-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    color: #e8e4de;
    font-size: 16px;
    font-family: ${SANS};
    padding: 14px 0;
    width: 100%;
    outline: none;
    transition: border-color 0.3s;
  }
  .epic-input:focus { border-bottom-color: #bfa06a; }
  .epic-input::placeholder { color: rgba(255,255,255,0.25); }

  .epic-textarea {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    color: #e8e4de;
    font-size: 16px;
    font-family: ${SANS};
    padding: 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.3s;
    resize: vertical;
    min-height: 120px;
  }
  .epic-textarea:focus { border-color: #bfa06a; }
  .epic-textarea::placeholder { color: rgba(255,255,255,0.25); }

  .cta-btn {
    display: inline-block;
    padding: 14px 40px;
    border: 1px solid #bfa06a;
    color: #bfa06a;
    font-family: ${SANS};
    font-size: 12px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    cursor: pointer;
    background: transparent;
    transition: all 0.4s;
  }
  .cta-btn:hover {
    background: #bfa06a;
    color: #060606;
  }

  @media (max-width: 768px) {
    .gallery-grid { column-count: 2 !important; }
    .split-grid { grid-template-columns: 1fr !important; }
  }
`

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(40px)',
      transition: `opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
    }}>
      {children}
    </div>
  )
}

export default function EpicPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ background: '#060606', color: '#e8e4de', minHeight: '100vh', fontFamily: SANS }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {/* Crossfading background images */}
        <div style={{ position: 'absolute', inset: 0, animation: 'heroFadeIn 2s ease-out both' }}>
          {HERO_IMAGES.map((src, i) => (
            <img key={i} src={src} alt="" className="hero-img" style={{ objectPosition: 'center 25%' }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,6,0.3) 0%, rgba(6,6,6,0.1) 40%, rgba(6,6,6,0.7) 85%, #060606 100%)' }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(24px, 5vw, 80px) clamp(60px, 10vh, 120px)' }}>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: 'clamp(42px, 8vw, 120px)',
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            animation: 'titleReveal 1.2s cubic-bezier(0.25,0.46,0.45,0.94) 0.5s both',
          }}>
            Aidan Torrence
          </h1>
          <div style={{
            width: 60, height: 1, background: '#bfa06a', marginTop: 24,
            transformOrigin: 'left', animation: 'lineGrow 0.8s ease-out 1.2s both',
          }} />
          <p style={{
            fontFamily: SANS, fontSize: 'clamp(10px, 1.2vw, 13px)', textTransform: 'uppercase',
            marginTop: 16,
            animation: 'subtitleReveal 1s ease-out 1.5s both',
          }}>
            Film · Fashion · Editorial
          </p>
        </div>
      </section>

      {/* ═══ FEATURED SPREAD ═══ */}
      <section style={{ padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)' }}>
        <Reveal>
          <div className="split-grid" style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'clamp(12px, 2vw, 24px)',
            maxWidth: 1400, margin: '0 auto',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <img src={GALLERY[0].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 24px)' }}>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <img src={GALLERY[1].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <img src={GALLERY[3].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ ABOUT LINE ═══ */}
      <section style={{ padding: 'clamp(40px, 6vw, 80px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <p style={{
              fontFamily: SERIF, fontSize: 'clamp(22px, 3.5vw, 44px)',
              lineHeight: 1.35, fontWeight: 400, color: '#e8e4de',
            }}>
              Art-directed portraits on 35mm film. Every session is fully guided — you just show up.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p style={{
              marginTop: 24, fontSize: 14, lineHeight: 1.7,
              opacity: 0.4, maxWidth: 520,
            }}>
              Based between Bangkok and Europe. Currently booking worldwide.
              Featured in Vogue Italia, Hypebeast, and WWD.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ FULL WIDTH IMAGE ═══ */}
      <section style={{ padding: '0 clamp(24px, 5vw, 80px)', margin: 'clamp(40px, 6vw, 80px) 0' }}>
        <Reveal>
          <div style={{ maxWidth: 1400, margin: '0 auto', overflow: 'hidden' }}>
            <img src={img('manila-gallery-park-001.jpg')} alt="" style={{
              width: '100%', display: 'block', objectFit: 'cover', maxHeight: '70vh',
            }} />
          </div>
        </Reveal>
      </section>

      {/* ═══ GALLERY GRID ═══ */}
      <section style={{ padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)' }}>
        <Reveal>
          <div style={{ maxWidth: 1400, margin: '0 auto', marginBottom: 48 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.35 }}>
              Selected Work
            </p>
          </div>
        </Reveal>
        <div className="gallery-grid" style={{
          columnCount: 3, columnGap: 12, maxWidth: 1400, margin: '0 auto',
        }}>
          {GALLERY.map((photo, i) => (
            <Reveal key={i} delay={(i % 3) * 0.1}>
              <div className="gallery-item">
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ INQUIRY ═══ */}
      <section style={{
        padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{
              fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 400, marginBottom: 12,
            }}>
              Work with me
            </h2>
            <p style={{ fontSize: 14, opacity: 0.4, lineHeight: 1.7, marginBottom: 48 }}>
              Send a message and I&apos;ll get back to you within a few hours.
            </p>
          </Reveal>

          {submitted ? (
            <Reveal>
              <p style={{ fontFamily: SERIF, fontSize: 24, padding: '60px 0', textAlign: 'center' }}>
                Got it — I&apos;ll be in touch.
              </p>
            </Reveal>
          ) : (
            <Reveal delay={0.15}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <input type="text" name="name" placeholder="Name" required className="epic-input" />
                <input type="email" name="email" placeholder="Email" required className="epic-input" />
                <input type="text" name="instagram" placeholder="Instagram" className="epic-input" />
                <textarea name="message" placeholder="What are you looking for?" className="epic-textarea" />
                <div style={{ marginTop: 8 }}>
                  <button type="submit" className="cta-btn">Send</button>
                </div>
              </form>
            </Reveal>
          )}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: '40px clamp(24px, 5vw, 80px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
        fontSize: 11, opacity: 0.35,
      }}>
        <span style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>Aidan Torrence</span>
        <div style={{ display: 'flex', gap: 24, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          <a href="mailto:aidan@aidantorrence.com">Email</a>
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence">Instagram</a>
        </div>
      </footer>
    </div>
  )
}
