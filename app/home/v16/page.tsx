'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

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
  { src: 'manila-gallery-night-002.jpg', name: 'Dorahan', city: 'Ho Chi Minh City' },
  { src: 'manila-gallery-market-001.jpg', name: 'Pharima', city: 'Bangkok' },
  { src: 'manila-gallery-park-001.jpg', name: 'Tess', city: 'Glasgow' },
  { src: 'manila-gallery-floor-001.jpg', name: 'Francisca', city: 'Cascais' },
  { src: 'manila-gallery-garden-002.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-urban-002.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-dsc-0190.jpg', name: 'Dia', city: 'Bali' },
  { src: 'manila-gallery-ivy-002.jpg', name: 'Daniela', city: 'Rome' },
  { src: 'manila-gallery-canal-002.jpg', name: 'Greta', city: 'Venice' },
  { src: 'manila-gallery-night-003.jpg', name: 'Dorahan', city: 'Ho Chi Minh City' },
  { src: 'manila-gallery-urban-003.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-white-001.jpg', name: 'Silvia', city: 'Milan' },
  { src: 'manila-gallery-dsc-0911.jpg', name: 'Zarissa', city: 'Kuala Lumpur' },
];

// Each "spread" = 2 pages (left + right). We build spreads from the images.
// Spread 0 = Cover (front cover left + inside cover right)
// Spread 1..N = photo left, editorial text right (one image per spread)
// Spread N+1 = Back cover (CTA form)

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    background: #0c0c0c !important;
    color: #fff;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  @keyframes pageTurnForward {
    0% {
      transform: rotateY(0deg);
      box-shadow: -5px 0 15px rgba(0,0,0,0.2);
    }
    30% {
      box-shadow: -15px 0 40px rgba(0,0,0,0.5);
    }
    100% {
      transform: rotateY(-180deg);
      box-shadow: 5px 0 15px rgba(0,0,0,0.2);
    }
  }

  @keyframes pageTurnBackward {
    0% {
      transform: rotateY(0deg);
      box-shadow: 5px 0 15px rgba(0,0,0,0.2);
    }
    30% {
      box-shadow: 15px 0 40px rgba(0,0,0,0.5);
    }
    100% {
      transform: rotateY(180deg);
      box-shadow: -5px 0 15px rgba(0,0,0,0.2);
    }
  }

  .turn-shadow-front {
    animation: turnShadowForward 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
  }

  @keyframes turnShadowForward {
    0% { background: transparent; }
    40% { background: rgba(0,0,0,0.15); }
    100% { background: transparent; }
  }

  .turn-shadow-back {
    animation: turnShadowBackward 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
  }

  @keyframes turnShadowBackward {
    0% { background: transparent; }
    40% { background: rgba(0,0,0,0.15); }
    100% { background: transparent; }
  }

  button:hover {
    border-color: rgba(255,255,255,0.35) !important;
  }

  input::placeholder, textarea::placeholder {
    color: rgba(255,255,255,0.25);
    font-family: Georgia, serif;
    letter-spacing: 0.1em;
  }

  input:focus, textarea:focus {
    border-color: rgba(255,255,255,0.3) !important;
  }

  @media (max-width: 768px) {
    .page-turning-forward,
    .page-turning-backward {
      animation-duration: 0.6s !important;
    }
  }
