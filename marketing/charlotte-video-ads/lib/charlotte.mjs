// Shared look for the Charlotte reels: the same type system as the winning story deck
// (aidan-modern marketing/carousel/render-coast-story-v2i.mjs): Georgia italic headlines, Caveat handwriting, Poppins badge.
import fs from 'node:fs'
import path from 'node:path'
import { fboxes } from './engine.mjs'

export const CITY = 'Charlotte'
const FDIR = '/Users/aidantorrence/Documents/aidan-modern/marketing/carousel/fonts'
const b64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
export const FONTS = `@font-face{font-family:'Caveat';font-weight:700;src:url(data:font/woff2;base64,${b64('caveat-700.woff2')}) format('woff2')}
@font-face{font-family:'Poppins';font-weight:700;src:url(data:font/woff2;base64,${b64('poppins-700.woff2')}) format('woff2')}`
export const SE = "Georgia,'Times New Roman',serif", HW = "'Caveat',cursive", RD = "'Poppins',sans-serif"
export const SANS = "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif"
export const SH = 'text-shadow:0 2px 8px rgba(0,0,0,.85),0 12px 50px rgba(0,0,0,.6);'
export const FONT_CHECK = ["700 64px Caveat", "700 22px Poppins"]

// top-right city badge (same as the deck); class t so it is audited like any text
export const BADGE = `<div class="badge" style="position:absolute;top:262px;right:54px;text-align:right;text-shadow:0 2px 12px rgba(0,0,0,.95),0 1px 3px rgba(0,0,0,.9);">
  <div class="t" style="font-family:${SE};font-size:50px;font-weight:700;letter-spacing:.15em;color:#fff;line-height:1;">${CITY.toUpperCase()}</div>
  <div style="display:flex;align-items:center;justify-content:flex-end;gap:15px;margin-top:13px;">
    <span style="width:70px;height:2px;background:rgba(255,255,255,.8);display:inline-block;"></span>
    <span class="t" style="font-family:${RD};font-size:22px;font-weight:700;letter-spacing:.28em;color:#fff;">FREE PHOTO SHOOT</span></div></div>`

// a matted print: white border, the photo inside carries its .fbox face markers (scaled with it)
export function print(a, id, w, { mat = 12, crop = null } = {}) {
  const h = Math.round(w * a.h / a.w), k = w / a.w
  return `<div id="${id}" class="abs print" style="width:${w + mat * 2}px;height:${h + mat * 2 + 2}px;background:#fafafa;padding:${mat}px;box-shadow:0 16px 44px rgba(0,0,0,.55),0 3px 10px rgba(0,0,0,.3);">
    <div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;"><div style="position:absolute;left:0;top:0;width:${a.w}px;height:${a.h}px;transform:scale(${k});transform-origin:0 0;"><img src="${a.src}" style="width:100%;height:100%"/>${fboxes(a)}</div></div></div>`
}

// text as hidden glyph spans so layout never moves while it types
export const spans = s => Array.from(s).map(c => `<span style="visibility:hidden">${c === ' ' ? ' ' : c}</span>`).join('')
export const SHOW = `const show=(el,times,t)=>{let n=0;[...el.children].forEach((s,i)=>{const v=t>=times[i];s.style.visibility=v?'visible':'hidden';if(v)n=i+1});return n};`
// fonts only load once something visible uses them; cards that start hidden need this invisible preload
export const PRELOAD = `<div style="position:absolute;left:0;top:0;opacity:0;pointer-events:none;font:700 20px 'Caveat'">a<span style="font-family:'Poppins'">a</span></div>`
