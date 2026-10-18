// Act on items in data/approvals.json that Aidan has approved (see flywheel/APPROVALS.md).
// Today: kind "post" with payload.channel "instagram", published through the Instagram Graph
// API (feed image + caption). Needs IG_USER_ID and IG_ACCESS_TOKEN in the environment; they are
// never written to the repo or printed. Without them the script only reports what is waiting.
// Results go into the item's payload (result / posted / error); status is the human's field and
// is never changed here. `--dry` lists what would be posted without calling anything.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(new URL('.', import.meta.url).pathname, '../..')
const file = path.join(root, 'data/approvals.json')
const db = JSON.parse(fs.readFileSync(file, 'utf8'))
const dry = process.argv.includes('--dry')
const igUser = process.env.IG_USER_ID
const igToken = process.env.IG_ACCESS_TOKEN
const now = () => new Date().toISOString().slice(0, 16) + 'Z'

async function postInstagram(item) {
  const base = `https://graph.facebook.com/v21.0/${igUser}`
  const form = o => new URLSearchParams({ ...o, access_token: igToken })
  const container = await fetch(`${base}/media`, {
    method: 'POST',
    body: form({ image_url: item.payload.image, caption: item.payload.caption }),
  }).then(r => r.json())
  if (!container.id) throw new Error(`media container: ${JSON.stringify(container.error || container).slice(0, 200)}`)
  const published = await fetch(`${base}/media_publish`, {
    method: 'POST',
    body: form({ creation_id: container.id }),
  }).then(r => r.json())
  if (!published.id) throw new Error(`media_publish: ${JSON.stringify(published.error || published).slice(0, 200)}`)
  return `posted:instagram:${published.id}`
}

let acted = 0
let waiting = 0
for (const item of db.items) {
  if (item.status !== 'approved' || item.payload?.result) continue
  // Aidan, 18 Oct 2026: nothing is ever posted to his Instagram or other social accounts.
  if (item.kind === 'post') { console.log(`${item.id}: refused, posting to Aidan's accounts is disabled`); continue }
  if (item.kind === 'post' && item.payload?.channel === 'instagram') {
    if (!igUser || !igToken) { waiting++; continue }
    if (dry) { console.log(`would post ${item.id}`); continue }
    try {
      item.payload.result = await postInstagram(item)
      item.payload.posted = now()
      acted++
      console.log(`${item.id}: ${item.payload.result}`)
    } catch (e) {
      item.payload.error = `${now()} ${e.message}`
      console.log(`${item.id}: failed, ${e.message}`)
    }
  } else {
    waiting++
  }
}
fs.writeFileSync(file, JSON.stringify(db, null, 2) + '\n')
const pending = db.items.filter(i => i.status === 'pending').length
const why = igUser && igToken ? 'unsupported kind or channel' : 'no IG_USER_ID / IG_ACCESS_TOKEN in the environment'
console.log(`approvals: ${pending} pending, ${acted} acted on, ${waiting} approved but waiting (${why})`)
