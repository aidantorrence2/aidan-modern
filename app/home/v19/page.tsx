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

export default function V19Page() {
  const [revealStates, setRevealStates] = useState<number[]>(
    () => images.map(() => 0)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleScroll = useCallback(() => {
    const vh = window.innerHeight;
    const newStates: number[] = [];
    let activeIdx = 0;

    for (let i = 0; i < images.length; i++) {
      const el = sectionRefs.current[i];
      if (!el) {
        newStates.push(0);
        continue;
      }
      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // Reveal starts when section enters viewport, completes when section center is at viewport center
      const revealStart = sectionHeight * 0.3;
      const revealEnd = -sectionHeight * 0.1;
      const progress = 1 - (sectionTop - revealEnd) / (revealStart - revealEnd);
      const clamped = Math.max(0, Math.min(1, progress));
      newStates.push(clamped);

      if (rect.top < vh * 0.5 && rect.bottom > vh * 0.5) {
        activeIdx = i;
      }
    }

    setRevealStates(newStates);
    setCurrentIndex(activeIdx);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { margin: 0; padding: 0; background: #0c0c0c; overflow-x: hidden; }
        * { box-sizing: border-box; }

        @keyframes v19HeroFade {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes v19CurtainShimmer {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.08; }
        }
        @keyframes v19GoldPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes v19SpotlightPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.7; }
        }
        @keyframes v19CaptionSlide {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .v19-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 36px;
          pointer-events: none;
          mix-blend-mode: difference;
        }
        .v19-nav * { pointer-events: auto; }
        .v19-nav-brand {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
        }
        .v19-nav-inquire {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #c9a84c;
          text-decoration: none;
          border: 1px solid rgba(201,168,76,0.4);
          padding: 8px 20px;
          transition: all 0.3s ease;
        }
        .v19-nav-inquire:hover {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
        }

        .v19-counter {
          position: fixed;
          bottom: 36px;
          right: 36px;
          z-index: 1000;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.5);
          mix-blend-mode: difference;
        }
        .v19-counter-active {
          color: #c9a84c;
          font-weight: 600;
        }

        .v19-progress {
          position: fixed;
          top: 0; left: 0;
          height: 2px;
          background: linear-gradient(90deg, #c9a84c, #e8d48b, #c9a84c);
          z-index: 1001;
          transition: width 0.15s ease-out;
        }

        .v19-hero {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .v19-hero-curtain-left,
        .v19-hero-curtain-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          background:
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.015) 2px,
              rgba(255,255,255,0.015) 4px
            ),
            repeating-linear-gradient(
              180deg,
              transparent,
              transparent 8px,
              rgba(255,255,255,0.01) 8px,
              rgba(255,255,255,0.01) 16px
            ),
            linear-gradient(180deg, #1a0505 0%, #0d0202 50%, #1a0505 100%);
          z-index: 2;
        }
        .v19-hero-curtain-left {
          left: 0;
          border-right: 2px solid rgba(201,168,76,0.3);
          box-shadow: inset -20px 0 40px rgba(0,0,0,0.5);
        }
        .v19-hero-curtain-right {
          right: 0;
          border-left: 2px solid rgba(201,168,76,0.3);
          box-shadow: inset 20px 0 40px rgba(0,0,0,0.5);
        }
        .v19-hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          animation: v19HeroFade 1.8s ease-out 0.3s both;
        }
        .v19-hero-name {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(32px, 7vw, 80px);
          font-weight: 200;
          letter-spacing: clamp(8px, 2vw, 24px);
          text-transform: uppercase;
          color: #fff;
          margin: 0;
          line-height: 1.2;
        }
        .v19-hero-sub {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(11px, 1.4vw, 15px);
          letter-spacing: 6px;
          text-transform: uppercase;
          color: #c9a84c;
          margin-top: 24px;
          font-weight: 300;
        }
        .v19-hero-scroll {
          position: absolute;
          bottom: 48px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          animation: v19HeroFade 1.8s ease-out 1s both;
        }
        .v19-hero-scroll::after {
          content: '';
          display: block;
          width: 1px;
          height: 40px;
          background: linear-gradient(180deg, rgba(201,168,76,0.5), transparent);
          margin: 12px auto 0;
        }

        .v19-section {
          height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .v19-photo-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .v19-photo {
          width: 55vw;
          max-width: 800px;
          height: 70vh;
          object-fit: cover;
          display: block;
          border-radius: 2px;
        }

        .v19-spotlight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .v19-curtain-half {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          z-index: 5;
          overflow: hidden;
          will-change: transform;
          transition: none;
        }
        .v19-curtain-half::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(255,255,255,0.02) 3px,
              rgba(255,255,255,0.02) 6px
            ),
            repeating-linear-gradient(
              180deg,
              transparent,
              transparent 12px,
              rgba(255,255,255,0.008) 12px,
              rgba(255,255,255,0.008) 24px
            ),
            linear-gradient(180deg, #1a0505 0%, #120303 30%, #0d0202 50%, #120303 70%, #1a0505 100%);
        }
        .v19-curtain-half::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%);
          animation: v19CurtainShimmer 4s ease-in-out infinite;
        }

        .v19-curtain-left {
          left: 0;
          transform-origin: left center;
        }
        .v19-curtain-right {
          right: 0;
          transform-origin: right center;
        }

        .v19-curtain-gold {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 3px;
          z-index: 6;
          will-change: transform;
        }
        .v19-curtain-gold-inner {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(201,168,76,0.1) 10%,
            rgba(201,168,76,0.5) 20%,
            rgba(232,212,139,0.7) 30%,
            rgba(201,168,76,0.5) 50%,
            rgba(232,212,139,0.7) 70%,
            rgba(201,168,76,0.5) 80%,
            rgba(201,168,76,0.1) 90%,
            transparent 100%
          );
          box-shadow: 0 0 8px rgba(201,168,76,0.3);
          animation: v19GoldPulse 3s ease-in-out infinite;
        }

        .v19-caption {
          position: absolute;
          bottom: 8vh;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          text-align: center;
          pointer-events: none;
        }
        .v19-caption-name {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(16px, 2.5vw, 28px);
          font-weight: 300;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: #fff;
          margin: 0;
        }
        .v19-caption-city {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(10px, 1.2vw, 13px);
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #c9a84c;
          margin-top: 8px;
        }

        .v19-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          height: 60px;
          position: relative;
          overflow: hidden;
        }
        .v19-divider-line {
          height: 1px;
          flex: 1;
          max-width: 200px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
        }
        .v19-divider-ornament {
          width: 8px;
          height: 8px;
          border: 1px solid rgba(201,168,76,0.5);
          transform: rotate(45deg);
          margin: 0 16px;
          flex-shrink: 0;
        }

        .v19-cta {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          position: relative;
        }
        .v19-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center top, rgba(201,168,76,0.05) 0%, transparent 60%);
          pointer-events: none;
        }
        .v19-cta-title {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(24px, 4vw, 48px);
          font-weight: 200;
          letter-spacing: 8px;
          text-transform: uppercase;
          color: #fff;
          margin: 0 0 12px;
          text-align: center;
        }
        .v19-cta-sub {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          margin-bottom: 48px;
        }
        .v19-form {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          z-index: 1;
        }
        .v19-form input,
        .v19-form textarea {
          width: 100%;
          padding: 16px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,168,76,0.2);
          color: #fff;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          letter-spacing: 1px;
          outline: none;
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .v19-form input:focus,
        .v19-form textarea:focus {
          border-color: rgba(201,168,76,0.5);
          background: rgba(255,255,255,0.06);
        }
        .v19-form input::placeholder,
        .v19-form textarea::placeholder {
          color: rgba(255,255,255,0.25);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 11px;
        }
        .v19-form textarea {
          min-height: 120px;
          resize: vertical;
        }
        .v19-form button {
          padding: 16px 40px;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.5);
          color: #c9a84c;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 4px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: center;
        }
        .v19-form button:hover {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
        }
        .v19-form-success {
          text-align: center;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          letter-spacing: 3px;
          color: #c9a84c;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .v19-photo {
            width: 85vw;
            height: 55vh;
          }
          .v19-nav { padding: 16px 20px; }
          .v19-counter { bottom: 20px; right: 20px; font-size: 11px; }
        }
      `}} />

      {/* Progress bar */}
      <div
        className="v19-progress"
        style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
      />

      {/* Navigation */}
      <nav className="v19-nav">
        <a href="/" className="v19-nav-brand">Aidan Torrence</a>
        <a href="#contact" className="v19-nav-inquire">Inquire</a>
      </nav>

      {/* Counter */}
      <div className="v19-counter">
        <span className="v19-counter-active">
          {String(currentIndex + 1).padStart(2, '0')}
        </span>
        {' / '}
        {String(images.length).padStart(2, '0')}
      </div>

      {/* Hero */}
      <section className="v19-hero">
        <div className="v19-hero-curtain-left" />
        <div className="v19-hero-curtain-right" />
        <div className="v19-hero-content">
          <h1 className="v19-hero-name">Aidan Torrence</h1>
          <p className="v19-hero-sub">Portrait Photography</p>
        </div>
        <div className="v19-hero-scroll">Scroll to reveal</div>
      </section>

      {/* Photo sections */}
      {images.map((img, i) => {
        const reveal = revealStates[i] ?? 0;
        // Curtain slides: 0 = fully closed, 1 = fully open (each half translates 100% outward)
        const curtainTranslate = reveal * 100;
        const captionOpacity = reveal >= 0.95 ? 1 : 0;
        const captionVisible = reveal >= 0.95;
        // Spotlight intensity tied to reveal
        const spotlightOpacity = reveal * 0.6;

        return (
          <div key={i}>
            {/* Gold ornamental divider */}
            <div className="v19-divider">
              <div className="v19-divider-line" />
              <div className="v19-divider-ornament" />
              <div className="v19-divider-line" />
            </div>

            <section
              className="v19-section"
              ref={(el) => { sectionRefs.current[i] = el; }}
            >
              <div className="v19-photo-container">
                {/* Photo */}
                <img
                  className="v19-photo"
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} - ${img.city}`}
                  loading="lazy"
                />

                {/* Spotlight overlay */}
                <div
                  className="v19-spotlight"
                  style={{
                    background: `radial-gradient(ellipse at 50% 45%, rgba(255,245,200,${spotlightOpacity * 0.08}) 0%, rgba(201,168,76,${spotlightOpacity * 0.03}) 30%, transparent 65%)`,
                    opacity: reveal > 0.1 ? 1 : 0,
                  }}
                />

                {/* Left curtain */}
                <div
                  className="v19-curtain-half v19-curtain-left"
                  style={{
                    transform: `translateX(-${curtainTranslate}%)`,
                  }}
                >
                  {/* Gold trim on inner edge */}
                  <div
                    className="v19-curtain-gold"
                    style={{ right: 0, top: 0, bottom: 0 }}
                  >
                    <div className="v19-curtain-gold-inner" />
                  </div>
                </div>

                {/* Right curtain */}
                <div
                  className="v19-curtain-half v19-curtain-right"
                  style={{
                    transform: `translateX(${curtainTranslate}%)`,
                  }}
                >
                  {/* Gold trim on inner edge */}
                  <div
                    className="v19-curtain-gold"
                    style={{ left: 0, top: 0, bottom: 0 }}
                  >
                    <div className="v19-curtain-gold-inner" />
                  </div>
                </div>

                {/* Caption */}
                <div
                  className="v19-caption"
                  style={{
                    opacity: captionOpacity,
                    animation: captionVisible ? 'v19CaptionSlide 0.6s ease-out both' : 'none',
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  <p className="v19-caption-name">{img.name}</p>
                  <p className="v19-caption-city">{img.city}</p>
                </div>
              </div>
            </section>
          </div>
        );
      })}

      {/* Divider before CTA */}
      <div className="v19-divider">
        <div className="v19-divider-line" />
        <div className="v19-divider-ornament" />
        <div className="v19-divider-line" />
      </div>

      {/* CTA Section */}
      <section className="v19-cta" id="contact">
        <h2 className="v19-cta-title">Let&apos;s Create</h2>
        <p className="v19-cta-sub">Book your session</p>
        {formSubmitted ? (
          <div className="v19-form-success">
            Thank you. I&apos;ll be in touch soon.
          </div>
        ) : (
          <form className="v19-form" onSubmit={handleSubmit}>
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
              placeholder="Tell me about your vision"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
            <button type="submit">Send Inquiry</button>
          </form>
        )}
      </section>
    </>
  );
}
