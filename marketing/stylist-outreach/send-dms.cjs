#!/usr/bin/env node
// Athens stylist DMs from @madebyaidan: exact text per handle from tracker.csv (city=Athens), human-paced.
// Safety reused from ~/istanbul-casting/scripts/ig-dm-runner.cjs: skip any thread with history, hard-stop on
// block/challenge text, stop after two unverified sends. Every attempt is appended to ig-sent-log.jsonl and a
// handle already logged there is never messaged again.
//   node send-dms.cjs --dry-run --only pax.ter   (opens the composer, sends nothing)
//   node send-dms.cjs --only pax.ter             (canary: one real send)
//   node send-dms.cjs                            (everyone left)
const fs = require('fs'); const path = require('path'); const os = require('os');
const { chromium } = require('/Users/aidantorrence/outreach-manager/node_modules/playwright-core');
const { clearStaleLock } = require('/Users/aidantorrence/istanbul-casting/scripts/profile-lock.cjs');
const { historyLines } = require('/Users/aidantorrence/istanbul-casting/scripts/ig-dm-runner.cjs');
const DIR = __dirname; const LOG = path.join(DIR, 'ig-sent-log.jsonl');
const PROFILE = path.join(os.homedir(), 'Library/Application Support/OutreachManager/ig-profile');
const args = process.argv.slice(2); const flag = (f) => args.includes(f); const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const DRY = flag('--dry-run'); const ONLY = (opt('--only', '') || '').toLowerCase(); const CITY = opt('--city', 'Athens');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const rnd = (a, b) => a + Math.random() * (b - a);

function parseCSV(text) { const rows = []; let row = [], cur = '', q = false; for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; } else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (c !== '\r') cur += c; } if (cur || row.length) { row.push(cur); rows.push(row); } const head = rows.shift().map((h) => h.trim()); return rows.filter((r) => r.length >= head.length - 1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()]))); }

const logRows = fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
const done = new Set(logRows.filter((r) => !r.dry && !['no_composer', 'error', 'no_message_button'].includes(r.status)).map((r) => r.handle));
const order = { A: 0, B: 1, C: 2 };
const targets = parseCSV(fs.readFileSync(path.join(DIR, 'tracker.csv'), 'utf8'))
  .filter((r) => r.city === CITY && r.dm_text && /^@[a-z0-9._]{2,30}$/i.test(r.instagram.trim()))
  .map((r) => ({ name: r.name, handle: r.instagram.trim().slice(1).toLowerCase(), text: r.dm_text, pr: r.priority }))
  .filter((t) => !done.has(t.handle) && (!ONLY || t.handle === ONLY))
  .sort((a, b) => order[a.pr] - order[b.pr]);
console.log(`targets: ${targets.length}${DRY ? ' (dry-run)' : ''}: ${targets.map((t) => t.handle).join(', ')}`);
if (!targets.length) process.exit(0);

const BLOCK_RE = /action blocked|try again later|we limit how often|restrict certain activity|suspicious activity|confirm it'?s you|help us confirm|your account has been|temporarily blocked|couldn'?t send|message not sent/i;
async function blocked(page) { if (/\/challenge\/|\/accounts\/login|\/accounts\/suspended/.test(page.url())) return 'url:' + page.url(); const t = await page.evaluate(() => [...document.querySelectorAll('div[role="dialog"], div[role="alert"]')].map((d) => d.innerText).join(' | ').slice(0, 600)).catch(() => ''); const m = t.match(BLOCK_RE); return m ? m[0] : ''; }
async function dismiss(page) { for (const t of ['Not Now', 'Not now', 'Cancel']) { const b = page.locator(`div[role="dialog"] button:has-text("${t}")`).first(); if (await b.count().catch(() => 0)) { await b.click().catch(() => {}); await sleep(1200); } } }
function append(rec) { fs.appendFileSync(LOG, JSON.stringify({ ts: new Date().toISOString(), ...(DRY ? { dry: true } : {}), ...rec }) + '\n'); }

