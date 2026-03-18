import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output', 'antipolo-low-cpc-v1')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

const CITY = 'Antipolo'
const CITY_UPPER = CITY.toUpperCase()
const HANDLE = '@madebyaidan'

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const photoFiles = {
  heroWarm: 'manila-gallery-dsc-0130.jpg',
  heroDark: 'manila-gallery-night-001.jpg',
  heroMotion: 'manila-gallery-dsc-0075.jpg',
  heroUrban: 'manila-gallery-urban-003.jpg',
  heroClose: 'manila-gallery-closeup-001.jpg',
  heroGarden: 'manila-gallery-garden-002.jpg',
  heroIvy: 'manila-gallery-ivy-002.jpg',
  heroCanal: 'manila-gallery-canal-001.jpg',
  proofA: 'manila-gallery-dsc-0190.jpg',
  proofB: 'manila-gallery-dsc-0911.jpg',
  proofC: 'manila-gallery-garden-001.jpg',
  proofD: 'manila-gallery-market-001.jpg',
  proofE: 'manila-gallery-urban-001.jpg',
  proofF: 'manila-gallery-ivy-001.jpg'
}

const photos = Object.fromEntries(
  Object.entries(photoFiles).map(([key, filename]) => [key, img(filename)])
)

const FONT_SANS = "'Space Grotesk', 'Helvetica Neue', sans-serif"
const FONT_DISPLAY = "'Archivo Black', 'Arial Black', sans-serif"
const FONT_SERIF = "'Instrument Serif', Georgia, serif"
const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace"
const SHADOW = 'text-shadow:0 2px 10px rgba(0,0,0,0.85),0 18px 48px rgba(0,0,0,0.55);'

function shell(background, overlay, content, grainOpacity = 0.05) {
  return `
    <div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#050505;">
      ${background}
      ${overlay}
      ${content}
      ${grain(grainOpacity)}
    </div>`
}

function grain(opacity) {
  return `
    <div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
      radial-gradient(circle at 15% 20%, rgba(255,255,255,0.35), transparent 16%),
      radial-gradient(circle at 82% 12%, rgba(255,255,255,0.18), transparent 14%),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px);"></div>`
}

function heroPhoto(src, extra = '') {
  return `<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;${extra}"/>`
}

function topRail(leftText, rightText, accent) {
  return `
    <div style="position:absolute;top:48px;left:48px;right:48px;display:flex;align-items:center;justify-content:space-between;z-index:5;">
      <div style="padding:14px 22px;border-radius:999px;background:rgba(8,8,8,0.84);backdrop-filter:blur(8px);font-family:${FONT_MONO};font-size:24px;font-weight:700;letter-spacing:2px;color:${accent};text-transform:uppercase;">${leftText}</div>
      <div style="padding:14px 22px;border-radius:999px;border:1px solid rgba(255,255,255,0.2);background:rgba(8,8,8,0.54);backdrop-filter:blur(8px);font-family:${FONT_MONO};font-size:22px;font-weight:700;letter-spacing:1px;color:white;text-transform:uppercase;">${rightText}</div>
    </div>`
}

function chipRow(items, accent, top, left) {
  return `
    <div style="position:absolute;top:${top}px;left:${left}px;display:flex;gap:14px;flex-wrap:wrap;z-index:5;">
      ${items.map((item) => `
        <div style="padding:14px 18px;border-radius:999px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(8px);font-family:${FONT_SANS};font-size:24px;font-weight:700;letter-spacing:0.3px;color:${accent};">${item}</div>
      `).join('')}
    </div>`
}

