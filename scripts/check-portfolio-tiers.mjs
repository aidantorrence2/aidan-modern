import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Match the existing dependency-free regression scripts; never touch real photo files.
function loadTs(file, mocks = {}, env = process.env) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React,
  } }).outputText;
  const compiledModule = { exports: {} };
  new Function('require', 'module', 'exports', 'process', compiled)((name) =>
    Object.hasOwn(mocks, name) ? mocks[name] : require(name), compiledModule, compiledModule.exports, { ...process, env });
  return compiledModule.exports;
}

const portfolio = loadTs('lib/portfolio.ts');
const fixture = {
  _readme: 'Preserve this description.',
  'tier-1': Array.from({ length: 99 }, (_, i) => [`selected-${i}`, i < 96 ? 1070 : 1600, i < 96 ? 1600 : 1070]),
  tier0: [['previous-top-b', 1000, 1500], ['previous-top-a', 1500, 1000]],
  tier1: [['existing-b', 1000, 1500], ['existing-a', 1500, 1000]],
  tier2: [['backup', 1000, 1500]],
};
const photos = portfolio.portfolioPhotos(fixture);
assert.deepEqual(photos.map((p) => p.src), [...fixture['tier-1'], ...fixture.tier0, ...fixture.tier1].map(([src]) => src));
assert.equal(photos.filter((p) => p.star).length, 99);
assert.ok(photos.every((p, i) => p.i === i && p.star === (p.tier === 'tier-1')));
assert.equal(photos[98].landscape, true);
assert.equal(photos[0].landscape, false);
assert.deepEqual(photos.filter((p) => p.tier !== 'tier1').map((p) => p.i), Array.from({ length: 101 }, (_, i) => i));
assert.deepEqual(portfolio.portfolioPhotos({ tier0: fixture.tier0, tier1: fixture.tier1 }).map((p) => p.src), [...fixture.tier0, ...fixture.tier1].map(([src]) => src));

const shared = loadTs('app/designs/shared.tsx', { '@/data/portfolio-tiers.json': fixture, '@/lib/portfolio': portfolio });
for (const p of photos) {
  assert.equal(shared.full(p.src), `/images/${p.tier}/${p.src}.jpg`);
  assert.equal(shared.opt(p, 'full'), `/images/opt/full/${p.src}.webp`);
  assert.match(shared.optSet(p), new RegExp(`${p.src}\\.webp`));
}

const { portfolioGlobe } = loadTs('lib/portfolio-globe.ts');
for (const [priority, rest] of [[99, 129], [32, 97], [1, 1], [0, 129], [99, 0], [0, 0]]) {
  const globe = portfolioGlobe(priority, rest);
  assert.equal(globe.positions.length, priority + rest);
  assert.ok(globe.positions.every(({ lon, lat }) => Number.isFinite(lon) && Number.isFinite(lat) && Math.abs(lat) <= 90));
  assert.ok(globe.priorityTileScale > 0 && globe.otherTileScale > 0);
  if (priority === 99) {
    const bands = new Set(globe.positions.slice(0, priority).map((p) => p.lat));
    assert.equal(bands.size, 4, '99 highlights need more than the old two crowded bands');
    for (const lat of bands) {
      const ring = globe.positions.slice(0, priority).filter((p) => p.lat === lat);
      const gap = 2 * Math.cos(lat * Math.PI / 180) * Math.sin(Math.PI / ring.length);
      assert.ok(globe.priorityTileScale < gap * 0.9, 'highlight tiles leave space around each ring');
    }
    assert.ok(globe.positions.slice(priority).every((p) => Math.abs(p.lat) >= 39), 'odd-sized background pools must not place a photo inside the highlight band');
    assert.ok(globe.priorityTileScale > globe.otherTileScale, 'highlights stay larger');
  }
}

async function save(body, environment = 'development') {
  const writes = [], moves = [], reads = [];
  const api = loadTs('app/api/tiers/route.ts', { fs: { promises: {
    readFile: async (file) => { reads.push(file); return JSON.stringify(fixture); },
    rename: async (...args) => { moves.push(args); },
    writeFile: async (...args) => { writes.push(args); },
  } } }, { ...process.env, NODE_ENV: environment });
  const response = await api.POST(new Request('http://localhost/api/tiers', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));
  return { response, writes, moves, reads };
}
const body = { tier1: ['backup', 'existing-a'], tier2: ['existing-b'], 'tier-1': [], tier0: [] };
const saved = await save(body);
assert.equal(saved.response.status, 200);
assert.equal(saved.writes.length, 1);
assert.equal(saved.moves.length, 2);
const result = JSON.parse(saved.writes[0][1]);
assert.deepEqual(result['tier-1'], fixture['tier-1'], 'saving editable tiers preserves all selected photos, dimensions, and order');
assert.deepEqual(result.tier0, fixture.tier0, 'saving editable tiers preserves the previous top tier');
assert.equal(result._readme, fixture._readme);
assert.deepEqual(result.tier1.map(([src]) => src), body.tier1);
assert.deepEqual(result.tier2.map(([src]) => src), body.tier2);
assert.ok(saved.moves.every((move) => move.every((file) => /[\\/]tier[12][\\/]/.test(file))), 'only editable-tier files can move');
for (const invalid of [
  { tier1: ['selected-0', 'existing-a'], tier2: ['existing-b'] },
  { tier1: ['previous-top-a', 'existing-a'], tier2: ['existing-b'] },
  { tier1: ['existing-a', 'existing-a'], tier2: ['existing-b'] },
  { tier1: ['existing-a'], tier2: ['existing-b'] },
]) {
  const rejected = await save(invalid);
  assert.equal(rejected.response.status, 400);
  assert.equal(rejected.writes.length + rejected.moves.length, 0);
}
const deployed = await save(body, 'production');
assert.equal(deployed.response.status, 404);
assert.equal(deployed.reads.length + deployed.writes.length + deployed.moves.length, 0, 'the deployed API must not access local files');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/portfolio-tiers.json'), 'utf8'));
for (const tier of ['tier-1', 'tier0', 'tier1', 'tier2']) {
  assert.ok((manifest[tier] ?? []).every((entry) => entry.length === 3 && typeof entry[0] === 'string' && entry.slice(1).every((size) => Number.isFinite(size) && size > 0)), `${tier} entries need a filename and positive dimensions`);
}
const actual = portfolio.portfolioPhotos(manifest);
assert.deepEqual(actual.map((p) => p.src), ['tier-1', 'tier0', 'tier1'].flatMap((tier) => (manifest[tier] ?? []).map(([src]) => src)));
assert.equal(new Set(actual.map((p) => p.src)).size, actual.length, 'portfolio filenames must be unique across tiers');
console.log(`Portfolio regression checks passed (${actual.length} current photos; 99-photo priority fixture, image paths, globe spacing, tier preservation, and production write protection).`);
