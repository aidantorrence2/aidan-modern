'use client';

import { useState, useEffect, useRef } from 'react';

const photos = [
  { src: '/images/large/manila-gallery-dsc-0075.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-street-001.jpg', style: 'inset' as const },
  { src: '/images/large/manila-gallery-night-001.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-closeup-001.jpg', style: 'wide' as const },
  { src: '/images/large/manila-gallery-garden-001.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-urban-001.jpg', style: 'inset' as const },
  { src: '/images/large/manila-gallery-canal-001.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-shadow-001.jpg', style: 'wide' as const },
  { src: '/images/large/manila-gallery-tropical-001.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-market-001.jpg', style: 'inset' as const },
  { src: '/images/large/manila-gallery-ivy-001.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-dsc-0130.jpg', style: 'wide' as const },
  { src: '/images/large/manila-gallery-night-002.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-park-001.jpg', style: 'inset' as const },
  { src: '/images/large/manila-gallery-statue-001.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-urban-002.jpg', style: 'wide' as const },
  { src: '/images/large/manila-gallery-dsc-0190.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-floor-001.jpg', style: 'inset' as const },
  { src: '/images/large/manila-gallery-night-003.jpg', style: 'full' as const },
  { src: '/images/large/manila-gallery-white-001.jpg', style: 'full' as const },
];

const CSS = `
body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
html, body { background: #060606 !important; margin: 0; }

.v3-wrap {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #fff;
  position: relative;
}

.v3-hero {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}
.v3-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.v3-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(6,6,6,0.8));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 24px 60px;
}
.v3-hero-overlay h1 {
  font-size: 36px;
  font-weight: 300;
  letter-spacing: 6px;
  text-transform: uppercase;
  margin: 0 0 8px;
}
.v3-hero-overlay p {
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

.scroll-progress {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 80px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  z-index: 50;
  overflow: hidden;
}
.scroll-progress-fill {
  width: 100%;
  background: rgba(255,255,255,0.5);
  border-radius: 2px;
  transition: height 0.1s linear;
}

.v3-section {
  position: relative;
}

.v3-full {
  width: 100%;
  overflow: hidden;
}
.v3-full img {
  width: 100%;
  display: block;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.7s ease, opacity 0.7s ease;
}
.v3-full img.visible {
  transform: translateY(0);
  opacity: 1;
}

.v3-inset {
  padding: 24px 28px;
}
.v3-inset img {
  width: 100%;
  display: block;
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.7s ease, opacity 0.7s ease;
}
.v3-inset img.visible {
  transform: translateY(0);
  opacity: 1;
}

.v3-wide {
  padding: 12px 0;
  overflow: hidden;
}
.v3-wide img {
  width: 110%;
  margin-left: -5%;
  display: block;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.7s ease, opacity 0.7s ease;
}
.v3-wide img.visible {
  transform: translateY(0);
  opacity: 1;
}

.v3-form {
  padding: 80px 24px 100px;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
.v3-form h2 {
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin: 0 0 6px;
}
.v3-form .sub {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 2px;
  margin: 0 0 36px;
}
.v3-form input,
.v3-form textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  padding: 16px 0;
  font-size: 15px;
  color: #fff;
  font-family: inherit;
  outline: none;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}
.v3-form input::placeholder,
.v3-form textarea::placeholder {
  color: rgba(255,255,255,0.3);
}
.v3-form input:focus,
.v3-form textarea:focus {
  border-color: rgba(255,255,255,0.5);
}
.v3-form textarea {
  resize: none;
  min-height: 70px;
}
.v3-form button {
  margin-top: 20px;
  width: 100%;
  padding: 16px;
  background: #fff;
  color: #060606;
  border: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  border-radius: 4px;
  transition: opacity 0.2s;
}
.v3-form button:active {
  opacity: 0.8;
}

.v3-contact-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 0 24px 60px;
}
.v3-contact-links a {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
}

@media (min-width: 768px) {
  .v3-hero-overlay h1 { font-size: 48px; letter-spacing: 10px; }
  .v3-inset { padding: 40px 80px; }
  .v3-form { max-width: 500px; }
}
`;

export default function V3Page() {
  const [scrollPct, setScrollPct] = useState(0);
  const [sent, setSent] = useState(false);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollPct(Math.min(1, window.scrollY / docHeight));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    imgRefs.current.forEach((img) => {
      if (img) observer.observe(img);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="v3-wrap">
        <div className="scroll-progress">
          <div
            className="scroll-progress-fill"
            style={{ height: `${scrollPct * 100}%` }}
          />
        </div>

        <div className="v3-hero">
          <img src={photos[0].src} alt="Hero" />
          <div className="v3-hero-overlay">
            <h1>Aidan Torrence</h1>
            <p>Film · Fashion · Editorial</p>
          </div>
        </div>

        {photos.slice(1).map((photo, i) => {
          const cls =
            photo.style === 'full'
              ? 'v3-full'
              : photo.style === 'inset'
                ? 'v3-inset'
                : 'v3-wide';
          return (
            <div className={`v3-section ${cls}`} key={photo.src}>
              <img
                ref={(el) => { imgRefs.current[i] = el; }}
                src={photo.src}
                alt={`Photo ${i + 2}`}
                loading="lazy"
              />
            </div>
          );
        })}

        <div className="v3-form">
          <h2>Get in Touch</h2>
          <p className="sub">Bangkok & Europe · Worldwide</p>
          {sent ? (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 24 }}>
              Thank you. I will be in touch.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target as HTMLFormElement);
                const name = fd.get('name');
                const email = fd.get('email');
                const msg = fd.get('message');
                window.location.href = `mailto:aidan@aidantorrence.com?subject=Inquiry from ${name}&body=${msg}%0A%0AFrom: ${name} (${email})`;
                setSent(true);
              }}
            >
              <input name="name" type="text" placeholder="Your name" required />
              <input name="email" type="email" placeholder="Email" required />
              <textarea name="message" placeholder="Tell me about your project" rows={3} />
              <button type="submit">Send</button>
            </form>
          )}
        </div>

        <div className="v3-contact-links">
          <a href="mailto:aidan@aidantorrence.com">Email</a>
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence">Instagram</a>
        </div>
      </div>
    </>
  );
}