function polaroid(src, left, top, rotate) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:390px;height:470px;transform:rotate(${rotate}deg);background:white;padding:14px;box-shadow:0 18px 48px rgba(0,0,0,0.42);">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
    </div>`
}

const ads = [
  {
    name: '01-local-offer',
    photo: 'heroWarm',
    strategy: 'Big local callout with clear free offer and beginner-safe promise.',
    html: shell(
      heroPhoto(photos.heroWarm, 'filter:saturate(1.05) contrast(1.06) brightness(0.88);'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(7,7,7,0.1) 0%, rgba(7,7,7,0.08) 24%, rgba(7,7,7,0.38) 58%, rgba(7,7,7,0.94) 100%);"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(180deg, transparent 0%, rgba(7,7,7,0.84) 40%, rgba(7,7,7,1) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'FREE SHOOT', '#ffcf40')}
        <div style="position:absolute;left:58px;right:58px;bottom:360px;z-index:5;">
          <div style="font-family:${FONT_DISPLAY};font-size:96px;font-weight:900;line-height:0.93;letter-spacing:-2px;color:white;${SHADOW}">ANTIPOLO</div>
          <div style="font-family:${FONT_SERIF};font-size:132px;font-style:italic;font-weight:700;line-height:0.88;color:#ffcf40;margin-top:18px;${SHADOW}">free<br/>photo shoot</div>
          <div style="font-family:${FONT_SANS};font-size:34px;line-height:1.35;color:rgba(255,255,255,0.88);margin-top:28px;max-width:760px;${SHADOW}">For people who need new IG, portfolio, or dating profile photos.</div>
          <div style="font-family:${FONT_MONO};font-size:24px;font-weight:700;letter-spacing:2px;color:#ffcf40;margin-top:28px;text-transform:uppercase;">No experience needed. DM to apply.</div>
        </div>
      `
    )
  },
  {
    name: '02-beginner-safe',
    photo: 'heroDark',
    strategy: 'Calls out first-timers and removes posing anxiety fast.',
    html: shell(
      heroPhoto(photos.heroDark, 'filter:saturate(0.98) contrast(1.08) brightness(0.76);object-position:center top;'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(4,4,4,0.22) 0%, rgba(4,4,4,0.12) 24%, rgba(4,4,4,0.44) 58%, rgba(4,4,4,0.94) 100%);"></div>
      `,
      `
        ${topRail('ANTIPOLO BEGINNERS', 'FREE SESSION', '#8ef36b')}
        <div style="position:absolute;left:58px;right:90px;bottom:390px;z-index:5;">
          <div style="font-family:${FONT_DISPLAY};font-size:120px;font-weight:900;line-height:0.88;letter-spacing:-3px;color:white;max-width:800px;${SHADOW}">NEVER DONE A SHOOT BEFORE?</div>
          <div style="font-family:${FONT_SANS};font-size:38px;font-weight:700;line-height:1.28;color:#8ef36b;margin-top:28px;max-width:700px;${SHADOW}">Perfect. I direct poses, angles, and the whole vibe so it feels easy.</div>
          <div style="font-family:${FONT_MONO};font-size:24px;letter-spacing:2px;color:rgba(255,255,255,0.8);margin-top:26px;text-transform:uppercase;">Free Antipolo photo shoot slots are open now.</div>
        </div>
      `
    )
  },
  {
    name: '03-need-better-photos',
    photo: 'heroUrban',
    strategy: 'Outcome-focused hook that names the use cases people already care about.',
    html: shell(
      heroPhoto(photos.heroUrban, 'filter:saturate(1.08) contrast(1.04) brightness(0.78);object-position:center 28%;'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(13,13,13,0.12) 0%, rgba(13,13,13,0.12) 36%, rgba(13,13,13,0.62) 76%, rgba(13,13,13,0.96) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'PROFILE UPGRADE', '#ff7657')}
        <div style="position:absolute;left:58px;right:58px;top:300px;z-index:5;">
          <div style="display:inline-block;padding:14px 18px;border-radius:18px;background:#ff7657;font-family:${FONT_MONO};font-size:22px;font-weight:800;letter-spacing:1px;color:#140d0a;text-transform:uppercase;">Free Antipolo shoot</div>
        </div>
        <div style="position:absolute;left:58px;right:58px;bottom:430px;z-index:5;">
          <div style="font-family:${FONT_DISPLAY};font-size:126px;font-weight:900;line-height:0.86;letter-spacing:-3px;color:white;${SHADOW}">NEED BETTER PHOTOS?</div>
          <div style="font-family:${FONT_SANS};font-size:34px;line-height:1.34;color:rgba(255,255,255,0.9);margin-top:24px;max-width:760px;${SHADOW}">Free portrait sessions for creators, portfolios, and profile refreshes.</div>
        </div>
        ${chipRow(['IG', 'Portfolio', 'Dating apps'], '#ffd8cf', 1450, 58)}
      `
    )
  },
  {
    name: '04-free-means-free',
    photo: 'heroMotion',
    strategy: 'Kills skepticism by making the offer concrete and specific.',
    html: shell(
      heroPhoto(photos.heroMotion, 'filter:saturate(1.02) contrast(1.05) brightness(0.74);object-position:center 24%;'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,8,8,0.18) 0%, rgba(8,8,8,0.1) 20%, rgba(8,8,8,0.28) 44%, rgba(8,8,8,0.86) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'NO CATCH', '#ffd66b')}
        <div style="position:absolute;left:48px;right:48px;bottom:250px;z-index:5;background:rgba(10,10,10,0.88);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.12);border-radius:34px;padding:48px 42px 46px;">
          <div style="font-family:${FONT_DISPLAY};font-size:82px;font-weight:900;line-height:0.95;letter-spacing:-2px;color:white;">FREE MEANS FREE.</div>
          <div style="font-family:${FONT_SANS};font-size:30px;line-height:1.35;color:rgba(255,255,255,0.78);margin-top:16px;">If the offer is not obvious, CPC gets worse. So here it is:</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 22px;margin-top:28px;">
            ${[
              '10+ edited photos',
              'Pose direction',
              'Outfit + location help',
              '7-day delivery'
            ].map((item) => `
              <div style="padding:18px 20px;border-radius:20px;background:rgba(255,255,255,0.06);font-family:${FONT_SANS};font-size:26px;font-weight:700;color:#fff7d1;">${item}</div>
            `).join('')}
          </div>
          <div style="font-family:${FONT_MONO};font-size:22px;letter-spacing:2px;color:#ffd66b;margin-top:24px;text-transform:uppercase;">Antipolo free shoot applications are open.</div>
        </div>
      `
    )
  },
  {
    name: '05-proof-grid',
    photo: 'proofA',
    strategy: 'Proof-first creative that sells the style before the CTA.',
    html: shell(
      heroPhoto(photos.proofD, 'filter:blur(8px) saturate(0.72) brightness(0.46);transform:scale(1.12);'),
      `
        <div style="position:absolute;inset:0;background:rgba(6,6,6,0.58);"></div>
      `,
      `
        ${topRail('RECENT WORK', `${CITY_UPPER} FREE SHOOT`, '#ffcf40')}
        <div style="position:absolute;top:230px;left:0;right:0;text-align:center;z-index:5;">
          <div style="font-family:${FONT_SERIF};font-size:86px;font-style:italic;font-weight:700;color:white;${SHADOW}">This is the look.</div>
          <div style="font-family:${FONT_SANS};font-size:30px;color:rgba(255,255,255,0.8);margin-top:10px;">Run proof, not just pretty type.</div>
        </div>
        ${polaroid(photos.proofA, 90, 430, -4)}
        ${polaroid(photos.proofB, 585, 455, 3)}
        ${polaroid(photos.proofC, 120, 975, 2)}
        ${polaroid(photos.proofE, 570, 1005, -3)}
        <div style="position:absolute;left:72px;right:72px;bottom:170px;z-index:5;padding:24px 28px;border-radius:999px;background:rgba(10,10,10,0.86);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;">
          <div style="font-family:${FONT_MONO};font-size:22px;font-weight:700;letter-spacing:2px;color:#ffcf40;text-transform:uppercase;">DM ${HANDLE}</div>
          <div style="font-family:${FONT_SANS};font-size:26px;color:white;">Free Antipolo session slots</div>
        </div>
      `,
      0.04
    )
  },
  {
    name: '06-dm-plan-shoot',
    photo: 'heroCanal',
    strategy: 'Process creative that makes the offer feel easy and low-friction.',
    html: shell(
      heroPhoto(photos.heroCanal, 'filter:saturate(0.96) contrast(1.04) brightness(0.42);object-position:center 20%;'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(9,12,11,0.68) 0%, rgba(9,12,11,0.58) 42%, rgba(9,12,11,0.88) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'SUPER SIMPLE', '#74f0d5')}
        <div style="position:absolute;left:58px;right:58px;top:260px;z-index:5;">
          <div style="font-family:${FONT_DISPLAY};font-size:96px;font-weight:900;line-height:0.92;letter-spacing:-2px;color:white;${SHADOW}">DM. PLAN. SHOOT.</div>
          <div style="font-family:${FONT_SANS};font-size:32px;line-height:1.35;color:rgba(255,255,255,0.84);margin-top:18px;max-width:760px;">Low CPC comes from clarity. This is the whole process.</div>
        </div>
        <div style="position:absolute;left:58px;right:58px;top:650px;display:flex;flex-direction:column;gap:24px;z-index:5;">
          ${[
            ['1', 'DM me on Instagram'],
            ['2', 'We pick the vibe + location'],
            ['3', 'You show up, I direct everything']
          ].map(([num, label]) => `
            <div style="display:flex;align-items:center;gap:22px;padding:24px 26px;border-radius:28px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);backdrop-filter:blur(10px);">
              <div style="width:68px;height:68px;border-radius:999px;background:#74f0d5;color:#071411;font-family:${FONT_DISPLAY};font-size:34px;display:flex;align-items:center;justify-content:center;">${num}</div>
              <div style="font-family:${FONT_SANS};font-size:32px;font-weight:700;color:white;line-height:1.25;">${label}</div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;left:58px;right:58px;bottom:200px;z-index:5;font-family:${FONT_MONO};font-size:22px;letter-spacing:2px;color:#74f0d5;text-transform:uppercase;">30 to 45 minutes. Beginner friendly. Free Antipolo slot.</div>
      `,
      0.04
    )
  },
  {
    name: '07-hate-posing',
    photo: 'heroClose',
    strategy: 'Calls out the awkwardness objection directly.',
    html: shell(
      heroPhoto(photos.heroClose, 'filter:saturate(1.02) contrast(1.06) brightness(0.8);object-position:center 18%;'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.08) 30%, rgba(10,10,10,0.52) 72%, rgba(10,10,10,0.94) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'POSE HELP INCLUDED', '#b6ff46')}
        <div style="position:absolute;left:58px;right:58px;bottom:340px;z-index:5;">
          <div style="font-family:${FONT_DISPLAY};font-size:146px;font-weight:900;line-height:0.84;letter-spacing:-4px;color:white;${SHADOW}">HATE POSING?</div>
          <div style="font-family:${FONT_SANS};font-size:38px;font-weight:700;line-height:1.3;color:#b6ff46;margin-top:26px;max-width:760px;${SHADOW}">Good. I guide the whole thing so you do not need to know what to do.</div>
          <div style="font-family:${FONT_MONO};font-size:24px;letter-spacing:2px;color:rgba(255,255,255,0.84);margin-top:24px;text-transform:uppercase;">Free Antipolo shoot for people who want better photos without the awkward part.</div>
        </div>
      `
    )
  },
  {
    name: '08-fast-value',
    photo: 'heroGarden',
    strategy: 'Makes the time-to-value obvious and easy to process in one glance.',
    html: shell(
      heroPhoto(photos.heroGarden, 'filter:saturate(1.06) contrast(1.02) brightness(0.76);object-position:center 18%;'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(14,14,14,0.14) 0%, rgba(14,14,14,0.14) 36%, rgba(14,14,14,0.64) 74%, rgba(14,14,14,0.96) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'FAST WIN', '#ff9f59')}
        <div style="position:absolute;left:52px;right:52px;bottom:250px;z-index:5;background:rgba(255,245,234,0.92);border-radius:34px;padding:42px 40px 38px;">
          <div style="font-family:${FONT_DISPLAY};font-size:88px;font-weight:900;line-height:0.92;letter-spacing:-2px;color:#17110b;">30 TO 45 MINUTES.</div>
          <div style="font-family:${FONT_SERIF};font-size:102px;font-style:italic;font-weight:700;line-height:0.9;color:#d6501f;margin-top:12px;">10+ edited photos.</div>
          <div style="font-family:${FONT_SANS};font-size:30px;line-height:1.33;color:#3d2d1f;margin-top:18px;">Free Antipolo portrait session. Simple process. Real value.</div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:24px;">
            ${['Free', 'Beginner friendly', 'DM to apply'].map((item) => `
              <div style="padding:12px 16px;border-radius:999px;background:#17110b;font-family:${FONT_MONO};font-size:20px;font-weight:700;letter-spacing:1px;color:#ffcfb2;text-transform:uppercase;">${item}</div>
            `).join('')}
          </div>
        </div>
      `,
      0.04
    )
  },
  {
    name: '09-limited-slots',
    photo: 'heroIvy',
    strategy: 'Urgency-led local creative that makes the timing explicit.',
    html: shell(
      heroPhoto(photos.heroIvy, 'filter:saturate(0.98) contrast(1.06) brightness(0.66);object-position:center 18%;'),
      `
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 45% 28%, rgba(255,255,255,0.08) 0%, rgba(10,10,10,0.12) 22%, rgba(10,10,10,0.82) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'THIS MONTH', '#ff5b5b')}
        <div style="position:absolute;left:58px;right:120px;bottom:350px;z-index:5;">
          <div style="font-family:${FONT_DISPLAY};font-size:112px;font-weight:900;line-height:0.88;letter-spacing:-2px;color:white;max-width:760px;${SHADOW}">ONLY A FEW FREE SESSIONS LEFT.</div>
          <div style="font-family:${FONT_SANS};font-size:34px;line-height:1.35;color:rgba(255,255,255,0.9);margin-top:28px;max-width:660px;${SHADOW}">Antipolo slots for this month are almost gone. DM now if you want in.</div>
        </div>
        <div style="position:absolute;left:58px;bottom:240px;z-index:5;padding:16px 20px;border-radius:18px;background:#ff5b5b;font-family:${FONT_MONO};font-size:24px;font-weight:800;letter-spacing:2px;color:#180707;text-transform:uppercase;">DM ${HANDLE}</div>
      `
    )
  },
  {
    name: '10-direct-cta',
    photo: 'proofF',
    strategy: 'Straight CTA creative for the platform to push once the hook is validated.',
    html: shell(
      heroPhoto(photos.proofF, 'filter:saturate(1.04) contrast(1.08) brightness(0.72);object-position:center 10%;'),
      `
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,8,8,0.18) 0%, rgba(8,8,8,0.12) 28%, rgba(8,8,8,0.4) 54%, rgba(8,8,8,0.94) 100%);"></div>
      `,
      `
        ${topRail(CITY_UPPER, 'FREE SHOOT', '#ffcf40')}
        <div style="position:absolute;left:58px;right:58px;bottom:300px;z-index:5;">
          <div style="font-family:${FONT_DISPLAY};font-size:108px;font-weight:900;line-height:0.88;letter-spacing:-2px;color:white;${SHADOW}">DM ${HANDLE}</div>
          <div style="font-family:${FONT_SERIF};font-size:96px;font-style:italic;font-weight:700;line-height:0.94;color:#ffcf40;margin-top:18px;${SHADOW}">if you want a free shoot</div>
          <div style="font-family:${FONT_SANS};font-size:32px;line-height:1.35;color:rgba(255,255,255,0.84);margin-top:24px;max-width:700px;${SHADOW}">Antipolo session. No experience needed. I guide the whole thing.</div>
        </div>
      `
    )
  }
]

function documentFor(body) {
  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@500;700&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
          body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; font-family: ${FONT_SANS}; }
        </style>
      </head>
      <body>${body}</body>
    </html>`
}

async function render() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  })

  const summary = {
    createdAt: new Date().toISOString(),
    city: CITY,
    folder: path.relative(__dirname, OUT),
    strategy: 'Antipolo low-CPC v1: local callout + explicit free offer + objection handling + proof + urgency.',
    handle: HANDLE,
    photos: photoFiles,
    ads: ads.map((ad) => ({
      file: `${ad.name}.png`,
      sourcePhoto: ad.photo,
      strategy: ad.strategy
    }))
  }

  for (const ad of ads) {
    const page = await context.newPage()
    await page.setContent(documentFor(ad.html), { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, `${ad.name}.png`), type: 'png' })
    await page.close()
    console.log(`OK ${ad.name}`)
  }

  fs.writeFileSync(path.join(OUT, 'sources.json'), JSON.stringify(summary, null, 2))
  await browser.close()
  console.log(`Done - ${ads.length} Antipolo low-CPC ads -> ${OUT}`)
}

render()
