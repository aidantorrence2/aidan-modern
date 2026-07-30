// Dumps the wardrobe catalog structure (ids, kinds, labels, colorways) as
// JSON — the generation manifest for the photographic catalog.
import { writeFileSync } from 'fs'
import { ALL_PIECES } from '../components/wardrobe'
const out = process.argv[2]
writeFileSync(out, JSON.stringify(ALL_PIECES.map(p => ({
  id: p.id, kind: p.kind, label: p.label, colorways: p.colorways,
})), null, 1))
console.log('wrote', out, ALL_PIECES.length, 'pieces', ALL_PIECES.reduce((n, p) => n + p.colorways.length, 0), 'images to generate')
