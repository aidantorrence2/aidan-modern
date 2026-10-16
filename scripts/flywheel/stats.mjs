#!/usr/bin/env node
// Prints the interest table the hourly run reads. Defaults to the live site;
// set BASE_URL for a preview or local server.
//   node scripts/flywheel/stats.mjs [--reasons]
const base = (process.env.BASE_URL || 'https://www.aidantorrence.com').replace(/\/$/, '')
const reasons = process.argv.includes('--reasons')
const res = await fetch(`${base}/api/offers/stats${reasons ? '?reasons=1' : ''}`, { headers: { 'user-agent': 'flywheel-stats' } })
if (!res.ok) {
  console.error(`stats ${res.status} from ${base}`)
  process.exit(1)
}
const json = await res.json()
if (!json.ok) console.error('warning:', json.error)
const rows = Object.entries(json.offers).map(([slug, o]) => ({
  offer: slug, status: o.status, views72h: o.views_72h, signups72h: o.signup_72h, pay72h: o.would_pay_72h, pre72h: o.preorder_72h,
  signups: o.signup_total, pay: o.would_pay_total, pre: o.preorder_total,
}))
rows.sort((a, b) => (b.pre72h * 10 + b.pay72h * 3 + b.signups72h) - (a.pre72h * 10 + a.pay72h * 3 + a.signups72h))
console.log(`as of ${json.as_of || 'n/a'} (${base})`)
console.table(rows)
for (const r of rows) {
  const build = r.pre72h >= 1 || r.pay72h >= 3 || r.signups72h >= 10
  if (build) console.log(`THRESHOLD MET: ${r.offer}`)
}
if (reasons && json.reasons?.length) {
  console.log('\nWhat buyers said:')
  for (const r of json.reasons) console.log(`- [${r.offer}/${r.intent}] ${r.reason}`)
}
