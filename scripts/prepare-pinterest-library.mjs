// Builds the picker library (/sign-up-collab and /sign-up) from public/images/pinterest/.
//
// Every file in that folder is a hand-picked Pinterest reference (Aidan drops
// them in; nothing is downloaded here). Two sidecar files tag each pin:
//   data/pinterest-themes.json   file → style bucket (sea / old-town / boat / indoor),
//                                so rounds mix styles; unlisted files fall back to 'old-town'.
//   data/pinterest-subjects.json file → who is in the photo: 'woman' | 'man' | 'couple' | 'brand'
//                                (several allowed). Unlisted files count as 'woman'.
//                                The free /sign-up-collab picker shows every 'woman' pin plus
//                                any pin also tagged 'collab'; /sign-up filters by the
//                                subject the visitor picks on its first screen.
//   data/pinterest-excluded.json pins pulled from the free collab rotation (collab: false)
//   data/pinterest-sources.json  hash → original URL, only for pins whose pinimg original is
//                                not a .jpg (the default link is reconstructed as .jpg).
// Hash-named files are pinimg originals, so their source URL is reconstructed
// from the hash (i.pinimg.com/originals/aa/bb/cc/<hash>.jpg); theme-named files
// (<theme>-<pinId>.jpg) link to the pin page.
//
// Output: data/theme-images.json
// Usage: node scripts/prepare-pinterest-library.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const folder = path.join(root, 'public/images/pinterest')
const themes = JSON.parse(fs.readFileSync(path.join(root, 'data/shoot-themes.json'), 'utf8'))
const labelOf = Object.fromEntries(themes.map(theme => [theme.id, theme.label]))
const buckets = JSON.parse(fs.readFileSync(path.join(root, 'data/pinterest-themes.json'), 'utf8'))
const subjectsOf = JSON.parse(fs.readFileSync(path.join(root, 'data/pinterest-subjects.json'), 'utf8'))
const sourceOf = JSON.parse(fs.readFileSync(path.join(root, 'data/pinterest-sources.json'), 'utf8'))
const SUBJECTS = ['woman', 'man', 'couple', 'brand']
const ALT = { woman: label => `${label} reference`, man: () => "Men's portrait reference", couple: () => 'Couple reference', brand: () => 'Brand campaign reference' }
// data/pinterest-excluded.json: pins Aidan pulled from the free /sign-up-collab rotation.
// They stay in the library (so /sign-up can still draw them and earlier picks resolve) with collab: false.
const excluded = new Set(JSON.parse(fs.readFileSync(path.join(root, 'data/pinterest-excluded.json'), 'utf8')))
const files = fs.readdirSync(folder).filter(name => /\.jpe?g$/i.test(name)).sort()
const counters = {}
const library = files.map(name => {
  const stem = name.replace(/\.jpe?g$/i, '')
  const theme = buckets[name] || 'old-town'
  if (!labelOf[theme]) throw new Error(`${name}: unknown theme ${theme}`)
  const tags = subjectsOf[name] || ['woman']
  const subjects = tags.filter(tag => SUBJECTS.includes(tag))
  if (!subjects.length) throw new Error(`${name}: no subject among ${tags}`)
  const collab = !excluded.has(name) && (subjects.includes('woman') || tags.includes('collab'))
  const hash = /^[0-9a-f]{32}$/.test(stem) ? stem : null
  const pin = stem.match(/^[a-z-]+-(\d+)$/)?.[1]
  const source = (hash && sourceOf[hash]) || (hash ? `https://i.pinimg.com/originals/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash.slice(4, 6)}/${hash}.jpg` : pin ? `https://www.pinterest.com/pin/${pin}/` : 'https://www.pinterest.com/')
  // Alt text names the subject for non-women pins ("Couple reference 3"), the style otherwise.
  const primary = subjects[0]
  const key = primary === 'woman' ? theme : primary
  counters[key] = (counters[key] || 0) + 1
  const alt = `${ALT[primary](labelOf[theme])} ${counters[key]}`
  return { id: stem, theme, subjects, collab, src: `/images/pinterest/${name}`, alt, source, credit: 'Pinterest' }
})
fs.writeFileSync(path.join(root, 'data/theme-images.json'), JSON.stringify(library, null, 2) + '\n')
const bySubject = Object.fromEntries(SUBJECTS.map(subject => [subject, library.filter(image => image.subjects.includes(subject)).length]))
console.log(`Indexed ${library.length} images from public/images/pinterest:`, counters, '| by subject:', bySubject, '| in collab rotation:', library.filter(image => image.collab).length)
