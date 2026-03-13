'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const images = [
  { src: 'manila-gallery-dsc-0075.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-night-001.jpg', name: 'Dorahan', city: 'Tokyo' },
  { src: 'manila-gallery-garden-001.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-street-001.jpg', name: 'Soph', city: 'Vienna' },
  { src: 'manila-gallery-closeup-001.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-canal-001.jpg', name: 'Hana', city: 'Bratislava' },
  { src: 'manila-gallery-ivy-001.jpg', name: 'Ellie', city: 'Tokyo' },
  { src: 'manila-gallery-urban-001.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-dsc-0130.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-shadow-001.jpg', name: 'Josephine', city: 'Bali' },
  { src: 'manila-gallery-tropical-001.jpg', name: 'Karima', city: 'Bali' },
  { src: 'manila-gallery-statue-001.jpg', name: 'Linda', city: 'Vienna' },
  { src: 'manila-gallery-night-002.jpg', name: 'Dorahan', city: 'HCMC' },
  { src: 'manila-gallery-market-001.jpg', name: 'Pharima', city: 'Bangkok' },
  { src: 'manila-gallery-park-001.jpg', name: 'Tess', city: 'Glasgow' },
  { src: 'manila-gallery-floor-001.jpg', name: 'Francisca', city: 'Cascais' },
  { src: 'manila-gallery-garden-002.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-urban-002.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-dsc-0190.jpg', name: 'Dia', city: 'Bali' },
  { src: 'manila-gallery-ivy-002.jpg', name: 'Daniela', city: 'Rome' },
  { src: 'manila-gallery-canal-002.jpg', name: 'Greta', city: 'Venice' },
  { src: 'manila-gallery-night-003.jpg', name: 'Dorahan', city: 'HCMC' },
  { src: 'manila-gallery-urban-003.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-white-001.jpg', name: 'Silvia', city: 'Milan' },
  { src: 'manila-gallery-dsc-0911.jpg', name: 'Zarissa', city: 'KL' },
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    background: #0c0c0c !important;
    color: #fff;
    height: 100%;
    width: 100%;
  }

  /* ========== TYPEWRITER CORE ========== */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes flashIn {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes slideFromRight {
    from { opacity: 0; transform: translateX(80px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes typeNameLine {
    from { width: 0; }
    to { width: 14ch; }
  }

  @keyframes typeRoleLine {
    from { width: 0; }
    to { width: 17ch; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ========== SCROLL CONTAINER ========== */
  .v14-container {
    height: 100vh;
    width: 100vw;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .v14-container::-webkit-scrollbar { width: 0; display: none; }
  .v14-container { scrollbar-width: none; }

  /* ========== NAV ========== */
  .v14-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 40px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  .v14-nav.visible { opacity: 1; }

  .v14-nav-logo {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    pointer-events: auto;
    text-decoration: none;
  }

  .v14-nav-links {
    display: flex;
    gap: 32px;
    list-style: none;
  }

  .v14-nav-links a {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    pointer-events: auto;
    transition: color 0.3s ease;
  }

  .v14-nav-links a:hover { color: #fff; }

  /* ========== HERO / INTRO ========== */
  .v14-hero {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #0c0c0c;
  }

  .v14-type-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(36px, 6vw, 80px);
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    border-right: 3px solid rgba(255,255,255,0.8);
    width: 0;
    animation:
      typeNameLine 1.4s steps(14, end) 0.5s forwards,
      blink 0.7s step-end infinite;
  }

  .v14-type-name.done {
    border-right-color: transparent;
    animation: none;
    width: 14ch;
  }

  .v14-type-role {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: clamp(12px, 1.5vw, 18px);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    white-space: nowrap;
    overflow: hidden;
    border-right: 2px solid rgba(255,255,255,0.5);
    width: 0;
    opacity: 0;
    margin-top: 16px;
  }

  .v14-type-role.active {
    opacity: 1;
    animation:
      typeRoleLine 1.0s steps(17, end) forwards,
      blink 0.7s step-end infinite;
  }

  .v14-type-role.done {
    border-right-color: transparent;
    animation: none;
    width: 17ch;
    opacity: 1;
  }

  .v14-selected-works {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-top: 60px;
    opacity: 0;
    transition: opacity 1s ease;
  }

  .v14-selected-works.visible { opacity: 1; }

  .v14-scroll-hint {
    position: absolute;
    bottom: 40px;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    opacity: 0;
    transition: opacity 1s ease;
  }

  .v14-scroll-hint.visible { opacity: 1; }

  /* ========== PHOTO SECTIONS ========== */
  .v14-photo-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    position: relative;
    overflow: hidden;
  }

  .v14-photo-inner {
    display: flex;
    align-items: center;
    gap: 60px;
    max-width: 1200px;
    width: 100%;
    opacity: 0;
    transform: translateX(80px);
    transition: opacity 0.8s ease, transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .v14-photo-inner.revealed {
    opacity: 1;
    transform: translateX(0);
  }

  .v14-photo-frame {
    position: relative;
    flex: 0 0 55%;
    max-width: 55%;
    overflow: hidden;
  }

  .v14-photo-frame img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    max-height: 80vh;
  }

  /* White flash overlay */
  .v14-flash {
    position: absolute;
    inset: 0;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
  }

  .v14-flash.active {
    animation: flashIn 0.4s ease-out forwards;
  }

  .v14-photo-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px 0;
  }

  .v14-photo-index {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 10px;
    letter-spacing: 0.3em;
    color: rgba(255,255,255,0.2);
    margin-bottom: 16px;
  }

  .v14-photo-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(24px, 3vw, 42px);
    font-weight: 400;
    letter-spacing: 0.06em;
    color: #fff;
    min-height: 1.2em;
  }

  .v14-photo-caption-line {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 12px;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.4);
    min-height: 1.4em;
    white-space: nowrap;
    overflow: hidden;
  }

  .v14-caption-cursor {
    display: inline;
    border-right: 2px solid rgba(255,255,255,0.5);
    animation: blink 0.6s step-end infinite;
    margin-left: 1px;
  }

  .v14-photo-separator {
    width: 40px;
    height: 1px;
    background: rgba(255,255,255,0.12);
    margin: 16px 0;
    opacity: 0;
    transition: opacity 0.6s ease 0.8s;
  }

  .v14-photo-separator.visible { opacity: 1; }

  .v14-photo-desc {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.2);
    line-height: 1.6;
    max-width: 280px;
    min-height: 2.8em;
  }

  /* ========== COUNTER ========== */
  .v14-counter {
    position: fixed;
    bottom: 32px;
    right: 40px;
    z-index: 100;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.3);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .v14-counter.visible { opacity: 1; }

  /* ========== PROGRESS BAR ========== */
  .v14-progress {
    position: fixed;
    left: 0;
    bottom: 0;
    height: 1px;
    background: rgba(255,255,255,0.15);
    z-index: 100;
    transition: width 0.3s ease;
  }

  /* ========== CTA SECTION ========== */
  .v14-cta {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: #0c0c0c;
    padding: 80px 40px;
  }

  .v14-cta-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(28px, 4vw, 52px);
    font-weight: 400;
    color: #fff;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
    text-align: center;
  }

  .v14-cta-sub {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 48px;
    text-align: center;
  }

  .v14-cta-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 440px;
  }

  .v14-cta-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    padding: 14px 0;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 13px;
    color: #fff;
    letter-spacing: 0.04em;
    outline: none;
    transition: border-color 0.3s ease;
    width: 100%;
  }

  .v14-cta-input::placeholder {
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.08em;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
  }

  .v14-cta-input:focus {
    border-bottom-color: rgba(255,255,255,0.5);
  }

  .v14-cta-textarea {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    padding: 14px 0;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 13px;
    color: #fff;
    letter-spacing: 0.04em;
    outline: none;
    resize: none;
    min-height: 80px;
    transition: border-color 0.3s ease;
    width: 100%;
  }

  .v14-cta-textarea::placeholder {
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.08em;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
  }

  .v14-cta-textarea:focus {
    border-bottom-color: rgba(255,255,255,0.5);
  }

  .v14-cta-btn {
    align-self: flex-start;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.6);
    padding: 14px 48px;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.4s ease;
    margin-top: 12px;
  }

  .v14-cta-btn:hover {
    background: #fff;
    color: #0c0c0c;
    border-color: #fff;
  }

  /* ========== ALTERNATE LAYOUT: even photos swap sides ========== */
  .v14-photo-section:nth-child(even) .v14-photo-inner {
    flex-direction: row-reverse;
  }

  /* ========== MOBILE ========== */
  @media (max-width: 768px) {
    .v14-nav { padding: 16px 20px; }
    .v14-nav-links { gap: 16px; }

    .v14-photo-section { padding: 60px 20px; }

    .v14-photo-inner {
      flex-direction: column !important;
      gap: 30px;
    }

    .v14-photo-frame {
      flex: none;
      max-width: 100%;
      width: 100%;
    }

    .v14-photo-meta {
      padding: 0;
      align-items: flex-start;
    }

    .v14-counter { right: 20px; bottom: 20px; }

    .v14-type-name {
      font-size: clamp(28px, 8vw, 48px);
    }

    .v14-cta { padding: 60px 20px; }
  }
