'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

// Phone-use dashboard. Data comes from /api/phone/summary; events are sent by
// an iOS Shortcuts automation hitting /api/phone/ping. The hourly coach posts
// its critique to /api/phone/review and it shows up under "Hourly coach".

type WindowStats = { minutes: number; sessions: number; quickChecks: number; longest: number; byApp: Record<string, number>; quietMinutes: number }
type Session = { app: string; start: string; end: string; minutes: number; ongoing: boolean; capped: boolean }
type Review = { at: string; status: string; headline: string; body: string; score: number | null }
type Summary = {
  ok: boolean; error?: string
  now: string; tz: string; localTime: string; ready: boolean; readyReason: string
  eventsLast24h: number; lastEventAt: string | null
  prefs: { dailyLimitMin: number; tz: string; quietStart: string; quietEnd: string; goal: string }
  apps: string[]; h1: WindowStats; h12: WindowStats; today: WindowStats
  hourly: { from: string; minutes: number }[]
  sessions: Session[]
  review: Review | null
  reviewHistory: { at: string; status: string; score: number | null }[]
}

const css = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #0c0c0c; color: #fff; }
  .ph { max-width: 540px; margin: 0 auto; padding: 20px 16px 60px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  .ph h1 { font-family: Georgia, serif; font-weight: 400; font-size: 28px; margin: 0; letter-spacing: -0.01em; }
  .ph .sub { color: #8a8a8a; font-size: 13px; margin-top: 4px; }
  .ph .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .ph .pill { display: inline-block; border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
  .ph .pill.ok { background: #143d2c; color: #7fe0ad; }
  .ph .pill.bad { background: #4a1a15; color: #ff9d8f; }
  .ph .pill.warn { background: #46360f; color: #ffd27a; }
  .ph .pill.muted { background: #1e1e1e; color: #9a9a9a; }
  .ph .card { background: #141414; border: 1px solid #242424; border-radius: 16px; padding: 16px; margin-bottom: 12px; }
  .ph .card h2 { margin: 0 0 10px; font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #8a8a8a; }
  .ph .alert { background: #2a120e; border: 1px solid #5a2a22; border-radius: 14px; padding: 14px 16px; margin-bottom: 12px; color: #ffb4a8; font-size: 14px; line-height: 1.45; }
  .ph .alert strong { color: #ff9d8f; }
  .ph .alert.ok { background: #0f2419; border-color: #1f4a34; color: #a6e6c4; }
  .ph .alert.ok strong { color: #7fe0ad; }
  .ph .headline { font-family: Georgia, serif; font-size: 21px; line-height: 1.3; margin: 0 0 8px; }
  .ph .body { white-space: pre-wrap; color: #c9c9c9; font-size: 14.5px; line-height: 1.5; margin: 0; }
  .ph .meta { display: flex; align-items: center; gap: 10px; color: #8a8a8a; font-size: 13px; margin-top: 12px; }
  .ph .score { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; background: #1f2a26; color: #7fe0ad; font-family: Georgia, serif; font-size: 20px; }
  .ph .hist { display: flex; gap: 3px; align-items: flex-end; height: 22px; margin-left: auto; }
  .ph .hist i { display: block; width: 5px; border-radius: 2px; background: #7fe0ad; opacity: .7; }
  .ph .hist i.na { background: #ff9d8f; height: 5px; }
  .ph .big { display: flex; align-items: baseline; gap: 8px; }
  .ph .big .n { font-family: Georgia, serif; font-size: 52px; line-height: 1; font-variant-numeric: tabular-nums; }
  .ph .big .u { color: #8a8a8a; font-size: 14px; }
  .ph .bar { height: 8px; border-radius: 999px; background: #232323; overflow: hidden; margin: 12px 0 8px; }
  .ph .bar i { display: block; height: 100%; background: #7fe0ad; }
  .ph .bar i.warn { background: #ffd27a; } .ph .bar i.bad { background: #ff9d8f; }
  .ph .row { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 13px; color: #8a8a8a; }
  .ph .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
  .ph .stat { background: #1a1a1a; border-radius: 12px; padding: 10px 12px; }
  .ph .stat .v { font-family: Georgia, serif; font-size: 22px; font-variant-numeric: tabular-nums; }
  .ph .stat .k { font-size: 11px; color: #8a8a8a; margin-top: 2px; }
  .ph .win { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ph .win .stat .v { font-size: 30px; }
  .ph .win .stat .s { font-size: 12.5px; color: #a0a0a0; margin-top: 4px; }
  .ph .bars { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; align-items: end; height: 64px; border-bottom: 1px solid #2a2a2a; margin-top: 14px; }
  .ph .bars b { display: block; background: #7fe0ad; opacity: .55; border-radius: 3px 3px 0 0; min-height: 2px; }
  .ph .bars b.cur { opacity: 1; } .ph .bars b.zero { background: #2a2a2a; opacity: 1; }
  .ph .lbl { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; margin-top: 4px; font-size: 10px; color: #6f6f6f; text-align: center; font-variant-numeric: tabular-nums; }
  .ph .apps { display: flex; flex-direction: column; gap: 8px; }
  .ph .app { display: grid; grid-template-columns: 110px 1fr 48px; align-items: center; gap: 10px; font-size: 14px; }
  .ph .app .t { height: 8px; background: #232323; border-radius: 999px; overflow: hidden; }
  .ph .app .t i { display: block; height: 100%; background: #b9a7ff; }
  .ph .app .m { text-align: right; font-variant-numeric: tabular-nums; color: #c9c9c9; font-size: 13px; }
  .ph ul.list { list-style: none; margin: 0; padding: 0; }
  .ph ul.list li { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 9px 0; border-top: 1px solid #222; font-size: 14px; }
  .ph ul.list li:first-child { border-top: 0; }
  .ph ul.list .s { color: #8a8a8a; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  .ph ul.list .m { font-variant-numeric: tabular-nums; color: #c9c9c9; text-align: right; }
  .ph .tag { font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; padding: 2px 6px; border-radius: 6px; background: #1f2a26; color: #7fe0ad; margin-left: 6px; vertical-align: middle; }
  .ph .tag.warn { background: #46360f; color: #ffd27a; }
  .ph .empty { color: #6f6f6f; font-size: 14px; padding: 8px 0; }
  .ph .btn { font: inherit; font-size: 14px; font-weight: 600; color: #0c0c0c; background: #fff; border: 0; border-radius: 10px; padding: 11px 14px; cursor: pointer; }
  .ph .btn.ghost { background: #1e1e1e; color: #fff; border: 1px solid #2c2c2c; }
  .ph .btn:disabled { opacity: .5; }
  .ph .btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .ph input, .ph textarea { font: inherit; font-size: 15px; color: #fff; background: #0f0f0f; border: 1px solid #2c2c2c; border-radius: 10px; padding: 10px 12px; width: 100%; box-sizing: border-box; }
  .ph label { display: block; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #8a8a8a; margin: 12px 0 6px; }
  .ph .url { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; background: #0f0f0f; border: 1px solid #2c2c2c; border-radius: 10px; padding: 10px 12px; word-break: break-all; color: #d6d6d6; }
  .ph ol { margin: 8px 0 0; padding-left: 20px; color: #c9c9c9; font-size: 14.5px; line-height: 1.5; }
  .ph ol li { margin: 6px 0; }
  .ph .note { color: #8a8a8a; font-size: 13px; line-height: 1.45; margin-top: 8px; }
  .ph .msg { margin-top: 10px; font-size: 13.5px; color: #a6e6c4; }
  .ph .msg.bad { color: #ff9d8f; }
  .ph details summary { cursor: pointer; color: #c9c9c9; font-size: 14px; }
`

function fmtT(iso: string, tz?: string) {
  try { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: tz }) } catch { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }
}
function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return `${Math.round(s / 86400)} d ago`
}
const r0 = (n: number) => Math.round(n)

export default function PhonePage() {
  const [key, setKey] = useState<string>('')
  const [keyInput, setKeyInput] = useState('')
  const [data, setData] = useState<Summary | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ t: string; bad?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [limit, setLimit] = useState('90')
  const [qs, setQs] = useState('22:00')
  const [qe, setQe] = useState('07:00')
  const [goal, setGoal] = useState('')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    const u = new URL(window.location.href)
    setOrigin(u.origin)
    const k = u.searchParams.get('k') || (() => { try { return localStorage.getItem('phone.k') || '' } catch { return '' } })()
    if (k) { setKey(k); try { localStorage.setItem('phone.k', k) } catch {} }
  }, [])

  const load = useCallback(async (k: string) => {
    if (!k) return
    try {
      const r = await fetch(`/api/phone/summary?k=${encodeURIComponent(k)}`, { cache: 'no-store' })
      const d = (await r.json()) as Summary
      if (!d.ok) { setErr(d.error || 'Failed to load'); return }
      setErr(null); setData(d)
      setLimit(String(d.prefs.dailyLimitMin)); setQs(d.prefs.quietStart); setQe(d.prefs.quietEnd); setGoal(d.prefs.goal || '')
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz && d.prefs.tz !== tz) {
        await fetch(`/api/phone/settings?k=${encodeURIComponent(k)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tz }) })
      }
    } catch (e: any) { setErr(e?.message || 'Network error') }
  }, [])

  useEffect(() => {
    if (!key) return
    load(key)
    const id = setInterval(() => load(key), 60_000)
    const vis = () => { if (!document.hidden) load(key) }
    document.addEventListener('visibilitychange', vis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis) }
  }, [key, load])

  const pingUrl = useMemo(() => `${origin}/api/phone/ping?k=${key}&app=`, [origin, key])

  async function testPing() {
    setBusy(true); setMsg(null)
    try {
      const r = await fetch(`/api/phone/ping?k=${encodeURIComponent(key)}&app=Test&action=open&source=dashboard`)
      const d = await r.json()
      if (d.ok) { setMsg({ t: `Test event stored at ${fmtT(d.ts)}. The site is receiving pings.` }); load(key) }
      else setMsg({ t: d.error || 'Ping failed', bad: true })
    } catch (e: any) { setMsg({ t: e?.message || 'Network error', bad: true }) }
    setBusy(false)
  }

  async function savePrefs() {
    setBusy(true); setMsg(null)
    try {
      const r = await fetch(`/api/phone/settings?k=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dailyLimitMin: limit, quietStart: qs, quietEnd: qe, goal }) })
      const d = await r.json()
      if (d.ok) { setMsg({ t: 'Saved.' }); load(key) } else setMsg({ t: d.error || 'Save failed', bad: true })
    } catch (e: any) { setMsg({ t: e?.message || 'Network error', bad: true }) }
    setBusy(false)
  }

  const style = <style dangerouslySetInnerHTML={{ __html: css }} />

  if (!key) {
    return (
      <div className="ph">{style}
        <h1>Phone</h1>
        <div className="sub">Enter the access key to open the dashboard.</div>
        <div className="card" style={{ marginTop: 16 }}>
          <label htmlFor="k">Access key</label>
          <input id="k" value={keyInput} onChange={e => setKeyInput(e.target.value)} autoCapitalize="off" autoCorrect="off" />
          <div className="btns"><button className="btn" onClick={() => { const k = keyInput.trim(); if (k) { setKey(k); try { localStorage.setItem('phone.k', k) } catch {} } }}>Open</button></div>
        </div>
      </div>
    )
  }

  const d = data
  const lim = d?.prefs.dailyLimitMin || 0
  const todayMin = d ? r0(d.today.minutes) : 0
  const pct = lim ? Math.min(100, (todayMin / lim) * 100) : 0
  const byApp12 = d ? Object.entries(d.h12.byApp).sort((a, b) => b[1] - a[1]) : []
  const maxApp = byApp12.length ? byApp12[0][1] : 1
  const maxHour = d ? Math.max(20, ...d.hourly.map(h => h.minutes)) : 20

  return (
    <div className="ph">{style}
      <div className="top">
        <div>
          <h1>Phone</h1>
          <div className="sub">{d ? `${new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} · ${d.tz}` : 'Loading…'}</div>
        </div>
        {d && <span className={`pill ${d.ready ? 'ok' : 'bad'}`}>{d.ready ? 'Ready' : 'Not ready'}</span>}
      </div>

      {err && <div className="alert"><strong>Could not load.</strong> {err}{err === 'Bad key' && <> <button className="btn ghost" style={{ marginLeft: 8, padding: '6px 10px' }} onClick={() => { setKey(''); try { localStorage.removeItem('phone.k') } catch {} }}>Change key</button></>}</div>}

      {d && !d.ready && (
        <div className="alert"><strong>Not ready.</strong> {d.readyReason} The hourly coach will keep sending “Urgent alert — not enough info” until events arrive. Set up the automation below and send a test ping.</div>
      )}
      {d && d.ready && (
        <div className="alert ok"><strong>Receiving events.</strong> {d.eventsLast24h} in the last 24 h, last one {ago(d.lastEventAt!)}.</div>
      )}

      <section className="card">
        <div className="row" style={{ marginBottom: 10 }}><h2 style={{ margin: 0 }}>Hourly coach</h2>
          {d?.review ? <span className={`pill ${d.review.status === 'ready' ? 'ok' : d.review.status === 'not_enough_info' ? 'bad' : 'warn'}`}>{d.review.status === 'ready' ? 'Reviewed' : d.review.status === 'not_enough_info' ? 'Urgent · not enough info' : 'Unreachable'}</span> : <span className="pill muted">No review yet</span>}
        </div>
        {d?.review ? (
          <>
            <p className="headline">{d.review.headline}</p>
            <p className="body">{d.review.body}</p>
            <div className="meta">
              {typeof d.review.score === 'number' && <span className="score">{d.review.score}</span>}
              <span>{ago(d.review.at)} · {fmtT(d.review.at)}</span>
              <span className="hist">{d.reviewHistory.slice(-16).map((h, i) => typeof h.score === 'number' ? <i key={i} style={{ height: Math.max(4, (h.score / 10) * 22) }} title={`${h.score}/10`} /> : <i key={i} className="na" title="not enough info" />)}</span>
            </div>
          </>
        ) : (
          <p className="body">Runs at 44 minutes past every hour. It reads the last hour and the last 12 hours from this page’s data and writes a short critique here.</p>
        )}
      </section>

      <section className="card">
        <div className="row"><h2 style={{ margin: 0 }}>Today on the phone</h2><span className={`pill ${lim ? (todayMin > lim ? 'bad' : todayMin > lim * 0.8 ? 'warn' : 'ok') : 'muted'}`}>{lim ? `limit ${lim} min` : 'no limit'}</span></div>
        <div className="big" style={{ marginTop: 8 }}><span className="n">{todayMin}</span><span className="u">min {lim ? `of ${lim}` : ''}</span></div>
        <div className="bar"><i className={pct >= 100 ? 'bad' : pct >= 80 ? 'warn' : ''} style={{ width: `${pct}%` }} /></div>
        <div className="row"><span>{lim ? (todayMin > lim ? `${todayMin - lim} min over` : `${lim - todayMin} min left`) : 'Set a limit below'}</span><span>{lim ? `${Math.round((todayMin / lim) * 100)}%` : ''}</span></div>
        <div className="grid3">
          <div className="stat"><div className="v">{d?.today.sessions ?? 0}</div><div className="k">pickups</div></div>
          <div className="stat"><div className="v">{d?.today.quickChecks ?? 0}</div><div className="k">quick checks</div></div>
          <div className="stat"><div className="v">{d ? r0(d.today.longest) : 0}</div><div className="k">longest, min</div></div>
        </div>
      </section>

      <section className="card">
        <div className="row"><h2 style={{ margin: 0 }}>What the coach sees</h2><span>{d ? d.localTime : ''}</span></div>
        <div className="win" style={{ marginTop: 10 }}>
          <div className="stat"><div className="k">Last hour</div><div className="v">{d ? r0(d.h1.minutes) : 0}<small style={{ fontSize: 13, color: '#8a8a8a' }}> min</small></div><div className="s">{d?.h1.sessions ?? 0} pickups · {d?.h1.quickChecks ?? 0} quick</div></div>
          <div className="stat"><div className="k">Last 12 hours</div><div className="v">{d ? r0(d.h12.minutes) : 0}<small style={{ fontSize: 13, color: '#8a8a8a' }}> min</small></div><div className="s">{d?.h12.sessions ?? 0} pickups · {d ? r0(d.h12.quietMinutes) : 0} in quiet hrs</div></div>
        </div>
        <div className="bars">{(d?.hourly || Array.from({ length: 12 }, () => ({ from: '', minutes: 0 }))).map((h, i) => <b key={i} className={`${i === 11 ? 'cur' : ''} ${h.minutes ? '' : 'zero'}`} style={{ height: `${Math.max(3, (h.minutes / maxHour) * 100)}%` }} title={`${r0(h.minutes)} min`} />)}</div>
        <div className="lbl">{(d?.hourly || []).map((h, i) => <span key={i}>{i % 3 === 2 ? fmtT(h.from, d?.tz).replace(':00', '').replace(' ', '') : ''}</span>)}</div>
        {byApp12.length > 0 && (
          <div className="apps" style={{ marginTop: 16 }}>
            {byApp12.map(([app, m]) => <div className="app" key={app}><span>{app}</span><span className="t"><i style={{ width: `${(m / maxApp) * 100}%` }} /></span><span className="m">{r0(m)} min</span></div>)}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Sessions, last 12 hours</h2>
        {d && d.sessions.length ? (
          <ul className="list">
            {d.sessions.map((s, i) => (
              <li key={i}>
                <span>{s.app}{s.ongoing && <span className="tag">open now</span>}{s.capped && <span className="tag warn">no close, capped</span>}<div className="s">{fmtT(s.start, d.tz)} – {fmtT(s.end, d.tz)}</div></span>
                <span className="m">{s.minutes < 1 ? '<1' : r0(s.minutes)} min</span>
              </li>
            ))}
          </ul>
        ) : <div className="empty">No sessions yet.</div>}
      </section>

      <section className="card">
        <h2>Setup on the phone</h2>
        <p className="note" style={{ marginTop: 0 }}>Each app you want tracked gets one automation in the Shortcuts app. It fires silently every time that app opens or closes and tells this site.</p>
        <label>Ping URL (add the app name at the end)</label>
        <div className="url">{pingUrl}Instagram</div>
        <div className="btns">
          <button className="btn ghost" onClick={() => { navigator.clipboard?.writeText(pingUrl).then(() => setMsg({ t: 'URL copied. Paste it in the automation and add the app name.' })) }}>Copy URL</button>
          <button className="btn" onClick={testPing} disabled={busy}>Send test ping</button>
        </div>
        {msg && <div className={`msg ${msg.bad ? 'bad' : ''}`}>{msg.t}</div>}
        <details style={{ marginTop: 14 }}>
          <summary>iPhone steps (about a minute per app)</summary>
          <ol>
            <li>Open the <strong>Shortcuts</strong> app → <strong>Automation</strong> tab → <strong>+</strong> (New Automation).</li>
            <li>Choose <strong>App</strong>. Tap Choose and pick the app, e.g. Instagram. Tick <strong>both</strong> “Is Opened” and “Is Closed”.</li>
            <li>Select <strong>Run Immediately</strong> and turn off “Notify When Run”. Tap Next.</li>
            <li>Tap <strong>New Blank Automation</strong>, search for the action <strong>Get Contents of URL</strong>.</li>
            <li>Paste the ping URL and type the app name after <code>app=</code> (e.g. <code>app=Instagram</code>). Leave Method as GET. Tap Done.</li>
            <li>Repeat for every app you want tracked. Open one of them, then close it, and this page should show a session.</li>
          </ol>
          <p className="note">The same URL handles open and close: the first ping is an open, the next one for that app is a close. An open with no close is capped at 30 minutes.</p>
          <p className="note">Android: install MacroDroid or Tasker from the Play Store, add a trigger “Application launched / closed” for each app, with an HTTP GET action to the same URL.</p>
        </details>
        {d && d.apps.length > 0 && <p className="note">Apps seen so far: {d.apps.join(', ')}.</p>}
      </section>

      <section className="card">
        <h2>Goals</h2>
        <label htmlFor="lim">Daily limit, minutes</label>
        <input id="lim" inputMode="numeric" value={limit} onChange={e => setLimit(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label htmlFor="qs">Quiet from</label><input id="qs" type="time" value={qs} onChange={e => setQs(e.target.value)} /></div>
          <div><label htmlFor="qe">Quiet until</label><input id="qe" type="time" value={qe} onChange={e => setQe(e.target.value)} /></div>
        </div>
        <label htmlFor="goal">What you’re trying to change</label>
        <textarea id="goal" rows={2} value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. no Instagram before noon, phone out of the bedroom" />
        <div className="btns"><button className="btn" onClick={savePrefs} disabled={busy}>Save goals</button></div>
        <p className="note">Add this page to your home screen (Share → Add to Home Screen). The key is remembered on this phone.</p>
      </section>
    </div>
  )
}
