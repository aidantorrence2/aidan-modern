import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'public/images/theme-picker')
await fs.mkdir(output, { recursive: true })
const groups = {
  'mountain-park': [
    ['large/000001-11.jpg', 'A quiet moment on a garden wall'],
    ['large/000007-13.jpg', 'White dress against deep green'],
    ['large/000010-13.jpg', 'Movement in an open field'],
    ['large/000012-3.jpg', 'Relaxed portrait in a sunlit park'],
    ['large/000014-10.jpg', 'Ivy and old stone'],
    ['large/000015-3.jpg', 'Walking through dappled light'],
    ['large/000019-3.jpg', 'A portrait among the trees'],
    ['large/000026-6.jpg', 'A flowing dress in a woodland clearing'],
    ['large/000027-6.jpg', 'Sitting in the grass'],
    ['large/000029-5.jpg', 'A picnic afternoon'],
    ['large/000034-4.jpg', 'An unhurried garden walk'],
    ['large/000038-9.jpg', 'Blue dress and sunlit leaves'],
    ['large/000041.jpg', 'A colourful park portrait'],
    ['large/000044.jpg', 'A candid moment on a park bench'],
    ['large/000049690034.jpg', 'Reaching into the light'],
    ['large/000049740015.jpg', 'Laid-back greenery'],
    ['proof/000038-4.jpg', 'Open countryside and distant hills'],
  ],
  street: [
    ['large/000001.jpg', 'A casual city walk'],
    ['large/000002.jpg', 'A red dress by the canal'],
    ['large/000007.jpg', 'Old stone and bright colour'],
    ['large/000008-5.jpg', 'Patterned tiles and a summer dress'],
    ['large/000015-2.jpg', 'A stop at the photo booth'],
    ['large/000023-3.jpg', 'An everyday street portrait'],
    ['large/000026-2.jpg', 'Plaid skirt against a city wall'],
    ['large/000029-2.jpg', 'Graphic walls and a simple outfit'],
    ['large/000030-4.jpg', 'A pause beside the canal'],
    ['large/000039-3.jpg', 'Sitting on city steps'],
    ['large/000046-4.jpg', 'Street art and an all-black look'],
    ['large/000048-5.jpg', 'Colour and movement downtown'],
    ['large/000050-4.jpg', 'An editorial moment at a newsstand'],
    ['large/000056-10.jpg', 'Pastel walls and a green dress'],
    ['large/000067-4.jpg', 'Denim, a car, and afternoon light'],
    ['proof/000015-3.jpg', 'City lights after dark'],
    ['proof/000025.jpg', 'A spontaneous taxi-side portrait'],
  ],
  indoor: [
    ['proof/000008-3.jpg', 'A simple studio portrait'],
    ['proof/000016.jpg', 'A close portrait in soft shadow'],
    ['proof/000019-6.jpg', 'A quiet stairwell portrait'],
    ['faves/000040-5.jpg', 'A silhouette by the window'],
    ['faves/000062-7.jpg', 'Warm interiors and a relaxed pose'],
    ['large/000023-9.jpg', 'Window light and a thoughtful pause'],
    ['large/000038.jpg', 'Sunlight on a simple wall'],
    ['large/000048750031.jpg', 'A relaxed portrait on a white sofa'],
    ['large/000048750034.jpg', 'Soft movement in a bright room'],
    ['large/000048780005.jpg', 'A natural portrait beside a window'],
    ['large/000048780008.jpg', 'A wide, quiet sofa portrait'],
    ['large/000048780009.jpg', 'An intimate close-up in soft light'],
    ['large/000055.jpg', 'A monochrome indoor portrait'],
    ['large/6.jpg', 'Leather and soft interior light'],
    ['large/13.jpg', 'A moody close-up'],
  ],
}
const themes = JSON.parse(await fs.readFile(path.join(root, 'data/shoot-themes.json'), 'utf8'))
const library = []
for (const theme of themes) {
  const html = await (await fetch(theme.source)).text()
  const imageTag = html.match(/<meta[^>]*property="og:image"[^>]*>/)?.[0]
  const url = imageTag?.match(/content="([^"]+)"/)?.[1]
  if (!url?.startsWith('https://i.pinimg.com/')) throw new Error(`No image for ${theme.id}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Image download failed: ${response.status}`)
  const dest = path.join(root, 'public', theme.image)
  await fs.writeFile(dest, Buffer.from(await response.arrayBuffer()))
  execFileSync('magick', [dest, '-auto-orient', '-resize', '900x1200>', '-strip', '-quality', '86', dest])
  library.push({ id: `${theme.id}-reference`, theme: theme.id, src: theme.image, alt: `${theme.label} starting reference`, source: theme.source, credit: 'Pinterest reference' })
  for (const [index, [file, alt]] of groups[theme.id].entries()) {
    const id = `${theme.id}-${String(index + 1).padStart(2, '0')}`
    const src = `/images/theme-picker/${id}.jpg`
    execFileSync('magick', [path.join(root, 'public/images', file), '-auto-orient', '-resize', '900x1200>', '-strip', '-quality', '84', path.join(root, 'public', src)])
    library.push({ id, theme: theme.id, src, alt, source: `https://www.aidantorrence.com/images/${file}`, credit: 'Aidan Torrence' })
  }
}
if (library.length !== 52) throw new Error(`Expected 52 images, got ${library.length}`)
await fs.writeFile(path.join(root, 'data/theme-images.json'), JSON.stringify(library, null, 2) + '\n')
console.log(`Prepared ${library.length} images across ${themes.length} themes.`)