(async () => {
  clearStaleLock(PROFILE);
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: chromium.executablePath(), headless: false, viewport: { width: 1280, height: 860 }, args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check', '--window-size=1300,900'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  let abort = '', unv = 0, sent = 0;
  for (const [i, t] of targets.entries()) {
    if (abort) break;
    const rec = { handle: t.handle, name: t.name };
    try {
      await page.goto(`https://www.instagram.com/${t.handle}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await sleep(rnd(4500, 7500)); await dismiss(page);
      let b = await blocked(page); if (b) { abort = b; rec.status = 'blocked'; rec.detail = b; append(rec); break; }
      const body = await page.evaluate(() => document.body.innerText.slice(0, 3000));
      if (/Sorry, this page isn't available/i.test(body)) { rec.status = 'not_found'; append(rec); console.log('not found:', t.handle); continue; }
      const msgBtn = page.locator('header div[role="button"]:has-text("Message"), header button:has-text("Message")').first();
      if (await msgBtn.count()) { await msgBtn.click({ timeout: 8000 }); }
      else {
        // No Message button (private account, or messages hidden): try the "..." options menu -> "Send message".
        const opts = page.locator('header svg[aria-label="Options"]').first();
        if (await opts.count()) { await opts.click({ timeout: 8000 }).catch(() => {}); await sleep(rnd(1500, 2500)); }
        const send = page.locator('div[role="dialog"] button:has-text("Send message"), div[role="dialog"] div[role="button"]:has-text("Send message")').first();
        if (!(await send.count())) { rec.status = 'no_message_button'; await page.screenshot({ path: path.join(DIR, `ig-nobutton-${t.handle}.png`) }).catch(() => {}); await page.keyboard.press('Escape').catch(() => {}); append(rec); console.log('no message button:', t.handle); continue; }
        await send.click({ timeout: 8000 }); rec.via = 'options_menu';
      }
      await sleep(rnd(5000, 8000)); await dismiss(page);
      const box = page.locator('div[contenteditable="true"][aria-placeholder^="Message"], div[contenteditable="true"][role="textbox"]').first();
      await box.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {}); await sleep(rnd(2500, 3500));
      if (!(await box.count())) { rec.status = 'no_composer'; append(rec); console.log('no composer:', t.handle); continue; }
      const readPanel = () => box.evaluate((el) => { let p = el; while (p.parentElement && p.getBoundingClientRect().height < 380) p = p.parentElement; const all = [...p.querySelectorAll('img')].filter((x) => !/profile.?picture/i.test(x.alt || '') && (x.naturalWidth || x.width) > 40); return { text: p.innerText, imgs: all.length, alts: all.map((x) => (x.alt || '') + '@' + (x.naturalWidth || x.width)).join(' | ').slice(0, 200) }; });
      let panel = await readPanel(); await sleep(rnd(2000, 3000)); const p2 = await readPanel();
      if (p2.text.length > panel.text.length || p2.imgs > panel.imgs) panel = p2;
      const hist = historyLines(panel.text, t.name);
      if (hist.length || panel.imgs) { rec.status = 'existing_thread'; rec.detail = (hist.slice(0, 4).join(' / ') + (panel.imgs ? ` [imgs: ${panel.alts}]` : '')).slice(0, 300); await page.screenshot({ path: path.join(DIR, `ig-existing-${t.handle}.png`) }).catch(() => {}); append(rec); console.log('existing thread, skipped:', t.handle, '-', rec.detail); await page.keyboard.press('Escape'); continue; }
      rec.message = t.text;
      if (DRY) { rec.status = 'dry_ok'; append(rec); console.log('dry ok:', t.handle); continue; }
      await box.click(); await sleep(rnd(600, 1400));
      await page.keyboard.type(t.text, { delay: rnd(18, 38) }); await sleep(rnd(1500, 2800));
      await page.keyboard.press('Enter'); await sleep(rnd(4500, 7000));
      b = await blocked(page); if (b) { abort = b; rec.status = 'blocked'; rec.detail = b; append(rec); break; }
      const after = await box.evaluate((el) => { let p = el; while (p.parentElement && p.getBoundingClientRect().height < 380) p = p.parentElement; return p.innerText; });
      rec.status = after.includes(t.text.slice(4, 44)) ? 'dm_sent' : 'dm_unverified';
      await page.screenshot({ path: path.join(DIR, `ig-${rec.status}-${t.handle}.png`) }).catch(() => {});
      append(rec); sent++; console.log(`${rec.status}: ${t.handle} [${sent}]`);
      if (rec.status === 'dm_unverified' && ++unv >= 2) { abort = 'two unverified sends; stopping to inspect'; break; }
      if (i < targets.length - 1) await sleep(rnd(50000, 110000));
    } catch (e) { rec.status = 'error'; rec.detail = String(e.message).slice(0, 200); append(rec); console.log('error:', t.handle, rec.detail); await sleep(rnd(8000, 15000)); }
  }
  console.log(abort ? `ABORTED: ${abort}` : `run complete: ${sent} ${DRY ? 'checked' : 'sent'}`);
  await ctx.close();
})().catch((e) => { console.log('FATAL', e.message.slice(0, 300)); process.exit(1); });
