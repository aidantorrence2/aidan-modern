'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { shoots } from '@/data/shoots';

/**
 * OnlyFind — an algorithmic "For You" feed.
 *
 * A safe, SFW parody of a creator-subscription feed: instead of anything
 * explicit, every "creator" is one of Aidan Torrence's on-film portrait
 * subjects and every post is a real photograph from their shoot. The feed
 * is genuinely algorithmic — it learns an affinity model from your taps
 * (like / save / "more like this" / "not for me") and re-ranks what it
 * serves you next. The "Why this?" chip and the Algorithm panel expose
 * the ranking so you can see the recommender working.
 */

// ---------------------------------------------------------------------------
// Build the content pool from real shoot data
// ---------------------------------------------------------------------------

const VIBES = [
  'golden hour',
  'moody',
  'editorial',
  'candid',
  'film grain',
  'street',
  'natural light',
  'minimal',
];

type Post = {
  key: string; // unique per pool entry
  slug: string;
  creator: string;
  city: string;
  country: string;
  img: string;
  tags: string[];
};

const POOL: Post[] = shoots
  // Skip the brand campaign so the feed reads as people/creators.
  .filter((s) => s.slug !== 'merasa-jewelry')
  .flatMap((shoot, si) => {
    const [city, country] = shoot.location.split(',').map((part) => part.trim());
    return shoot.gallery.map((img, gi) => {
      const vibe = VIBES[(si * 7 + gi * 3) % VIBES.length];
      return {
        key: `${shoot.slug}-${img}`,
        slug: shoot.slug,
        creator: shoot.firstName,
        city: city || 'Worldwide',
        country: country || '',
        img,
        tags: ['film', 'portrait', vibe, city || 'worldwide', country].filter(
          Boolean
        ) as string[],
      };
    });
  });

// Deterministic shuffle so the first render matches on server + client
// (avoids hydration mismatch) while still feeling un-ordered.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SEEDED_POOL = seededShuffle(POOL, 20260606);

// ---------------------------------------------------------------------------
// Algorithm
// ---------------------------------------------------------------------------

type Affinity = Record<string, number>;

type Signals = {
  creator: Affinity; // by slug
  tag: Affinity; // by tag
  muted: Set<string>; // muted slugs
};

const WEIGHTS = {
  like: { creator: 3, tag: 2 },
  save: { creator: 5, tag: 3 },
  more: { creator: 4, tag: 4 },
  view: { creator: 0.4, tag: 0.2 }, // dwelled / scrolled past slowly
  less: { creator: -4, tag: -3 },
};

/** Score a candidate post against the current taste model. */
function scorePost(post: Post, sig: Signals, seenCount: number) {
  if (sig.muted.has(post.slug)) return -Infinity;

  const creatorScore = sig.creator[post.slug] ?? 0;
  const tagScore = post.tags.reduce((sum, t) => sum + (sig.tag[t] ?? 0), 0);

  // Diversity / fatigue: punish things you've already been served a lot.
  const fatigue = seenCount * 1.6;

  // Exploration: a little noise so the feed never fully collapses onto one
  // creator — this is the "discovery" knob.
  const exploration = Math.random() * 2.2;

  return creatorScore * 1.0 + tagScore * 0.8 - fatigue + exploration;
}

/** Pick the next best post given everything we know so far. */
function pickNext(
  sig: Signals,
  served: Record<string, number>,
  recentSlugs: string[]
): { post: Post; reason: string } {
  let best: Post | null = null;
  let bestScore = -Infinity;

  for (const post of SEEDED_POOL) {
    let score = scorePost(post, sig, served[post.key] ?? 0);
    // Avoid two posts from the same creator back-to-back.
    if (recentSlugs[recentSlugs.length - 1] === post.slug) score -= 6;
    if (score > bestScore) {
      bestScore = score;
      best = post;
    }
  }

  const chosen = best ?? SEEDED_POOL[0];
  return { post: chosen, reason: explain(chosen, sig) };
}

