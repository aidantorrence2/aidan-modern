// Builds the /sign-up-collab picker library from public/images/pinterest/.
//
// Every file in that folder is a hand-picked Pinterest reference (Aidan drops
// them in; nothing is downloaded here). data/pinterest-themes.json assigns each
// file a style bucket so rounds mix styles; unlisted files fall back to 'old-town'.
// Hash-named files are pinimg originals, so their source URL is reconstructed
// from the hash (i.pinimg.com/originals/aa/bb/cc/<hash>.jpg); theme-named files
// (<theme>-<pinId>.jpg) link to the pin page.
//
// Output: data/theme-images.json (replaces the moodboard/ library index).
// Usage: node scripts/prepare-pinterest-library.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const folder = path.join(root, 'public/images/pinterest')
const themes = JSON.parse(fs.readFileSync(path.join(root, 'data/shoot-themes.json'), 'utf8'))
const labelOf = Object.fromEntries(themes.map(theme => [theme.id, theme.label]))
const buckets = JSON.parse(fs.readFileSync(path.join(root, 'data/pinterest-themes.json'), 'utf8'))
const files = fs.readdirSync(folder).filter(name => /\.jpe?g$/i.test(name)).sort()
const counters = {}
const library = files.map(name => {
  const stem = name.replace(/\.jpe?g$/i, '')
  const theme = buckets[name] || 'old-town'
  if (!labelOf[theme]) throw new Error(`${name}: unknown theme ${theme}`)
  const hash = /^[0-9a-f]{32}$/.test(stem) ? stem : null
  const pin = stem.match(/^[a-z-]+-(\d+)$/)?.[1]
  const source = hash ? `https://i.pinimg.com/originals/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash.slice(4, 6)}/${hash}.jpg` : pin ? `https://www.pinterest.com/pin/${pin}/` : 'https://www.pinterest.com/'
  counters[theme] = (counters[theme] || 0) + 1
  return { id: stem, theme, src: `/images/pinterest/${name}`, alt: `${labelOf[theme]} reference ${counters[theme]}`, source, credit: 'Pinterest' }
})
fs.writeFileSync(path.join(root, 'data/theme-images.json'), JSON.stringify(library, null, 2) + '\n')
console.log(`Indexed ${library.length} images from public/images/pinterest:`, counters)
