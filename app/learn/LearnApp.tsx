'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Deck } from '@/lib/learn/types'
import { dayIndex, dayStart, formatDays, formatMs, previewInterval, schedule, type CardProgress, type Grade } from '@/lib/learn/srs'
import {
  allCards,
  buildQueue,
  emptyStore,
  forecast,
  loadStore,
  parseStore,
  pickNext,
  saveStore,
  streak,
  todayLog,
  type CardRef,
  type Settings,
  type Store,
} from '@/lib/learn/store'
import { CSS } from './styles'

type View = 'home' | 'study' | 'browse' | 'settings'

const GRADES: { g: Grade; label: string }[] = [
  { g: 1, label: 'Again' },
  { g: 2, label: 'Hard' },
  { g: 3, label: 'Good' },
  { g: 4, label: 'Easy' },
]

// ---------- speech ----------

/** Exposed by the Android app wrapper (android-learn/): WebView has no speechSynthesis or downloads. */
type NativeBridge = {
  speak(text: string, lang: string, rate: number): void
  saveFile(name: string, content: string): void
}
const nativeBridge = () => (window as unknown as { LearnNative?: NativeBridge }).LearnNative

function useSpeech(lang: string, rate: number, voiceURI: string) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (nativeBridge()) return setSupported(true)
    if (!('speechSynthesis' in window)) return
    setSupported(true)
    const base = lang.split('-')[0].toLowerCase()
    const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase()
    const load = () => {
      const list = speechSynthesis.getVoices().filter((v) => norm(v).startsWith(base))
      // Exact locale (pt-BR) before other variants (pt-PT).
      list.sort((a, b) => Number(norm(b) === lang.toLowerCase()) - Number(norm(a) === lang.toLowerCase()))
      setVoices(list)
    }
    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [lang])

  const speak = useCallback(
    (text: string) => {
      const spoken = text.replace(/\s\/\s/g, ', ').replace(/…/g, '')
      const native = nativeBridge()
      if (native) return native.speak(spoken, lang, rate)
      if (!('speechSynthesis' in window)) return
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(spoken)
      u.lang = lang
      u.rate = rate
      const v = voices.find((x) => x.voiceURI === voiceURI) ?? voices[0]
      if (v) u.voice = v
      speechSynthesis.speak(u)
    },
    [lang, rate, voiceURI, voices],
  )

  return { speak, voices, supported }
}

// ---------- typed answers ----------

