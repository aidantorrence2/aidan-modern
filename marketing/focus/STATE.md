# Focus pipeline — STATE (single source of truth)

Niche: app blocking / phone & computer distraction. Short vertical videos → comment keyword → DM → email opt-in → matched affiliate offer.
Channels planned: Facebook Page/Group, TikTok, X. Branch: `claude/focus-pipeline`, dir `marketing/focus/`.

_Last updated: 2026-11-14 (run 66)_

## Standing rules (copied from the owner's brief — survive context resets)
**Where state lives:** repo `aidantorrence2/aidan-modern`, branch `claude/focus-pipeline` (pull it first every run), dir `marketing/focus/`. STATE.md = source of truth (read first). LOG.md = one dated entry per run. `scripts/` = one markdown per video (hook, steps, caption, keyword, offer). `videos/` = 1080x1920 mp4 < 8 MB + caption file. `queue/` = ready-to-post packages per platform. `owner-todo.md` = owner-only actions with exact steps and prefilled text. Repo is PUBLIC: never commit credentials, affiliate IDs or ID-bearing links, personal details or revenue. Never touch files outside `marketing/focus/`, never push another branch, no PR. Repo CLAUDE.md reel naming does not apply here; no `next build` needed.

**Choosing the step:** one concrete step per hourly run. Priority: keep ≥5 good unrendered scripts ahead → render one video per run (look at frames before calling it done) → capture landing page + keyword→offer map → post packages → occasional signals refresh → draft affiliate applications. Max one video per run. If nothing unblocked remains, log that and stop. If a previous run is still in progress, don't start a second step.

**Hard limits:** post/upload/create accounts/submit applications ONLY via a credential or connector actually present for that exact platform — otherwise prepare the package and add to owner-todo. Never ask for credentials in an unattended run, never register accounts via browser, never work around login walls/captchas/phone verification. Affiliate signups: draft only, never submit. All content original; no unsupported health/income/product claims; affiliate disclosure in every caption with a link. No email/Slack/messages to anyone. Report honestly in LOG.md. Finish every run: commit, push to `claude/focus-pipeline`, reply in 2–3 lines (done / next / needs owner).


## 🎬 Owner direction (2026-11-14) — new video format
Owner reviewed the 10 text-card videos: likes the idea, but the visuals are too limited to get views. Decisions:
- **Use real stock footage** (B-roll) behind the captions. **No screen recordings from the owner — do not ask again.**
- **Add an AI voiceover** reading the script, with burned-in captions.
- Stop making text-card-only videos (001–015 v1 style is shelved; keep the files).
- First make ONE test video, **001b** (phone out of the bedroom), in the new format so the owner can compare it with 001. Do not convert the others until the owner OKs 001b.
- Engagement plan agreed in chat: stronger first-second hook (2–3 hook variants per video), series framing, comment questions, also post to Instagram Reels and YouTube Shorts.

**Blocked:** this session cannot reach the footage or voice sources (proxy 403 on api.pexels.com, videos.pexels.com, huggingface.co). A personal environment allowing only those hosts was proposed to the owner (approval pending, owner-todo #5). Pexels also needs a free API key (owner-todo #5).
**Pexels licence notes:** free commercial use, no attribution required, but do not make identifiable people in clips appear to endorse a product, and no unaltered resale. Use clips as mood B-roll only; no brand logos visible.

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
1. When network access is approved: build the stock-footage + voiceover renderer (Pexels search per scene, open-source TTS such as Kokoro running locally, word-timed captions, 1080x1920) and make **001b** only. Inspect frames and listen-check timing before sending it to the owner.
2. Until then: nothing to render. Runs log "waiting on owner" and stop.
3. After owner OKs 001b: convert the rest one per run (002b…015b), then 007/009/011/013/014 in the new style; regenerate `queue/` packages.
4. Signals research refresh (Reddit / Shorts / ad libraries); draft hook variants.

## Blocked on owner
- Network access for footage + voice, and a free Pexels API key (owner-todo #5).
- Platform accounts/credentials for Facebook, TikTok, X (owner-todo #1).
- Affiliate program signups (owner-todo #2).
- Email provider choice for opt-in (owner-todo #3).
- Hosting for the landing page (owner-todo #4).