`;

export default function V14Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [introPhase, setIntroPhase] = useState(0); // 0=waiting, 1=name typing, 2=role typing, 3=done
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedSections, setRevealedSections] = useState<Set<number>>(new Set());
  const [typingCaptions, setTypingCaptions] = useState<Record<number, string>>({});
  const [flashingSections, setFlashingSections] = useState<Set<number>>(new Set());
  const [showCursor, setShowCursor] = useState<Record<number, boolean>>({});
  const [progress, setProgress] = useState(0);
  const typingTimers = useRef<Record<number, NodeJS.Timeout>>({});
  const hasTyped = useRef<Set<number>>(new Set());

  // Intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase(1), 300);
    const t2 = setTimeout(() => setIntroPhase(2), 2000);
    const t3 = setTimeout(() => setIntroPhase(3), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Typewriter caption animation for a given section index
  const startTypingCaption = useCallback((idx: number) => {
    if (hasTyped.current.has(idx)) return;
    hasTyped.current.add(idx);

    const img = images[idx];
    const fullText = `${img.name} \u2014 ${img.city}`;
    let charIdx = 0;

    setShowCursor(prev => ({ ...prev, [idx]: true }));
    setTypingCaptions(prev => ({ ...prev, [idx]: '' }));

    const timer = setInterval(() => {
      charIdx++;
      if (charIdx <= fullText.length) {
        setTypingCaptions(prev => ({ ...prev, [idx]: fullText.slice(0, charIdx) }));
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setShowCursor(prev => ({ ...prev, [idx]: false }));
        }, 800);
      }
    }, 60);

    typingTimers.current[idx] = timer;
  }, []);

  // Scroll-based reveal with IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-index'));
          if (isNaN(idx)) return;

          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setRevealedSections(prev => {
              const next = new Set(prev);
              if (!next.has(idx)) {
                next.add(idx);
                // Trigger flash
                setFlashingSections(fl => {
                  const nf = new Set(fl);
                  nf.add(idx);
                  return nf;
                });
                setTimeout(() => {
                  setFlashingSections(fl => {
                    const nf = new Set(fl);
                    nf.delete(idx);
                    return nf;
                  });
                }, 500);
                // Start typing caption after slide-in
                setTimeout(() => startTypingCaption(idx), 600);
              }
              return next;
            });
            setCurrentIndex(idx + 1);
          }
        });
      },
      { root: container, threshold: [0.3] }
    );

    const sections = container.querySelectorAll('[data-index]');
    sections.forEach(s => observer.observe(s));

    return () => observer.disconnect();
  }, [introPhase, startTypingCaption]);

  // Progress bar
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const pct = scrollHeight > clientHeight
        ? (scrollTop / (scrollHeight - clientHeight)) * 100
        : 0;
      setProgress(pct);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup typing timers
  useEffect(() => {
    return () => {
      Object.values(typingTimers.current).forEach(t => clearInterval(t));
    };
  }, []);

  const navVisible = introPhase >= 3;
  const counterVisible = introPhase >= 3 && currentIndex > 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Nav */}
      <nav className={`v14-nav${navVisible ? ' visible' : ''}`}>
        <a className="v14-nav-logo" href="#">at_</a>
        <ul className="v14-nav-links">
          <li><a href="#work">Work</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Counter */}
      <div className={`v14-counter${counterVisible ? ' visible' : ''}`}>
        {String(currentIndex).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>

      {/* Progress bar */}
      <div className="v14-progress" style={{ width: `${progress}%` }} />

      <div className="v14-container" ref={containerRef}>

        {/* HERO - Typewriter intro */}
        <section className="v14-hero">
          <div
            className={`v14-type-name${introPhase >= 1 ? '' : ''}${introPhase >= 2 ? ' done' : ''}`}
            style={introPhase < 1 ? { width: 0, borderRightColor: 'transparent', animation: 'none' } : undefined}
          >
            AIDAN TORRENCE
          </div>

          <div
            className={`v14-type-role${introPhase >= 2 ? (introPhase >= 3 ? ' done' : ' active') : ''}`}
          >
            FILM PHOTOGRAPHER
          </div>

          <div className={`v14-selected-works${introPhase >= 3 ? ' visible' : ''}`}>
            &mdash; Selected Works &mdash;
          </div>

          <div className={`v14-scroll-hint${introPhase >= 3 ? ' visible' : ''}`}>
            scroll to explore
          </div>
        </section>

        {/* PHOTO SECTIONS */}
        {images.map((img, i) => {
          const isRevealed = revealedSections.has(i);
          const isFlashing = flashingSections.has(i);
          const caption = typingCaptions[i] || '';
          const cursorVisible = showCursor[i] || false;

          return (
            <section
              className="v14-photo-section"
              key={i}
              data-index={i}
              id={i === 0 ? 'work' : undefined}
            >
              <div className={`v14-photo-inner${isRevealed ? ' revealed' : ''}`}>
                <div className="v14-photo-frame">
                  <img
                    src={`/images/large/${img.src}`}
                    alt={`${img.name} - ${img.city}`}
                    loading={i < 3 ? 'eager' : 'lazy'}
                  />
                  <div className={`v14-flash${isFlashing ? ' active' : ''}`} />
                </div>

                <div className="v14-photo-meta">
                  <div className="v14-photo-index">
                    {String(i + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                  </div>

                  <div className="v14-photo-name">
                    {isRevealed ? img.name : ''}
                  </div>

                  <div className="v14-photo-caption-line">
                    {caption}
                    {cursorVisible && <span className="v14-caption-cursor">&nbsp;</span>}
                  </div>

                  <div className={`v14-photo-separator${isRevealed ? ' visible' : ''}`} />

                  <div className="v14-photo-desc">
                    {isRevealed ? `Portrait session \u2014 ${img.city}` : ''}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <section className="v14-cta" id="contact">
          <h2 className="v14-cta-title">Let&rsquo;s Create Together</h2>
          <p className="v14-cta-sub">Booking inquiries &amp; collaborations</p>
          <form className="v14-cta-form" onSubmit={e => e.preventDefault()}>
            <input className="v14-cta-input" type="text" placeholder="Your name" />
            <input className="v14-cta-input" type="email" placeholder="Email address" />
            <textarea className="v14-cta-textarea" placeholder="Tell me about your project..." />
            <button className="v14-cta-btn" type="submit">Send Inquiry</button>
          </form>
        </section>

      </div>
    </>
  );
}
