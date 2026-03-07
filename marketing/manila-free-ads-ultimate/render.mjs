import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

const DISPLAY = "Baskerville, 'Iowan Old Style', Georgia, serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const CONDENSED = "Futura, 'Avenir Next Condensed', 'Arial Narrow', sans-serif"

const images = {
  hero: img('manila-hero-dsc-0898.jpg'),
  shell: img('manila-gallery-dsc-0075.jpg'),
  close: img('manila-gallery-dsc-0130.jpg'),
  terracotta: img('manila-gallery-dsc-0190.jpg'),
  arcade: img('manila-gallery-dsc-0911.jpg')
}

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function frame({ background = '#111111', content, overlay = '' }) {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${background};">
      ${content}
      ${overlay}
    </div>
  `
}

function photoSlide({ image, inner, overlay }) {
  return frame({
    content: `
      <img src="${image}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
      ${overlay}
      ${inner}
    `
  })
}

function badge(text, {
  textColor = 'white',
  border = 'rgba(255,255,255,0.35)',
  background = 'rgba(255,255,255,0.08)'
} = {}) {
  return `
    <div style="display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:999px;border:1.5px solid ${border};background:${background};backdrop-filter:blur(10px);">
      <span style="width:8px;height:8px;border-radius:999px;background:${textColor};display:block;"></span>
      <span style="font-family:${CONDENSED};font-size:22px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${textColor};">${text}</span>
    </div>
  `
}

function bottomCue(text, light = true) {
  return `
    <div style="position:absolute;left:0;right:0;bottom:160px;text-align:center;">
      <span style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${light ? 'rgba(255,255,255,0.64)' : 'rgba(17,17,17,0.42)'};">${text}</span>
    </div>
  `
}

function grain(opacity = 0.18) {
  return `
    <div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
      radial-gradient(circle at 14% 18%, rgba(255,255,255,0.55) 0, transparent 18%),
      radial-gradient(circle at 82% 10%, rgba(255,255,255,0.35) 0, transparent 14%),
      radial-gradient(circle at 52% 78%, rgba(255,255,255,0.22) 0, transparent 22%),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 5px);"></div>
  `
}

function gradientPanel(top, middle, bottom) {
  return `
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, ${top} 0%, ${middle} 47%, ${bottom} 100%);"></div>
  `
}

const titleShadow = 'text-shadow:0 4px 20px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.7);'
const bodyShadow = 'text-shadow:0 2px 10px rgba(0,0,0,0.6);'

const stories = [
  {
    folder: 'story-01_photos-that-match-you',
    slides: [
      {
        name: '01_hook',
        html: photoSlide({
          image: images.arcade,
          overlay: `
            ${gradientPanel('rgba(8,8,8,0.72)', 'rgba(8,8,8,0.18)', 'rgba(8,8,8,0.82)')}
            ${grain(0.12)}
          `,
          inner: `
            <div style="position:absolute;top:210px;left:72px;right:72px;">
              ${badge('Manila Free Collabs')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:520px;">
              <h1 style="font-family:${DISPLAY};font-size:116px;font-weight:700;line-height:0.96;color:white;margin:0;max-width:820px;${titleShadow}">
                Your energy is too good for average photos.
              </h1>
            </div>

            <div style="position:absolute;left:72px;right:72px;bottom:350px;">
              <p style="font-family:${SANS};font-size:37px;line-height:1.36;color:rgba(255,255,255,0.95);margin:0;max-width:760px;${bodyShadow}">
                If your current photos do not feel like you yet, fix that for free.
              </p>
            </div>

            ${bottomCue('Swipe for the story')}
          `
        })
      },
      {
        name: '02_problem',
        html: frame({
          background: '#f4ede4',
          content: `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at top left, rgba(214,177,111,0.20), transparent 34%),
              linear-gradient(180deg, rgba(255,255,255,0.9), rgba(244,237,228,1));"></div>

            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('Why this hits', {
                textColor: '#171411',
                border: 'rgba(23,20,17,0.16)',
                background: 'rgba(255,255,255,0.72)'
              })}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:430px;">
              <h2 style="font-family:${DISPLAY};font-size:92px;font-weight:700;line-height:0.99;color:#171411;margin:0 0 40px;">
                You know that moment when your life looks better than your camera roll?
              </h2>

              <div style="display:grid;gap:18px;">
                <div style="padding:28px 30px;border-radius:28px;background:white;border:1.5px solid rgba(23,20,17,0.08);box-shadow:0 28px 50px rgba(23,20,17,0.08);">
                  <p style="font-family:${SANS};font-size:35px;line-height:1.32;color:#322a24;margin:0;">
                    You want to update your Instagram, dating profile, or portfolio... then realize your photos are not there yet.
                  </p>
                </div>
                <div style="padding:28px 30px;border-radius:28px;background:#171411;color:white;box-shadow:0 22px 44px rgba(23,20,17,0.2);">
                  <p style="font-family:${SANS};font-size:35px;line-height:1.32;margin:0;">
                    That is not a confidence problem. It is a content problem.
                  </p>
                </div>
              </div>
            </div>

            ${bottomCue('And this is the fix', false)}
          `,
          overlay: grain(0.08)
        })
      },
      {
        name: '03_offer',
        html: frame({
          background: '#121212',
          content: `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(0,0,0,0.96), rgba(0,0,0,0.78)),
              radial-gradient(circle at 20% 20%, rgba(197,124,87,0.24), transparent 20%),
              radial-gradient(circle at 82% 80%, rgba(255,255,255,0.10), transparent 18%);"></div>

            <div style="position:absolute;top:210px;left:72px;right:72px;display:flex;justify-content:space-between;align-items:flex-start;">
              ${badge('Offer Reveal')}
              <span style="font-family:${CONDENSED};font-size:26px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.58);">Manila</span>
            </div>

            <div style="position:absolute;top:410px;left:72px;right:72px;">
              <h2 style="font-family:${DISPLAY};font-size:96px;font-weight:700;line-height:0.97;color:white;margin:0 0 28px;max-width:840px;">
                I am opening free Manila collab shoots.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.34;color:rgba(255,255,255,0.78);margin:0;max-width:820px;">
                You get a real directed portrait session, edited selects, and photos that actually feel premium.
              </p>
            </div>

            <div style="position:absolute;left:72px;right:72px;bottom:320px;display:grid;grid-template-columns:1.05fr 0.95fr;gap:16px;">
              <img src="${images.terracotta}" style="width:100%;height:540px;object-fit:cover;border-radius:26px;box-shadow:0 28px 70px rgba(0,0,0,0.35);"/>
              <div style="display:grid;gap:16px;">
                <img src="${images.close}" style="width:100%;height:262px;object-fit:cover;border-radius:26px;box-shadow:0 28px 70px rgba(0,0,0,0.35);"/>
                <div style="padding:28px;border-radius:26px;background:linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));border:1.5px solid rgba(255,255,255,0.12);backdrop-filter:blur(14px);">
                  <p style="font-family:${CONDENSED};font-size:25px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.52);margin:0 0 14px;">Not random content</p>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:white;margin:0;">
                    Styled. Directed. Edited. Built to make people stop scrolling.
                  </p>
                </div>
              </div>
            </div>

            ${bottomCue('Next: why it feels easy')}
          `,
          overlay: grain(0.14)
        })
      },
      {
        name: '04_objection',
        html: photoSlide({
          image: images.hero,
          overlay: `
            ${gradientPanel('rgba(12,12,12,0.75)', 'rgba(12,12,12,0.18)', 'rgba(12,12,12,0.82)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 70% 32%, rgba(255,255,255,0.16), transparent 18%),
              linear-gradient(120deg, rgba(217,183,109,0.22), transparent 30%);"></div>
            ${grain(0.10)}
          `,
          inner: `
            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('No experience needed')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:470px;">
              <h2 style="font-family:${DISPLAY};font-size:108px;font-weight:700;line-height:0.98;color:white;margin:0 0 36px;max-width:760px;${titleShadow}">
                No idea how to pose? Perfect.
              </h2>

              <div style="display:grid;gap:18px;max-width:760px;">
                <div style="padding:24px 28px;border-radius:26px;background:rgba(255,255,255,0.10);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(14px);">
                  <p style="font-family:${SANS};font-size:34px;line-height:1.34;color:white;margin:0;">I guide pose, angle, expression, and pacing the whole time.</p>
                </div>
                <div style="display:flex;gap:14px;flex-wrap:wrap;">
                  <span style="padding:14px 18px;border-radius:999px;background:rgba(255,255,255,0.12);font-family:${CONDENSED};font-size:21px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:white;">Pose coaching</span>
                  <span style="padding:14px 18px;border-radius:999px;background:rgba(255,255,255,0.12);font-family:${CONDENSED};font-size:21px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:white;">Outfit input</span>
                  <span style="padding:14px 18px;border-radius:999px;background:rgba(255,255,255,0.12);font-family:${CONDENSED};font-size:21px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:white;">Natural direction</span>
                </div>
              </div>
            </div>

            ${bottomCue('Then the value lands')}
          `
        })
      },
      {
        name: '05_value',
        html: frame({
          background: '#f6f3ee',
          content: `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 80% 16%, rgba(197,124,87,0.16), transparent 16%),
              radial-gradient(circle at 10% 88%, rgba(214,177,111,0.14), transparent 18%),
              linear-gradient(180deg, rgba(255,255,255,0.92), rgba(246,243,238,1));"></div>

            <div style="position:absolute;top:210px;left:72px;right:72px;display:flex;justify-content:space-between;align-items:center;">
              ${badge('What you walk away with', {
                textColor: '#181512',
                border: 'rgba(24,21,18,0.16)',
                background: 'rgba(255,255,255,0.86)'
              })}
              <span style="font-family:${CONDENSED};font-size:25px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(24,21,18,0.42);">Zero catch</span>
            </div>

            <div style="position:absolute;left:72px;right:72px;top:430px;display:grid;grid-template-columns:1.08fr 0.92fr;gap:26px;">
              <div>
                <h2 style="font-family:${DISPLAY};font-size:92px;font-weight:700;line-height:0.98;color:#181512;margin:0 0 30px;max-width:540px;">
                  A real shoot. A real upgrade.
                </h2>
                <div style="display:grid;gap:16px;">
                  ${[
                    '30 to 60 minute directed session in Manila',
                    '10+ edited photos ready for IG, dating, and personal brand use',
                    'Location and outfit guidance before the shoot',
                    'Final gallery delivered in 7 days'
                  ].map(item => `
                    <div style="display:flex;gap:16px;align-items:flex-start;padding:20px 22px;border-radius:24px;background:white;border:1.5px solid rgba(24,21,18,0.08);box-shadow:0 18px 34px rgba(24,21,18,0.06);">
                      <div style="width:16px;height:16px;border-radius:999px;background:#d6b16f;flex-shrink:0;margin-top:14px;"></div>
                      <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:#2e2721;margin:0;">${item}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div style="padding:28px;border-radius:30px;background:#181512;color:white;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 28px 50px rgba(24,21,18,0.18);">
                <div>
                  <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.56);margin:0 0 18px;">Best for</p>
                  <p style="font-family:${DISPLAY};font-size:64px;font-weight:700;line-height:0.98;margin:0 0 28px;">Instagram. Dating. Personal brand.</p>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.36;color:rgba(255,255,255,0.78);margin:0;">
                    The point is simple: leave with photos that open doors instead of blending in.
                  </p>
                </div>
                <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#d6b16f;margin:0;">100% free</p>
              </div>
            </div>

            ${bottomCue('One last step', false)}
          `,
          overlay: grain(0.08)
        })
      },
      {
        name: '06_close',
        html: photoSlide({
          image: images.terracotta,
          overlay: `
            ${gradientPanel('rgba(12,12,12,0.72)', 'rgba(12,12,12,0.28)', 'rgba(12,12,12,0.84)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 18% 18%, rgba(214,177,111,0.20), transparent 24%),
              linear-gradient(135deg, rgba(214,177,111,0.12), transparent 28%);"></div>
            ${grain(0.12)}
          `,
          inner: `
            <div style="position:absolute;top:210px;left:72px;right:72px;">
              ${badge('This is your sign')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:560px;">
              <h2 style="font-family:${DISPLAY};font-size:112px;font-weight:700;line-height:0.95;color:white;margin:0 0 30px;max-width:780px;${titleShadow}">
                Tap Learn More and take the free shoot.
              </h2>
              <p style="font-family:${SANS};font-size:37px;line-height:1.36;color:rgba(255,255,255,0.88);margin:0;max-width:760px;${bodyShadow}">
                Quick intro call. Limited Manila collab spots. Zero pressure if it is not a fit.
              </p>
            </div>

            <div style="position:absolute;left:72px;right:72px;bottom:280px;display:flex;justify-content:space-between;align-items:center;padding:24px 28px;border-radius:30px;background:rgba(255,255,255,0.10);border:1.5px solid rgba(255,255,255,0.14);backdrop-filter:blur(14px);">
              <span style="font-family:${CONDENSED};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:white;">Learn more</span>
              <span style="font-family:${CONDENSED};font-size:30px;font-weight:700;letter-spacing:0.08em;color:#d6b16f;">→</span>
            </div>
          `
        })
      }
    ]
  },
  {
    folder: 'story-02_free-does-not-mean-basic',
    slides: [
      {
        name: '01_hook',
        html: photoSlide({
          image: images.close,
          overlay: `
            ${gradientPanel('rgba(10,10,10,0.80)', 'rgba(10,10,10,0.20)', 'rgba(10,10,10,0.76)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 84% 24%, rgba(127,255,191,0.16), transparent 18%),
              linear-gradient(125deg, rgba(127,255,191,0.08), transparent 26%);"></div>
            ${grain(0.10)}
          `,
          inner: `
            <div style="position:absolute;top:210px;left:72px;right:72px;">
              ${badge('Offer angle')}
            </div>
            <div style="position:absolute;left:72px;right:72px;top:560px;">
              <h1 style="font-family:${DISPLAY};font-size:122px;font-weight:700;line-height:0.95;color:white;margin:0 0 28px;max-width:820px;${titleShadow}">
                Free does not mean basic.
              </h1>
              <p style="font-family:${SANS};font-size:37px;line-height:1.36;color:rgba(255,255,255,0.90);margin:0;max-width:760px;${bodyShadow}">
                This is a real portrait session, not throwaway content.
              </p>
            </div>
            ${bottomCue('Here is what makes it different')}
          `
        })
      },
      {
        name: '02_premium',
        html: frame({
          background: '#0c100e',
          content: `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 18% 18%, rgba(127,255,191,0.18), transparent 20%),
              radial-gradient(circle at 88% 82%, rgba(255,255,255,0.10), transparent 18%),
              linear-gradient(180deg, rgba(12,16,14,0.96), rgba(12,16,14,1));"></div>

            <div style="position:absolute;top:220px;left:72px;right:72px;display:flex;justify-content:space-between;align-items:center;">
              ${badge('Premium pieces')}
              <span style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.42);">Directed</span>
            </div>

            <div style="position:absolute;left:72px;right:72px;top:430px;">
              <h2 style="font-family:${DISPLAY};font-size:92px;font-weight:700;line-height:0.97;color:white;margin:0 0 34px;max-width:830px;">
                This round includes everything that makes a shoot feel premium.
              </h2>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
                ${[
                  ['Location plan', 'We match the spot to the vibe you want.'],
                  ['Outfit guidance', 'We make sure the styling reads clean on camera.'],
                  ['Pose coaching', 'You are directed in real time, not left guessing.'],
                  ['Edited selects', 'You leave with polished images you can actually use.']
                ].map(([title, body]) => `
                  <div style="padding:30px;border-radius:28px;background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));border:1.5px solid rgba(255,255,255,0.10);box-shadow:0 24px 50px rgba(0,0,0,0.18);">
                    <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#7fffbf;margin:0 0 16px;">${title}</p>
                    <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:rgba(255,255,255,0.84);margin:0;">${body}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            ${bottomCue('And the look is there too')}
          `,
          overlay: grain(0.12)
        })
      },
      {
        name: '03_visual_proof',
        html: frame({
          background: '#060707',
          content: `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(6,7,7,1), rgba(6,7,7,0.94)),
              radial-gradient(circle at 74% 18%, rgba(127,255,191,0.12), transparent 18%);"></div>

            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('Visual proof')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:400px;display:grid;grid-template-columns:0.98fr 1.02fr;gap:18px;align-items:start;">
              <div>
                <h2 style="font-family:${DISPLAY};font-size:90px;font-weight:700;line-height:0.97;color:white;margin:0 0 22px;max-width:430px;">
                  Clean. Confident. Expensive-looking.
                </h2>
                <p style="font-family:${SANS};font-size:33px;line-height:1.34;color:rgba(255,255,255,0.76);margin:0 0 30px;max-width:430px;">
                  The goal is not overdone. The goal is magnetic.
                </p>
                <div style="padding:26px 28px;border-radius:26px;background:rgba(127,255,191,0.10);border:1.5px solid rgba(127,255,191,0.20);">
                  <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#7fffbf;margin:0 0 14px;">Built for</p>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:white;margin:0;">
                    Instagram refreshes, dating profiles, portfolios, and personal brands.
                  </p>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:360px;gap:16px;">
                <img src="${images.arcade}" style="width:100%;height:100%;object-fit:cover;border-radius:24px;box-shadow:0 24px 50px rgba(0,0,0,0.22);"/>
                <img src="${images.terracotta}" style="width:100%;height:100%;object-fit:cover;border-radius:24px;box-shadow:0 24px 50px rgba(0,0,0,0.22);"/>
                <img src="${images.shell}" style="width:100%;height:100%;object-fit:cover;border-radius:24px;box-shadow:0 24px 50px rgba(0,0,0,0.22);"/>
                <img src="${images.hero}" style="width:100%;height:100%;object-fit:cover;border-radius:24px;box-shadow:0 24px 50px rgba(0,0,0,0.22);"/>
              </div>
            </div>

            ${bottomCue('Still worried about posing?')}
          `,
          overlay: grain(0.12)
        })
      },
      {
        name: '04_first_timer',
        html: photoSlide({
          image: images.shell,
          overlay: `
            ${gradientPanel('rgba(10,10,10,0.76)', 'rgba(10,10,10,0.18)', 'rgba(10,10,10,0.84)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 14% 82%, rgba(127,255,191,0.12), transparent 20%),
              linear-gradient(120deg, rgba(255,255,255,0.10), transparent 18%);"></div>
            ${grain(0.08)}
          `,
          inner: `
            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('First-timer safe')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:520px;">
              <h2 style="font-family:${DISPLAY};font-size:112px;font-weight:700;line-height:0.95;color:white;margin:0 0 26px;max-width:800px;${titleShadow}">
                Never done a shoot before? Even better.
              </h2>
              <p style="font-family:${SANS};font-size:36px;line-height:1.36;color:rgba(255,255,255,0.92);margin:0 0 34px;max-width:760px;${bodyShadow}">
                You do not need model experience. I direct the whole flow so it feels easy and natural.
              </p>

              <div style="display:flex;gap:14px;flex-wrap:wrap;max-width:760px;">
                <span style="padding:16px 18px;border-radius:999px;background:rgba(255,255,255,0.12);font-family:${CONDENSED};font-size:22px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:white;">No awkward guessing</span>
                <span style="padding:16px 18px;border-radius:999px;background:rgba(255,255,255,0.12);font-family:${CONDENSED};font-size:22px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:white;">Coached in real time</span>
              </div>
            </div>

            ${bottomCue('So what is the catch?')}
          `
        })
      },
      {
        name: '05_no_catch',
        html: frame({
          background: '#f2f6f3',
          content: `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 12% 18%, rgba(127,255,191,0.22), transparent 20%),
              linear-gradient(180deg, rgba(255,255,255,0.9), rgba(242,246,243,1));"></div>

            <div style="position:absolute;top:220px;left:72px;right:72px;display:flex;justify-content:space-between;align-items:center;">
              ${badge('The answer', {
                textColor: '#102118',
                border: 'rgba(16,33,24,0.16)',
                background: 'rgba(255,255,255,0.86)'
              })}
              <span style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(16,33,24,0.38);">No hidden fee</span>
            </div>

            <div style="position:absolute;left:72px;right:72px;top:430px;display:grid;grid-template-columns:0.95fr 1.05fr;gap:24px;align-items:start;">
              <div style="padding:34px;border-radius:34px;background:#102118;color:white;box-shadow:0 32px 60px rgba(16,33,24,0.16);">
                <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#7fffbf;margin:0 0 20px;">Simple truth</p>
                <h2 style="font-family:${DISPLAY};font-size:88px;font-weight:700;line-height:0.97;margin:0 0 22px;">Yes, it is really free.</h2>
                <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(255,255,255,0.82);margin:0;">
                  This is a collab round. You bring your time and energy. I bring the direction and edited images.
                </p>
              </div>

              <div style="display:grid;gap:18px;">
                <div style="padding:28px 30px;border-radius:28px;background:white;border:1.5px solid rgba(16,33,24,0.08);box-shadow:0 18px 36px rgba(16,33,24,0.07);">
                  <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#217951;margin:0 0 14px;">Why I offer it</p>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:#24352c;margin:0;">
                    I am building my Manila portfolio and looking for people with strong style or energy.
                  </p>
                </div>
                <div style="padding:28px 30px;border-radius:28px;background:white;border:1.5px solid rgba(16,33,24,0.08);box-shadow:0 18px 36px rgba(16,33,24,0.07);">
                  <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#217951;margin:0 0 14px;">How it starts</p>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:#24352c;margin:0;">
                    You book a quick intro call so we can make sure it is a fit before we plan anything.
                  </p>
                </div>
              </div>
            </div>

            ${bottomCue('So do not overthink it', false)}
          `,
          overlay: grain(0.08)
        })
      },
      {
        name: '06_close',
        html: photoSlide({
          image: images.arcade,
          overlay: `
            ${gradientPanel('rgba(9,9,9,0.74)', 'rgba(9,9,9,0.24)', 'rgba(9,9,9,0.82)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 82%, rgba(127,255,191,0.16), transparent 20%),
              linear-gradient(135deg, rgba(127,255,191,0.12), transparent 28%);"></div>
            ${grain(0.10)}
          `,
          inner: `
            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('Easy next step')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:600px;">
              <h2 style="font-family:${DISPLAY};font-size:108px;font-weight:700;line-height:0.95;color:white;margin:0 0 28px;max-width:800px;${titleShadow}">
                Tap Learn More before the free collab spots fill.
              </h2>
              <p style="font-family:${SANS};font-size:36px;line-height:1.36;color:rgba(255,255,255,0.88);margin:0;max-width:760px;${bodyShadow}">
                One quick call. Then we decide if we are a fit and plan the shoot from there.
              </p>
            </div>

            <div style="position:absolute;left:72px;right:72px;bottom:285px;padding:26px 30px;border-radius:30px;background:rgba(255,255,255,0.10);border:1.5px solid rgba(255,255,255,0.14);backdrop-filter:blur(14px);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:${CONDENSED};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:white;">Book intro call</span>
              <span style="font-family:${CONDENSED};font-size:34px;font-weight:700;color:#7fffbf;">→</span>
            </div>
          `
        })
      }
    ]
  },
  {
    folder: 'story-03_this-is-your-sign',
    slides: [
      {
        name: '01_hook',
        html: photoSlide({
          image: images.hero,
          overlay: `
            ${gradientPanel('rgba(12,8,7,0.72)', 'rgba(12,8,7,0.20)', 'rgba(12,8,7,0.82)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 18% 18%, rgba(214,94,63,0.22), transparent 20%),
              linear-gradient(140deg, rgba(214,94,63,0.10), transparent 26%);"></div>
            ${grain(0.10)}
          `,
          inner: `
            <div style="position:absolute;top:210px;left:72px;right:72px;">
              ${badge('Urgency angle')}
            </div>
            <div style="position:absolute;left:72px;right:72px;top:520px;">
              <h1 style="font-family:${DISPLAY};font-size:118px;font-weight:700;line-height:0.95;color:white;margin:0 0 28px;max-width:840px;${titleShadow}">
                If you have been waiting for a sign, this is it.
              </h1>
              <p style="font-family:${SANS};font-size:37px;line-height:1.36;color:rgba(255,255,255,0.90);margin:0;max-width:760px;${bodyShadow}">
                Stop putting off the shoot that would upgrade your whole online presence.
              </p>
            </div>
            ${bottomCue('Because the offer is live now')}
          `
        })
      },
      {
        name: '02_offer_window',
        html: frame({
          background: '#170d0a',
          content: `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 16%, rgba(214,94,63,0.18), transparent 18%),
              radial-gradient(circle at 18% 84%, rgba(255,255,255,0.08), transparent 16%),
              linear-gradient(180deg, rgba(23,13,10,0.98), rgba(23,13,10,1));"></div>

            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('Open collab round')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:430px;display:grid;grid-template-columns:1.02fr 0.98fr;gap:22px;">
              <div style="padding:34px;border-radius:34px;background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));border:1.5px solid rgba(255,255,255,0.10);box-shadow:0 28px 60px rgba(0,0,0,0.20);">
                <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#ff8e68;margin:0 0 18px;">What is happening</p>
                <h2 style="font-family:${DISPLAY};font-size:86px;font-weight:700;line-height:0.97;color:white;margin:0 0 20px;max-width:440px;">
                  I am opening a limited batch of free Manila collab shoots.
                </h2>
                <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(255,255,255,0.78);margin:0;">
                  When the round fills, I close it. So if you want in, move now.
                </p>
              </div>

              <div style="display:grid;gap:18px;">
                <div style="padding:28px 30px;border-radius:28px;background:#f6eee6;box-shadow:0 22px 44px rgba(0,0,0,0.12);">
                  <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#a84c2c;margin:0 0 14px;">Why free</p>
                  <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:#2f1e19;margin:0;">
                    I am building my Manila portfolio. You get premium images. I get to create. Win-win.
                  </p>
                </div>
                <img src="${images.close}" style="width:100%;height:414px;object-fit:cover;border-radius:28px;box-shadow:0 24px 50px rgba(0,0,0,0.18);"/>
              </div>
            </div>

            ${bottomCue('And yes, it is for real')}
          `,
          overlay: grain(0.12)
        })
      },
      {
        name: '03_for_what',
        html: frame({
          background: '#f5efe9',
          content: `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 12% 18%, rgba(214,94,63,0.20), transparent 18%),
              radial-gradient(circle at 86% 84%, rgba(214,177,111,0.18), transparent 18%),
              linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,239,233,1));"></div>

            <div style="position:absolute;top:210px;left:72px;right:72px;">
              ${badge('Use cases', {
                textColor: '#231511',
                border: 'rgba(35,21,17,0.14)',
                background: 'rgba(255,255,255,0.88)'
              })}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:410px;display:grid;grid-template-columns:0.95fr 1.05fr;gap:22px;align-items:start;">
              <div>
                <h2 style="font-family:${DISPLAY};font-size:94px;font-weight:700;line-height:0.97;color:#231511;margin:0 0 24px;max-width:430px;">
                  This is for the upgrade you keep meaning to make.
                </h2>
                <p style="font-family:${SANS};font-size:32px;line-height:1.34;color:#4a3530;margin:0 0 26px;">
                  The photos can work for more than one thing at once.
                </p>
                <div style="display:flex;gap:12px;flex-wrap:wrap;max-width:420px;">
                  ${['Instagram refresh', 'Dating profile', 'Portfolio', 'Creator page', 'Personal brand'].map(item => `
                    <span style="padding:14px 18px;border-radius:999px;background:#231511;color:white;font-family:${CONDENSED};font-size:21px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;">${item}</span>
                  `).join('')}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:380px;gap:16px;">
                <img src="${images.arcade}" style="width:100%;height:100%;object-fit:cover;border-radius:28px;box-shadow:0 24px 50px rgba(35,21,17,0.14);"/>
                <img src="${images.terracotta}" style="width:100%;height:100%;object-fit:cover;border-radius:28px;box-shadow:0 24px 50px rgba(35,21,17,0.14);"/>
                <img src="${images.shell}" style="width:100%;height:100%;object-fit:cover;border-radius:28px;box-shadow:0 24px 50px rgba(35,21,17,0.14);"/>
                <img src="${images.close}" style="width:100%;height:100%;object-fit:cover;border-radius:28px;box-shadow:0 24px 50px rgba(35,21,17,0.14);"/>
              </div>
            </div>

            ${bottomCue('Now the details')}
          `,
          overlay: grain(0.08)
        })
      },
      {
        name: '04_details',
        html: photoSlide({
          image: images.arcade,
          overlay: `
            ${gradientPanel('rgba(10,10,10,0.80)', 'rgba(10,10,10,0.28)', 'rgba(10,10,10,0.84)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 86% 16%, rgba(214,94,63,0.18), transparent 20%),
              linear-gradient(135deg, rgba(214,177,111,0.08), transparent 24%);"></div>
            ${grain(0.10)}
          `,
          inner: `
            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('What you get')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:480px;display:grid;gap:18px;max-width:760px;">
              ${[
                '30 to 60 minute shoot',
                '10+ edited photos',
                'Location + outfit guidance',
                'Final gallery in 7 days'
              ].map((item, index) => `
                <div style="display:flex;align-items:center;gap:18px;padding:22px 26px;border-radius:26px;background:rgba(255,255,255,0.10);border:1.5px solid rgba(255,255,255,0.14);backdrop-filter:blur(12px);">
                  <div style="width:48px;height:48px;border-radius:999px;background:#ff8e68;color:#231511;display:flex;align-items:center;justify-content:center;font-family:${CONDENSED};font-size:24px;font-weight:700;">${index + 1}</div>
                  <p style="font-family:${SANS};font-size:34px;line-height:1.34;color:white;margin:0;">${item}</p>
                </div>
              `).join('')}
            </div>

            <div style="position:absolute;left:72px;right:72px;bottom:300px;padding:24px 28px;border-radius:28px;background:rgba(255,142,104,0.18);border:1.5px solid rgba(255,142,104,0.30);backdrop-filter:blur(12px);max-width:760px;">
              <p style="font-family:${SANS};font-size:32px;line-height:1.34;color:white;margin:0;">No hidden fee. No modeling experience required.</p>
            </div>

            ${bottomCue('Last slide')}
          `
        })
      },
      {
        name: '05_scarcity',
        html: frame({
          background: '#120908',
          content: `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 16% 18%, rgba(214,94,63,0.18), transparent 18%),
              linear-gradient(180deg, rgba(18,9,8,0.98), rgba(18,9,8,1));"></div>

            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('Why act now')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:470px;display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;">
              <div style="padding:34px;border-radius:32px;background:#f7efe8;box-shadow:0 28px 60px rgba(0,0,0,0.14);">
                <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#b14f2f;margin:0 0 18px;">Limited round</p>
                <h2 style="font-family:${DISPLAY};font-size:86px;font-weight:700;line-height:0.97;color:#261612;margin:0 0 18px;">
                  I only take a small number of collab sessions at a time.
                </h2>
                <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:#4c3530;margin:0;">
                  When the round fills, the free offer closes and you miss this batch.
                </p>
              </div>
              <div style="display:grid;gap:18px;">
                <div style="padding:30px;border-radius:32px;background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));border:1.5px solid rgba(255,255,255,0.10);">
                  <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#ff8e68;margin:0 0 16px;">Easy yes</p>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:white;margin:0;">
                    The next step is just a quick intro call to see if we are a fit.
                  </p>
                </div>
                <div style="padding:30px;border-radius:32px;background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));border:1.5px solid rgba(255,255,255,0.10);">
                  <p style="font-family:${CONDENSED};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#ff8e68;margin:0 0 16px;">No pressure</p>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:white;margin:0;">
                    If it is not a fit, we do not book. Simple.
                  </p>
                </div>
              </div>
            </div>

            ${bottomCue('Take the next step')}
          `,
          overlay: grain(0.12)
        })
      },
      {
        name: '06_close',
        html: photoSlide({
          image: images.close,
          overlay: `
            ${gradientPanel('rgba(9,9,9,0.74)', 'rgba(9,9,9,0.20)', 'rgba(9,9,9,0.82)')}
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 20% 80%, rgba(214,94,63,0.16), transparent 20%),
              linear-gradient(135deg, rgba(255,142,104,0.10), transparent 28%);"></div>
            ${grain(0.10)}
          `,
          inner: `
            <div style="position:absolute;top:220px;left:72px;right:72px;">
              ${badge('Call to action')}
            </div>

            <div style="position:absolute;left:72px;right:72px;top:560px;">
              <h2 style="font-family:${DISPLAY};font-size:112px;font-weight:700;line-height:0.95;color:white;margin:0 0 30px;max-width:840px;${titleShadow}">
                Tap Learn More and lock in the intro call.
              </h2>
              <p style="font-family:${SANS};font-size:36px;line-height:1.36;color:rgba(255,255,255,0.88);margin:0;max-width:740px;${bodyShadow}">
                If you want the free collab slot, this is the moment to grab it.
              </p>
            </div>

            <div style="position:absolute;left:72px;right:72px;bottom:285px;padding:26px 30px;border-radius:30px;background:rgba(255,255,255,0.10);border:1.5px solid rgba(255,255,255,0.14);backdrop-filter:blur(14px);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:${CONDENSED};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:white;">Claim free session</span>
              <span style="font-family:${CONDENSED};font-size:34px;font-weight:700;color:#ff8e68;">→</span>
            </div>
          `
        })
      }
    ]
  }
]

async function render() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  })

  for (const story of stories) {
    const storyDir = path.join(OUT, story.folder)
    fs.mkdirSync(storyDir, { recursive: true })

    for (const slide of story.slides) {
      const page = await context.newPage()
      await page.setContent(
        `<!DOCTYPE html><html><head><style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1080px; height: 1920px; background: #000; }
          body { overflow: hidden; }
          img { display: block; }
        </style></head><body>${slide.html}</body></html>`,
        { waitUntil: 'load' }
      )
      await page.waitForTimeout(350)
      const outPath = path.join(storyDir, `${slide.name}.png`)
      await page.screenshot({ path: outPath, type: 'png' })
      await page.close()
      console.log(`✓ ${story.folder}/${slide.name}.png`)
    }
  }

  await browser.close()
  console.log(`\nDone. Rendered ${stories.reduce((sum, story) => sum + story.slides.length, 0)} slides into ${OUT}`)
}

render()
