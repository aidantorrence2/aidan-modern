// Static export of the hosted offer pages for GitHub Pages (no Vercel, no server).
// Output: static-offers/index.html + static-offers/<slug>/index.html
// Interest capture: if flywheel/config.json formEndpoint is set, forms POST JSON
// there (Formspree-style). Otherwise the buttons open a mailto to config.mail with a
// machine-readable subject "[offer:<slug>] <intent> <price>" that the hourly
// harvest counts from Gmail. Either way ?src= and utm_* ride along.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(new URL('.', import.meta.url).pathname, '../..')
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'flywheel/config.json'), 'utf8'))
const offers = JSON.parse(fs.readFileSync(path.join(root, 'data/offers.json'), 'utf8'))
const out = path.join(root, 'static-offers')
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const css = fs.readFileSync(path.join(root, 'components/OfferPage.tsx'), 'utf8').split('const css = `')[1].split('`')[0] + '.offer-lead{font-size:20px;line-height:1.45;margin:0 0 14px;color:inherit;opacity:.92}'
const labCss = fs.readFileSync(path.join(root, 'app/offers/page.tsx'), 'utf8').split('const css = `')[1].split('`')[0] + '.lab-sub{font-family:Georgia,serif;font-weight:400;font-size:22px;margin:40px 0 12px}'

const js = `
(function(){
  var CFG=${JSON.stringify({ endpoint: cfg.formEndpoint || '', mail: cfg.mail })};
  var offer=document.body.dataset.offer, price=document.body.dataset.price;
  function attr(){var src='',utm={};try{var u=new URL(location.href);src=u.searchParams.get('src')||'';['utm_source','utm_medium','utm_campaign','utm_content','utm_term','ref'].forEach(function(k){var v=u.searchParams.get(k);if(v)utm[k]=v.slice(0,100)});if(src)sessionStorage.setItem('offer_src',src);else src=sessionStorage.getItem('offer_src')||''}catch(e){}return{src:src.slice(0,100),utm:utm}}
  var a=attr();
  var $=function(s){return document.querySelector(s)};
  var email=$('#email'), reason=$('#reason'), actions=$('#actions'), done=$('#done'), title=$('#done-title'), err=$('#err'), reasonForm=$('#reason-form'), saved=$('#saved'), state=null;
  function mailto(intent,text){var sub='[offer:'+offer+'] '+intent+' '+price;var body=(text||'')+'\\n\\n--\\noffer: '+offer+'\\nintent: '+intent+'\\nsrc: '+(a.src||'-')+'\\nutm: '+JSON.stringify(a.utm)+'\\npage: '+location.href;location.href='mailto:'+CFG.mail+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body)}
  function send(intent,text){
    var payload={offer:offer,intent:intent,email:(email.value||'').trim(),reason:text||'',src:a.src,utm:a.utm,referrer:document.referrer||'',page:location.href};
    try{localStorage.setItem('offer_'+offer+'_'+intent,String(Date.now()))}catch(e){}
    if(CFG.endpoint){return fetch(CFG.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.ok}).catch(function(){return false})}
    mailto(intent,(payload.email?'email: '+payload.email+'\\n':'')+(text||''));return Promise.resolve(true)
  }
  function finish(intent){state=intent;actions.hidden=true;done.hidden=false;title.textContent=intent==='signup'?'You\\u2019re on the list.':'Noted: you\\u2019d pay '+price+'.';if(!CFG.endpoint)title.textContent+=' Send the email that just opened and it counts.'}
  $('#signup').addEventListener('submit',function(e){e.preventDefault();err.textContent='';if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value.trim())){err.textContent='Add an email so we can send early access.';return}send('signup').then(function(ok){if(ok)finish('signup');else err.textContent='Could not save. Try again.'})});
  $('#pay').addEventListener('click',function(){err.textContent='';send('would_pay').then(function(ok){if(ok)finish('would_pay');else err.textContent='Could not save. Try again.'})});
  reasonForm.addEventListener('submit',function(e){e.preventDefault();if(!reason.value.trim())return;send(state||'would_pay',reason.value.trim()).then(function(){reasonForm.hidden=true;saved.hidden=false})});
})();`

