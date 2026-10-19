// Generates the ✓ / ✗ example submission photos shown above the "Photos of
// yourself" upload on /sign-up-collab. The good headshot is generated first and
// passed as the identity reference for the rest, so all four read as one person.
//
//   GEMINI_API_KEY=… node scripts/generate-submission-examples.mjs [staging-dir]
//
// Raw PNGs stay in the staging dir; resized JPEGs land in
// public/images/submission-examples/.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1) }
const MODEL = 'gemini-3.1-flash-image'
const STAGE = process.argv[2] || '/tmp/submission-examples'
const OUT = 'public/images/submission-examples'
mkdirSync(STAGE, { recursive: true }); mkdirSync(OUT, { recursive: true })

const PHONE = 'Candid, unedited smartphone photo, natural colors, realistic skin texture, vertical 3:4 framing. No text, no watermark, no borders.'
const PERSON = 'a young woman in her early twenties with long dark-brown hair'

const JOBS = [
  { name: 'good-headshot', text: `${PHONE} A simple model digital headshot of ${PERSON}: shoulders-up, facing the camera straight on at eye level, relaxed neutral expression with closed lips and NOT smiling, bare face with no makeup, hair pulled back tightly into a low bun so the whole face, forehead and ears are visible. Plain fitted black tank top. Plain white wall behind her, soft even daylight from a window.` },
  { name: 'good-full', ref: true, text: `${PHONE} The same woman as in the attached photo, now taking a full-length mirror selfie in a tall bedroom mirror, whole body visible head to toe, standing straight, phone held at chest height so her face is fully visible, neutral expression NOT smiling, no makeup, hair pulled back. Plain fitted black tank top and fitted blue jeans, barefoot. Tidy, simple room, daylight.` },
  { name: 'bad-glam', ref: true, text: `${PHONE} The same woman as in the attached photo, taking a typical social-media selfie from a high angle: big toothy smile, heavy glam makeup with dramatic winged eyeliner, false lashes and bold red lipstick, an obvious beauty-filter skin smoothing look, loose hair falling over half her face. Night out, warm restaurant light.` },
  { name: 'bad-far', ref: true, text: `${PHONE} The same woman as in the attached photo, standing far away and small in the frame at a busy beach with friends around her, wearing big dark sunglasses and a wide straw hat that shadows her face, harsh midday backlight, slightly blurry, her face not clearly visible.` },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function generate(job, refFile) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const parts = [{ text: job.text }]
    if (refFile) parts.push({ inlineData: { mimeType: 'image/png', data: readFileSync(refFile).toString('base64') } })
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4' } } }),
    })
    if (res.status === 429 || res.status >= 500) { await sleep(4000 * attempt); continue }
    const j = await res.json()
    const part = j?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
    if (!part) { console.error(`${job.name}: no image (${JSON.stringify(j).slice(0, 160)})`); await sleep(3000 * attempt); continue }
    const raw = path.join(STAGE, `${job.name}.png`)
    writeFileSync(raw, Buffer.from(part.inlineData.data, 'base64'))
    // Shown at ~80px wide; 480px tall covers 3x displays.
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-Z', '480', raw, '--out', path.join(OUT, `${job.name}.jpg`)], { stdio: 'ignore' })
    console.log(`ok ${job.name}`)
    return raw
  }
  throw new Error(`${job.name}: failed after retries`)
}

const ref = await generate(JOBS[0])
await Promise.all(JOBS.slice(1).map(job => generate(job, job.ref ? ref : undefined)))