/** Human-readable reason the recommender surfaced this post. */
function explain(post: Post, sig: Signals): string {
  const c = sig.creator[post.slug] ?? 0;
  if (c >= 5) return `You keep engaging with ${post.creator}`;

  const topTag = post.tags
    .map((t) => [t, sig.tag[t] ?? 0] as const)
    .sort((a, b) => b[1] - a[1])[0];

  if (topTag && topTag[1] >= 4) return `Because you like "${topTag[0]}"`;
  if (c > 0) return `More from ${post.creator}`;
  return 'Fresh for you · exploring your taste';
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #000 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  .of-app {
    --accent: #00d6c2;
    max-width: 480px;
    margin: 0 auto;
    background: #050505;
    min-height: 100vh;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    position: relative;
  }

  .of-top {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    background: linear-gradient(#050505 70%, transparent);
  }

  .of-logo {
    font-weight: 800;
    font-size: 22px;
    letter-spacing: -0.5px;
  }
  .of-logo span { color: var(--accent); }

  .of-tabs { display: flex; gap: 18px; }
  .of-tab {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.45);
    font-size: 15px; font-weight: 700; padding: 2px 0;
  }
  .of-tab.active { color: #fff; border-bottom: 2px solid var(--accent); }

  .of-algo-btn {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: #fff; border-radius: 999px;
    font-size: 12px; font-weight: 700; padding: 6px 11px; cursor: pointer;
  }
  .of-algo-btn.on { background: var(--accent); color: #032; border-color: transparent; }

  .of-feed { scroll-snap-type: y mandatory; }

  .of-card {
    position: relative;
    scroll-snap-align: start;
    height: calc(100vh - 56px);
    min-height: 560px;
    overflow: hidden;
    background: #111;
  }

  .of-card img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  .of-shade {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 22%, transparent 52%, rgba(0,0,0,0.85) 100%);
    pointer-events: none;
  }

  .of-why {
    position: absolute; top: 14px; left: 14px;
    display: inline-flex; align-items: center; gap: 6px;
    max-width: 75%;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 999px;
    padding: 6px 11px;
    font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.92);
  }
  .of-why .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex: none; }

  .of-meta {
    position: absolute; left: 16px; right: 80px; bottom: 18px;
  }
  .of-creator { display: flex; align-items: center; gap: 10px; }
  .of-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    object-fit: cover; border: 2px solid var(--accent);
    position: static; inset: auto;
  }
  .of-name { font-weight: 800; font-size: 17px; }
  .of-loc { font-size: 13px; color: rgba(255,255,255,0.7); }
  .of-tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  .of-chip {
    font-size: 11px; font-weight: 600;
    background: rgba(255,255,255,0.14);
    border-radius: 999px; padding: 4px 9px;
    color: rgba(255,255,255,0.9);
  }
  .of-sub {
    margin-top: 14px;
    display: inline-block;
    background: var(--accent); color: #032;
    font-weight: 800; font-size: 14px;
    padding: 10px 18px; border-radius: 999px;
    text-decoration: none;
  }

  .of-rail {
    position: absolute; right: 12px; bottom: 24px;
    display: flex; flex-direction: column; align-items: center; gap: 18px;
  }
  .of-act {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    background: none; border: none; cursor: pointer; color: #fff;
  }
  .of-act .ico {
    width: 46px; height: 46px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.12s, background 0.12s;
  }
  .of-act:active .ico { transform: scale(0.86); }
  .of-act .lbl { font-size: 11px; font-weight: 700; }
  .of-act.active .ico { background: rgba(0,214,194,0.22); }
  .of-act.like.active .ico { background: rgba(255,48,64,0.22); }
  .of-act.like.active svg { fill: #ff3040; stroke: #ff3040; }
  .of-act.save.active svg { fill: var(--accent); stroke: var(--accent); }

  /* Algorithm transparency panel */
  .of-panel {
    position: fixed;
    left: 50%; transform: translateX(-50%);
    bottom: 0;
    width: 100%; max-width: 480px;
    background: rgba(8,8,8,0.97);
    border-top: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px 16px 0 0;
    padding: 16px 18px 26px;
    z-index: 60;
    animation: ofUp 0.25s ease;
  }
  @keyframes ofUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
  .of-panel h3 { margin: 0 0 4px; font-size: 15px; font-weight: 800; }
  .of-panel p.sub { margin: 0 0 14px; font-size: 12px; color: rgba(255,255,255,0.55); }
  .of-bar-row { margin-bottom: 9px; }
  .of-bar-top { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .of-bar-top b { font-weight: 700; }
  .of-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
  .of-bar i { display: block; height: 100%; background: var(--accent); border-radius: 99px; }
  .of-panel .of-col { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 18px; }
  .of-panel .empty { font-size: 12px; color: rgba(255,255,255,0.4); }
  .of-reset {
    margin-top: 14px; width: 100%;
    background: rgba(255,255,255,0.1); border: none; color: #fff;
    font-weight: 700; font-size: 13px; padding: 10px; border-radius: 10px; cursor: pointer;
  }

  .of-toast {
    position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
    background: rgba(0,214,194,0.95); color: #032;
    font-weight: 800; font-size: 13px;
    padding: 9px 16px; border-radius: 999px; z-index: 70;
    animation: ofToast 1.6s ease forwards;
  }
  @keyframes ofToast {
    0% { opacity: 0; transform: translate(-50%, 8px); }
    14%, 75% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -6px); }
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type FeedItem = Post & { instId: string; reason: string };

const BATCH = 4;

export default function OnlyFindPage() {
  const sig = useRef<Signals>({ creator: {}, tag: {}, muted: new Set() });
  const served = useRef<Record<string, number>>({});
  const recentSlugs = useRef<string[]>([]);
  const instCounter = useRef(0);

  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'foryou' | 'following'>('foryou');
  const [showPanel, setShowPanel] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [, force] = useState(0); // re-render when affinity changes

  const sentinel = useRef<HTMLDivElement | null>(null);

  // Append the next algorithm-chosen batch of posts.
  function loadMore(n = BATCH) {
    setFeed((prev) => {
      const next = [...prev];
      for (let i = 0; i < n; i++) {
        const { post, reason } = pickNext(
          sig.current,
          served.current,
          recentSlugs.current
        );
        served.current[post.key] = (served.current[post.key] ?? 0) + 1;
        recentSlugs.current.push(post.slug);
        next.push({ ...post, reason, instId: `i${instCounter.current++}` });
      }
      return next;
    });
  }

  // Seed the feed on mount.
  useEffect(() => {
    loadMore(6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '600px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [feed.length]);

  function bump(post: Post, kind: keyof typeof WEIGHTS) {
    const w = WEIGHTS[kind];
    sig.current.creator[post.slug] =
      (sig.current.creator[post.slug] ?? 0) + w.creator;
    for (const t of post.tags) {
      sig.current.tag[t] = (sig.current.tag[t] ?? 0) + w.tag;
    }
    force((x) => x + 1);
  }

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }

  function onLike(item: FeedItem) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(item.instId)) {
        next.delete(item.instId);
        bump(item, 'less');
      } else {
        next.add(item.instId);
        bump(item, 'like');
        flash(`More ${item.creator}-style portraits coming up`);
      }
      return next;
    });
  }

  function onSave(item: FeedItem) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(item.instId)) next.delete(item.instId);
      else {
        next.add(item.instId);
        bump(item, 'save');
        flash('Saved · tuning your feed');
      }
      return next;
    });
  }

  function onMore(item: FeedItem) {
    bump(item, 'more');
    flash('Got it — showing more like this');
  }

  function onLess(item: FeedItem) {
    sig.current.muted.add(item.slug);
    bump(item, 'less');
    setFeed((prev) => prev.filter((f) => f.slug !== item.slug || f.instId === item.instId));
    flash('Noted — less of that');
  }

  function reset() {
    sig.current = { creator: {}, tag: {}, muted: new Set() };
    served.current = {};
    recentSlugs.current = [];
    setLiked(new Set());
    setSaved(new Set());
    setFeed([]);
    setShowPanel(false);
    setTimeout(() => loadMore(6), 0);
    flash('Algorithm reset');
  }

  // Following tab: only creators you've liked/saved/boosted.
  const followingSlugs = useMemo(() => {
    return new Set(
      Object.entries(sig.current.creator)
        .filter(([, v]) => v > 0)
        .map(([k]) => k)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed, liked, saved]);

  const visibleFeed =
    tab === 'foryou'
      ? feed
      : feed.filter((f) => followingSlugs.has(f.slug));

  const topCreators = useMemo(
    () =>
      Object.entries(sig.current.creator)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, liked, saved, showPanel]
  );
  const topTags = useMemo(
    () =>
      Object.entries(sig.current.tag)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, liked, saved, showPanel]
  );

  const slugToName = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of shoots) m[s.slug] = s.firstName;
    return m;
  }, []);

  const maxCreator = Math.max(1, ...topCreators.map(([, v]) => v));
  const maxTag = Math.max(1, ...topTags.map(([, v]) => v));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="of-app">
        {/* Top bar */}
        <div className="of-top">
          <div className="of-logo">
            Only<span>Find</span>
          </div>
          <div className="of-tabs">
            <button
              className={`of-tab ${tab === 'foryou' ? 'active' : ''}`}
              onClick={() => setTab('foryou')}
            >
              For You
            </button>
            <button
              className={`of-tab ${tab === 'following' ? 'active' : ''}`}
              onClick={() => setTab('following')}
            >
              Following
            </button>
          </div>
          <button
            className={`of-algo-btn ${showPanel ? 'on' : ''}`}
            onClick={() => setShowPanel((v) => !v)}
          >
            ⚙︎ Algorithm
          </button>
        </div>

        {/* Feed */}
        <div className="of-feed">
          {tab === 'following' && visibleFeed.length === 0 && (
            <div
              style={{
                padding: '80px 28px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                No follows yet
              </p>
              <p style={{ fontSize: 13 }}>
                Like a few posts in <b>For You</b> and the creators you engage
                with show up here.
              </p>
            </div>
          )}

          {visibleFeed.map((item) => (
            <article className="of-card" key={item.instId}>
              <img
                src={`/images/large/${item.img}.jpg`}
                alt={`${item.creator} on film by Aidan Torrence`}
                loading="lazy"
              />
              <div className="of-shade" />

              <div className="of-why">
                <span className="dot" />
                {item.reason}
              </div>

              <div className="of-meta">
                <div className="of-creator">
                  <img
                    className="of-avatar"
                    src={`/images/large/${item.img}.jpg`}
                    alt=""
                  />
                  <div>
                    <div className="of-name">{item.creator}</div>
                    <div className="of-loc">
                      {item.city}
                      {item.country ? `, ${item.country}` : ''}
                    </div>
                  </div>
                </div>
                <div className="of-tags">
                  {item.tags
                    .filter((t) => t !== item.country)
                    .slice(0, 3)
                    .map((t) => (
                      <span className="of-chip" key={t}>
                        #{t.replace(/\s+/g, '')}
                      </span>
                    ))}
                </div>
                <a className="of-sub" href={'/sign-up' as any}>
                  ✦ Subscribe — book a shoot
                </a>
              </div>

              {/* Action rail */}
              <div className="of-rail">
                <button
                  className={`of-act like ${liked.has(item.instId) ? 'active' : ''}`}
                  onClick={() => onLike(item)}
                  aria-label="Like"
                >
                  <span className="ico">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path d="M12 21s-7.5-4.9-10-9.2C.6 9 1.6 5.5 4.8 4.7 7 4.2 9 5.4 12 8c3-2.6 5-3.8 7.2-3.3 3.2.8 4.2 4.3 2.8 7.1C19.5 16.1 12 21 12 21z" />
                    </svg>
                  </span>
                  <span className="lbl">Like</span>
                </button>

                <button
                  className={`of-act save ${saved.has(item.instId) ? 'active' : ''}`}
                  onClick={() => onSave(item)}
                  aria-label="Save"
                >
                  <span className="ico">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  </span>
                  <span className="lbl">Save</span>
                </button>

                <button
                  className="of-act more"
                  onClick={() => onMore(item)}
                  aria-label="More like this"
                >
                  <span className="ico">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span className="lbl">More</span>
                </button>

                <button
                  className="of-act less"
                  onClick={() => onLess(item)}
                  aria-label="Not for me"
                >
                  <span className="ico">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                  <span className="lbl">Not me</span>
                </button>
              </div>
            </article>
          ))}

          <div ref={sentinel} style={{ height: 1 }} />
        </div>

        {/* Algorithm transparency panel */}
        {showPanel && (
          <div className="of-panel">
            <h3>Your taste profile</h3>
            <p className="sub">
              OnlyFind ranks every post live from these signals. Tap ♥ / save /
              + / − on the feed and watch the model shift.
            </p>

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: 8,
                }}
              >
                Top creators
              </div>
              {topCreators.length === 0 && (
                <div className="empty">No signal yet — start tapping.</div>
              )}
              {topCreators.map(([slug, v]) => (
                <div className="of-bar-row" key={slug}>
                  <div className="of-bar-top">
                    <b>{slugToName[slug] ?? slug}</b>
                    <span>{Math.round(v)}</span>
                  </div>
                  <div className="of-bar">
                    <i style={{ width: `${(v / maxCreator) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: 8,
                }}
              >
                Top tags
              </div>
              {topTags.length === 0 && (
                <div className="empty">No signal yet.</div>
              )}
              {topTags.map(([tag, v]) => (
                <div className="of-bar-row" key={tag}>
                  <div className="of-bar-top">
                    <b>#{tag.replace(/\s+/g, '')}</b>
                    <span>{Math.round(v)}</span>
                  </div>
                  <div className="of-bar">
                    <i style={{ width: `${(v / maxTag) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <button className="of-reset" onClick={reset}>
              Reset algorithm
            </button>
          </div>
        )}

        {toast && <div className="of-toast">{toast}</div>}
      </div>
    </>
  );
}
