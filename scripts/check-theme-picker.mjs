import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'lib/themePicker.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText
const module = { exports: {} }
new Function('require', 'module', 'exports', compiled)(name => name.startsWith('@/data/') ? require(path.join(root, name.slice(2))) : require(name), module, module.exports)
const { THEME_IMAGES, MAX_PICKS, PER_ROUND, ROUNDS, makeRounds, parseThemeSelection, moodboardEntries, boardPath, selectionFromQuery } = module.exports
const total = THEME_IMAGES.length
assert.ok(ROUNDS >= MAX_PICKS, `need at least ${MAX_PICKS * PER_ROUND} images, got ${total}`)
assert.equal(new Set(THEME_IMAGES.map(image => image.id)).size, total)
assert.equal(new Set(THEME_IMAGES.map(image => image.src)).size, total)
for (const image of THEME_IMAGES) {
  assert.ok(fs.existsSync(path.join(root, 'public', image.src)), image.src)
  assert.ok(fs.statSync(path.join(root, 'public', image.src)).size < 500_000, image.src)
}
const themeOf = new Map(THEME_IMAGES.map(image => [image.id, image.theme]))
let leastMixed = Infinity
for (const seed of [0, 1, 42, 0xffffffff]) {
  const rounds = makeRounds(seed)
  assert.equal(rounds.length, ROUNDS)
  assert.deepEqual(rounds, makeRounds(seed))
  const shown = rounds.flat()
  assert.equal(new Set(shown).size, shown.length)
  for (const round of rounds) {
    assert.equal(round.length, PER_ROUND)
    const themes = new Set(round.map(id => themeOf.get(id)))
    leastMixed = Math.min(leastMixed, themes.size)
    assert.ok(themes.size >= 2, `every round mixes styles, got ${themes.size}`)
  }
  const picks = rounds.slice(0, MAX_PICKS).map(round => round[0])
  const selection = parseThemeSelection({ theme: 'any', imageIds: picks })
  assert.ok(selection)
  const query = Object.fromEntries(new URL(boardPath(selection), 'https://example.com').searchParams)
  assert.deepEqual(selectionFromQuery(query), selection)
  assert.equal(moodboardEntries(selection).filter(line => line.startsWith('Reference: ')).length, MAX_PICKS)
}
const first = THEME_IMAGES[0].id
for (const input of [null, {}, { theme: 'invalid', imageIds: [first] }, { theme: 'any', imageIds: [] }, { theme: 'any', imageIds: ['not-an-image'] }, { theme: 'any', imageIds: [first, first] }, { theme: 'any', imageIds: [first], suggestedUrl: 'javascript:alert(1)' }, { theme: 'any', imageIds: [first], suggestedUrl: 'https://user:password@example.com' }]) assert.equal(parseThemeSelection(input), null)
assert.ok(parseThemeSelection({ theme: 'any', imageIds: [first], suggestedUrl: 'https://www.pinterest.com/pin/533958099593582289/' }))
console.log(`PASS: ${total} assets, ${ROUNDS} rounds of ${PER_ROUND}, ${MAX_PICKS} picks to finish, every round mixes ≥${leastMixed} styles, deterministic, no repeats, share-link roundtrip, input validation.`)

if (process.argv.includes('--database-canary')) {
  // Local server only, started with SLACK_BOOKING_WEBHOOK='' to suppress
  // notifications. One uniquely marked fixture; exact ID cleanup in finally.
  require('@next/env').loadEnvConfig(root)
  const { createClient } = require('@supabase/supabase-js')
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const contact = `codex_canary_${Date.now()}`
  const selection = { theme: 'mountain-park', imageIds: makeRounds(42).slice(0, 4).map(round => round[0]), suggestedUrl: 'https://www.pinterest.com/pin/533958099593582289/' }
  const base = 'http://localhost:5184/api/sign-up'
  const bad = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city: 'Almaty', contactMethod: 'instagram', contact, themeSelection: { ...selection, imageIds: ['invalid'] } }) })
  assert.equal(bad.status, 400)
  let rowId
  try {
    const response = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city: 'Almaty', contactMethod: 'instagram', contact, moodboard: ['TEST: Codex theme picker canary', 'Location: Almaty'], themeSelection: selection }) })
    const json = await response.json()
    assert.equal(response.status, 200, JSON.stringify(json))
    assert.equal(json.ok, true)
    rowId = json.id
    const { data, error } = await sb.from('signups').select('id, moodboard').eq('id', rowId).eq('contact', contact).single()
    assert.ifError(error)
    for (const entry of moodboardEntries(selection)) assert.ok(data.moodboard.includes(entry), entry)
    console.log(`PASS: actual signup API persisted ${selection.imageIds.length} exact references, theme, shareable board, and custom Pinterest link.`)
  } finally {
    if (rowId) {
      const { error } = await sb.from('signups').delete().eq('id', rowId).eq('contact', contact)
      assert.ifError(error)
      console.log('Removed only the temporary canary signup.')
    }
  }
}
