import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const edit = JSON.parse(read('data/photographic-edit.json'));
const tiers = JSON.parse(read('data/portfolio-tiers.json'));
const ids = edit.photos.map((photo) => photo.id);
assert.equal(edit.sourceVersion, 'e330984387305137362cab8174ca3903a19bcbb4');
assert.equal(ids.length, 47);
assert.equal(new Set(ids).size, 47);
const openingSequence = [
  'phoenix-ii-3-r1-09797-0005', 'phoenix-ii-r1-09793-0028',
  'phoenix-ii-3-r1-09797-0009', 'phoenix-ii-r1-09793-0016',
  'phoenix-ii-3-r1-09797-0029', 'phoenix-ii-r1-09793-0025',
  'phoenix-ii-3-r1-09797-0031', 'phoenix-ii-r1-09793-030a',
];
assert.deepEqual(ids.slice(0, 8), openingSequence, 'Opening models followed by three more photographs of each');
assert.deepEqual(edit.passages.slice(1, 5).map(({ ids, layout }) => ({ ids, layout })), [
  { ids: openingSequence.slice(2, 4), layout: 'equal' },
  { ids: openingSequence.slice(4, 6), layout: 'equal' },
  { ids: openingSequence.slice(6, 7), layout: 'landscape' },
  { ids: openingSequence.slice(7, 8), layout: 'landscape' },
]);
assert.deepEqual([...ids].sort(), tiers['tier-2'].map(([id]) => id).sort());
assert.deepEqual(edit.passages.flatMap((passage) => passage.ids), ids);
assert.equal(edit.passages.length, 28);
assert.deepEqual(edit.passages[0], { ids: ids.slice(0, 2), layout: 'equal', ground: '#0b1512' });
assert.equal(tiers['tier-2'].length + tiers['tier-1'].length, 99, 'Retain all 99 prioritized photos');
const landscapes = [];
for (const photo of edit.photos) {
  const tier = tiers['tier-2'].find(([id]) => id === photo.id);
  assert.deepEqual([photo.width, photo.height], tier.slice(1));
  assert.ok(photo.alt.length > 20);
  if (photo.width > photo.height) landscapes.push(photo.id);
  for (const size of [256, 384, 640, 'full']) {
    assert.ok(fs.existsSync(path.join(root, `public/images/opt/${size}/${photo.id}.webp`)));
  }
}
assert.equal(landscapes.length, 3);
assert.deepEqual(edit.passages.filter((passage) => passage.layout === 'landscape').flatMap((passage) => passage.ids), landscapes);
assert.ok(fs.existsSync(path.join(root, 'public/fonts/inter.woff2')));

const source = read('components/PhotographicPortfolio.tsx');
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const module = { exports: {} };
new Function('require', 'module', 'exports', compiled)((name) => {
  if (name === '@/data/photographic-edit.json') return edit;
  if (name.endsWith('.module.css')) return new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });
  return require(name);
}, module, module.exports);
const html = renderToStaticMarkup(React.createElement(module.exports.default));
assert.deepEqual([...html.matchAll(/data-photo="([^"]+)"/g)].map((match) => match[1]), ids);
assert.equal((html.match(/<figure /g) ?? []).length, 47);
assert.equal((html.match(/<img /g) ?? []).length, 47, 'No duplicated featured/index/viewer images before opening');
assert.ok(html.includes('id="work"'), 'Preserve incoming /#work portfolio links');
assert.ok(html.includes('aria-label="Photograph viewer"'));
assert.ok(html.includes('href="mailto:aidan@aidantorrence.com"'));
assert.ok(html.includes('href="https://wa.me/491758966210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp, opens in a new tab"'));
assert.ok(html.includes('href="https://www.instagram.com/madebyaidan"'), 'Keep the existing Instagram contact');
assert.ok(!read('app/page.tsx').includes('noindex'));
console.log('Photographic edit checks passed: exact approved 47-photo set, 28 passages, opening models plus three more photographs each, 3 natural landscapes, 188 existing WebP files, SSR sequence, and all 99 priority photos retained.');
