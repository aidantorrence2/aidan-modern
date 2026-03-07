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
  hero: dataUri('manila-hero-dsc-0898.jpg'),
  stone: dataUri('manila-gallery-dsc-0075.jpg'),
  closeup: dataUri('manila-gallery-dsc-0130.jpg'),
  redwall: dataUri('manila-gallery-dsc-0190.jpg'),
  arcade: dataUri('manila-gallery-dsc-0911.jpg')
}

function dataUri(file) {
  const buf = fs.readFileSync(path.join(IMG_DIR, file))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function chip(label, opts = {}) {
  const text = opts.text || 'white'
  const border = opts.border || 'rgba(255,255,255,0.32)'
  const bg = opts.bg || 'rgba(255,255,255,0.08)'
  return `
    <div style="display:inline-flex;align-items:center;gap:10px;padding:11px 18px;border-radius:999px;background:${bg};border:1.5px solid ${border};backdrop-filter:blur(8px);">
      <span style="width:7px;height:7px;border-radius:99px;background:${text};display:block;"></span>
      <span style="font-family:${NARROW};font-size:21px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${text};">${label}</span>
    </div>
  `
}

function footerCue(text, light = true) {
  return `
    <div style="position:absolute;left:0;right:0;bottom:150px;text-align:center;">
      <span style="font-family:${NARROW};font-size:23px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${light ? 'rgba(255,255,255,0.66)' : 'rgba(12,12,12,0.45)'};">${text}</span>
    </div>
  `
}

function texture(opacity = 0.1) {
  return `
    <div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
      radial-gradient(circle at 12% 16%, rgba(255,255,255,0.45), transparent 16%),
      radial-gradient(circle at 78% 11%, rgba(255,255,255,0.24), transparent 14%),
      radial-gradient(circle at 40% 80%, rgba(255,255,255,0.20), transparent 18%),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 4px);"></div>
  `
}

function frame(inner, background = '#111') {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${background};">
      ${inner}
    </div>
  `
}

function photoFrame(image, overlay, inner) {
  return frame(`
    <img src="${image}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
    ${overlay}
    ${inner}
  `)
}

const H = 'text-shadow:0 4px 18px rgba(0,0,0,0.58), 0 1px 3px rgba(0,0,0,0.8);'
const B = 'text-shadow:0 2px 12px rgba(0,0,0,0.68);'

const funnels = [
  {
    folder: 'funnel-01_profile-conversion',
    slides: [
      {
        name: '01_hook',
        html: photoFrame(
          photos.arcade,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(6,8,14,0.82) 0%, rgba(6,8,14,0.28) 46%, rgba(6,8,14,0.86) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 78% 15%, rgba(74,132,255,0.24), transparent 18%),
              radial-gradient(circle at 10% 88%, rgba(237,174,73,0.24), transparent 16%);"></div>
            ${texture(0.12)}
          `,
          `
            <div style="position:absolute;top:200px;left:68px;right:68px;">
              ${chip('Conversion angle')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:520px;">
              <h1 style="font-family:${DISPLAY};font-size:112px;line-height:0.95;color:white;margin:0;max-width:800px;${H}">
                People decide from your photos before they read your bio.
              </h1>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:350px;">
              <p style="font-family:${SANS};font-size:36px;line-height:1.34;color:rgba(255,255,255,0.94);margin:0;max-width:770px;${B}">
                If your current shots are weak, you lose replies, dates, and opportunities.
              </p>
            </div>
            ${footerCue('Keep going')}
          `
        )
      },
      {
        name: '02_pain',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 9% 14%, rgba(74,132,255,0.18), transparent 20%),
              radial-gradient(circle at 89% 86%, rgba(237,174,73,0.18), transparent 16%),
              linear-gradient(180deg, #f4f6ff 0%, #eceff9 100%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('What weak photos cost', { text: '#18213f', border: 'rgba(24,33,63,0.2)', bg: 'rgba(255,255,255,0.76)' })}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:425px;">
              <h2 style="font-family:${DISPLAY};font-size:94px;line-height:0.96;color:#0f1428;margin:0 0 28px;max-width:820px;">
                You are not being ignored. Your photos are under-selling you.
              </h2>
              <div style="display:grid;gap:15px;">
                ${[
                  ['Dating apps', 'Lower quality matches and fewer meaningful replies.'],
                  ['Instagram', 'People scroll past because your profile looks generic.'],
                  ['Work and brand', 'You look inconsistent, not intentional.']
                ].map(([title, copy]) => `
                  <div style="padding:23px 24px;border-radius:24px;background:white;border:1.5px solid rgba(15,20,40,0.08);box-shadow:0 16px 30px rgba(15,20,40,0.08);">
                    <p style="font-family:${NARROW};font-size:22px;letter-spacing:0.13em;text-transform:uppercase;font-weight:700;color:#3356c4;margin:0 0 10px;">${title}</p>
                    <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:#2b355e;margin:0;">${copy}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ${footerCue('Here is the fix', false)}
            ${texture(0.08)}
          `,
          '#eceff9'
        )
      },
      {
        name: '03_offer',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(8,10,18,0.96) 0%, rgba(8,10,18,1) 100%),
              radial-gradient(circle at 78% 15%, rgba(74,132,255,0.22), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;display:flex;justify-content:space-between;align-items:center;">
              ${chip('Free portrait batch')}
              <span style="font-family:${NARROW};font-size:23px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Manila</span>
            </div>
            <div style="position:absolute;left:68px;right:68px;top:410px;">
              <h2 style="font-family:${DISPLAY};font-size:95px;line-height:0.95;color:white;margin:0 0 24px;max-width:830px;">
                I am opening a free conversion-shoot batch this month.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.34;color:rgba(255,255,255,0.82);margin:0;max-width:810px;">
                You get a directed portrait session built to produce photos that make people respond.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:315px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <img src="${photos.redwall}" style="width:100%;height:430px;object-fit:cover;border-radius:22px;box-shadow:0 20px 48px rgba(0,0,0,0.26);"/>
              <img src="${photos.closeup}" style="width:100%;height:430px;object-fit:cover;border-radius:22px;box-shadow:0 20px 48px rgba(0,0,0,0.26);"/>
            </div>
            ${footerCue('Details next')}
            ${texture(0.1)}
          `,
          '#080a12'
        )
      },
      {
        name: '04_package',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #f9f6f1 0%, #f2ede5 100%),
              radial-gradient(circle at 82% 18%, rgba(237,174,73,0.20), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;display:flex;justify-content:space-between;">
              ${chip('What is included', { text: '#2c2110', border: 'rgba(44,33,16,0.2)', bg: 'rgba(255,255,255,0.78)' })}
              <span style="font-family:${NARROW};font-size:23px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(44,33,16,0.45);">One session</span>
            </div>
            <div style="position:absolute;left:68px;right:68px;top:420px;display:grid;grid-template-columns:1.03fr 0.97fr;gap:18px;">
              <div>
                <h2 style="font-family:${DISPLAY};font-size:88px;line-height:0.96;color:#1f1608;margin:0 0 22px;">Everything needed for strong profile photos.</h2>
                <div style="display:grid;gap:14px;">
                  ${[
                    '30 to 60 minute guided shoot in Manila',
                    '10+ edited selects you can post immediately',
                    'Location and wardrobe planning before shoot day',
                    'Final delivery within 7 days'
                  ].map(item => `
                    <div style="padding:20px 22px;border-radius:21px;background:white;border:1.5px solid rgba(31,22,8,0.08);box-shadow:0 14px 24px rgba(31,22,8,0.07);">
                      <p style="font-family:${SANS};font-size:30px;line-height:1.33;color:#3d2d16;margin:0;">${item}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:14px;">
                <img src="${photos.stone}" style="width:100%;height:300px;object-fit:cover;border-radius:22px;box-shadow:0 18px 30px rgba(31,22,8,0.12);"/>
                <div style="padding:24px;border-radius:24px;background:#1f1608;color:white;box-shadow:0 22px 42px rgba(31,22,8,0.2);">
                  <p style="font-family:${NARROW};font-size:22px;letter-spacing:0.13em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.58);margin:0 0 14px;">Best for</p>
                  <p style="font-family:${DISPLAY};font-size:58px;line-height:0.98;margin:0 0 18px;">Dating profiles. Instagram refresh. Personal brand.</p>
                  <p style="font-family:${SANS};font-size:30px;line-height:1.33;color:rgba(255,255,255,0.78);margin:0;">No shoot experience needed. Direction is provided live.</p>
                </div>
              </div>
            </div>
            ${footerCue('How to claim', false)}
            ${texture(0.06)}
          `,
          '#f2ede5'
        )
      },
      {
        name: '05_steps',
        html: photoFrame(
          photos.hero,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(7,8,12,0.82) 0%, rgba(7,8,12,0.28) 42%, rgba(7,8,12,0.88) 100%);"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 76% 14%, rgba(74,132,255,0.2), transparent 18%);"></div>
            ${texture(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Claim flow')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:445px;">
              <h2 style="font-family:${DISPLAY};font-size:98px;line-height:0.95;color:white;margin:0 0 24px;max-width:830px;${H}">
                Takes about 60 seconds to secure your slot.
              </h2>
              <div style="display:grid;gap:14px;max-width:780px;">
                ${[
                  ['1', 'Tap Learn More and pick a short fit-call slot.'],
                  ['2', 'We align on vibe, outfits, and location.'],
                  ['3', 'Shoot day in Manila. You get guided posing live.'],
                  ['4', 'Edits arrive in your inbox in 7 days.']
                ].map(([num, copy]) => `
                  <div style="display:flex;align-items:center;gap:16px;padding:18px 20px;border-radius:20px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(10px);">
                    <div style="width:44px;height:44px;border-radius:99px;background:#4a84ff;color:#0d1120;display:flex;align-items:center;justify-content:center;font-family:${NARROW};font-size:24px;font-weight:700;">${num}</div>
                    <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:white;margin:0;">${copy}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ${footerCue('Final step')}
          `
        )
      },
      {
        name: '06_cta',
        html: photoFrame(
          photos.redwall,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,10,18,0.80) 0%, rgba(8,10,18,0.24) 44%, rgba(8,10,18,0.88) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 14% 84%, rgba(74,132,255,0.20), transparent 20%),
              radial-gradient(circle at 85% 17%, rgba(237,174,73,0.18), transparent 18%);"></div>
            ${texture(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Action now')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:560px;">
              <h2 style="font-family:${DISPLAY};font-size:106px;line-height:0.94;color:white;margin:0 0 24px;max-width:830px;${H}">
                If you want stronger responses, apply today.
              </h2>
              <p style="font-family:${SANS};font-size:35px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${B}">
                Tap Learn More and secure a fit call before this free batch closes.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:280px;padding:24px 28px;border-radius:26px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:space-between;">
              <span style="font-family:${NARROW};font-size:25px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:white;">Apply for free batch</span>
              <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:#4a84ff;">-></span>
            </div>
          `
        )
      }
    ]
  },
  {
    folder: 'funnel-02_signal-upgrade',
    slides: [
      {
        name: '01_hook',
        html: photoFrame(
          photos.closeup,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(4,20,15,0.82) 0%, rgba(4,20,15,0.30) 46%, rgba(4,20,15,0.88) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 17%, rgba(66,255,177,0.20), transparent 18%),
              radial-gradient(circle at 12% 84%, rgba(255,255,255,0.12), transparent 16%);"></div>
            ${texture(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Signal upgrade')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:540px;">
              <h1 style="font-family:${DISPLAY};font-size:111px;line-height:0.95;color:white;margin:0 0 24px;max-width:830px;${H}">
                You are not bad on camera. Your current photos are just not converting.
              </h1>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${B}">
                A better image set changes how people rank you instantly.
              </p>
            </div>
            ${footerCue('Diagnose it')}
          `
        )
      },
      {
        name: '02_diagnose',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #edfdf5 0%, #e4f7ef 100%),
              radial-gradient(circle at 14% 18%, rgba(66,255,177,0.24), transparent 20%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Quick self-check', { text: '#0f2d20', border: 'rgba(15,45,32,0.2)', bg: 'rgba(255,255,255,0.76)' })}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:420px;">
              <h2 style="font-family:${DISPLAY};font-size:90px;line-height:0.96;color:#10271e;margin:0 0 24px;max-width:830px;">
                If two or more are true, your photo stack is costing you.
              </h2>
              <div style="display:grid;gap:14px;">
                ${[
                  'You avoid posting because you dislike your current shots.',
                  'Your dating profile gets views but low message quality.',
                  'Your profile looks random, not intentional.',
                  'You have no recent portrait that feels premium.'
                ].map(item => `
                  <div style="padding:20px 22px;border-radius:21px;background:white;border:1.5px solid rgba(16,39,30,0.08);box-shadow:0 14px 26px rgba(16,39,30,0.08);display:flex;gap:14px;align-items:flex-start;">
                    <div style="width:18px;height:18px;border-radius:99px;background:#1dc77f;flex-shrink:0;margin-top:10px;"></div>
                    <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:#204133;margin:0;">${item}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ${footerCue('Offer next', false)}
            ${texture(0.08)}
          `,
          '#e4f7ef'
        )
      },
      {
        name: '03_offer',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(6,20,14,0.98) 0%, rgba(6,20,14,1) 100%),
              radial-gradient(circle at 88% 14%, rgba(66,255,177,0.22), transparent 20%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;display:flex;justify-content:space-between;align-items:center;">
              ${chip('Free upgrade batch')}
              <span style="font-family:${NARROW};font-size:23px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.45);">BGC and Makati</span>
            </div>
            <div style="position:absolute;left:68px;right:68px;top:410px;">
              <h2 style="font-family:${DISPLAY};font-size:92px;line-height:0.95;color:white;margin:0 0 22px;max-width:830px;">
                I am running free Manila shoots for people who need a serious profile reset.
              </h2>
              <p style="font-family:${SANS};font-size:33px;line-height:1.34;color:rgba(255,255,255,0.8);margin:0;max-width:790px;">
                The mission is simple: produce a photo stack that makes your value obvious.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:310px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <img src="${photos.arcade}" style="width:100%;height:440px;object-fit:cover;border-radius:22px;box-shadow:0 20px 44px rgba(0,0,0,0.24);"/>
              <img src="${photos.stone}" style="width:100%;height:440px;object-fit:cover;border-radius:22px;box-shadow:0 20px 44px rgba(0,0,0,0.24);"/>
            </div>
            ${footerCue('Risk reversal next')}
            ${texture(0.11)}
          `,
          '#06140e'
        )
      },
      {
        name: '04_risk-reversal',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #f6fff9 0%, #ebfaf1 100%),
              radial-gradient(circle at 82% 14%, rgba(66,255,177,0.20), transparent 18%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Zero-risk step', { text: '#173c2c', border: 'rgba(23,60,44,0.2)', bg: 'rgba(255,255,255,0.76)' })}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:420px;display:grid;grid-template-columns:1.01fr 0.99fr;gap:18px;">
              <div style="padding:28px;border-radius:26px;background:#173c2c;color:white;box-shadow:0 22px 46px rgba(23,60,44,0.18);">
                <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:rgba(255,255,255,0.56);margin:0 0 14px;">Why this works</p>
                <h2 style="font-family:${DISPLAY};font-size:78px;line-height:0.95;margin:0 0 18px;">You only commit to a short fit call first.</h2>
                <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(255,255,255,0.8);margin:0;">
                  If the style and goals do not align, you walk away. No pressure.
                </p>
              </div>
              <div style="display:grid;gap:14px;">
                ${[
                  ['Step 1', 'Pick a call slot from the Learn More page.'],
                  ['Step 2', 'We align on your target outcome.'],
                  ['Step 3', 'If it fits, we lock your free session.']
                ].map(([title, copy]) => `
                  <div style="padding:20px 22px;border-radius:21px;background:white;border:1.5px solid rgba(23,60,44,0.08);box-shadow:0 14px 28px rgba(23,60,44,0.08);">
                    <p style="font-family:${NARROW};font-size:22px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:#1dc77f;margin:0 0 10px;">${title}</p>
                    <p style="font-family:${SANS};font-size:30px;line-height:1.33;color:#245039;margin:0;">${copy}</p>
                  </div>
                `).join('')}
                <img src="${photos.redwall}" style="width:100%;height:280px;object-fit:cover;border-radius:21px;box-shadow:0 14px 28px rgba(23,60,44,0.12);"/>
              </div>
            </div>
            ${footerCue('Qualify next', false)}
            ${texture(0.06)}
          `,
          '#ebfaf1'
        )
      },
      {
        name: '05_qualify',
        html: photoFrame(
          photos.hero,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(4,20,15,0.82) 0%, rgba(4,20,15,0.30) 44%, rgba(4,20,15,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 16% 84%, rgba(66,255,177,0.18), transparent 20%);"></div>
            ${texture(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Who should apply')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:500px;">
              <h2 style="font-family:${DISPLAY};font-size:94px;line-height:0.95;color:white;margin:0 0 22px;max-width:820px;${H}">
                This is for people ready to show up and execute.
              </h2>
              <div style="display:grid;gap:12px;max-width:790px;">
                ${[
                  'You want high-quality images now, not someday.',
                  'You can make time for one short call and one shoot.',
                  'You are open to direction so we can get results fast.'
                ].map(item => `
                  <div style="padding:18px 20px;border-radius:20px;background:rgba(255,255,255,0.11);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(8px);">
                    <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:white;margin:0;">${item}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ${footerCue('Final call')}
          `
        )
      },
      {
        name: '06_cta',
        html: photoFrame(
          photos.closeup,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(4,20,15,0.84) 0%, rgba(4,20,15,0.30) 43%, rgba(4,20,15,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 14%, rgba(66,255,177,0.22), transparent 18%),
              radial-gradient(circle at 12% 86%, rgba(255,255,255,0.10), transparent 16%);"></div>
            ${texture(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Claim slot')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:580px;">
              <h2 style="font-family:${DISPLAY};font-size:106px;line-height:0.94;color:white;margin:0 0 22px;max-width:840px;${H}">
                Tap Learn More and submit for this free batch.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.88);margin:0;max-width:760px;${B}">
                The entry step is a short fit call. If we are aligned, you are in.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:280px;padding:24px 28px;border-radius:26px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(10px);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:${NARROW};font-size:25px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:white;">Start fit call</span>
              <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:#42ffb1;">-></span>
            </div>
          `
        )
      }
    ]
  },
  {
    folder: 'funnel-03_last-call',
    slides: [
      {
        name: '01_hook',
        html: photoFrame(
          photos.redwall,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(30,10,6,0.82) 0%, rgba(30,10,6,0.28) 44%, rgba(30,10,6,0.88) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 13%, rgba(255,125,90,0.24), transparent 18%),
              radial-gradient(circle at 12% 86%, rgba(255,228,169,0.20), transparent 18%);"></div>
            ${texture(0.11)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Retargeting angle')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:540px;">
              <h1 style="font-family:${DISPLAY};font-size:112px;line-height:0.95;color:white;margin:0 0 24px;max-width:830px;${H}">
                Last open free batch before I close bookings.
              </h1>
              <p style="font-family:${SANS};font-size:35px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:760px;${B}">
                If you have been waiting, this is the window.
              </p>
            </div>
            ${footerCue('What you get')}
          `
        )
      },
      {
        name: '02_offer-stack',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #fff3ef 0%, #f8e8e2 100%),
              radial-gradient(circle at 15% 18%, rgba(255,125,90,0.20), transparent 20%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Offer stack', { text: '#3d130d', border: 'rgba(61,19,13,0.2)', bg: 'rgba(255,255,255,0.78)' })}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:420px;display:grid;grid-template-columns:0.98fr 1.02fr;gap:18px;">
              <div style="padding:28px;border-radius:26px;background:#3d130d;color:white;box-shadow:0 24px 44px rgba(61,19,13,0.2);">
                <h2 style="font-family:${DISPLAY};font-size:82px;line-height:0.95;margin:0 0 18px;">One shoot can reset your whole profile.</h2>
                <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(255,255,255,0.82);margin:0 0 16px;">
                  Shoot length: 30 to 60 minutes.
                </p>
                <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(255,255,255,0.82);margin:0 0 16px;">
                  Delivery: 10+ edited selects in 7 days.
                </p>
                <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(255,255,255,0.82);margin:0;">
                  Support: location and outfit planning before shoot day.
                </p>
              </div>
              <div style="display:grid;gap:14px;">
                <img src="${photos.arcade}" style="width:100%;height:290px;object-fit:cover;border-radius:22px;box-shadow:0 16px 30px rgba(61,19,13,0.12);"/>
                <img src="${photos.stone}" style="width:100%;height:290px;object-fit:cover;border-radius:22px;box-shadow:0 16px 30px rgba(61,19,13,0.12);"/>
                <img src="${photos.closeup}" style="width:100%;height:290px;object-fit:cover;border-radius:22px;box-shadow:0 16px 30px rgba(61,19,13,0.12);"/>
              </div>
            </div>
            ${footerCue('How easy is it?', false)}
            ${texture(0.08)}
          `,
          '#f8e8e2'
        )
      },
      {
        name: '03_no-model-needed',
        html: photoFrame(
          photos.stone,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(27,10,8,0.82) 0%, rgba(27,10,8,0.28) 45%, rgba(27,10,8,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 16% 84%, rgba(255,125,90,0.22), transparent 20%);"></div>
            ${texture(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Direction included')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:510px;">
              <h2 style="font-family:${DISPLAY};font-size:104px;line-height:0.94;color:white;margin:0 0 22px;max-width:830px;${H}">
                No model background required.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0 0 24px;max-width:760px;${B}">
                I coach posture, angle, expression, and pacing in real time.
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:12px;max-width:780px;">
                ${['Pose guidance', 'Face direction', 'Outfit checks', 'Live feedback'].map(item => `
                  <span style="padding:14px 16px;border-radius:99px;background:rgba(255,255,255,0.14);border:1.5px solid rgba(255,255,255,0.18);font-family:${NARROW};font-size:21px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;color:white;">${item}</span>
                `).join('')}
              </div>
            </div>
            ${footerCue('Final filter')}
          `
        )
      },
      {
        name: '04_filter',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #2a120f 0%, #140a08 100%),
              radial-gradient(circle at 82% 14%, rgba(255,125,90,0.22), transparent 20%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('This is who I accept')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:390px;">
              <h2 style="font-family:${DISPLAY};font-size:88px;line-height:0.96;color:white;margin:0;max-width:830px;">
                Free slots go to people who execute fast.
              </h2>
            </div>
            <div style="position:absolute;left:68px;right:68px;top:620px;display:grid;grid-template-columns:1.03fr 0.97fr;gap:14px;">
              <div style="padding:24px;border-radius:22px;background:rgba(255,178,149,0.16);border:1.5px solid rgba(255,178,149,0.28);box-shadow:0 16px 30px rgba(0,0,0,0.12);">
                <p style="font-family:${NARROW};font-size:22px;letter-spacing:0.13em;text-transform:uppercase;font-weight:700;color:#ffb295;margin:0 0 10px;">Serious intent</p>
                <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:white;margin:0 0 16px;">
                  You are ready to book now, not browsing for later.
                </p>
                <p style="font-family:${NARROW};font-size:22px;letter-spacing:0.13em;text-transform:uppercase;font-weight:700;color:#ffb295;margin:0 0 10px;">Open to coaching</p>
                <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:white;margin:0;">
                  Direction helps us produce top-tier results quickly.
                </p>
              </div>
              <div style="display:grid;gap:14px;">
                ${[
                  ['Shows up on time', 'Reliable attendance is required for free slots.'],
                  ['Wants usable assets', 'Goal is photos you can deploy immediately.'],
                  ['Moves quickly', 'If selected, you can lock your shoot this week.']
                ].map(([title, copy]) => `
                  <div style="padding:20px 22px;border-radius:22px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);backdrop-filter:blur(8px);box-shadow:0 16px 30px rgba(0,0,0,0.12);">
                    <p style="font-family:${NARROW};font-size:21px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:#ffb295;margin:0 0 9px;">${title}</p>
                    <p style="font-family:${SANS};font-size:27px;line-height:1.32;color:rgba(255,255,255,0.84);margin:0;">${copy}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:310px;padding:20px 22px;border-radius:22px;background:rgba(255,178,149,0.16);border:1.5px solid rgba(255,178,149,0.28);">
              <p style="font-family:${SANS};font-size:30px;line-height:1.33;color:white;margin:0;">
                If this sounds like you, apply now before the batch closes.
              </p>
            </div>
            ${footerCue('Action steps')}
            ${texture(0.1)}
          `,
          '#140a08'
        )
      },
      {
        name: '05_steps',
        html: frame(
          `
            <div style="position:absolute;inset:0;background:
              linear-gradient(180deg, #fff8f5 0%, #fcede7 100%),
              radial-gradient(circle at 14% 14%, rgba(255,125,90,0.20), transparent 20%);"></div>
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Claim steps', { text: '#4b1d15', border: 'rgba(75,29,21,0.2)', bg: 'rgba(255,255,255,0.8)' })}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:430px;">
              <h2 style="font-family:${DISPLAY};font-size:89px;line-height:0.96;color:#39140f;margin:0 0 20px;max-width:830px;">
                How to secure your slot in under a minute.
              </h2>
              <div style="display:grid;gap:13px;">
                ${[
                  ['1', 'Tap Learn More.'],
                  ['2', 'Choose a fit-call time.'],
                  ['3', 'Confirm your target style and use-case.'],
                  ['4', 'Receive your shoot schedule.']
                ].map(([n, copy]) => `
                  <div style="display:flex;align-items:center;gap:14px;padding:18px 20px;border-radius:20px;background:white;border:1.5px solid rgba(57,20,15,0.08);box-shadow:0 14px 24px rgba(57,20,15,0.08);">
                    <div style="width:44px;height:44px;border-radius:99px;background:#ff7d5a;color:#3b140f;display:flex;align-items:center;justify-content:center;font-family:${NARROW};font-size:24px;font-weight:700;">${n}</div>
                    <p style="font-family:${SANS};font-size:31px;line-height:1.33;color:#57241a;margin:0;">${copy}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ${footerCue('Final slide', false)}
            ${texture(0.07)}
          `,
          '#fcede7'
        )
      },
      {
        name: '06_cta',
        html: photoFrame(
          photos.closeup,
          `
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(25,8,6,0.84) 0%, rgba(25,8,6,0.30) 44%, rgba(25,8,6,0.9) 100%);"></div>
            <div style="position:absolute;inset:0;background:
              radial-gradient(circle at 82% 14%, rgba(255,125,90,0.24), transparent 18%),
              radial-gradient(circle at 12% 86%, rgba(255,228,169,0.18), transparent 18%);"></div>
            ${texture(0.1)}
          `,
          `
            <div style="position:absolute;top:205px;left:68px;right:68px;">
              ${chip('Last call')}
            </div>
            <div style="position:absolute;left:68px;right:68px;top:560px;">
              <h2 style="font-family:${DISPLAY};font-size:109px;line-height:0.94;color:white;margin:0 0 22px;max-width:840px;${H}">
                Tap Learn More now and grab one of the final free spots.
              </h2>
              <p style="font-family:${SANS};font-size:34px;line-height:1.33;color:rgba(255,255,255,0.88);margin:0;max-width:760px;${B}">
                If you delay, this batch closes and you wait for the next round.
              </p>
            </div>
            <div style="position:absolute;left:68px;right:68px;bottom:280px;padding:24px 28px;border-radius:26px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(10px);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:${NARROW};font-size:25px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:white;">Reserve free slot</span>
              <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:#ff7d5a;">-></span>
            </div>
          `
        )
      }
    ]
  }
]

function cleanOldOutputs() {
  const entries = fs.readdirSync(OUT, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('story-') || entry.name.startsWith('funnel-')) {
      fs.rmSync(path.join(OUT, entry.name), { recursive: true, force: true })
    }
  }
}

async function render() {
  cleanOldOutputs()

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  })

  let total = 0

  for (const funnel of funnels) {
    const dir = path.join(OUT, funnel.folder)
    fs.mkdirSync(dir, { recursive: true })

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
      await page.waitForTimeout(300)
      const outPath = path.join(dir, `${slide.name}.png`)
      await page.screenshot({ path: outPath, type: 'png' })
      await page.close()
      console.log(`Rendered ${funnel.folder}/${slide.name}.png`)
    }
  }

  await browser.close()
  console.log(`Done. Rendered ${total} slides.`)
}

render()