function page(o) {
  const faq = (o.faq || []).map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')
  const reasonPrompt = o.reasonPrompt || 'What would make you buy this? One line is plenty.'
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.name)} — pre-launch — Aidan Torrence</title>
<meta name="description" content="${esc(o.headline)}">
<meta property="og:title" content="${esc(o.name)} — ${esc(o.price)}"><meta property="og:description" content="${esc(o.headline)}">
<link rel="canonical" href="${cfg.publicBase}/${o.slug}/"><meta property="og:url" content="${cfg.publicBase}/${o.slug}/"><meta property="og:type" content="website"><meta name="twitter:card" content="summary"><style>${css}</style></head>
<body data-offer="${esc(o.slug)}" data-price="${esc(o.price)}"><div class="offer"><main class="offer-main">
<p class="offer-kicker">Pre-launch · from Aidan Torrence</p>
${o.need ? `<h1>${esc(o.need)}</h1><p class="offer-lead">${esc(o.headline)}</p>` : `<h1>${esc(o.headline)}</h1>`}
<p class="offer-buyer">For ${esc(o.buyer)}.</p>
<ul class="offer-bullets">${o.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
<div class="offer-price"><span class="offer-price-main">${esc(o.price)}</span>${o.priceNote ? `<span class="offer-price-note">${esc(o.priceNote)}</span>` : ''}</div>
<p class="offer-honest">Honest note: this is a pre-launch page. The product is not built yet. I build the ones people ask for, in the order they ask. Leaving your email or clicking “I’d pay” costs nothing and tells me what to build first.</p>
<section id="actions" class="offer-actions">
<form id="signup" class="offer-form"><input type="text" name="company" tabindex="-1" autocomplete="off" class="offer-hp" aria-hidden="true"><input id="email" type="email" inputmode="email" placeholder="your@email.com"><button type="submit">Get early access</button></form>
<div class="offer-pay"><button id="pay" type="button" class="offer-pay-btn">I’d pay ${esc(o.price)}</button><span class="offer-muted">Not a charge. Just a count that decides what gets built.</span></div>
<p id="err" class="offer-error" role="alert"></p>
</section>
<section id="done" class="offer-done" hidden aria-live="polite"><p id="done-title" class="offer-done-title"></p>
<form id="reason-form" class="offer-reason"><label for="reason">${esc(reasonPrompt)}</label><textarea id="reason" rows="2" maxlength="1000"></textarea><button type="submit">Send</button></form>
<p id="saved" class="offer-muted" hidden>Got it. Thank you.</p></section>
${faq ? `<section class="offer-faq">${faq}</section>` : ''}
<footer class="offer-foot"><a href="../">All pre-launch offers</a><span>·</span><a href="https://aidantorrence.com">aidantorrence.com</a><span>·</span><a href="https://www.instagram.com/madebyaidan" rel="noopener">@madebyaidan</a></footer>
</main></div><script>${js}</script></body></html>`
}

function index(list) {
  const resources = globalThis.__resources || []
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pre-launch offers — Aidan Torrence</title><meta name="description" content="Small software tools, each one built only after people ask for it."><link rel="canonical" href="${cfg.publicBase}/"><meta property="og:title" content="Pre-launch software — Aidan Torrence"><meta property="og:description" content="Small software tools, each one built only after people ask for it."><style>${labCss}</style></head>
<body><div class="lab"><main class="lab-main"><p class="lab-kicker">Pre-launch</p><h1>Tools I want to exist.</h1>
<p class="lab-lead">Each page below is a promise, not a product. If enough people leave an email or say they’d pay, I build it, in that order. Nothing here charges you.</p>
${list.length ? '' : '<p class="lab-lead">Nothing is open right now. New tools appear here once people have asked for them in public.</p>'}
${[['For you', list.filter(o => o.need)], ['More offers', list.filter(o => !o.need)]].filter(([, l]) => l.length).map(([h, l]) => `<h2 class="lab-sub">${h}</h2><ul class="lab-list">${l.map(o => `<li><a href="./${o.slug}/?src=lab"><span class="lab-name">${esc(o.name)}</span><span class="lab-head">${esc(o.need ? o.need + ' ' + o.headline : o.headline)}</span><span class="lab-price">${esc(o.price)}</span></a></li>`).join('')}</ul>`).join('')}
${resources.length ? `<h2 class="lab-sub">Free resources</h2><ul class="lab-list">${resources.map(r => `<li><a href="./resources/${r.slug}/"><span class="lab-name">Free</span><span class="lab-head">${esc(r.title)}</span><span class="lab-price">${esc(r.description)}</span></a></li>`).join('')}</ul>` : ''}
${(globalThis.__tools || []).length ? `<h2 class="lab-sub">Free tools</h2><ul class="lab-list">${globalThis.__tools.map(t => `<li><a href="./tools/${t.slug}/"><span class="lab-name">Free tool</span><span class="lab-head">${esc(t.title)}</span><span class="lab-price">${esc(t.description)}</span></a></li>`).join('')}</ul>` : ''}
</main></div></body></html>`
}

