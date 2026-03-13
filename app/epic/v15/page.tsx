'use client';

import { useState, useEffect } from 'react';

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #f2efe8 !important; margin: 0; }

  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400&display=swap');

  .ed-page { font-family: 'Inter', system-ui, sans-serif; color: #1a1a1a; }

  /* Hero block */
  .ed-hero {
    width: 100%; height: 100svh;
    position: relative; overflow: hidden;
  }
  .ed-hero img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
  }
  .ed-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(transparent 40%, rgba(0,0,0,0.5));
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 2rem 1.5rem;
  }
  .ed-hero-name {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    color: #fff;
    font-weight: 400;
    letter-spacing: 0.02em;
    line-height: 1.1;
  }
  .ed-hero-tag {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.7);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 0.5rem;
    font-weight: 300;
  }
  @media (min-width: 768px) {
    .ed-hero-name { font-size: 4rem; }
    .ed-hero-overlay { padding: 3rem 4rem; }
  }

  /* Block: photo + text side by side */
  .ed-split {
    display: flex; flex-direction: column;
    max-width: 1200px; margin: 0 auto;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }
  .ed-split.reverse { flex-direction: column; }
  @media (min-width: 768px) {
    .ed-split { flex-direction: row; padding: 3rem 2rem; gap: 2.5rem; align-items: center; }
    .ed-split.reverse { flex-direction: row-reverse; }
    .ed-split-photo { flex: 0 0 58%; }
    .ed-split-text { flex: 1; }
  }
  .ed-split-photo img {
    width: 100%; display: block;
    object-fit: cover; aspect-ratio: 3/4;
  }
  .ed-split-text {
    display: flex; flex-direction: column;
    justify-content: center;
  }
  .ed-split-text h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 400;
    margin: 0 0 0.75rem;
    line-height: 1.3;
  }
  .ed-split-text p {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.7;
    margin: 0 0 0.5rem;
    font-weight: 300;
  }
  @media (min-width: 768px) {
    .ed-split-text h2 { font-size: 2rem; }
  }

  /* Block: two photos */
  .ed-duo {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    max-width: 1200px; margin: 0 auto;
  }
  @media (min-width: 640px) {
    .ed-duo { grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 2rem; }
  }
  .ed-duo img {
    width: 100%; display: block;
    object-fit: cover; aspect-ratio: 4/5;
  }

  /* Block: three photos */
  .ed-trio {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    max-width: 1200px; margin: 0 auto;
  }
  @media (min-width: 640px) {
    .ed-trio { grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; padding: 1rem 2rem; }
  }
  .ed-trio img {
    width: 100%; display: block;
    object-fit: cover; aspect-ratio: 3/4;
  }

  /* Full-bleed single */
  .ed-full {
    width: 100%; padding: 0.5rem 0;
  }
  .ed-full img {
    width: 100%; display: block;
    object-fit: cover;
    max-height: 85vh;
  }

  /* Quote / text block */
  .ed-quote {
    max-width: 640px;
    margin: 3rem auto;
    padding: 2rem 1.5rem;
    text-align: center;
  }
  .ed-quote blockquote {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 1.3rem;
    color: #333;
    line-height: 1.6;
    margin: 0 0 1rem;
    border: none;
    padding: 0;
  }
  .ed-quote cite {
    font-style: normal;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #999;
  }
  @media (min-width: 768px) {
    .ed-quote blockquote { font-size: 1.6rem; }
  }

  /* Divider */
  .ed-divider {
    width: 60px; height: 1px;
    background: #ccc;
    margin: 2.5rem auto;
  }

  /* Inquiry */
  .ed-inquiry {
    max-width: 520px;
    margin: 2rem auto 4rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
  }
  .ed-inquiry h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 400;
    margin: 0 0 0.5rem;
  }
  .ed-inquiry .ed-sub {
    font-size: 0.8rem;
    color: #888;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .ed-inquiry input, .ed-inquiry textarea {
    width: 100%; box-sizing: border-box;
    padding: 0.75rem 1rem;
    margin-bottom: 0.65rem;
    border: 1px solid #d0ccc4;
    border-radius: 0;
    background: #fff;
    font-size: 0.9rem;
    font-family: 'Inter', sans-serif;
    color: #333;
  }
  .ed-inquiry textarea { min-height: 90px; resize: vertical; }
  .ed-inquiry input::placeholder, .ed-inquiry textarea::placeholder { color: #aaa; }
  .ed-inquiry-btn {
    display: inline-block;
    padding: 0.85rem 3rem;
    background: #1a1a1a;
    color: #f2efe8;
    border: none;
    font-size: 0.85rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 0.5rem;
  }
  .ed-inquiry-btn:hover { background: #333; }
  .ed-links {
    display: flex; gap: 1.25rem; justify-content: center;
    flex-wrap: wrap; margin-top: 1.25rem;
  }
  .ed-links a {
    color: #888; font-size: 0.8rem;
    text-decoration: none; letter-spacing: 0.04em;
  }
  .ed-links a:hover { color: #333; }

  .ed-footer {
    text-align: center;
    padding: 1.5rem;
    font-size: 0.7rem;
    color: #bbb;
    letter-spacing: 0.08em;
  }

  /* Fade-in on scroll */
  .ed-fade {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .ed-fade.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function AsymmetricEditorial() {
  const [visible, setVisible] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute('data-fade');
            if (id) setVisible((prev) => new Set(prev).add(id));
            observer.unobserve(e.target);
          }
        });
      },
      { rootMargin: '40px', threshold: 0.15 }
    );
    document.querySelectorAll('.ed-fade').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fc = (id: string) => `ed-fade ${visible.has(id) ? 'visible' : ''}`;

  return (
    <div className="ed-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Block 1: Full-bleed hero */}
      <div className="ed-hero">
        <img src="/images/large/manila-gallery-canal-001.jpg" alt="Hero" loading="eager" />
        <div className="ed-hero-overlay">
          <div className="ed-hero-name">Aidan Torrence</div>
          <div className="ed-hero-tag">Film &middot; Fashion &middot; Editorial</div>
        </div>
      </div>

      {/* Block 2: Photo left, text right */}
      <div className={`ed-split ${fc('b2')}`} data-fade="b2">
        <div className="ed-split-photo">
          <img src="/images/large/manila-gallery-closeup-001.jpg" alt="Portrait" loading="lazy" />
        </div>
        <div className="ed-split-text">
          <h2>Capturing Authentic Moments</h2>
          <p>
            Based between Bangkok and Europe, I work with models, brands, and creatives
            to craft editorial imagery that feels both timeless and alive.
          </p>
          <p>
            Featured in Vogue Italia, Hypebeast, and WWD.
          </p>
        </div>
      </div>

      {/* Block 3: Two photos side by side */}
      <div className={`ed-duo ${fc('b3')}`} data-fade="b3">
        <img src="/images/large/manila-gallery-dsc-0075.jpg" alt="Editorial 1" loading="lazy" />
        <img src="/images/large/manila-gallery-garden-001.jpg" alt="Editorial 2" loading="lazy" />
      </div>

      {/* Block 4: Text left, photo right */}
      <div className={`ed-split reverse ${fc('b4')}`} data-fade="b4">
        <div className="ed-split-photo">
          <img src="/images/large/manila-gallery-ivy-001.jpg" alt="Fashion" loading="lazy" />
        </div>
        <div className="ed-split-text">
          <h2>Fashion Meets Film</h2>
          <p>
            Every session blends deliberate composition with spontaneous energy.
            I shoot on both digital and analog, finding beauty in the interplay
            of light, texture, and human emotion.
          </p>
        </div>
      </div>

      {/* Block 5: Three photos in a row */}
      <div className={`ed-trio ${fc('b5')}`} data-fade="b5">
        <img src="/images/large/manila-gallery-night-001.jpg" alt="Night 1" loading="lazy" />
        <img src="/images/large/manila-gallery-street-001.jpg" alt="Street" loading="lazy" />
        <img src="/images/large/manila-gallery-urban-001.jpg" alt="Urban" loading="lazy" />
      </div>

      {/* Quote */}
      <div className={`ed-quote ${fc('q1')}`} data-fade="q1">
        <blockquote>&ldquo;The best photographs are the ones that make you feel something you can&apos;t quite name.&rdquo;</blockquote>
        <cite>Aidan Torrence</cite>
      </div>

      {/* Block 6: Full bleed */}
      <div className={`ed-full ${fc('b6')}`} data-fade="b6">
        <img src="/images/large/manila-gallery-shadow-001.jpg" alt="Shadow" loading="lazy" />
      </div>

      {/* Block 7: Photo left, text right */}
      <div className={`ed-split ${fc('b7')}`} data-fade="b7">
        <div className="ed-split-photo">
          <img src="/images/large/manila-gallery-tropical-001.jpg" alt="Tropical" loading="lazy" />
        </div>
        <div className="ed-split-text">
          <h2>Worldwide Bookings</h2>
          <p>
            From Bangkok rooftops to European countryside estates,
            I travel wherever the story takes me. Currently booking
            editorial, commercial, and personal sessions.
          </p>
        </div>
      </div>

      {/* Block 8: Two photos */}
      <div className={`ed-duo ${fc('b8')}`} data-fade="b8">
        <img src="/images/large/manila-gallery-market-001.jpg" alt="Market" loading="lazy" />
        <img src="/images/large/manila-gallery-dsc-0130.jpg" alt="Portrait" loading="lazy" />
      </div>

      <div className="ed-divider" />

      {/* Block 9: Three photos */}
      <div className={`ed-trio ${fc('b9')}`} data-fade="b9">
        <img src="/images/large/manila-gallery-park-001.jpg" alt="Park" loading="lazy" />
        <img src="/images/large/manila-gallery-night-002.jpg" alt="Night 2" loading="lazy" />
        <img src="/images/large/manila-gallery-canal-002.jpg" alt="Canal" loading="lazy" />
      </div>

      {/* Block 10: Text left, photo right */}
      <div className={`ed-split reverse ${fc('b10')}`} data-fade="b10">
        <div className="ed-split-photo">
          <img src="/images/large/manila-gallery-ivy-002.jpg" alt="Ivy" loading="lazy" />
        </div>
        <div className="ed-split-text">
          <h2>The Analog Touch</h2>
          <p>
            Film grain, natural light, and unhurried moments.
            There is a depth to analog that digital only aspires to.
            I bring that sensibility to every frame.
          </p>
        </div>
      </div>

      {/* Block 11: Full bleed */}
      <div className={`ed-full ${fc('b11')}`} data-fade="b11">
        <img src="/images/large/manila-gallery-dsc-0190.jpg" alt="Editorial" loading="lazy" />
      </div>

      {/* Block 12: Two photos */}
      <div className={`ed-duo ${fc('b12')}`} data-fade="b12">
        <img src="/images/large/manila-gallery-urban-002.jpg" alt="Urban 2" loading="lazy" />
        <img src="/images/large/manila-gallery-garden-002.jpg" alt="Garden 2" loading="lazy" />
      </div>

      {/* Block 13: Three final photos */}
      <div className={`ed-trio ${fc('b13')}`} data-fade="b13">
        <img src="/images/large/manila-gallery-floor-001.jpg" alt="Floor" loading="lazy" />
        <img src="/images/large/manila-gallery-white-001.jpg" alt="White" loading="lazy" />
        <img src="/images/large/manila-gallery-statue-001.jpg" alt="Statue" loading="lazy" />
      </div>

      {/* Block 14: Two more */}
      <div className={`ed-duo ${fc('b14')}`} data-fade="b14">
        <img src="/images/large/manila-gallery-night-003.jpg" alt="Night 3" loading="lazy" />
        <img src="/images/large/manila-gallery-urban-003.jpg" alt="Urban 3" loading="lazy" />
      </div>

      {/* Final full-bleed */}
      <div className={`ed-full ${fc('b15')}`} data-fade="b15">
        <img src="/images/large/manila-gallery-dsc-0911.jpg" alt="Final" loading="lazy" />
      </div>

      <div className="ed-divider" />

      {/* Inquiry */}
      <div className={`ed-inquiry ${fc('inq')}`} data-fade="inq">
        <h2>Work With Me</h2>
        <div className="ed-sub">Booking worldwide</div>
        <form onSubmit={(e) => { e.preventDefault(); window.location.href = 'mailto:aidan@aidantorrence.com'; }}>
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Email" />
          <textarea placeholder="Tell me about your project..." />
          <button type="submit" className="ed-inquiry-btn">Send Inquiry</button>
        </form>
        <div className="ed-links">
          <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener">@aidantorrence</a>
        </div>
      </div>

      <div className="ed-footer">
        &copy; {new Date().getFullYear()} Aidan Torrence. All rights reserved.
      </div>
    </div>
  );
}
