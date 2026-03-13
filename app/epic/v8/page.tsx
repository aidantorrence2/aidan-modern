'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const photos = [
  '/images/large/manila-gallery-closeup-001.jpg',
  '/images/large/manila-gallery-night-001.jpg',
  '/images/large/manila-gallery-street-001.jpg',
  '/images/large/manila-gallery-garden-001.jpg',
  '/images/large/manila-gallery-ivy-001.jpg',
  '/images/large/manila-gallery-canal-001.jpg',
  '/images/large/manila-gallery-shadow-001.jpg',
  '/images/large/manila-gallery-urban-001.jpg',
  '/images/large/manila-gallery-dsc-0075.jpg',
  '/images/large/manila-gallery-tropical-001.jpg',
  '/images/large/manila-gallery-market-001.jpg',
  '/images/large/manila-gallery-night-002.jpg',
  '/images/large/manila-gallery-park-001.jpg',
  '/images/large/manila-gallery-urban-002.jpg',
  '/images/large/manila-gallery-dsc-0130.jpg',
  '/images/large/manila-gallery-dsc-0190.jpg',
  '/images/large/manila-gallery-floor-001.jpg',
  '/images/large/manila-gallery-statue-001.jpg',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #1a1a1e !important;
    color: #f0ece6 !important;
    overflow-x: hidden !important;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .v8-wrapper {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .v8-top {
    text-align: center;
    padding: 4vh 6vw 2vh;
  }
  .v8-top h1 {
    font-family: 'Georgia', serif;
    font-size: 1.6rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .v8-top p {
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #8a857f;
    margin-top: 0.3rem;
  }
  .v8-card-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 2vh 5vw;
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
  }
  .v8-card {
    position: absolute;
    width: 88vw;
    max-width: 420px;
    aspect-ratio: 3/4;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease;
    will-change: transform, opacity;
  }
  .v8-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
  .v8-card.swiping {
    transition: none !important;
  }
  .v8-card.exit-left {
    transform: translateX(-120vw) rotate(-15deg) !important;
    opacity: 0 !important;
    transition: transform 0.5s ease, opacity 0.5s ease !important;
  }
  .v8-card.exit-right {
    transform: translateX(120vw) rotate(15deg) !important;
    opacity: 0 !important;
    transition: transform 0.5s ease, opacity 0.5s ease !important;
  }
  .v8-counter {
    text-align: center;
    padding: 2vh 0 1vh;
    font-size: 0.85rem;
    letter-spacing: 0.15em;
    color: #666;
    font-variant-numeric: tabular-nums;
  }
  .v8-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 1vh 0;
    flex-wrap: wrap;
    max-width: 90vw;
    margin: 0 auto;
  }
  .v8-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #333;
    transition: background 0.3s, transform 0.3s;
  }
  .v8-dot.active {
    background: #f0ece6;
    transform: scale(1.4);
  }
  .v8-bottom {
    padding: 2vh 6vw 4vh;
    text-align: center;
  }
  .v8-inquiry-btn {
    display: inline-block;
    padding: 14px 40px;
    background: transparent;
    border: 1px solid #555;
    color: #f0ece6;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    border-radius: 40px;
    transition: background 0.3s, border-color 0.3s;
    text-decoration: none;
  }
  .v8-inquiry-btn:hover {
    background: rgba(240,236,230,0.1);
    border-color: #999;
  }
  .v8-swipe-hint {
    font-size: 0.7rem;
    color: #555;
    margin-top: 1rem;
    letter-spacing: 0.1em;
  }
  .v8-panel {
    position: fixed;
    inset: 0;
    background: rgba(10,10,10,0.95);
    z-index: 100;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 6vh 8vw;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .v8-panel h2 {
    font-family: 'Georgia', serif;
    font-size: 1.6rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    margin-bottom: 0.6rem;
  }
  .v8-panel .v8-sub {
    font-size: 0.8rem;
    color: #8a857f;
    margin-bottom: 2rem;
    line-height: 1.5;
  }
  .v8-panel-form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
  .v8-panel-form input, .v8-panel-form textarea {
    background: #222;
    border: 1px solid #3a3a3a;
    color: #f0ece6;
    padding: 14px 16px;
    font-size: 0.95rem;
    font-family: system-ui, sans-serif;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s;
  }
  .v8-panel-form input:focus, .v8-panel-form textarea:focus {
    border-color: #777;
  }
  .v8-panel-form textarea {
    min-height: 100px;
    resize: vertical;
  }
  .v8-panel-form button[type="submit"] {
    background: #f0ece6;
    color: #1a1a1e;
    border: none;
    padding: 16px;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    font-weight: 600;
    border-radius: 8px;
  }
  .v8-panel-close {
    position: absolute;
    top: 5vh;
    right: 6vw;
    background: none;
    border: none;
    color: #888;
    font-size: 1.8rem;
    cursor: pointer;
    line-height: 1;
  }
  .v8-links {
    display: flex;
    gap: 1.2rem;
    justify-content: center;
    margin-top: 1rem;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .v8-links a {
    color: #666;
    text-decoration: none;
    transition: color 0.3s;
  }
  .v8-links a:hover { color: #ccc; }

  @media (min-width: 768px) {
    .v8-card { width: 60vw; max-width: 500px; }
  }
`;

export default function V8Page() {
  const [current, setCurrent] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragOffset = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    if (current >= photos.length - 1) return;
    setExitDir('left');
    setTimeout(() => {
      setCurrent((c) => Math.min(c + 1, photos.length - 1));
      setExitDir(null);
    }, 400);
  }, [current]);

  const goPrev = useCallback(() => {
    if (current <= 0) return;
    setExitDir('right');
    setTimeout(() => {
      setCurrent((c) => Math.max(c - 1, 0));
      setExitDir(null);
    }, 400);
  }, [current]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    dragOffset.current = 0;
    if (cardRef.current) cardRef.current.classList.add('swiping');
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || !cardRef.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    dragOffset.current = dx;
    const rotation = dx * 0.05;
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rotation}deg)`;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!cardRef.current || !touchStart.current) return;
    cardRef.current.classList.remove('swiping');
    const dx = dragOffset.current;
    const elapsed = Date.now() - (touchStart.current?.time || 0);
    const velocity = Math.abs(dx) / elapsed;

    if (Math.abs(dx) > 80 || velocity > 0.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
    cardRef.current.style.transform = '';
    touchStart.current = null;
  }, [goNext, goPrev]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="v8-wrapper">
        <div className="v8-top">
          <h1>Aidan Torrence</h1>
          <p>Film &middot; Fashion &middot; Editorial</p>
        </div>

        <div className="v8-card-area">
          {/* Stack shadow cards behind */}
          {current + 2 < photos.length && (
            <div
              className="v8-card"
              style={{ transform: 'scale(0.9) translateY(16px)', opacity: 0.3, zIndex: 1 }}
            >
              <img src={photos[current + 2]} alt="" loading="lazy" />
            </div>
          )}
          {current + 1 < photos.length && (
            <div
              className="v8-card"
              style={{ transform: 'scale(0.95) translateY(8px)', opacity: 0.6, zIndex: 2 }}
            >
              <img src={photos[current + 1]} alt="" loading="lazy" />
            </div>
          )}
          {/* Active card */}
          <div
            ref={cardRef}
            className={`v8-card ${exitDir === 'left' ? 'exit-left' : ''} ${exitDir === 'right' ? 'exit-right' : ''}`}
            style={{ zIndex: 3 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={photos[current]}
              alt={`Photo ${current + 1}`}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div className="v8-counter">
          {current + 1} / {photos.length}
        </div>

        <div className="v8-dots">
          {photos.map((_, i) => (
            <div key={i} className={`v8-dot ${i === current ? 'active' : ''}`} />
          ))}
        </div>

        <div className="v8-bottom">
          <button className="v8-inquiry-btn" onClick={() => setShowInquiry(true)}>
            Book a Shoot
          </button>
          <p className="v8-swipe-hint">Swipe to explore</p>
          <div className="v8-links">
            <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://wa.me/491758966210" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="mailto:aidan@aidantorrence.com">Email</a>
          </div>
        </div>
      </div>

      {/* Inquiry panel */}
      {showInquiry && (
        <div className="v8-panel">
          <button className="v8-panel-close" onClick={() => setShowInquiry(false)}>&times;</button>
          <h2>Let&apos;s Create</h2>
          <p className="v8-sub">
            Featured in Vogue Italia, Hypebeast, WWD.
            Based between Bangkok and Europe, booking worldwide.
          </p>
          <form
            className="v8-panel-form"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `mailto:aidan@aidantorrence.com?subject=Inquiry from ${formData.name}&body=${formData.message}`;
            }}
          >
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <textarea
              placeholder="Project details..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
            <button type="submit">Send Inquiry</button>
          </form>
        </div>
      )}
    </>
  );
}
