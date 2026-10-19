#!/usr/bin/env node
// Tell IndexNow search engines (Bing, Yandex, Seznam, Naver and others) about every URL in the
// published sitemap. Run after publish-pages.sh, once the key file is live on GitHub Pages.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(new URL('.', import.meta.url).pathname, '../..')
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'flywheel/config.json'), 'utf8'))
if (!cfg.indexNowKey) { console.error('no indexNowKey in flywheel/config.json'); process.exit(1) }
const sitemap = fs.readFileSync(path.join(root, 'static-offers/sitemap.xml'), 'utf8')
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
const host = new URL(cfg.publicBase).host
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: cfg.indexNowKey, keyLocation: `${cfg.publicBase}/${cfg.indexNowKey}.txt`, urlList }),
})
console.log(`indexnow: ${res.status} for ${urlList.length} urls`)
if (res.status >= 400) { console.error(await res.text()); process.exit(1) }
