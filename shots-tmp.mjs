import { chromium } from '@playwright/test';
const b = await chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (let n = 1; n <= 10; n++) {
  try {
    await pg.goto(`http://localhost:5174/designs/${n}`, { waitUntil: 'networkidle', timeout: 90000 });
    await pg.waitForTimeout(2500);
    if (n === 10) { await pg.evaluate(() => scrollTo(0, 300)); await pg.waitForTimeout(1500); }
    await pg.screenshot({ path: `/Users/aidantorrence/Documents/aidan-modern-portfolio/public/design-shots/d${n}.jpg`, type: 'jpeg', quality: 70 });
    console.log(n, 'ok');
  } catch (e) { console.log(n, 'fail', e.message.slice(0, 80)); }
}
await b.close();
