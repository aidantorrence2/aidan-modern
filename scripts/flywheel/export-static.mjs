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

const css = fs.readFileSync(path.join(root, 'components/OfferPage.tsx'), 'utf8').split('const css = `')[1].split('`')[0]
const labCss = fs.readFileSync(path.join(root, 'app/offers/page.tsx'), 'utf8').split('const css = `')[1].split('`')[0]

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
<meta name="robots" content="noindex"><style>${css}</style></head>
<body data-offer="${esc(o.slug)}" data-price="${esc(o.price)}"><div class="offer"><main class="offer-main">
<p class="offer-kicker">Pre-launch · from Aidan Torrence</p>
<h1>${esc(o.headline)}</h1>
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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pre-launch offers — Aidan Torrence</title><meta name="description" content="Small tools for photographers and creators. Each one gets built only if enough people say they want it."><meta name="robots" content="noindex"><style>${labCss}</style></head>
<body><div class="lab"><main class="lab-main"><p class="lab-kicker">Pre-launch</p><h1>Tools I want to exist.</h1>
<p class="lab-lead">Each page below is a promise, not a product. If enough people leave an email or say they’d pay, I build it, in that order. Nothing here charges you.</p>
<ul class="lab-list">${list.map(o => `<li><a href="./${o.slug}/?src=lab"><span class="lab-name">${esc(o.name)}</span><span class="lab-head">${esc(o.headline)}</span><span class="lab-price">${esc(o.price)}</span></a></li>`).join('')}</ul>
</main></div></body></html>`
}

fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })
const live = offers.filter(o => o.status !== 'draft' && o.status !== 'killed')
for (const o of live) {
  fs.mkdirSync(path.join(out, o.slug), { recursive: true })
  fs.writeFileSync(path.join(out, o.slug, 'index.html'), page(o))
}
fs.writeFileSync(path.join(out, 'index.html'), index(live))
fs.writeFileSync(path.join(out, '.nojekyll'), '')
fs.writeFileSync(path.join(out, '404.html'), '<meta http-equiv="refresh" content="0;url=./">')
console.log(`exported ${live.length} offer pages to static-offers/ (base ${cfg.publicBase}, form ${cfg.formEndpoint ? 'endpoint' : 'mailto fallback'})`)
