'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const photos = [
  'manila-gallery-canal-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-urban-003.jpg',
  'manila-gallery-dsc-0911.jpg',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #000 !important; margin: 0; overflow-x: hidden; }

  .ss-container {
    position: fixed; inset: 0;
    background: #000;
    z-index: 1;
  }
  .ss-slide {
    position: absolute; inset: 0;
    transition: opacity 0.8s ease;
  }
  .ss-slide img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  .ss-overlay-name {
    position: fixed; top: 1rem; left: 1.25rem;
    z-index: 10;
    color: #fff;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 300;
    font-size: 1rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-shadow: 0 1px 8px rgba(0,0,0,0.7);
  }
  .ss-overlay-name span {
    display: block;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.6);
    margin-top: 2px;
  }

  .ss-inquiry-btn {
    position: fixed; top: 1rem; right: 1.25rem;
    z-index: 10;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff;
    padding: 0.5rem 1.25rem;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: system-ui, sans-serif;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.2s;
    text-decoration: none;
  }
  .ss-inquiry-btn:hover { background: rgba(255,255,255,0.3); }

  .ss-counter {
    position: fixed; bottom: 5.5rem; right: 1.25rem;
    z-index: 10;
    color: rgba(255,255,255,0.6);
    font-family: system-ui, sans-serif;
    font-size: 0.8rem;
    font-weight: 300;
    letter-spacing: 0.08em;
    text-shadow: 0 1px 6px rgba(0,0,0,0.5);
  }

  .ss-thumbstrip {
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 10;
    height: 4.5rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.85));
    display: flex;
    align-items: flex-end;
    padding: 0 0.5rem 0.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 4px;
  }
  .ss-thumbstrip::-webkit-scrollbar { display: none; }
  .ss-thumb {
    flex: 0 0 auto;
    width: 48px; height: 48px;
    border-radius: 2px;
    overflow: hidden;
    opacity: 0.4;
    transition: opacity 0.25s, transform 0.25s;
    cursor: pointer;
    border: 2px solid transparent;
  }
  .ss-thumb.active {
    opacity: 1;
    border-color: #fff;
    transform: scale(1.1);
  }
  .ss-thumb:hover { opacity: 0.9; }
  .ss-thumb img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }

  .ss-progress {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 11; height: 2px;
    background: rgba(255,255,255,0.15);
  }
  .ss-progress-bar {
    height: 100%;
    background: rgba(255,255,255,0.6);
    transition: width 0.1s linear;
  }

  .ss-nav-area {
    position: fixed; top: 0; bottom: 5rem;
    z-index: 5;
    cursor: pointer;
  }
  .ss-nav-prev { left: 0; width: 30%; }
  .ss-nav-next { right: 0; width: 70%; }

  .ss-modal-overlay {
    position: fixed; inset: 0;
    z-index: 100;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: ssModalIn 0.3s ease;
  }
  @keyframes ssModalIn { from { opacity: 0; } to { opacity: 1; } }
  .ss-modal {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 2rem 1.5rem;
    width: 90%;
    max-width: 400px;
    color: #eee;
    font-family: system-ui, sans-serif;
  }
  .ss-modal h2 {
    font-size: 1.25rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 0.25rem;
  }
  .ss-modal p {
    font-size: 0.8rem;
    color: #888;
    margin: 0 0 1.25rem;
    line-height: 1.5;
  }
  .ss-modal input, .ss-modal textarea {
    width: 100%; box-sizing: border-box;
    padding: 0.65rem 0.75rem;
    margin-bottom: 0.6rem;
    background: #111;
    border: 1px solid #444;
    border-radius: 4px;
    color: #eee;
    font-size: 0.9rem;
    font-family: system-ui, sans-serif;
  }
  .ss-modal textarea { min-height: 80px; resize: vertical; }
  .ss-modal input::placeholder, .ss-modal textarea::placeholder { color: #666; }
  .ss-modal-submit {
    width: 100%;
    padding: 0.75rem;
    background: #fff;
    color: #000;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
  }
  .ss-modal-submit:hover { background: #ddd; }
  .ss-modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: none; border: none;
    color: #888; font-size: 1.5rem;
    cursor: pointer;
  }
  .ss-contact-row {
    display: flex; gap: 1rem; justify-content: center;
    flex-wrap: wrap; margin-top: 1rem;
  }
  .ss-contact-row a {
    color: #888; font-size: 0.75rem;
    text-decoration: none;
  }
  .ss-contact-row a:hover { color: #fff; }
`;

export default function FullScreenSlideshow() {
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const thumbRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + photos.length) % photos.length);
    setProgress(0);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || showModal) return;
    const start = Date.now();
    const duration = 4000;
    const tick = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / duration, 1));
      if (elapsed < duration) {
        progressRef.current = requestAnimationFrame(tick);
      } else {
        goTo(current + 1);
      }
    };
    progressRef.current = requestAnimationFrame(tick);
    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [current, paused, showModal, goTo]);

  // Scroll active thumb into view
  useEffect(() => {
    const strip = thumbRef.current;
    if (!strip) return;
    const active = strip.children[current] as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [current]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') setShowModal(false);
      else if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) {
        diff < 0 ? next() : prev();
      }
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [next, prev]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="ss-container">
        {photos.map((p, i) => (
          <div
            key={p}
            className="ss-slide"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 2 : 1 }}
          >
            <img
              src={`/images/large/${p}`}
              alt={`Photo ${i + 1}`}
              loading={i < 2 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="ss-progress">
        <div className="ss-progress-bar" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="ss-overlay-name">
        Aidan Torrence
        <span>Film &middot; Fashion &middot; Editorial</span>
      </div>

      <a
        className="ss-inquiry-btn"
        href="#"
        onClick={(e) => { e.preventDefault(); setShowModal(true); setPaused(true); }}
      >
        Inquire
      </a>

      <div className="ss-counter">
        {String(current + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
      </div>

      <div className="ss-nav-area ss-nav-prev" onClick={prev} />
      <div className="ss-nav-area ss-nav-next" onClick={next} />

      <div className="ss-thumbstrip" ref={thumbRef}>
        {photos.map((p, i) => (
          <div
            key={p}
            className={`ss-thumb ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
          >
            <img src={`/images/large/${p}`} alt={`Thumb ${i + 1}`} loading="lazy" />
          </div>
        ))}
      </div>

      {showModal && (
        <div className="ss-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setPaused(false); } }}>
          <div className="ss-modal" style={{ position: 'relative' }}>
            <button className="ss-modal-close" onClick={() => { setShowModal(false); setPaused(false); }}>&times;</button>
            <h2>Get In Touch</h2>
            <p>Bangkok &amp; Europe based. Booking worldwide.<br />Featured in Vogue Italia, Hypebeast, WWD.</p>
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = 'mailto:aidan@aidantorrence.com'; }}>
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <textarea placeholder="Project details..." />
              <button type="submit" className="ss-modal-submit">Send Inquiry</button>
            </form>
            <div className="ss-contact-row">
              <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
              <a href="https://wa.me/491758966210">WhatsApp</a>
              <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener">@aidantorrence</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
