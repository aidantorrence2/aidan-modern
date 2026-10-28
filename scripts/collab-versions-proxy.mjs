// Injecting proxy: :32xx -> :31xx, adds a script to HTML that clicks through the photo picker until the form shows.
import http from 'node:http'
const INJECT = `<script>(function(){if(location.pathname!=='/sign-up-collab')return;var n=0,t=setInterval(function(){if(document.querySelector('fieldset')){clearInterval(t);return}var b=document.querySelector('button[aria-label^="Choose"]');if(b)b.click();if(++n>600)clearInterval(t)},120)})()</script>`
for (let i = 1; i <= 7; i++) {
  const target = 3100 + i, listen = 3200 + i
  http.createServer((req, res) => {
    const h = { ...req.headers, 'accept-encoding': 'identity', host: 'localhost:' + target }
    const up = http.request({ host: 'localhost', port: target, path: req.url, method: req.method, headers: h }, r => {
      const ct = r.headers['content-type'] || ''
      if (!ct.includes('text/html')) { res.writeHead(r.statusCode, r.headers); r.pipe(res); return }
      const chunks = []; r.on('data', c => chunks.push(c)); r.on('end', () => {
        let body = Buffer.concat(chunks).toString('utf8')
        body = body.includes('</head>') ? body.replace('</head>', INJECT + '</head>') : INJECT + body
        const hh = { ...r.headers }; delete hh['content-length']; delete hh['transfer-encoding']
        res.writeHead(r.statusCode, hh); res.end(body)
      })
    })
    up.on('error', e => { res.writeHead(502); res.end('upstream :' + target + ' down: ' + e.message) })
    req.pipe(up)
  }).listen(listen, () => console.log('proxy :' + listen + ' -> :' + target))
}
