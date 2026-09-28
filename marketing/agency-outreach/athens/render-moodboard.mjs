// Renders moodboard.html → Aidan-Torrence_Athens-test-moodboard.pdf (+ page PNG previews)
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
const dir = path.dirname(fileURLToPath(import.meta.url))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1123, height: 794 } })
await page.goto('file://' + path.join(dir, 'moodboard.html'), { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: path.join(dir, 'Aidan-Torrence_Athens-test-moodboard.pdf'), width: '297mm', height: '210mm', printBackground: true })
if (process.argv.includes('--preview')) {
  const n = await page.locator('.page').count()
  for (let i = 0; i < n; i++) await page.locator('.page').nth(i).screenshot({ path: path.join(dir, `preview-${i + 1}.png`) })
}
await browser.close()
