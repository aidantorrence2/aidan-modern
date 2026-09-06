// Builds the moodboard library from Pinterest.
//
// Seeds: data/shoot-themes.json (one pin per theme, chosen by Aidan).
// Library: data/theme-pins.json — the related pins Pinterest surfaces under each
// seed ("More like this"), curated by hand. Pinterest blocks its related-pins
// feed for anonymous requests, so that manifest is gathered in a signed-in
// browser and checked in; this script only downloads, resizes and indexes.
//
// Output: public/images/moodboard/<theme>-<pin>.jpg + data/theme-images.json
//
// Usage: node scripts/prepare-theme-library.mjs
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'public/images/moodboard')
await fs.mkdir(output, { recursive: true })

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
const exists = p => fs.stat(p).then(() => true, () => false)

async function download(urls, dest) {
  for (const url of urls) {
    const response = await fetch(url, { headers: { 'User-Agent': UA } }).catch(() => null)
    if (!response?.ok) continue
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length < 5000) continue
    await fs.writeFile(dest, bytes)
    return true
  }
  return false
}

// Resize for the picker grid; step quality down until it fits the size budget.
function optimise(src, dest) {
  for (const quality of [84, 78, 72, 66]) {
    execFileSync('magick', [src, '-auto-orient', '-resize', '900x1200>', '-strip', '-quality', String(quality), dest])
    if (execFileSync('stat', ['-f', '%z', dest]).toString().trim() < 480_000) return
  }
}

const themes = JSON.parse(await fs.readFile(path.join(root, 'data/shoot-themes.json'), 'utf8'))
const pins = JSON.parse(await fs.readFile(path.join(root, 'data/theme-pins.json'), 'utf8'))
const library = []
const tmp = path.join(output, '.download.tmp')

for (const theme of themes) {
  // Seed reference: the pin's og:image, kept at its existing path.
  const seedDest = path.join(root, 'public', theme.image)
  if (!(await exists(seedDest))) {
    const html = await (await fetch(theme.source, { headers: { 'User-Agent': UA } })).text()
    const url = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1]
    if (!url?.startsWith('https://i.pinimg.com/')) throw new Error(`No image for ${theme.id}`)
    if (!(await download([url], tmp))) throw new Error(`Seed download failed: ${theme.id}`)
    optimise(tmp, seedDest)
  }
  library.push({ id: `${theme.id}-reference`, theme: theme.id, src: theme.image, alt: `${theme.label} reference`, source: theme.source, credit: 'Pinterest' })

  for (const [index, pin] of (pins[theme.id] || []).entries()) {
    const id = `${theme.id}-${pin.pin}`
    const src = `/images/moodboard/${id}.jpg`
    const dest = path.join(root, 'public', src)
    if (!(await exists(dest))) {
      const ok = await download([pin.image, pin.image.replace('/originals/', '/736x/')], tmp)
      if (!ok) throw new Error(`Download failed for pin ${pin.pin}`)
      optimise(tmp, dest)
    }
    library.push({ id, theme: theme.id, src, alt: `${theme.label} reference ${index + 2}`, source: `https://www.pinterest.com/pin/${pin.pin}/`, credit: 'Pinterest' })
  }
}
await fs.rm(tmp, { force: true })
if (library.length !== 52) throw new Error(`Expected 52 images, got ${library.length}`)
await fs.writeFile(path.join(root, 'data/theme-images.json'), JSON.stringify(library, null, 2) + '\n')
console.log(`Prepared ${library.length} images across ${themes.length} themes.`)