const clean = (s: string) =>
  s.toLowerCase().replace(/[.,!?¿¡…:;"“”()]/g, ' ').replace(/\s+/g, ' ').trim()
const bare = (s: string) => clean(s).normalize('NFD').replace(/[̀-ͯ]/g, '')

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

type Check = 'ok' | 'close' | 'no'

function checkAnswer(input: string, target: string): Check {
  const a = clean(input)
  if (!a) return 'no'
  const options = [target, ...target.split(' / ')]
  if (options.some((t) => clean(t) === a)) return 'ok'
  const b = bare(input)
  if (options.some((t) => bare(t) === b || (b.length > 4 && distance(bare(t), b) <= 1))) return 'close'
  return 'no'
}

// ---------- small pieces ----------

function SpeakButton({ onClick, small }: { onClick: () => void; small?: boolean }) {
  return (
    <button className={`lx-say${small ? ' sm' : ''}`} onClick={onClick} aria-label="Play audio" type="button">
      <svg width={small ? 14 : 18} height={small ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 5a10 10 0 0 1 0 14" />
      </svg>
    </button>
  )
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="lx-switch" onClick={() => onChange(!on)} />
}

function cardBadge(p: CardProgress | undefined, now: number) {
  if (!p) return { cls: '', text: 'new' }
  if (p.state !== 'review') return { cls: 'learning', text: 'learning' }
  if (p.due <= now) return { cls: 'due', text: 'due' }
  return { cls: 'review', text: formatDays(Math.max(1, dayIndex(p.due) - dayIndex(now))) }
}

// ---------- app ----------

/** `embedded`: running inside the Android app, where there's no language index to go back to. */
export default function LearnApp({ deck, embedded = false }: { deck: Deck; embedded?: boolean }) {
  const [store, setStore] = useState<Store | null>(null)
  const [view, setView] = useState<View>('home')
  const [now, setNow] = useState(() => Date.now())
  const [current, setCurrent] = useState<CardRef | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [typed, setTyped] = useState('')
  const [undo, setUndo] = useState<{ store: Store; card: CardRef } | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const shownAt = useRef(0)

  const settings = store?.settings
  const { speak, voices, supported } = useSpeech(deck.tts, settings?.rate ?? 1, settings?.voice ?? '')

  useEffect(() => setStore(loadStore(deck.code)), [deck.code])
  useEffect(() => {
    if (store) saveStore(deck.code, store)
  }, [deck.code, store])
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])

  const queue = useMemo(() => (store ? buildQueue(deck, store, now) : null), [deck, store, now])

  const show = useCallback((c: CardRef | null) => {
    setCurrent(c)
    setRevealed(false)
    setTyped('')
    shownAt.current = Date.now()
  }, [])

  // When the study screen is waiting on a learning card, pick it up once it comes due.
  useEffect(() => {
    if (view !== 'study' || current || !queue) return
    const c = pickNext(queue, now)
    if (c) show(c)
  }, [view, current, queue, now, show])

  const speakRef = useRef(speak)
  speakRef.current = speak
  const autoplay = !!settings?.autoplay
  useEffect(() => {
    if (view !== 'study' || !current || !autoplay) return
    if ((current.dir === 'r' && !revealed) || (current.dir === 'p' && revealed)) speakRef.current(current.note.t)
  }, [view, current, revealed, autoplay])

  const updateSettings = (patch: Partial<Settings>) =>
    setStore((s) => (s ? { ...s, settings: { ...s.settings, ...patch } } : s))

  const startStudy = () => {
    if (!store) return
    const t = Date.now()
    setNow(t)
    show(pickNext(buildQueue(deck, store, t), t))
    setUndo(null)
    setView('study')
  }

  const reveal = () => {
    if (!current || revealed) return
    ;(document.activeElement as HTMLElement | null)?.blur()
    setRevealed(true)
  }

  const answer = useCallback(
    (grade: Grade) => {
      if (!store || !current || !revealed) return
      const t = Date.now()
      const prev = store.cards[current.id]
      const log = todayLog(store, t)
      if (prev) log.reviews++
      else log.new++
      if (grade === 1) log.again++
      log.ms += Math.min(60_000, t - shownAt.current)
      const next: Store = {
        ...store,
        cards: { ...store.cards, [current.id]: schedule(prev, grade, t) },
        days: { ...store.days, [dayIndex(t)]: log },
      }
      setUndo({ store, card: current })
      setStore(next)
      setNow(t)
      show(pickNext(buildQueue(deck, next, t), t))
    },
    [store, current, revealed, deck, show],
  )

  const undoLast = useCallback(() => {
    if (!undo) return
    setStore(undo.store)
    show(undo.card)
    setUndo(null)
  }, [undo, show])

  const learnMore = () => {
    if (!store) return
    const t = Date.now()
    const log = todayLog(store, t)
    log.extra += 10
    const next = { ...store, days: { ...store.days, [dayIndex(t)]: log } }
    setStore(next)
    setNow(t)
    show(pickNext(buildQueue(deck, next, t), t))
    setView('study')
  }

  useEffect(() => {
    if (view !== 'study') return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') {
        if (e.key === 'Enter') {
          e.preventDefault()
          reveal()
        }
        return
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!current) return
        if (revealed) answer(3)
        else reveal()
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        answer(Number(e.key) as Grade)
      } else if (e.key === 'z' || e.key === 'u') {
        undoLast()
      } else if (e.key === 'r' && current) {
        speak(current.note.t)
      } else if (e.key === 'Escape') {
        setView('home')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Lets the Android back button close a sub-screen before exiting the app.
  useEffect(() => {
    const w = window as unknown as { learnBack?: () => boolean }
    w.learnBack = () => {
      if (view === 'home') return false
      setView('home')
      return true
    }
  }, [view])

  if (!store || !queue || !settings) {
    return (
      <div className="lx">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </div>
    )
  }

  const totalNotes = deck.topics.reduce((n, t) => n + t.notes.length, 0)
  const dueCount = queue.fresh.length + queue.learning.length + queue.reviews.length
  const log = todayLog(store, now)
  // Whether "learn more" would actually find unseen cards beyond today's limit.
  const moreAvailable = dueCount === 0 && buildQueue(deck, { ...store, settings: { ...settings, newPerDay: 1e6 } }, now).fresh.length > 0

  // ---------- study ----------
  if (view === 'study') {
    const p = current ? store.cards[current.id] : undefined
    const kind = !current ? '' : !p ? 'new' : p.state === 'review' ? 'due' : 'learn'
    const result = current && revealed && typed.trim() ? checkAnswer(typed, current.note.t) : null
    const upcoming = queue.learning[0]
    const canLearnMore = !current && !upcoming && moreAvailable

    return (
      <div className="lx">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="lx-study">
          <div className="lx-bar">
            <button className="lx-icon" onClick={() => setView('home')} aria-label="Back to overview">
              ✕
            </button>
            <div className="lx-mini" aria-label="New, learning, review">
              <span className={`c-new${kind === 'new' ? ' cur' : ''}`}>{queue.fresh.length}</span>
              <span className={`c-learn${kind === 'learn' ? ' cur' : ''}`}>{queue.learning.length}</span>
              <span className={`c-due${kind === 'due' ? ' cur' : ''}`}>{queue.reviews.length}</span>
            </div>
            <button className="lx-icon" onClick={undoLast} disabled={!undo}>
              Undo
            </button>
          </div>

          {current ? (
            <>
              <div className="lx-card" key={current.id + shownAt.current}>
                <div className="lx-kicker">
                  {current.dir === 'r' ? 'What does this mean?' : `Say it in ${deck.name.split(' ').pop()}`}
                </div>
                {current.dir === 'r' ? (
                  <>
                    <p className="lx-word">{current.note.t}</p>
                    {supported && <SpeakButton onClick={() => speak(current.note.t)} />}
                  </>
                ) : (
                  <>
                    <p className="lx-word en">{current.note.en}</p>
                    {settings.typeAnswers && (
                      <input
                        className="lx-input"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder="Type your answer"
                        autoFocus
                        readOnly={revealed}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        lang={deck.tts}
                      />
                    )}
                  </>
                )}

                {revealed && (
                  <>
                    <hr className="lx-rule" />
                    {current.dir === 'r' ? (
                      <div className="lx-answer">{current.note.en}</div>
                    ) : (
                      <>
                        <p className="lx-word">{current.note.t}</p>
                        {supported && <SpeakButton onClick={() => speak(current.note.t)} />}
                        {result && (
                          <div className={`lx-result ${result}`}>
                            {result === 'ok' ? 'Correct ✓' : result === 'close' ? 'Almost — check accents & spelling' : <>You typed <s>{typed}</s></>}
                          </div>
                        )}
                      </>
                    )}
                    {current.note.ex && (
                      <div className="lx-ex">
                        <div className="pt">
                          {current.note.ex}
                          {supported && <SpeakButton small onClick={() => speak(current.note.ex!)} />}
                        </div>
                        {current.note.exEn && <div className="en">{current.note.exEn}</div>}
                      </div>
                    )}
                    {current.note.tip && <div className="lx-tip">{current.note.tip}</div>}
                  </>
                )}
              </div>

              <div className="lx-actions">
                {revealed ? (
                  <div className="lx-grades">
                    {GRADES.map(({ g, label }) => (
                      <button key={g} className={`lx-grade g${g}`} onClick={() => answer(g)}>
                        <b>{label}</b>
                        <small>{previewInterval(p, g, now)}</small>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button className="lx-reveal" onClick={reveal}>
                    Show answer
                  </button>
                )}
                <div className="lx-keys">space · reveal / good &nbsp; 1–4 · grade &nbsp; r · replay &nbsp; z · undo</div>
              </div>
            </>
          ) : (
            <div className="lx-card">
              {upcoming ? (
                <div className="lx-done">
                  <strong>Nice — short break</strong>
                  Next learning card in {formatMs(upcoming.due - now)}. It’ll appear here automatically.
                </div>
              ) : (
                <div className="lx-done">
                  <strong>Done for today</strong>
                  {log.new + log.reviews} cards · {Math.max(1, Math.round(log.ms / 60_000))} min
                  {log.new + log.reviews > 0 && ` · ${Math.round((1 - log.again / (log.new + log.reviews)) * 100)}% first-try`}
                </div>
              )}
              {canLearnMore && (
                <button className="lx-secondary" onClick={learnMore}>
                  Learn 10 more new cards
                </button>
              )}
              <button className="lx-secondary" onClick={() => setView('home')}>
                Back to overview
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- browse ----------
  if (view === 'browse') {
    const q = bare(query)
    const notes = deck.topics
      .filter((t) => !filter || t.id === filter)
      .flatMap((t) => t.notes)
      .filter((n) => !q || bare(n.t).includes(q) || bare(n.en).includes(q))
    return (
      <div className="lx">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="lx-wrap">
          <div className="lx-top">
            <button className="lx-link" onClick={() => setView('home')}>
              ← Back
            </button>
            <span className="lx-link">{notes.length} entries</span>
          </div>
          <input className="lx-search" placeholder="Search Portuguese or English" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginTop: 12 }} />
          <div className="lx-chips">
            <button className={`lx-chip${!filter ? ' on' : ''}`} onClick={() => setFilter('')}>
              All
            </button>
            {deck.topics.map((t) => (
              <button key={t.id} className={`lx-chip${filter === t.id ? ' on' : ''}`} onClick={() => setFilter(t.id)}>
                {t.name}
              </button>
            ))}
          </div>
          <div>
            {notes.map((n) => {
              const r = cardBadge(store.cards[`${n.id}:r`], now)
              const pr = cardBadge(store.cards[`${n.id}:p`], now)
              return (
                <div className="lx-row" key={n.id}>
                  <div className="lx-row-main">
                    <div className="lx-row-t">{n.t}</div>
                    <div className="lx-row-en">{n.en}</div>
                  </div>
                  <div className="lx-badges">
                    {settings.mode !== 'production' && <span className={`lx-badge ${r.cls}`} title="Recognition">read · {r.text}</span>}
                    {settings.mode !== 'recognition' && <span className={`lx-badge ${pr.cls}`} title="Production">say · {pr.text}</span>}
                  </div>
                  {supported && <SpeakButton small onClick={() => speak(n.t)} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ---------- settings ----------
  if (view === 'settings') {
    const exportData = () => {
      const json = JSON.stringify(store, null, 1)
      const name = `learn-${deck.code}-${new Date().toISOString().slice(0, 10)}.json`
      const native = nativeBridge()
      if (native) return native.saveFile(name, json)
      const blob = new Blob([json], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = name
      a.click()
      URL.revokeObjectURL(a.href)
    }
    const importData = async (file: File | undefined) => {
      if (!file) return
      try {
        const parsed = parseStore(JSON.parse(await file.text()))
        if (!parsed) throw new Error('bad file')
        if (confirm(`Replace your current progress with ${Object.keys(parsed.cards).length} cards from this file?`)) {
          setStore(parsed)
          setUndo(null)
        }
      } catch {
        alert('That file doesn’t look like a progress export.')
      }
    }
    const lang = deck.name.split(' ').pop()

    return (
      <div className="lx">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="lx-wrap">
          <div className="lx-top">
            <button className="lx-link" onClick={() => setView('home')}>
              ← Back
            </button>
          </div>
          <h1 className="lx-h1" style={{ fontSize: 34 }}>
            Settings
          </h1>

          <div className="lx-section">
            <h2 className="lx-h2">Study</h2>
            <div className="lx-field">
              <label htmlFor="npd">
                New cards per day
                <span className="hint">Each new card brings a few reviews per day for weeks.</span>
              </label>
              <input
                id="npd"
                className="lx-num"
                type="number"
                min={0}
                max={200}
                value={settings.newPerDay}
                onChange={(e) => updateSettings({ newPerDay: Math.max(0, Math.min(200, Number(e.target.value) || 0)) })}
              />
            </div>
            <div className="lx-field">
              <label htmlFor="mode">
                Card directions
                <span className="hint">In “both”, you learn to recognize a word before producing it.</span>
              </label>
              <select id="mode" className="lx-select" value={settings.mode} onChange={(e) => updateSettings({ mode: e.target.value as Settings['mode'] })}>
                <option value="both">Both</option>
                <option value="recognition">{lang} → English</option>
                <option value="production">English → {lang}</option>
              </select>
            </div>
            <div className="lx-field">
              <div className="lbl">
                Type answers
                <span className="hint">Type the {lang} on English → {lang} cards.</span>
              </div>
              <Switch label="Type answers" on={settings.typeAnswers} onChange={(v) => updateSettings({ typeAnswers: v })} />
            </div>
          </div>

          <div className="lx-section">
            <h2 className="lx-h2">Audio</h2>
            {!supported && <p className="lx-about">This browser doesn’t support speech synthesis.</p>}
            <div className="lx-field">
              <div className="lbl">
                Play audio automatically
                <span className="hint">Reads the {lang} aloud when it appears.</span>
              </div>
              <Switch label="Autoplay audio" on={settings.autoplay} onChange={(v) => updateSettings({ autoplay: v })} />
            </div>
            <div className="lx-field">
              <label htmlFor="voice">
                Voice
                <span className="hint">{voices.length ? `${voices.length} available on this device` : 'Using the system default'}</span>
              </label>
              <select id="voice" className="lx-select" value={settings.voice} onChange={(e) => updateSettings({ voice: e.target.value })}>
                <option value="">Default</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
            <div className="lx-field">
              <label htmlFor="rate">Speed</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select id="rate" className="lx-select" value={settings.rate} onChange={(e) => updateSettings({ rate: Number(e.target.value) })}>
                  <option value={0.7}>Slow</option>
                  <option value={0.85}>Relaxed</option>
                  <option value={0.95}>Normal</option>
                  <option value={1.1}>Fast</option>
                </select>
                {supported && <SpeakButton small onClick={() => speak('Oi! Tudo bem? Vamos aprender português.')} />}
              </div>
            </div>
          </div>

          <div className="lx-section">
            <h2 className="lx-h2">Progress</h2>
            <p className="lx-about">Progress is saved in this browser. Export it to back up or move to another device.</p>
            <button className="lx-secondary" onClick={exportData}>
              Export progress
            </button>
            <label className="lx-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
              Import progress
              <input type="file" accept="application/json,.json" hidden onChange={(e) => importData(e.target.files?.[0])} />
            </label>
            <button
              className="lx-secondary lx-danger"
              onClick={() => {
                if (confirm('Erase all progress for this language? This can’t be undone.')) {
                  setStore({ ...emptyStore(), settings: store.settings })
                  setUndo(null)
                }
              }}
            >
              Reset progress
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- home ----------
  const today = dayIndex(now)
  const cards = Object.values(store.cards)
  const learned = cards.filter((c) => c.state === 'review').length
  const mature = cards.filter((c) => c.state === 'review' && c.interval >= 21).length
  const fc = forecast(store, now)
  const fcMax = Math.max(1, ...fc)
  const totalCards = allCards(deck, settings).length
  const next = queue.learning[0]

  return (
    <div className="lx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lx-wrap">
        <div className="lx-top">
          {embedded ? (
            <span />
          ) : (
            <Link className="lx-link" href={'/learn' as any}>
              ← Languages
            </Link>
          )}
          <button className="lx-link" onClick={() => setView('settings')}>
            Settings
          </button>
        </div>

        <div className="lx-hero">
          <div className="lx-flag">{deck.flag}</div>
          <h1 className="lx-h1">{deck.nativeName}</h1>
          <p className="lx-sub">
            {deck.name} · {totalNotes} words & phrases · {deck.topics.length} topics
          </p>
        </div>

        <div className="lx-counts">
          <div className="lx-count">
            <b className="c-new">{queue.fresh.length}</b>
            <span>New</span>
          </div>
          <div className="lx-count">
            <b className="c-learn">{queue.learning.length}</b>
            <span>Learning</span>
          </div>
          <div className="lx-count">
            <b className="c-due">{queue.reviews.length}</b>
            <span>Review</span>
          </div>
        </div>
        {dueCount > 0 ? (
          <button className="lx-primary" onClick={startStudy}>
            {cards.length ? 'Study now' : 'Start learning'}
          </button>
        ) : (
          <>
            <div className="lx-done">
              <strong>All caught up</strong>
              {next ? `Next learning card in ${formatMs(next.due - now)}` : fc[1] ? `${fc[1]} reviews tomorrow` : 'Nothing due — come back tomorrow'}
            </div>
            {moreAvailable && (
              <button className="lx-secondary" onClick={learnMore}>
                Learn 10 more new cards
              </button>
            )}
          </>
        )}

        <div className="lx-section">
          <h2 className="lx-h2">Progress</h2>
          <div className="lx-stats">
            <div className="lx-stat">
              <b>{streak(store, now)}</b>
              <span>day streak</span>
            </div>
            <div className="lx-stat">
              <b>{log.new + log.reviews}</b>
              <span>cards today</span>
            </div>
            <div className="lx-stat">
              <b>{learned}</b>
              <span>of {totalCards} learned</span>
            </div>
            <div className="lx-stat">
              <b>{mature}</b>
              <span>mature (21d+)</span>
            </div>
          </div>
        </div>

        <div className="lx-section">
          <h2 className="lx-h2">Reviews this week</h2>
          <div className="lx-fc">
            {fc.map((n, i) => (
              <div className="lx-fc-col" key={i}>
                <em>{n || ''}</em>
                <div className="lx-fc-bar" style={{ height: `${(n / fcMax) * 60}px` }} />
                <small>{i === 0 ? 'Today' : new Date(dayStart(today + i)).toLocaleDateString(undefined, { weekday: 'short' })}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="lx-section">
          <h2 className="lx-h2">Topics</h2>
          {deck.topics.map((t) => {
            const on = !settings.off.includes(t.id)
            const done = t.notes.filter((n) => store.cards[`${n.id}:r`]?.state === 'review' || store.cards[`${n.id}:p`]?.state === 'review').length
            return (
              <div className={`lx-topic${on ? '' : ' off'}`} key={t.id}>
                <div className="lx-topic-main">
                  <div className="lx-topic-name">
                    {t.name} <span style={{ color: 'var(--muted)', fontSize: 13 }}>· {done}/{t.notes.length}</span>
                  </div>
                  <div className="lx-topic-blurb">{t.blurb}</div>
                  <div className="lx-prog">
                    <div style={{ width: `${(done / t.notes.length) * 100}%` }} />
                  </div>
                </div>
                <Switch
                  label={`Introduce new cards from ${t.name}`}
                  on={on}
                  onChange={(v) => updateSettings({ off: v ? settings.off.filter((id) => id !== t.id) : [...settings.off, t.id] })}
                />
              </div>
            )
          })}
          <p className="lx-about" style={{ marginTop: 12 }}>
            Switched-off topics stop introducing new cards; anything you’ve started keeps coming up for review.
          </p>
        </div>

        <div className="lx-section">
          <details className="lx-about">
            <summary style={{ cursor: 'pointer', color: 'var(--text)' }}>How it works</summary>
            <div style={{ marginTop: 12 }}>
              <p>
                This is spaced repetition: each card comes back right before you’d forget it. New cards repeat after 1 and 10 minutes, then after a day, then at
                growing intervals — 3 days, a week, a month and beyond.
              </p>
              <p>
                Grade yourself honestly. <b style={{ color: 'var(--again)' }}>Again</b> if you didn’t know it, <b style={{ color: 'var(--hard)' }}>Hard</b> if it was
                a struggle, <b style={{ color: 'var(--good)' }}>Good</b> if you got it, <b style={{ color: 'var(--easy)' }}>Easy</b> if it was instant. Cards you find
                hard come back more often.
              </p>
              <p>A few minutes every day beats an hour once a week. Your progress is stored in this browser.</p>
            </div>
          </details>
        </div>

        <div className="lx-foot">
          <button className="lx-link" onClick={() => setView('browse')}>
            Browse all cards
          </button>
          <button className="lx-link" onClick={() => setView('settings')}>
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
