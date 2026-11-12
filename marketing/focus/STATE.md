# Focus pipeline — STATE (single source of truth)

Niche: app blocking / phone & computer distraction. Short vertical videos → comment keyword → DM → email opt-in → matched affiliate offer.
Channels planned: Facebook Page/Group, TikTok, X. Branch: `claude/focus-pipeline`, dir `marketing/focus/`.

_Last updated: 2026-11-12 (run 20)_

## Standing rules (copied from the owner's brief — survive context resets)
**Where state lives:** repo `aidantorrence2/aidan-modern`, branch `claude/focus-pipeline` (pull it first every run), dir `marketing/focus/`. STATE.md = source of truth (read first). LOG.md = one dated entry per run. `scripts/` = one markdown per video (hook, steps, caption, keyword, offer). `videos/` = 1080x1920 mp4 < 8 MB + caption file. `queue/` = ready-to-post packages per platform. `owner-todo.md` = owner-only actions with exact steps and prefilled text. Repo is PUBLIC: never commit credentials, affiliate IDs or ID-bearing links, personal details or revenue. Never touch files outside `marketing/focus/`, never push another branch, no PR. Repo CLAUDE.md reel naming does not apply here; no `next build` needed.

**Choosing the step:** one concrete step per hourly run. Priority: keep ≥5 good unrendered scripts ahead → render one video per run (look at frames before calling it done) → capture landing page + keyword→offer map → post packages → occasional signals refresh → draft affiliate applications. Max one video per run. If nothing unblocked remains, log that and stop. If a previous run is still in progress, don't start a second step.

**Hard limits:** post/upload/create accounts/submit applications ONLY via a credential or connector actually present for that exact platform — otherwise prepare the package and add to owner-todo. Never ask for credentials in an unattended run, never register accounts via browser, never work around login walls/captchas/phone verification. Affiliate signups: draft only, never submit. All content original; no unsupported health/income/product claims; affiliate disclosure in every caption with a link. No email/Slack/messages to anyone. Report honestly in LOG.md. Finish every run: commit, push to `claude/focus-pipeline`, reply in 2–3 lines (done / next / needs owner).


## ⛔ HOLD — owner instruction (2026-11-12): no new videos until the owner has reviewed
Do NOT render any video (and do not re-render existing ones) until this block is removed by the owner or the owner says so in the conversation. Scripts, landing page, post packages, signals research and affiliate drafts may continue. Review list: `owner-todo.md` #0.

## Stage status
| # | Stage | Status | Notes |
|---|-------|--------|-------|
| 1 | Signals | first pass done | `signals/2026-11-12.md`: top user-reported failure = app blocked but website open; feed reset; parents: precise co-created rules, routines > caps, modeling. 4 new script angles listed there. Aura $65/60-day seen on two third-party directories (still unverified with Aura). |
| 2 | Scripts | 15 drafts (5 unrendered: 007, 009, 011, 013, 014) | `scripts/001`–`015`. Keywords: NIGHT, KIDS, FOCUS, TAPS, FREE, STUDY, MORNING, FIRST, QUIET, AUTOPLAY, INBOX, GAMES, TABLE, WEEKEND, WIFI. New scripts must also get a landing-page entry + keyword-map row. |
| 3 | Review | not started | Self-review checklist: claims, disclosure, no logos/trademarks on screen. |
| 4 | Render | **10 of 15** (001–006, 008, 010, 012, 015) | Renderer: `node render/render.mjs render/specs/NNN.json` (HTML cards → PNG → ffmpeg push-in + crossfades, silent AAC track). 001 done (24 s, 2.0 MB); 002 done (26.6 s, 2.1 MB); 003 done (24 s, 1.7 MB); 008 done (24.4 s, 2.1 MB); 004 done (23.6 s, 1.8 MB); 010 done (24 s, 2.0 MB); 005 done (23.8 s, 1.9 MB); 012 done (24 s, 1.9 MB); 006 done (23.8 s, 1.9 MB); 015 done (24 s, 1.7 MB). Renderer now uses `text-wrap: balance/pretty` and auto-shrinks long comment keywords to fit. Style is text-only cards; no music (add in-app). |
| 5 | Publish | **packages ready, blocked (owner)** | `queue/` has a package per rendered video (FB Reel / TikTok / X captions, first comment, DM reply) — regenerate with `node queue/make-packages.mjs` after each render. No Facebook / TikTok / X credential in session → owner posts manually (owner-todo #1). |
| 6 | Capture | **page built, not deployed** | `landing/index.html` (static, one file): `?k=KEYWORD` shows the matching freebie; checklist revealed instantly on submit; emails only once `FORM_ACTION` is set; offer cards hidden until affiliate links set. `keyword-map.md` = map + DM templates. Needs owner: email tool + hosting (owner-todo #3, #4). |
| 7 | Monetize | **drafts ready, blocked (owner)** | `affiliate-drafts/` (README with shared answers + Aura, Qustodio, Freedom, Brick, Amazon). Owner fills identity/tax/payout and submits — after accounts have a few posts. |
| 8 | Measure | not started | Depends on publishing. |

## Keyword → offer map (draft — full version with freebies & DM templates in `keyword-map.md`)
| Keyword | Script | Primary offer | Status of offer terms |
|---------|--------|---------------|-----------------------|
| NIGHT | 001 | Timed lock box (Kitchen Safe, Amazon) | unverified |
| KIDS | 002 | Aura parental controls / Qustodio | unverified |
| FOCUS | 003 | Freedom | unverified |
| TAPS | 004 | Brick | rate unverified |
| FREE | 005 | Lead magnet only (Freedom secondary) | n/a |
| STUDY | 006 | Freedom (secondary: lock box) | unverified |
| MORNING | 007 | Freedom | unverified |
| FIRST | 008 | Aura / Qustodio | unverified |
| QUIET | 009 | Lead magnet (Freedom secondary) | n/a |
| AUTOPLAY | 010 | Qustodio / Aura | unverified |
| INBOX | 011 | Freedom | unverified |
| GAMES | 012 | Qustodio / Aura | unverified |
| TABLE | 013 | Lock box | unverified |
| WEEKEND | 014 | Freedom | unverified |
| WIFI | 015 | Qustodio / Aura | unverified |

## Next up (priority order)
1. ON HOLD (see top): no renders until owner review. Meanwhile: nothing high-value left that doesn't need the owner or a render — runs should log 'idle, waiting on owner' and end quickly rather than invent busywork. After approval: render 007, then 009, 011, 013, 014 one per run. Content is far ahead of distribution (nothing posted yet): when the buffer would need refilling, prefer a signals-research run over new scripts (run `node queue/make-packages.mjs` after each): write `render/specs/NNN.json` from the script, render, inspect frames.
2. Possible renderer upgrade: simple drawn icons/mock UI per step (scripts mention mock UI) — currently text-only.
3. Signals research refresh (Reddit / Shorts / ad libraries).
4. Draft affiliate application answers (never submit).

## Blocked on owner
- Platform accounts/credentials for Facebook, TikTok, X (owner-todo #1).
- Affiliate program signups (owner-todo #2).
- Email provider choice for opt-in (owner-todo #3).
- Hosting for the landing page (owner-todo #4).