// keep rendered post cards (static-offers/posts) across exports; everything else is rebuilt
const postsDir = path.join(out, 'posts'), keep = path.join(root, '.posts-keep')
if (fs.existsSync(postsDir)) { fs.rmSync(keep, { recursive: true, force: true }); fs.renameSync(postsDir, keep) }
fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })
if (fs.existsSync(keep)) fs.renameSync(keep, postsDir)
const live = offers.filter(o => o.status !== 'draft' && o.status !== 'killed')
// drop post cards for offers that are no longer live
if (fs.existsSync(postsDir)) for (const f of fs.readdirSync(postsDir)) {
  const slug = f.replace(/-(feed|story)\.png$/, '')
  if (!live.some(o => o.slug === slug)) fs.rmSync(path.join(postsDir, f))
}
for (const o of live) {
  fs.mkdirSync(path.join(out, o.slug), { recursive: true })
  fs.writeFileSync(path.join(out, o.slug, 'index.html'), page(o))
}
fs.writeFileSync(path.join(out, '.nojekyll'), '')
fs.writeFileSync(path.join(out, '404.html'), '<meta http-equiv="refresh" content="0;url=./">')
// free resource pages (lead magnets): content/resources.json → /resources/<slug>/
const resPath = path.join(root, 'content/resources.json')
const bySlug = Object.fromEntries(live.map(o => [o.slug, o]))
// a resource page only ships while the offer it feeds is live
const resources = (fs.existsSync(resPath) ? JSON.parse(fs.readFileSync(resPath, 'utf8')) : []).filter(r => bySlug[r.offer])
globalThis.__resources = resources
for (const r of resources) {
  const o = bySlug[r.offer]
  const body = r.sections.map(sec => `<h2>${esc(sec.h)}</h2>${(sec.p || []).map(x => `<p>${esc(x)}</p>`).join('')}${sec.list ? `<ul>${sec.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${sec.pre ? `<pre>${esc(sec.pre)}</pre>` : ''}`).join('')
  const cta = o ? `<aside class="res-cta"><p class="offer-kicker">Related, not built yet</p><p class="res-cta-title">${esc(o.name)}: ${esc(o.headline)}</p><p><a class="res-btn" href="../../${o.slug}/?src=resource">See the pre-launch page</a> <span class="offer-muted">${esc(o.price)} · nothing is charged</span></p></aside>` : ''
  fs.mkdirSync(path.join(out, 'resources', r.slug), { recursive: true })
  fs.writeFileSync(path.join(out, 'resources', r.slug, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(r.title)} — Aidan Torrence</title><meta name="description" content="${esc(r.description)}"><link rel="canonical" href="${cfg.publicBase}/resources/${r.slug}/"><meta property="og:title" content="${esc(r.title)}"><meta property="og:description" content="${esc(r.description)}"><meta property="og:type" content="article">
<style>${css}.res p,.res li{color:#d6d6d6;font-size:17px;line-height:1.55}.res h2{font-family:Georgia,serif;font-weight:400;font-size:24px;margin:34px 0 10px}.res ul{padding-left:20px}.res pre{white-space:pre-wrap;background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:14px;font-size:14.5px;line-height:1.5;color:#e6e6e6}.res-cta{margin-top:44px;border:1px solid #2c2c2c;border-radius:12px;padding:18px}.res-cta-title{font-family:Georgia,serif;font-size:19px;line-height:1.3;margin:0 0 12px}.res-btn{display:inline-block;background:#fff;color:#0c0c0c;padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:600;margin-right:10px}</style></head>
<body><div class="offer res"><main class="offer-main"><p class="offer-kicker">Free resource · from Aidan Torrence</p><h1>${esc(r.title)}</h1><p class="offer-buyer">${esc(r.intro)}</p>${body}${cta}
<footer class="offer-foot"><a href="../../">All pre-launch offers</a><span>·</span><a href="https://aidantorrence.com">aidantorrence.com</a><span>·</span><a href="https://www.instagram.com/madebyaidan" rel="noopener">@madebyaidan</a></footer></main></div></body></html>`)
}
// free tools and quizzes (content/tools/<slug>/index.html, listed in content/tools.json) ship while their offer is live
const toolsPath = path.join(root, 'content', 'tools.json')
const tools = (fs.existsSync(toolsPath) ? JSON.parse(fs.readFileSync(toolsPath, 'utf8')) : []).filter(t => bySlug[t.offer] && fs.existsSync(path.join(root, 'content', 'tools', t.slug, 'index.html')))
for (const t of tools) fs.cpSync(path.join(root, 'content', 'tools', t.slug), path.join(out, 'tools', t.slug), { recursive: true })
globalThis.__tools = tools
// IndexNow: a public key file lets Bing, Yandex and others index new pages the day they ship
if (cfg.indexNowKey) fs.writeFileSync(path.join(out, `${cfg.indexNowKey}.txt`), cfg.indexNowKey)
const urls = [`${cfg.publicBase}/`, ...live.map(o => `${cfg.publicBase}/${o.slug}/`), ...resources.map(r => `${cfg.publicBase}/resources/${r.slug}/`), ...tools.map(t => `${cfg.publicBase}/tools/${t.slug}/`)]
const today = new Date().toISOString().slice(0, 10)
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`)
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${cfg.publicBase}/sitemap.xml\n`)
fs.writeFileSync(path.join(out, 'index.html'), index(live))
console.log(`resources: ${resources.length}`)
console.log(`exported ${live.length} offer pages to static-offers/ (base ${cfg.publicBase}, form ${cfg.formEndpoint ? 'endpoint' : 'mailto fallback'})`)
