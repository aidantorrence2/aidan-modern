// Bundles the /learn app into app/src/main/assets/ so the APK works fully offline.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'app/src/main/assets')
mkdirSync(out, { recursive: true })

execFileSync(
  'npx',
  [
    '--yes',
    'esbuild@0.24.2',
    join(here, 'web/main.tsx'),
    '--bundle',
    '--minify',
    '--format=iife',
    '--target=chrome80',
    '--jsx=automatic',
    `--tsconfig=${join(here, '../tsconfig.json')}`,
    `--alias:next/link=${join(here, 'web/next-link-shim.tsx')}`,
    '--define:process.env.NODE_ENV="production"',
    `--outfile=${join(out, 'app.js')}`,
  ],
  { stdio: 'inherit', cwd: join(here, '..') },
)
copyFileSync(join(here, 'web/index.html'), join(out, 'index.html'))
