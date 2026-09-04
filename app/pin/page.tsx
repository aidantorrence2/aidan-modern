'use client'

/* eslint-disable @next/next/no-img-element */

// /pin — "Pinterest, but you're choosing between photographs."
//
// The page opens as a Meta carousel ad sitting in a mock Instagram feed: post
// header, swipeable cards, Learn more bar, like/comment row. Tapping the CTA
// peels the ad chrome away — the media window grows to fill the screen — and
// what was the ad's image area becomes the mobile site. From there it's seven
// this-or-that rounds; every pick scores three axes (light, place, direction),
// and the result is an actual moodboard built from frames that match, with a
// palette sampled from those same frames. It ends on /sign-up-collab.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ── Taxonomy ────────────────────────────────────────────────────────────────
type Place = 'street' | 'nature' | 'interior'
type Light = 'golden' | 'shadow' | 'soft' | 'neon'
type Mood = 'editorial' | 'candid' | 'intimate'
type Photo = { src: string; place: Place; light: Light; mood: Mood }

// Every frame is tagged by hand off the real photograph, not the filename.
const LIB: Photo[] = [
  { src: '/images/large/manila-gallery-canal-001.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/large/manila-gallery-closeup-001.jpg', place: 'nature', light: 'golden', mood: 'intimate' },
  { src: '/images/large/manila-gallery-dsc-0130.jpg', place: 'nature', light: 'golden', mood: 'intimate' },
  { src: '/images/large/manila-gallery-dsc-0190.jpg', place: 'interior', light: 'golden', mood: 'editorial' },
  { src: '/images/large/manila-gallery-dsc-0911.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/large/manila-gallery-floor-001.jpg', place: 'nature', light: 'soft', mood: 'candid' },
  { src: '/images/large/manila-gallery-graffiti-001.jpg', place: 'street', light: 'shadow', mood: 'editorial' },
  { src: '/images/large/manila-gallery-ivy-001.jpg', place: 'interior', light: 'soft', mood: 'editorial' },
  { src: '/images/large/manila-gallery-ivy-002.jpg', place: 'nature', light: 'golden', mood: 'intimate' },
  { src: '/images/large/manila-gallery-market-001.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/large/manila-gallery-night-001.jpg', place: 'interior', light: 'shadow', mood: 'intimate' },
  { src: '/images/large/manila-gallery-night-002.jpg', place: 'interior', light: 'shadow', mood: 'intimate' },
  { src: '/images/large/manila-gallery-night-003.jpg', place: 'interior', light: 'neon', mood: 'intimate' },
  { src: '/images/large/manila-gallery-park-001.jpg', place: 'nature', light: 'soft', mood: 'candid' },
  { src: '/images/large/manila-gallery-purple-006.jpg', place: 'interior', light: 'soft', mood: 'editorial' },
  { src: '/images/large/manila-gallery-shadow-001.jpg', place: 'nature', light: 'soft', mood: 'editorial' },
  { src: '/images/large/manila-gallery-statue-001.jpg', place: 'nature', light: 'soft', mood: 'editorial' },
  { src: '/images/large/manila-gallery-street-001.jpg', place: 'street', light: 'golden', mood: 'candid' },
  { src: '/images/large/manila-gallery-tropical-001.jpg', place: 'nature', light: 'shadow', mood: 'editorial' },
  { src: '/images/large/manila-gallery-urban-001.jpg', place: 'street', light: 'shadow', mood: 'editorial' },
  { src: '/images/large/manila-gallery-urban-002.jpg', place: 'street', light: 'shadow', mood: 'editorial' },
  { src: '/images/large/manila-gallery-urban-003.jpg', place: 'street', light: 'shadow', mood: 'editorial' },
  { src: '/images/large/manila-gallery-white-001.jpg', place: 'nature', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/000001-8.jpg', place: 'street', light: 'golden', mood: 'editorial' },
  { src: '/images/proof/000005-3.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/000008-3-2.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/000008-3.jpg', place: 'interior', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/000009.jpg', place: 'street', light: 'soft', mood: 'candid' },
  { src: '/images/proof/000012.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/000013-3.jpg', place: 'street', light: 'neon', mood: 'candid' },
  { src: '/images/proof/000014-3.jpg', place: 'street', light: 'neon', mood: 'candid' },
  { src: '/images/proof/000015-3.jpg', place: 'street', light: 'neon', mood: 'editorial' },
  { src: '/images/proof/000016.jpg', place: 'street', light: 'golden', mood: 'intimate' },
  { src: '/images/proof/000019-6.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/000023.jpg', place: 'street', light: 'soft', mood: 'candid' },
  { src: '/images/proof/000025.jpg', place: 'street', light: 'soft', mood: 'candid' },
  { src: '/images/proof/000038-4.jpg', place: 'nature', light: 'soft', mood: 'candid' },
  { src: '/images/proof/000039.jpg', place: 'nature', light: 'golden', mood: 'editorial' },
  { src: '/images/proof/000041.jpg', place: 'street', light: 'golden', mood: 'editorial' },
  { src: '/images/proof/000042-5.jpg', place: 'interior', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/000053-5.jpg', place: 'street', light: 'soft', mood: 'intimate' },
  { src: '/images/proof/000062.jpg', place: 'street', light: 'soft', mood: 'editorial' },
  { src: '/images/proof/DSC_0075.jpg', place: 'interior', light: 'shadow', mood: 'intimate' },
  { src: '/images/proof/DSC_0321.jpg', place: 'nature', light: 'soft', mood: 'intimate' },
  { src: '/images/proof/DSC_0347.jpg', place: 'street', light: 'golden', mood: 'candid' },
  { src: '/images/proof/DSC_0526.jpg', place: 'nature', light: 'golden', mood: 'intimate' },
  { src: '/images/faves/000010-6.jpg', place: 'nature', light: 'shadow', mood: 'editorial' },
  { src: '/images/faves/000016-3.jpg', place: 'street', light: 'golden', mood: 'editorial' },
  { src: '/images/faves/000039-3.jpg', place: 'street', light: 'soft', mood: 'candid' },
  { src: '/images/faves/000040-5.jpg', place: 'street', light: 'shadow', mood: 'editorial' },
  { src: '/images/faves/000047-4.jpg', place: 'street', light: 'neon', mood: 'candid' },
  { src: '/images/faves/000062-7.jpg', place: 'interior', light: 'golden', mood: 'editorial' },
]

const BY_SRC = new Map(LIB.map(p => [p.src, p]))
const photo = (src: string): Photo => BY_SRC.get(src) ?? LIB[0]

// ── The rounds ──────────────────────────────────────────────────────────────
// Seven pairs. Each one is a real fork — the two frames disagree on at least
// two axes, so a tap carries signal instead of noise. Sides alternate so the
// same answer is never in the same place twice running.
const PAIRS: { prompt: string; left: string; right: string }[] = [
  {
    prompt: 'Which light do you want on you?',
    left: '/images/proof/000041.jpg',
    right: '/images/large/manila-gallery-urban-002.jpg',
  },
  {
    prompt: 'Where should we shoot it?',
    left: '/images/large/manila-gallery-white-001.jpg',
    right: '/images/proof/000008-3-2.jpg',
  },
  {
    prompt: 'Pick the one you would post.',
    left: '/images/proof/000015-3.jpg',
    right: '/images/proof/000005-3.jpg',
  },
  {
    prompt: 'Close and quiet, or full length?',
    left: '/images/large/manila-gallery-dsc-0130.jpg',
    right: '/images/large/manila-gallery-graffiti-001.jpg',
  },
  {
    prompt: 'Which one feels more like you?',
    left: '/images/proof/000042-5.jpg',
    right: '/images/proof/DSC_0526.jpg',
  },
  {
    prompt: 'Last light or no light?',
    left: '/images/large/manila-gallery-statue-001.jpg',
    right: '/images/large/manila-gallery-night-002.jpg',
  },
  {
    prompt: 'Caught moving, or held still?',
    left: '/images/faves/000047-4.jpg',
    right: '/images/faves/000040-5.jpg',
  },
]

// ── The ad ──────────────────────────────────────────────────────────────────
type AdCard = { src: string; head: string; sub: string; cta?: string }
const AD_CARDS: AdCard[] = [
  { src: '/images/proof/000041.jpg', head: 'Tap the photos you like.', sub: 'Seven taps. Thirty seconds.' },
  { src: '/images/large/manila-gallery-urban-002.jpg', head: 'I read your taste.', sub: 'Light, place, direction.' },
  { src: '/images/large/manila-gallery-white-001.jpg', head: 'You get a moodboard.', sub: 'Your shoot, already planned.' },
  { src: '/images/proof/000016.jpg', head: 'Then I shoot it. Free.', sub: 'You keep every edited frame.' },
  { src: '/images/faves/000062-7.jpg', head: 'Ready?', sub: 'Build your moodboard now.', cta: 'Start picking' },
]

// ── Copy for the result ─────────────────────────────────────────────────────
const LIGHT_TEXT: Record<Light, { label: string; note: string }> = {
  golden: { label: 'Golden hour', note: 'The ninety minutes before sunset. Warm skin, long shadows.' },
  shadow: { label: 'Hard light', note: 'Midday sun with sharp shadow edges. High contrast, no softening.' },
  soft: { label: 'Soft daylight', note: 'Open shade or overcast. Even, clean, true colour.' },
  neon: { label: 'After dark', note: 'Shop signs and street lamps. Colour cast straight onto skin.' },
}
const PLACE_TEXT: Record<Place, { label: string; note: string }> = {
  street: { label: 'City streets', note: 'Alleys, shutters, markets, crossings. We keep moving.' },
  nature: { label: 'Green and water', note: 'Parks, leaves, rock, coastline. Quiet backgrounds.' },
  interior: { label: 'Indoors', note: 'Rooms, doorways, plain walls, one window.' },
}
const MOOD_TEXT: Record<Mood, { label: string; note: string }> = {
  editorial: { label: 'Directed', note: 'Built frames. I tell you where to stand and what to do with your hands.' },
  candid: { label: 'Candid', note: 'Walking, turning, caught in between. Almost nothing posed.' },
  intimate: { label: 'Close up', note: 'Tight crops. Face, hands, the expression before you settle.' },
}

const NAMES: Record<string, string> = {
  'golden|street': 'Late Sun on Concrete',
  'golden|nature': 'Warm Light, Green Air',
  'golden|interior': 'Last Light Indoors',
  'shadow|street': 'Hard Light, Hard Edges',
  'shadow|nature': 'Deep Green, Low Light',
  'shadow|interior': 'The Dark Room',
  'soft|street': 'Quiet Streets, Flat Light',
  'soft|nature': 'Open Green, Soft Day',
  'soft|interior': 'White Room, Clean Light',
  'neon|street': 'Neon, After Dark',
  'neon|nature': 'Night Air, Colour Cast',
  'neon|interior': 'Low Light, Four Walls',
}

// Palettes sampled from the actual frames each board is built from, quantised
// and spread so no two swatches collapse into each other.
const PALETTES: Record<string, string[]> = {
  'golden|street': ['#2f2a21', '#010101', '#755640', '#ddd0c9', '#b69b8f'],
  'golden|nature': ['#010101', '#681e10', '#876d42', '#202a24', '#b69b8f'],
  'golden|interior': ['#413d3a', '#010101', '#681e10', '#5e5c59', '#c6c1b8'],
  'shadow|street': ['#413d3a', '#121617', '#a7a38e', '#838672', '#5e5c59'],
  'shadow|nature': ['#010101', '#1c2f28', '#b69b8f', '#e3e7ef', '#727d68'],
  'shadow|interior': ['#413d3a', '#18161c', '#681e10', '#fdfdfd', '#5e5c59'],
  'soft|street': ['#191919', '#b0b2b0', '#533d2f', '#a0856c', '#6f848b'],
  'soft|nature': ['#27251f', '#797555', '#e8e5e3', '#b1a9a8', '#76a3bc'],
  'soft|interior': ['#261515', '#681e10', '#fdfdfd', '#c6c1b8', '#2e3b38'],
  'neon|street': ['#18161c', '#5b5c54', '#b0b2b0', '#522a29', '#dee5e2'],
  'neon|nature': ['#18161c', '#5b5c54', '#b69b8f', '#e3e7ef', '#323a3a'],
  'neon|interior': ['#413d3a', '#18161c', '#681e10', '#fdfdfd', '#5e5c59'],
}

// ── Scoring ─────────────────────────────────────────────────────────────────
// Light and place decide the board; direction colours the copy. Ties break on
// a fixed order so the same set of picks always lands on the same board.
const LIGHT_ORDER: Light[] = ['golden', 'soft', 'shadow', 'neon']
const PLACE_ORDER: Place[] = ['street', 'nature', 'interior']
const MOOD_ORDER: Mood[] = ['editorial', 'candid', 'intimate']

// Most picks wins. A tie goes to whichever tag they chose most recently —
// seven rounds tie often, and "your latest instinct" beats an alphabetical
// coin toss the visitor can't see.
function winner<T extends string>(
  counts: Record<string, number>,
  last: Record<string, number>,
  order: T[],
): T {
  let best = order[0]
  for (const k of order) {
    const c = counts[k] ?? 0
    const bc = counts[best] ?? 0
    if (c > bc) best = k
    else if (c === bc && c > 0 && (last[k] ?? -1) > (last[best] ?? -1)) best = k
  }
  return best
}

function profileOf(picks: Photo[]) {
  const count = { light: {}, place: {}, mood: {} } as Record<string, Record<string, number>>
  const last = { light: {}, place: {}, mood: {} } as Record<string, Record<string, number>>
  picks.forEach((pick, i) => {
    for (const axis of ['light', 'place', 'mood'] as const) {
      const tag = pick[axis]
      count[axis][tag] = (count[axis][tag] ?? 0) + 1
      last[axis][tag] = i
    }
  })
  return {
    light: winner(count.light, last.light, LIGHT_ORDER),
    place: winner(count.place, last.place, PLACE_ORDER),
    mood: winner(count.mood, last.mood, MOOD_ORDER),
  }
}

// The board leads with the frames they actually chose that fit the profile —
// they recognise those — then fills to nine by how well the rest of the
// library matches. Scoring never returns fewer than nine, so a profile with a
// thin corner of the library (night in nature, say) still gets a full board.
function buildBoard(picks: Photo[], light: Light, place: Place, mood: Mood) {
  const score = (x: Photo) =>
    (x.light === light ? 3 : 0) + (x.place === place ? 3 : 0) + (x.mood === mood ? 1 : 0)
  const chosen: Photo[] = []
  const seen = new Set<string>()
  for (const x of [...picks].sort((a, b) => score(b) - score(a))) {
    if (score(x) >= 3 && !seen.has(x.src)) {
      seen.add(x.src)
      chosen.push(x)
    }
  }
  for (const x of [...LIB].sort((a, b) => score(b) - score(a))) {
    if (chosen.length >= 9) break
    if (!seen.has(x.src)) {
      seen.add(x.src)
      chosen.push(x)
    }
  }
  return chosen.slice(0, 9)
}

// ── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  html, body {
    margin: 0; padding: 0;
    background: #0c0c0c;
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
  }
  .pin-root {
    --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    --serif: Georgia, 'Times New Roman', serif;
    font-family: var(--sans);
    min-height: 100dvh;
    background: #0c0c0c;
    display: flex; align-items: center; justify-content: center;
  }

  /* The device. Full bleed on a phone, a framed handset on a desktop so the
     ad reads as an ad. */
  .pin-device {
    position: relative;
    width: 100%; max-width: 100%;
    height: 100dvh;
    background: #fff;
    overflow: hidden;
  }
  @media (min-width: 760px) {
    .pin-root { padding: 28px 0; }
    .pin-device {
      width: 400px; height: min(860px, calc(100dvh - 56px));
      border-radius: 42px;
      border: 9px solid #1b1b1d;
      box-shadow: 0 40px 90px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.06);
    }
  }

  .pin-layer { position: absolute; inset: 0; }
  .pin-layer.is-hidden { pointer-events: none; opacity: 0; }

  /* ── Instagram chrome ───────────────────────────────────────────────── */
  .ig-top {
    position: absolute; top: 0; left: 0; right: 0; z-index: 4;
    background: #fff;
    transition: opacity .38s ease, transform .5s cubic-bezier(.4,0,.2,1);
  }
  .ig-status {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 20px 2px; font-size: 12px; font-weight: 600; color: #111;
    letter-spacing: .01em;
  }
  .ig-status .bars { display: flex; gap: 3px; align-items: flex-end; }
  .ig-status .bars i { display: block; width: 3px; background: #111; border-radius: 1px; }
  .ig-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 14px 8px;
    border-bottom: 1px solid #efefef;
  }
  .ig-word { font-family: var(--serif); font-size: 21px; letter-spacing: -.02em; color: #111; font-style: italic; }
  .ig-nav .icons { display: flex; gap: 16px; color: #111; }
  .ig-post-head { display: flex; align-items: center; gap: 10px; padding: 9px 12px; }
  .ig-avatar {
    width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
    box-shadow: 0 0 0 1.5px #fff, 0 0 0 3px #d8324f;
  }
  .ig-who { flex: 1; min-width: 0; line-height: 1.25; }
  .ig-who b { font-size: 13.5px; color: #111; font-weight: 600; display: block; }
  .ig-who span { font-size: 11.5px; color: #737373; }
  .ig-dots { color: #111; font-size: 17px; letter-spacing: 1px; }

  .ig-bottom {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 4;
    background: #fff;
    transition: opacity .38s ease, transform .5s cubic-bezier(.4,0,.2,1);
  }
  .ig-cta {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; border: 0; background: #fafafa;
    border-top: 1px solid #efefef; border-bottom: 1px solid #efefef;
    padding: 13px 14px; font: inherit; font-size: 14.5px; font-weight: 600; color: #111;
    cursor: pointer; text-align: left;
  }
  .ig-cta:active { background: #f0f0f0; }
  .ig-cta .chev { color: #8e8e8e; font-size: 17px; }
  .ig-actions { display: flex; align-items: center; gap: 15px; padding: 10px 14px 2px; color: #111; }
  .ig-actions .spacer { flex: 1; }
  .ig-meta { padding: 2px 14px 16px; font-size: 13px; color: #111; line-height: 1.45; }
  .ig-meta .likes { font-weight: 600; }
  .ig-meta .cap { margin-top: 3px; color: #262626; }
  .ig-meta .cap b { font-weight: 600; }
  .ig-meta .cap .tags { color: #00376b; }
  .ig-dotrow { display: flex; gap: 4px; justify-content: center; padding: 9px 0 1px; }
  .ig-dotrow i { width: 5px; height: 5px; border-radius: 50%; background: #c7c7c7; transition: background .2s ease; }
  .ig-dotrow i.on { background: #3897f0; }

  /* ── The media window: an ad card that grows into the whole screen ────── */
  .ig-window {
    position: absolute; left: 0; right: 0; z-index: 2;
    top: 152px; bottom: 178px;
    overflow: hidden; background: #000;
    transition: top .62s cubic-bezier(.5,0,.15,1), bottom .62s cubic-bezier(.5,0,.15,1);
  }
  .is-peeled .ig-window { top: 0; bottom: 0; }
  .is-peeled .ig-top { opacity: 0; transform: translateY(-16px); }
  .is-peeled .ig-bottom { opacity: 0; transform: translateY(20px); }
  .is-peeled .ig-top, .is-peeled .ig-bottom { visibility: hidden; transition: opacity .38s ease, transform .5s cubic-bezier(.4,0,.2,1), visibility 0s linear .5s; }

  .ad-track {
    display: flex; height: 100%; width: 100%;
    overflow-x: auto; overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scrollbar-width: none; -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .ad-track::-webkit-scrollbar { display: none; }
  .is-peeled .ad-track { overflow: hidden; }
  .ad-card {
    position: relative; flex: 0 0 100%; height: 100%;
    scroll-snap-align: center; scroll-snap-stop: always;
  }
  .ad-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ad-shade {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,.34) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,.72) 100%);
  }
  .ad-copy { position: absolute; left: 22px; right: 22px; bottom: 34px; color: #fff; }
  .ad-copy h2 {
    font-family: var(--serif); font-weight: 400; font-size: 28px; line-height: 1.12;
    margin: 0; letter-spacing: -.01em; text-shadow: 0 2px 22px rgba(0,0,0,.5);
  }
  .ad-copy p {
    margin: 8px 0 0; font-size: 13px; letter-spacing: .06em; text-transform: uppercase;
    color: rgba(255,255,255,.82);
  }
  .ad-badge {
    position: absolute; top: 12px; right: 12px;
    background: rgba(0,0,0,.55); color: #fff; font-size: 12px; font-weight: 600;
    padding: 4px 9px; border-radius: 12px; backdrop-filter: blur(3px);
  }
  .ad-cardbtn {
    display: inline-block; margin-top: 16px;
    background: #fff; color: #111; border: 0; cursor: pointer;
    font: inherit; font-size: 15px; font-weight: 600;
    padding: 13px 26px; border-radius: 999px;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
  }
  .ad-cardbtn:active { transform: scale(.97); }
  .ad-arrow {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
    width: 30px; height: 30px; border-radius: 50%; border: 0; cursor: pointer;
    background: rgba(255,255,255,.9); color: #111; font-size: 15px; line-height: 1;
    display: none; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,.25);
  }
  @media (min-width: 760px) { .ad-arrow { display: flex; } }
  .ad-arrow.prev { left: 8px; }
  .ad-arrow.next { right: 8px; }
  .ad-swipe {
    position: absolute; z-index: 3; right: 14px; bottom: 148px;
    color: #fff; font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
    background: rgba(0,0,0,.55); padding: 6px 11px; border-radius: 999px; backdrop-filter: blur(3px);
    animation: adNudge 1.9s ease-in-out infinite;
  }
  @keyframes adNudge {
    0%, 100% { opacity: .55; transform: translateX(0); }
    50% { opacity: 1; transform: translateX(-7px); }
  }

  /* ── The site ────────────────────────────────────────────────────────── */
  .site {
    position: absolute; inset: 0; z-index: 5;
    background: #0c0c0c; color: #f4f1ec;
    display: flex; flex-direction: column;
    opacity: 0; transition: opacity .45s ease .1s;
  }
  .site.is-in { opacity: 1; }

  .site-head { padding: 14px 18px 8px; flex: 0 0 auto; }
  .site-brand {
    display: flex; align-items: baseline; justify-content: space-between;
    font-size: 10px; letter-spacing: .26em; text-transform: uppercase;
    color: rgba(244,241,236,.42);
  }
  .site-bar { height: 2px; background: rgba(255,255,255,.12); margin-top: 10px; border-radius: 2px; overflow: hidden; }
  .site-bar i { display: block; height: 100%; background: #e8e4dd; transition: width .45s cubic-bezier(.4,0,.2,1); }
  .site-prompt {
    font-family: var(--serif); font-size: 21px; line-height: 1.25; margin: 13px 0 0;
    letter-spacing: -.01em; font-weight: 400;
  }

  .pick-row { flex: 1 1 auto; display: flex; gap: 7px; padding: 12px 12px 0; min-height: 0; }
  .pick-card {
    position: relative; flex: 1 1 0; min-width: 0; border: 0; padding: 0; cursor: pointer;
    background: #151515; border-radius: 4px; overflow: hidden;
    transition: transform .34s cubic-bezier(.34,1.3,.5,1), opacity .34s ease, filter .34s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .pick-card img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 34%; display: block; }
  .pick-card .veil {
    position: absolute; inset: 0; background: #d8324f; opacity: 0;
    transition: opacity .28s ease; mix-blend-mode: multiply;
  }
  .pick-card .saved {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) scale(.5);
    background: #d8324f; color: #fff; border-radius: 999px;
    font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
    padding: 9px 15px; opacity: 0; transition: opacity .2s ease, transform .34s cubic-bezier(.34,1.5,.5,1);
    box-shadow: 0 8px 26px rgba(0,0,0,.45); white-space: nowrap;
  }
  .pick-card.is-picked { transform: scale(1.02); }
  .pick-card.is-picked .veil { opacity: .18; }
  .pick-card.is-picked .saved { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  .pick-card.is-dropped { transform: scale(.9); opacity: .3; filter: grayscale(1); }
  .pick-hint {
    text-align: center; font-size: 10px; letter-spacing: .22em; text-transform: uppercase;
    color: rgba(244,241,236,.34); padding: 11px 0 0;
  }

  .rail { flex: 0 0 auto; padding: 9px 12px 14px; }
  .rail-head {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 9.5px; letter-spacing: .24em; text-transform: uppercase;
    color: rgba(244,241,236,.4); margin-bottom: 7px;
  }
  .rail-strip { display: flex; gap: 5px; }
  .rail-slot {
    flex: 1 1 0; aspect-ratio: 3/4; border-radius: 3px; overflow: hidden;
    border: 1px dashed rgba(255,255,255,.13); background: rgba(255,255,255,.03);
  }
  .rail-slot.filled { border: 1px solid transparent; animation: railPop .4s cubic-bezier(.34,1.5,.5,1); }
  .rail-slot img { width: 100%; height: 100%; object-fit: cover; display: block; }
  @keyframes railPop {
    0% { transform: scale(.4) translateY(14px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }

  /* Building screen */
  .building {
    position: absolute; inset: 0; z-index: 6; background: #0c0c0c;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; color: #f4f1ec;
  }
  .building p { font-family: var(--serif); font-size: 19px; margin: 0; letter-spacing: -.01em; }
  .building .track { width: 130px; height: 2px; background: rgba(255,255,255,.13); overflow: hidden; border-radius: 2px; }
  .building .track i { display: block; height: 100%; width: 40%; background: #e8e4dd; animation: buildSlide 1s ease-in-out infinite; }
  @keyframes buildSlide {
    0% { transform: translateX(-110%); } 100% { transform: translateX(330%); }
  }

  /* ── Board ───────────────────────────────────────────────────────────── */
  .board { position: absolute; inset: 0; z-index: 5; background: #0c0c0c; color: #f4f1ec; overflow-y: auto; -webkit-overflow-scrolling: touch; }
  .board-inner { padding: 26px 16px 30px; }
  .board-kicker { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: rgba(244,241,236,.42); }
  .board h1 {
    font-family: var(--serif); font-weight: 400; font-size: 33px; line-height: 1.1;
    margin: 11px 0 0; letter-spacing: -.02em;
  }
  .board .lede { margin: 11px 0 0; font-size: 14px; line-height: 1.6; color: rgba(244,241,236,.66); }
  .swatches { display: flex; margin: 20px 0 0; border-radius: 3px; overflow: hidden; height: 30px; }
  .swatches i { flex: 1 1 0; }
  .masonry { columns: 2; column-gap: 6px; margin: 20px 0 0; }
  .masonry figure { margin: 0 0 6px; break-inside: avoid; position: relative; border-radius: 3px; overflow: hidden; }
  .masonry img { width: 100%; display: block; }
  .masonry .yours {
    position: absolute; top: 6px; left: 6px;
    background: #d8324f; color: #fff; font-size: 8.5px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase; padding: 3px 7px; border-radius: 999px;
  }
  .specs { margin: 24px 0 0; border-top: 1px solid rgba(255,255,255,.11); }
  .spec { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,.11); }
  .spec .k {
    flex: 0 0 74px; font-size: 9.5px; letter-spacing: .2em; text-transform: uppercase;
    color: rgba(244,241,236,.4); padding-top: 3px;
  }
  .spec .v { flex: 1; min-width: 0; }
  .spec .v b { display: block; font-family: var(--serif); font-size: 17px; font-weight: 400; letter-spacing: -.01em; }
  .spec .v span { display: block; margin-top: 4px; font-size: 12.5px; line-height: 1.55; color: rgba(244,241,236,.55); }
  .board-cta {
    display: block; margin: 26px 0 0; text-align: center; text-decoration: none;
    background: #f4f1ec; color: #0c0c0c; border-radius: 999px;
    padding: 17px 20px; font-size: 15.5px; font-weight: 600; letter-spacing: -.01em;
  }
  .board-cta:active { transform: scale(.985); }
  .board-fine { margin: 13px 0 0; text-align: center; font-size: 12px; line-height: 1.55; color: rgba(244,241,236,.45); }
  .board-restart {
    display: block; margin: 20px auto 0; background: none; border: 0; cursor: pointer;
    font: inherit; font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(244,241,236,.38); text-decoration: underline; text-underline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .ig-window, .ig-top, .ig-bottom, .site, .pick-card, .site-bar i { transition-duration: .01ms !important; }
    .rail-slot.filled, .ad-swipe, .building .track i { animation: none !important; }
  }
`

// ── Icons ───────────────────────────────────────────────────────────────────
const Ico = {
  heart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
  ),
  comment: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-.9L3 20.5l1.5-4.5a8.4 8.4 0 0 1-.9-4 8.4 8.4 0 0 1 8.4-8.4h.5A8.4 8.4 0 0 1 21 11v.5z" /></svg>
  ),
  send: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
  ),
  save: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
  ),
  plus: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 8v8M8 12h8" /></svg>
  ),
  dm: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
  ),
}

// ── Component ───────────────────────────────────────────────────────────────
type Stage = 'ad' | 'pick' | 'building' | 'board'

export default function PinPage() {
  const [stage, setStage] = useState<Stage>('ad')
  const [peeled, setPeeled] = useState(false)
  const [siteIn, setSiteIn] = useState(false)
  const [card, setCard] = useState(0)
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<'left' | 'right' | null>(null)
  const [picks, setPicks] = useState<Photo[]>([])
  const trackRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  // Warm the first pair while the ad is still on screen, and each next pair
  // one round ahead, so a tap never lands on a grey box.
  useEffect(() => {
    const next = PAIRS[round]
    const upcoming = PAIRS[round + 1]
    for (const p of [next, upcoming]) {
      if (!p) continue
      for (const src of [p.left, p.right]) {
        const im = new Image()
        im.src = src
      }
    }
  }, [round])

  const scrollToCard = (i: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' })
  }

  const onTrackScroll = () => {
    const el = trackRef.current
    if (!el || el.clientWidth === 0) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setCard(Math.max(0, Math.min(AD_CARDS.length - 1, i)))
  }

  // The peel: chrome out, window to full bleed, then the site fades up in the
  // space the ad's photo used to occupy.
  const enterSite = () => {
    if (peeled) return
    setPeeled(true)
    after(560, () => setStage('pick'))
    after(620, () => setSiteIn(true))
  }

  const choose = (side: 'left' | 'right') => {
    if (picked) return
    const pair = PAIRS[round]
    const src = side === 'left' ? pair.left : pair.right
    setPicked(side)
    after(430, () => {
      const nextPicks = [...picks, photo(src)]
      setPicks(nextPicks)
      setPicked(null)
      if (round + 1 >= PAIRS.length) {
        setStage('building')
        after(1150, () => setStage('board'))
      } else {
        setRound(round + 1)
      }
    })
  }

  const restart = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPicks([])
    setRound(0)
    setPicked(null)
    setStage('pick')
    setSiteIn(true)
  }

  const result = useMemo(() => {
    if (picks.length === 0) return null
    const { light, place, mood } = profileOf(picks)
    const key = `${light}|${place}`
    return {
      light, place, mood, key,
      name: NAMES[key] ?? 'Your Look',
      palette: PALETTES[key] ?? PALETTES['soft|street'],
      board: buildBoard(picks, light, place, mood),
      slug: `${light}-${place}-${mood}`,
    }
  }, [picks])

  const pickedSrcs = useMemo(() => new Set(picks.map(p => p.src)), [picks])
  const pair = PAIRS[Math.min(round, PAIRS.length - 1)]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pin-root">
        <div className={`pin-device${peeled ? ' is-peeled' : ''}`}>

          {/* ── The Meta carousel ad ─────────────────────────────────── */}
          <div className="ig-top">
            <div className="ig-status">
              <span>9:41</span>
              <span className="bars" aria-hidden="true">
                <i style={{ height: 5 }} /><i style={{ height: 7 }} /><i style={{ height: 9 }} /><i style={{ height: 11 }} />
              </span>
            </div>
            <div className="ig-nav">
              <span className="ig-word">Instagram</span>
              <span className="icons">{Ico.plus}{Ico.dm}</span>
            </div>
            <div className="ig-post-head">
              <img className="ig-avatar" src="/images/self/aidan-cropped-01.jpg" alt="" />
              <span className="ig-who">
                <b>aidantorrence</b>
                <span>Sponsored</span>
              </span>
              <span className="ig-dots" aria-hidden="true">•••</span>
            </div>
          </div>

          <div className="ig-window">
            <div className="ad-track" ref={trackRef} onScroll={onTrackScroll}>
              {AD_CARDS.map((c, i) => (
                <div className="ad-card" key={c.src}>
                  <img src={c.src} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
                  <div className="ad-shade" />
                  <span className="ad-badge">{i + 1}/{AD_CARDS.length}</span>
                  <div className="ad-copy">
                    <h2>{c.head}</h2>
                    <p>{c.sub}</p>
                    {c.cta && (
                      <button className="ad-cardbtn" onClick={enterSite}>{c.cta}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {card === 0 && !peeled && <span className="ad-swipe">Swipe</span>}
            {card > 0 && (
              <button className="ad-arrow prev" aria-label="Previous card" onClick={() => scrollToCard(card - 1)}>‹</button>
            )}
            {card < AD_CARDS.length - 1 && (
              <button className="ad-arrow next" aria-label="Next card" onClick={() => scrollToCard(card + 1)}>›</button>
            )}
          </div>

          <div className="ig-bottom">
            <div className="ig-dotrow" aria-hidden="true">
              {AD_CARDS.map((c, i) => <i key={c.src} className={i === card ? 'on' : ''} />)}
            </div>
            <button className="ig-cta" onClick={enterSite}>
              <span>Learn more</span>
              <span className="chev">›</span>
            </button>
            <div className="ig-actions">
              {Ico.heart}{Ico.comment}{Ico.send}<span className="spacer" />{Ico.save}
            </div>
            <div className="ig-meta">
              <div className="likes">1,847 likes</div>
              <div className="cap">
                <b>aidantorrence</b> Free collab shoot — you keep the edited photos. Tap through
                and I&rsquo;ll build your moodboard. <span className="tags">#portrait #35mm</span>
              </div>
            </div>
          </div>

          {/* ── The site the ad turns into ───────────────────────────── */}
          {(stage === 'pick' || stage === 'building') && (
            <div className={`site${siteIn ? ' is-in' : ''}`}>
              <div className="site-head">
                <div className="site-brand">
                  <span>Aidan Torrence</span>
                  <span>{Math.min(round + 1, PAIRS.length)} / {PAIRS.length}</span>
                </div>
                <div className="site-bar"><i style={{ width: `${(round / PAIRS.length) * 100}%` }} /></div>
                <p className="site-prompt">{pair.prompt}</p>
              </div>

              <div className="pick-row">
                {(['left', 'right'] as const).map(side => {
                  const src = side === 'left' ? pair.left : pair.right
                  const state = picked === null ? '' : picked === side ? ' is-picked' : ' is-dropped'
                  return (
                    <button
                      key={side + round}
                      className={`pick-card${state}`}
                      onClick={() => choose(side)}
                      aria-label={`Choose the ${side} photo`}
                    >
                      <img src={src} alt="" />
                      <span className="veil" />
                      <span className="saved">Saved</span>
                    </button>
                  )
                })}
              </div>
              <div className="pick-hint">Tap the one you&rsquo;d rather have of you</div>

              <div className="rail">
                <div className="rail-head">
                  <span>Your board</span>
                  <span>{picks.length} of {PAIRS.length}</span>
                </div>
                <div className="rail-strip">
                  {Array.from({ length: PAIRS.length }, (_, i) => (
                    <div key={i} className={`rail-slot${picks[i] ? ' filled' : ''}`}>
                      {picks[i] && <img src={picks[i].src} alt="" />}
                    </div>
                  ))}
                </div>
              </div>

              {stage === 'building' && (
                <div className="building">
                  <p>Building your moodboard…</p>
                  <span className="track"><i /></span>
                </div>
              )}
            </div>
          )}

          {/* ── The moodboard ────────────────────────────────────────── */}
          {stage === 'board' && result && (
            <div className="board">
              <div className="board-inner">
                <div className="board-kicker">Your moodboard</div>
                <h1>{result.name}</h1>
                <p className="lede">
                  {LIGHT_TEXT[result.light].label.toLowerCase()} · {PLACE_TEXT[result.place].label.toLowerCase()} ·{' '}
                  {MOOD_TEXT[result.mood].label.toLowerCase()} — built from the {picks.length} frames you picked.
                </p>

                <div className="swatches" aria-hidden="true">
                  {result.palette.map(c => <i key={c} style={{ background: c }} />)}
                </div>

                <div className="masonry">
                  {result.board.map(p => (
                    <figure key={p.src}>
                      <img src={p.src} alt="" loading="lazy" />
                      {pickedSrcs.has(p.src) && <span className="yours">You picked this</span>}
                    </figure>
                  ))}
                </div>

                <div className="specs">
                  <div className="spec">
                    <span className="k">Light</span>
                    <span className="v"><b>{LIGHT_TEXT[result.light].label}</b><span>{LIGHT_TEXT[result.light].note}</span></span>
                  </div>
                  <div className="spec">
                    <span className="k">Location</span>
                    <span className="v"><b>{PLACE_TEXT[result.place].label}</b><span>{PLACE_TEXT[result.place].note}</span></span>
                  </div>
                  <div className="spec">
                    <span className="k">Direction</span>
                    <span className="v"><b>{MOOD_TEXT[result.mood].label}</b><span>{MOOD_TEXT[result.mood].note}</span></span>
                  </div>
                </div>

                <a className="board-cta" href={`/sign-up-collab?ref=pin&look=${result.slug}`}>
                  Book this shoot — free →
                </a>
                <p className="board-fine">
                  No session fee, no deposit, nothing to buy. I&rsquo;m building my portfolio, you keep
                  every edited photo.
                </p>
                <button className="board-restart" onClick={restart}>Start over</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