`;

export default function HomeV16() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [turningPage, setTurningPage] = useState<number | null>(null);
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const totalSpreads = images.length + 2; // cover + 25 image spreads + back cover

  const goToSpread = useCallback((target: number) => {
    if (isAnimating || target === currentSpread) return;
    if (target < 0 || target >= totalSpreads) return;

    setIsAnimating(true);
    setTurnDirection(target > currentSpread ? 'forward' : 'backward');
    setTurningPage(target > currentSpread ? currentSpread : target);

    setTimeout(() => {
      setCurrentSpread(target);
      setTurningPage(null);
      setIsAnimating(false);
    }, 800);
  }, [currentSpread, isAnimating, totalSpreads]);

  const nextSpread = useCallback(() => {
    goToSpread(currentSpread + 1);
  }, [currentSpread, goToSpread]);

  const prevSpread = useCallback(() => {
    goToSpread(currentSpread - 1);
  }, [currentSpread, goToSpread]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSpread();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSpread();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextSpread, prevSpread]);

  // Touch/swipe
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSpread();
      else prevSpread();
    }
    touchStart.current = null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you, ${formData.name}! We'll be in touch.`);
    setFormData({ name: '', email: '', message: '' });
  };

  const renderSpreadContent = (spreadIndex: number, side: 'left' | 'right') => {
    // Cover spread
    if (spreadIndex === 0) {
      if (side === 'left') {
        return (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }} />
            <div style={{
              width: '80px', height: '1px', background: '#fff', marginBottom: '40px', opacity: 0.3,
            }} />
            <h1 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(24px, 3.5vw, 42px)',
              fontWeight: 300,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1.4,
              color: '#fff',
            }}>
              Aidan<br />Torrence
            </h1>
            <div style={{
              width: '40px', height: '1px', background: '#fff', margin: '32px 0', opacity: 0.3,
            }} />
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
            }}>
              Selected Works
            </p>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginTop: '60px',
            }}>
              Volume I
            </p>
          </div>
        );
      } else {
        return (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '60px 40px',
            background: '#f5f0eb',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }} />
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '12px',
              letterSpacing: '0.15em',
              color: '#333',
              textAlign: 'center',
              lineHeight: 2,
              maxWidth: '280px',
            }}>
              A curated collection of portraits captured across Bali, Tokyo, Vienna, Warsaw, and beyond.
            </p>
            <div style={{
              width: '30px', height: '1px', background: '#999', margin: '40px 0', opacity: 0.5,
            }} />
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: '#999',
              textTransform: 'uppercase',
            }}>
              25 Photographs
            </p>
            <p style={{
              position: 'absolute', bottom: '30px', right: '30px',
              fontFamily: 'Georgia, serif',
              fontSize: '10px', color: '#bbb',
              letterSpacing: '0.1em',
            }}>
              Click or use arrows to turn pages &rarr;
            </p>
          </div>
        );
      }
    }

    // Back cover spread (CTA)
    if (spreadIndex === totalSpreads - 1) {
      if (side === 'left') {
        return (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '60px 40px',
            background: '#f5f0eb',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }} />
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              fontWeight: 300,
              letterSpacing: '0.05em',
              color: '#222',
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: '300px',
              fontStyle: 'italic',
            }}>
              &ldquo;Every portrait is a collaboration between subject and light.&rdquo;
            </p>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#999',
              marginTop: '30px',
            }}>
              &mdash; Aidan Torrence
            </p>
          </div>
        );
      } else {
        return (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '40px 30px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
            position: 'relative',
          }}>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '11px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '30px',
            }}>
              Get In Touch
            </p>
            <form onSubmit={handleSubmit} style={{
              display: 'flex', flexDirection: 'column',
              gap: '14px', width: '100%', maxWidth: '260px',
            }}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                required
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '12px 16px',
                  color: '#fff',
                  fontFamily: 'Georgia, serif',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  outline: 'none',
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                required
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '12px 16px',
                  color: '#fff',
                  fontFamily: 'Georgia, serif',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  outline: 'none',
                }}
              />
              <textarea
                placeholder="Tell me about your project..."
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                rows={3}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '12px 16px',
                  color: '#fff',
                  fontFamily: 'Georgia, serif',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  outline: 'none',
                  resize: 'none',
                }}
              />
              <button type="submit" style={{
                background: '#fff',
                color: '#0c0c0c',
                border: 'none',
                padding: '14px',
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginTop: '6px',
              }}>
                Send Inquiry
              </button>
            </form>
          </div>
        );
      }
    }

    // Image spreads (spreadIndex 1..25)
    const imgIndex = spreadIndex - 1;
    const img = images[imgIndex];
    if (!img) return null;

    if (side === 'left') {
      // Photo page
      return (
        <div style={{
          width: '100%', height: '100%',
          position: 'relative', overflow: 'hidden',
          background: '#111',
        }}>
          <img
            src={`/images/large/${img.src}`}
            alt={img.name}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{
            position: 'absolute', bottom: '16px', left: '16px',
            fontFamily: 'monospace',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
          }}>
            FR {String(imgIndex + 1).padStart(2, '0')}
          </div>
        </div>
      );
    } else {
      // Editorial text page
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: '60px 40px',
          background: '#f5f0eb',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }} />
          <p style={{
            fontFamily: 'monospace',
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#bbb',
            marginBottom: '20px',
          }}>
            No. {String(imgIndex + 1).padStart(2, '0')} / 25
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '12px',
          }}>
            {img.name}
          </h2>
          <div style={{
            width: '40px', height: '1px', background: '#ccc', margin: '8px 0 20px',
          }} />
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#888',
          }}>
            {img.city}
          </p>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '11px',
            color: '#aaa',
            marginTop: '30px',
            letterSpacing: '0.1em',
            fontStyle: 'italic',
          }}>
            Frame {String(imgIndex + 1).padStart(2, '0')}
          </p>
          <p style={{
            position: 'absolute',
            bottom: '16px', right: '20px',
            fontFamily: 'Georgia, serif',
            fontSize: '9px',
            color: '#ccc',
            letterSpacing: '0.05em',
          }}>
            {(spreadIndex * 2) + 1}
          </p>
        </div>
      );
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        style={{
          width: '100vw', height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0c0c0c',
          overflow: 'hidden',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fixed Nav */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 32px',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}>
            Aidan Torrence
          </span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.35)',
          }}>
            {String(currentSpread + 1).padStart(2, '0')} / {String(totalSpreads).padStart(2, '0')}
          </span>
        </nav>

        {/* Book Container */}
        <div
          ref={bookRef}
          style={{
            position: 'relative',
            width: 'min(90vw, 1100px)',
            height: 'min(75vh, 700px)',
            perspective: '2000px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          {/* Book body with spine shadow */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            transformStyle: 'preserve-3d',
          }}>
            {/* Spine */}
            <div style={{
              position: 'absolute',
              top: '-4px', bottom: '-4px',
              left: '50%',
              width: '6px',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(90deg, #1a1a1a, #333, #1a1a1a)',
              zIndex: 50,
              boxShadow: '0 0 20px rgba(0,0,0,0.8)',
              borderRadius: '1px',
            }} />

            {/* Left page (static) */}
            <div style={{
              width: '50%', height: '100%',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.15), -4px 4px 20px rgba(0,0,0,0.4)',
              borderRadius: '4px 0 0 4px',
              cursor: currentSpread > 0 ? 'pointer' : 'default',
            }} onClick={prevSpread}>
              {renderSpreadContent(currentSpread, 'left')}
              {/* Inner shadow along spine */}
              <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0,
                width: '40px',
                background: 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)',
                pointerEvents: 'none',
              }} />
              {/* Page number bottom left */}
              <div style={{
                position: 'absolute', bottom: '14px', left: '18px',
                fontFamily: 'Georgia, serif',
                fontSize: '9px',
                color: currentSpread === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                letterSpacing: '0.05em',
              }}>
                {currentSpread > 0 && (currentSpread * 2)}
              </div>
            </div>

            {/* Right page (static) */}
            <div style={{
              width: '50%', height: '100%',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.08), 4px 4px 20px rgba(0,0,0,0.4)',
              borderRadius: '0 4px 4px 0',
              cursor: currentSpread < totalSpreads - 1 ? 'pointer' : 'default',
            }} onClick={nextSpread}>
              {renderSpreadContent(currentSpread, 'right')}
              {/* Inner shadow along spine */}
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: '40px',
                background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Turning page overlay (forward: right page lifts and rotates left) */}
            {turningPage !== null && turnDirection === 'forward' && (
              <>
                {/* The page lifting from right, rotating around spine */}
                <div
                  className="page-turning-forward"
                  style={{
                    position: 'absolute',
                    top: 0, bottom: 0,
                    left: '50%',
                    width: '50%',
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    zIndex: 40,
                    animation: 'pageTurnForward 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) forwards',
                  }}
                >
                  {/* Front of turning page (current right page) */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backfaceVisibility: 'hidden',
                    overflow: 'hidden',
                    borderRadius: '0 4px 4px 0',
                  }}>
                    {renderSpreadContent(turningPage, 'right')}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: '40px',
                      background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)',
                      pointerEvents: 'none',
                    }} />
                    {/* Dynamic shadow on the turning page */}
                    <div className="turn-shadow-front" style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      pointerEvents: 'none',
                    }} />
                  </div>
                  {/* Back of turning page (next spread left page) */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    overflow: 'hidden',
                    borderRadius: '4px 0 0 4px',
                  }}>
                    {renderSpreadContent(turningPage + 1, 'left')}
                    <div style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0,
                      width: '40px',
                      background: 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)',
                      pointerEvents: 'none',
                    }} />
                  </div>
                </div>
              </>
            )}

            {/* Turning page overlay (backward: left page lifts and rotates right) */}
            {turningPage !== null && turnDirection === 'backward' && (
              <div
                className="page-turning-backward"
                style={{
                  position: 'absolute',
                  top: 0, bottom: 0,
                  right: '50%',
                  width: '50%',
                  transformOrigin: 'right center',
                  transformStyle: 'preserve-3d',
                  zIndex: 40,
                  animation: 'pageTurnBackward 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) forwards',
                }}
              >
                {/* Front of turning page (current left page) */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backfaceVisibility: 'hidden',
                  overflow: 'hidden',
                  borderRadius: '4px 0 0 4px',
                }}>
                  {renderSpreadContent(turningPage + 1, 'left')}
                  <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0,
                    width: '40px',
                    background: 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)',
                    pointerEvents: 'none',
                  }} />
                  <div className="turn-shadow-back" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    pointerEvents: 'none',
                  }} />
                </div>
                {/* Back of turning page (previous right page) */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(-180deg)',
                  overflow: 'hidden',
                  borderRadius: '0 4px 4px 0',
                }}>
                  {renderSpreadContent(turningPage, 'right')}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: '40px',
                    background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)',
                    pointerEvents: 'none',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Book edge shadow underneath */}
          <div style={{
            position: 'absolute',
            bottom: '-12px', left: '10%', right: '10%',
            height: '20px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)',
            filter: 'blur(6px)',
            zIndex: -1,
          }} />
        </div>

        {/* Arrow navigation */}
        <div style={{
          position: 'fixed', bottom: '28px', left: 0, right: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '24px', zIndex: 90,
        }}>
          <button
            onClick={prevSpread}
            disabled={currentSpread === 0}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              color: currentSpread === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentSpread === 0 ? 'default' : 'pointer',
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              borderRadius: '2px',
            }}
          >
            &#8592;
          </button>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.3)',
          }}>
            {currentSpread === 0 ? 'COVER' :
             currentSpread === totalSpreads - 1 ? 'BACK' :
             `PLATE ${String(currentSpread).padStart(2, '0')}`}
          </span>
          <button
            onClick={nextSpread}
            disabled={currentSpread === totalSpreads - 1}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              color: currentSpread === totalSpreads - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentSpread === totalSpreads - 1 ? 'default' : 'pointer',
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              borderRadius: '2px',
            }}
          >
            &#8594;
          </button>
        </div>
      </div>
    </>
  );
}
