import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

const DISPLAY = "'Didot', 'Bodoni MT', 'Times New Roman', serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"

const photos = {
  hero: toDataUri('manila-hero-dsc-0898.jpg'),
  stone: toDataUri('manila-gallery-dsc-0075.jpg'),
  closeup: toDataUri('manila-gallery-dsc-0130.jpg'),
  redwall: toDataUri('manila-gallery-dsc-0190.jpg'),
  arcade: toDataUri('manila-gallery-dsc-0911.jpg')
}

function toDataUri(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function frame(html, background = '#111') {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${background};">
      ${html}
    </div>
  `
}

function photoFrame(image, overlay, content) {
  return frame(`
    <img src="${image}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
    ${overlay}
    ${content}
  `)
}

function chip(label, opts = {}) {
  const text = opts.text || 'white'
  const border = opts.border || 'rgba(255,255,255,0.35)'
  const bg = opts.bg || 'rgba(255,255,255,0.1)'
  return `
    <div style="display:inline-flex;align-items:center;gap:10px;padding:11px 18px;border-radius:999px;background:${bg};border:1.5px solid ${border};backdrop-filter:blur(8px);">
      <span style="width:7px;height:7px;border-radius:99px;background:${text};display:block;"></span>
      <span style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:${text};">${label}</span>
    </div>
  `
}

function footer(text, light = true) {
  return `
    <div style="position:absolute;left:0;right:0;bottom:150px;text-align:center;">
      <span style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${light ? 'rgba(255,255,255,0.68)' : 'rgba(10,10,10,0.45)'};">${text}</span>
    </div>
  `
}

function grain(opacity = 0.1) {
  return `
    <div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
      radial-gradient(circle at 12% 15%, rgba(255,255,255,0.45), transparent 16%),
      radial-gradient(circle at 80% 12%, rgba(255,255,255,0.25), transparent 14%),
      radial-gradient(circle at 40% 82%, rgba(255,255,255,0.2), transparent 18%),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 4px);"></div>
  `
}

const titleShadow = 'text-shadow:0 3px 16px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.75);'
const bodyShadow = 'text-shadow:0 2px 10px rgba(0,0,0,0.6);'

const funnels = [
  {
    folder: 'funnel-01_fun-free-shoot',
    slides: [
      {
        name: '01_hook',
        html: photoFrame(
          photos.arcade,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,13,31,0.78) 0%, rgba(8,13,31,0.24) 45%, rgba(8,13,31,0.86) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 84% 16%, rgba(95,166,255,0.24), transparent 18%),
              radial-gradient(circle at 12% 86%, rgba(255,208,120,0.22), transparent 17%);"></div>
            ${grain(0.12)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Free Manila Collab')}</div>
            <div style="position:absolute;left:68px;right:68px;top:540px;">
              <h1 style="font-family:${DISPLAY};font-size:114px;line-height:0.95;color:white;margin:0;max-width:820px;${titleShadow}">
                Free Manila photoshoot? Yup, for real.
              </h1>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:350px;">
              <p style="font-family:${SANS};font-size:36px;line-height:1.33;color:rgba(255,255,255,0.94);margin:0;max-width:760px;${bodyShadow}">
                Fun shoot, guided posing, edited photos, zero fee.
              </p>
            </div>
            ${footer('See the details')}
          `
        )
      },
      {
        name: '02_opportunity',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #f2f8ff 0%, #e8f1ff 100%),
              radial-gradient(circle at 10% 14%, rgba(95,166,255,0.25), transparent 20%),
              radial-gradient(circle at 84% 84%, rgba(255,208,120,0.24), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Great for', { text: '#18305e', border: 'rgba(24,48,94,0.2)', bg: 'rgba(255,255,255,0.78)' })}</div>
            <div style="position:absolute;left:68px;right:68px;top:430px;">
              <h2 style="font-family:${DISPLAY};font-size:90px;line-height:0.96;color:#122347;margin:0 0 24px;max-width:820px;">
                New pics for IG, dating, or just because.
              </h2>
              <div style="display:grid;gap:14px;">
                ${[
                  'Want photos that actually look like your vibe.',
                  'Need a fresh profile update without paying right now.',
                  'Never done a shoot and want it to feel easy.'
                ].map(item => `
                  <div style="padding:20px 22px;border-radius:22px;background:white;border:1.5px solid rgba(18,35,71,0.09);box-shadow:0 14px 26px rgba(18,35,71,0.08);">
                    <p style="font-family:${SANS};font-size:32px;line-height:1.33;color:#28427b;margin:0;">${item}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ${footer('Offer next', false)}
            ${grain(0.08)}
          `,
          '#e8f1ff'
        )
      },
      {
        name: '03_limited-offer',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(7,14,35,0.98) 0%, rgba(7,14,35,1) 100%),
              radial-gradient(circle at 83% 15%, rgba(95,166,255,0.25), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;display:flex;justify-content:space-between;align-items:center;">
              ${chip('Limited Time Batch')}
              <span style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);">This month</span>
            </div>
            <div style="position:absolute;left:68px;right:68px;top:420px;">
              <h2 style="font-family:${DISPLAY};font-size:96px;line-height:0.95;color:white;margin:0 0 22px;max-width:830px;">
                I am opening a small batch of free collab sessions.
              </h2>
              <p style="font-family:${SANS};font-size:33px;line-height:1.33;color:rgba(255,255,255,0.82);margin:0;max-width:760px;">
                Once the slots fill, this offer closes.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:315px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <img src="${photos.redwall}" style="width:100%;height:430px;object-fit:cover;border-radius:22px;box-shadow:0 20px 44px rgba(0,0,0,0.24);"/>
              <img src="${photos.closeup}" style="width:100%;height:430px;object-fit:cover;border-radius:22px;box-shadow:0 20px 44px rgba(0,0,0,0.24);"/>
            </div>
            ${footer('What you get')}
            ${grain(0.1)}
          `,
          '#070e23'
        )
      },
      {
        name: '04_what-you-get',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #fff7ef 0%, #fdf0e2 100%),
              radial-gradient(circle at 84% 16%, rgba(255,166,120,0.25), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Included', { text: '#3a1f07', border: 'rgba(58,31,7,0.2)', bg: 'rgba(255,255,255,0.82)' })}</div>
            <div style="position:absolute;left:68px;right:68px;top:430px;display:grid;grid-template-columns:1.02fr 0.98fr;gap:18px;">
              <div>
                <h2 style="font-family:${DISPLAY};font-size:88px;line-height:0.96;color:#2f1805;margin:0 0 20px;">Simple and high value.</h2>
                <div style="display:grid;gap:13px;">
                  ${[
                    '30 to 60 minute shoot in Manila',
                    '10+ edited photos',
                    'Help with location and outfit',
                    'Final gallery in 7 days'
                  ].map(item => `
                    <div style="padding:19px 21px;border-radius:20px;background:white;border:1.5px solid rgba(47,24,5,0.08);box-shadow:0 12px 24px rgba(47,24,5,0.08);">
                      <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:#663612;margin:0;">${item}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:14px;">
                <img src="${photos.stone}" style="width:100%;height:320px;object-fit:cover;border-radius:22px;box-shadow:0 18px 30px rgba(47,24,5,0.12);"/>
                <div style="padding:24px;border-radius:24px;background:#2f1805;color:white;box-shadow:0 20px 40px rgba(47,24,5,0.2);">
                  <p style="font-family:${DISPLAY};font-size:60px;line-height:0.98;margin:0 0 14px;">No experience needed.</p>
                  <p style="font-family:${SANS};font-size:30px;line-height:1.33;color:rgba(255,255,255,0.82);margin:0;">
                    I guide you the whole time so it feels natural and fun.
                  </p>
                </div>
              </div>
            </div>
            ${footer('How to claim', false)}
            ${grain(0.07)}
          `,
          '#fdf0e2'
        )
      },
      {
        name: '05_easy-steps',
        html: photoFrame(
          photos.hero,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,13,31,0.8) 0%, rgba(8,13,31,0.28) 44%, rgba(8,13,31,0.88) 100%);"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 83% 15%, rgba(95,166,255,0.22), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('3 easy steps')}</div>
            <div style="position:absolute;left:68px;right:68px;top:500px;display:grid;gap:14px;max-width:790px;">
              ${[
                ['1', 'Tap Learn More and pick a quick intro-call time.'],
                ['2', 'We plan your vibe, location, and outfit.'],
                ['3', 'Show up, shoot, get edited photos in 7 days.']
              ].map(([num, text]) => `
                <div style="display:flex;align-items:center;gap:16px;padding:18px 20px;border-radius:20px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(8px);">
                  <div style="width:44px;height:44px;border-radius:99px;background:#5fa6ff;color:#0d1a3f;display:flex;align-items:center;justify-content:center;font-family:${NARROW};font-size:24px;font-weight:700;">${num}</div>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:white;margin:0;">${text}</p>
                </div>
              `).join('')}
            </div>
            ${footer('Final slide')}
          `
        )
      },
      {
        name: '06_cta',
        html: photoFrame(
          photos.redwall,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,13,31,0.8) 0%, rgba(8,13,31,0.24) 44%, rgba(8,13,31,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 84% 16%, rgba(95,166,255,0.22), transparent 18%),
              radial-gradient(circle at 12% 86%, rgba(255,208,120,0.2), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Limited free slots')}</div>
            <div style="position:absolute;left:68px;right:68px;top:560px;">
              <h2 style="font-family:${DISPLAY};font-size:108px;line-height:0.94;color:white;margin:0 0 22px;max-width:830px;${titleShadow}">
                Tap Learn More and grab your free shoot slot.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${bodyShadow}">
                This batch is first come, first served.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:280px;padding:24px 28px;border-radius:26px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(8px);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:${NARROW};font-size:25px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:white;">Claim free slot</span>
              <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:#5fa6ff;">-></span>
            </div>
          `
        )
      }
    ]
  },
  {
    folder: 'funnel-02_social-glow-up',
    slides: [
      {
        name: '01_hook',
        html: photoFrame(
          photos.closeup,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(6,20,13,0.8) 0%, rgba(6,20,13,0.28) 44%, rgba(6,20,13,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 16%, rgba(98,255,184,0.24), transparent 18%),
              radial-gradient(circle at 14% 86%, rgba(255,255,255,0.12), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Social Glow Up')}</div>
            <div style="position:absolute;left:68px;right:68px;top:560px;">
              <h1 style="font-family:${DISPLAY};font-size:111px;line-height:0.95;color:white;margin:0 0 22px;max-width:830px;${titleShadow}">
                Your profile can look way better by next week.
              </h1>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${bodyShadow}">
                Free shoot. Fast edits. Real glow up.
              </p>
            </div>
            ${footer('Why it works')}
          `
        )
      },
      {
        name: '02_vibe-shift',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #ecfff5 0%, #e3f9ef 100%),
              radial-gradient(circle at 12% 14%, rgba(98,255,184,0.26), transparent 20%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('The difference', { text: '#0f3625', border: 'rgba(15,54,37,0.2)', bg: 'rgba(255,255,255,0.8)' })}</div>
            <div style="position:absolute;left:68px;right:68px;top:430px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div style="padding:24px;border-radius:22px;background:white;border:1.5px solid rgba(15,54,37,0.08);box-shadow:0 14px 26px rgba(15,54,37,0.08);">
                <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#1fbf7a;margin:0 0 10px;">Before</p>
                <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:#28503e;margin:0;">Random photos, mixed quality, no clear vibe.</p>
              </div>
              <div style="padding:24px;border-radius:22px;background:#0f3625;color:white;box-shadow:0 16px 30px rgba(15,54,37,0.16);">
                <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#75ffca;margin:0 0 10px;">After</p>
                <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:rgba(255,255,255,0.86);margin:0;">Clean, confident photos that feel intentional.</p>
              </div>
            </div>
            <div style="position:absolute;left:68px;right:68px;top:760px;padding:22px 24px;border-radius:22px;background:white;border:1.5px solid rgba(15,54,37,0.08);box-shadow:0 14px 26px rgba(15,54,37,0.08);">
              <h2 style="font-family:${DISPLAY};font-size:86px;line-height:0.96;color:#143e2b;margin:0 0 12px;">Same you. Better signal.</h2>
              <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:#2f654d;margin:0;">That is the whole point of this free collab batch.</p>
            </div>
            ${footer('Offer next', false)}
            ${grain(0.08)}
          `,
          '#e3f9ef'
        )
      },
      {
        name: '03_offer',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(6,22,14,0.98) 0%, rgba(6,22,14,1) 100%),
              radial-gradient(circle at 83% 16%, rgba(98,255,184,0.24), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Limited this month')}</div>
            <div style="position:absolute;left:68px;right:68px;top:430px;">
              <h2 style="font-family:${DISPLAY};font-size:94px;line-height:0.95;color:white;margin:0 0 20px;max-width:830px;">
                Free Manila collab sessions are open now.
              </h2>
              <p style="font-family:${SANS};font-size:33px;line-height:1.33;color:rgba(255,255,255,0.82);margin:0;max-width:760px;">
                I only accept a small number of people each batch.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:320px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <img src="${photos.arcade}" style="width:100%;height:430px;object-fit:cover;border-radius:22px;box-shadow:0 20px 44px rgba(0,0,0,0.24);"/>
              <img src="${photos.stone}" style="width:100%;height:430px;object-fit:cover;border-radius:22px;box-shadow:0 20px 44px rgba(0,0,0,0.24);"/>
            </div>
            ${footer('No stress process')}
            ${grain(0.1)}
          `,
          '#06160e'
        )
      },
      {
        name: '04_no-stress',
        html: photoFrame(
          photos.hero,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(6,20,13,0.8) 0%, rgba(6,20,13,0.24) 43%, rgba(6,20,13,0.88) 100%);"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 82% 16%, rgba(98,255,184,0.2), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('No awkward vibes')}</div>
            <div style="position:absolute;left:68px;right:68px;top:520px;">
              <h2 style="font-family:${DISPLAY};font-size:102px;line-height:0.94;color:white;margin:0 0 20px;max-width:830px;${titleShadow}">
                You do not need to know how to pose.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0 0 20px;max-width:760px;${bodyShadow}">
                I direct the entire flow so you can relax and have fun.
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:12px;max-width:780px;">
                ${['Guided posing', 'Outfit help', 'Easy direction', 'Fast turnarounds'].map(item => `
                  <span style="padding:13px 16px;border-radius:99px;background:rgba(255,255,255,0.14);border:1.5px solid rgba(255,255,255,0.18);font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;color:white;">${item}</span>
                `).join('')}
              </div>
            </div>
            ${footer('Included items')}
          `
        )
      },
      {
        name: '05_included',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #f9fff9 0%, #eefbf1 100%),
              radial-gradient(circle at 84% 16%, rgba(98,255,184,0.2), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('You get', { text: '#13432f', border: 'rgba(19,67,47,0.2)', bg: 'rgba(255,255,255,0.82)' })}</div>
            <div style="position:absolute;left:68px;right:68px;top:420px;display:grid;gap:13px;">
              ${[
                '30 to 60 minute Manila shoot',
                '10+ edited photos',
                'Location and outfit planning',
                'Gallery delivered in 7 days'
              ].map(item => `
                <div style="padding:20px 22px;border-radius:20px;background:white;border:1.5px solid rgba(19,67,47,0.08);box-shadow:0 12px 24px rgba(19,67,47,0.08);display:flex;align-items:center;gap:14px;">
                  <div style="width:16px;height:16px;border-radius:99px;background:#27d68d;flex-shrink:0;"></div>
                  <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:#2f6950;margin:0;">${item}</p>
                </div>
              `).join('')}
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:320px;padding:22px 24px;border-radius:22px;background:#13432f;color:white;box-shadow:0 16px 30px rgba(19,67,47,0.16);">
              <p style="font-family:${DISPLAY};font-size:68px;line-height:0.96;margin:0 0 10px;">Zero cost. Limited time.</p>
              <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:rgba(255,255,255,0.84);margin:0;">When this batch fills, free slots are gone.</p>
            </div>
            ${footer('Final CTA', false)}
            ${grain(0.07)}
          `,
          '#eefbf1'
        )
      },
      {
        name: '06_cta',
        html: photoFrame(
          photos.closeup,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(6,20,13,0.82) 0%, rgba(6,20,13,0.25) 44%, rgba(6,20,13,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 16%, rgba(98,255,184,0.22), transparent 18%),
              radial-gradient(circle at 12% 86%, rgba(255,255,255,0.1), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Last slots')}</div>
            <div style="position:absolute;left:68px;right:68px;top:570px;">
              <h2 style="font-family:${DISPLAY};font-size:107px;line-height:0.94;color:white;margin:0 0 20px;max-width:830px;${titleShadow}">
                Tap Learn More and lock your free session.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${bodyShadow}">
                Easy intro call first, then we plan the shoot.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:280px;padding:24px 28px;border-radius:26px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(8px);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:${NARROW};font-size:25px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:white;">Book intro call</span>
              <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:#62ffb8;">-></span>
            </div>
          `
        )
      }
    ]
  },
  {
    folder: 'funnel-03_last-chance-vibes',
    slides: [
      {
        name: '01_hook',
        html: photoFrame(
          photos.redwall,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(30,11,8,0.8) 0%, rgba(30,11,8,0.26) 45%, rgba(30,11,8,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 16%, rgba(255,127,96,0.25), transparent 18%),
              radial-gradient(circle at 14% 86%, rgba(255,220,167,0.22), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Limited time')}</div>
            <div style="position:absolute;left:68px;right:68px;top:550px;">
              <h1 style="font-family:${DISPLAY};font-size:112px;line-height:0.95;color:white;margin:0 0 20px;max-width:830px;${titleShadow}">
                This is your sign to finally do the shoot.
              </h1>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${bodyShadow}">
                Free Manila collab slots are almost full.
              </p>
            </div>
            ${footer('Offer recap')}
          `
        )
      },
      {
        name: '02_recap',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #fff5f2 0%, #fdeae5 100%),
              radial-gradient(circle at 14% 14%, rgba(255,127,96,0.25), transparent 20%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Quick recap', { text: '#4a1c14', border: 'rgba(74,28,20,0.2)', bg: 'rgba(255,255,255,0.82)' })}</div>
            <div style="position:absolute;left:68px;right:68px;top:430px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              ${[
                ['Free session', 'No fee. This is a collab batch.'],
                ['Directed shoot', 'I guide you the whole time.'],
                ['Edited gallery', '10+ final photos in 7 days.'],
                ['Limited spots', 'Batch closes when full.']
              ].map(([title, copy]) => `
                <div style="padding:22px 24px;border-radius:22px;background:white;border:1.5px solid rgba(74,28,20,0.08);box-shadow:0 14px 26px rgba(74,28,20,0.08);">
                  <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#d45f46;margin:0 0 10px;">${title}</p>
                  <p style="font-family:${SANS};font-size:30px;line-height:1.33;color:#6f352a;margin:0;">${copy}</p>
                </div>
              `).join('')}
            </div>
            ${footer('Real examples', false)}
            ${grain(0.08)}
          `,
          '#fdeae5'
        )
      },
      {
        name: '03_examples',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(28,10,8,0.98) 0%, rgba(28,10,8,1) 100%),
              radial-gradient(circle at 83% 16%, rgba(255,127,96,0.24), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Real session energy')}</div>
            <div style="position:absolute;left:68px;right:68px;top:410px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:380px;gap:14px;">
              <img src="${photos.arcade}" style="width:100%;height:100%;object-fit:cover;border-radius:22px;box-shadow:0 18px 36px rgba(0,0,0,0.24);"/>
              <img src="${photos.redwall}" style="width:100%;height:100%;object-fit:cover;border-radius:22px;box-shadow:0 18px 36px rgba(0,0,0,0.24);"/>
              <img src="${photos.stone}" style="width:100%;height:100%;object-fit:cover;border-radius:22px;box-shadow:0 18px 36px rgba(0,0,0,0.24);"/>
              <img src="${photos.closeup}" style="width:100%;height:100%;object-fit:cover;border-radius:22px;box-shadow:0 18px 36px rgba(0,0,0,0.24);"/>
            </div>
            ${footer('Who should apply')}
            ${grain(0.1)}
          `,
          '#1c0a08'
        )
      },
      {
        name: '04_who-apply',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #fff8f4 0%, #fef0e8 100%),
              radial-gradient(circle at 84% 16%, rgba(255,127,96,0.24), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Best fit', { text: '#4e1f17', border: 'rgba(78,31,23,0.2)', bg: 'rgba(255,255,255,0.82)' })}</div>
            <div style="position:absolute;left:68px;right:68px;top:430px;">
              <h2 style="font-family:${DISPLAY};font-size:90px;line-height:0.96;color:#42180f;margin:0 0 20px;max-width:830px;">
                If this sounds like you, jump in now.
              </h2>
              <div style="display:grid;gap:13px;">
                ${[
                  'You want better photos now, not someday.',
                  'You can do a short intro call this week.',
                  'You are open to direction and want great results fast.',
                  'You understand spots are limited and first come first served.'
                ].map(item => `
                  <div style="padding:20px 22px;border-radius:20px;background:white;border:1.5px solid rgba(66,24,15,0.08);box-shadow:0 12px 24px rgba(66,24,15,0.08);">
                    <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:#784130;margin:0;">${item}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ${footer('Last step', false)}
            ${grain(0.07)}
          `,
          '#fef0e8'
        )
      },
      {
        name: '05_fast-step',
        html: photoFrame(
          photos.hero,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(28,10,8,0.8) 0%, rgba(28,10,8,0.24) 43%, rgba(28,10,8,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 83% 16%, rgba(255,127,96,0.22), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Takes 60 seconds')}</div>
            <div style="position:absolute;left:68px;right:68px;top:540px;">
              <h2 style="font-family:${DISPLAY};font-size:104px;line-height:0.94;color:white;margin:0 0 20px;max-width:830px;${titleShadow}">
                Quick intro call first, shoot next.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${bodyShadow}">
                Tap Learn More, choose a time, and secure your chance.
              </p>
            </div>
            ${footer('Final CTA')}
          `
        )
      },
      {
        name: '06_cta',
        html: photoFrame(
          photos.closeup,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(28,10,8,0.82) 0%, rgba(28,10,8,0.24) 44%, rgba(28,10,8,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 16%, rgba(255,127,96,0.24), transparent 18%),
              radial-gradient(circle at 12% 86%, rgba(255,220,167,0.2), transparent 18%);"></div>
            ${grain(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">${chip('Final free spots')}</div>
            <div style="position:absolute;left:68px;right:68px;top:570px;">
              <h2 style="font-family:${DISPLAY};font-size:108px;line-height:0.94;color:white;margin:0 0 20px;max-width:830px;${titleShadow}">
                Tap Learn More now before this free batch closes.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${bodyShadow}">
                You can always skip if it is not a fit after the call.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:280px;padding:24px 28px;border-radius:26px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(8px);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:${NARROW};font-size:25px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:white;">Grab free spot</span>
              <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:#ff7f60;">-></span>
            </div>
          `
        )
      }
    ]
  }
]

function cleanOutputs() {
  const entries = fs.readdirSync(OUT, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('story-') || entry.name.startsWith('funnel-')) {
      fs.rmSync(path.join(OUT, entry.name), { recursive: true, force: true })
    }
  }
}

async function render() {
  cleanOutputs()

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  })

  let total = 0
  for (const funnel of funnels) {
    const outDir = path.join(OUT, funnel.folder)
    fs.mkdirSync(outDir, { recursive: true })

    for (const slide of funnel.slides) {
      total += 1
      const page = await context.newPage()
      await page.setContent(
        `<!doctype html><html><head><style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
          body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        </style></head><body>${slide.html}</body></html>`,
        { waitUntil: 'load' }
      )
      await page.waitForTimeout(280)
      const outPath = path.join(outDir, `${slide.name}.png`)
      await page.screenshot({ path: outPath, type: 'png' })
      await page.close()
      console.log(`Rendered ${funnel.folder}/${slide.name}.png`)
    }
  }

  await browser.close()
  console.log(`Done. Rendered ${total} slides.`)
}

render()
