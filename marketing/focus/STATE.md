# Focus pipeline — STATE (single source of truth)

Niche: app blocking / phone & computer distraction. Short vertical videos → comment keyword → DM → email opt-in → matched affiliate offer.
Channels planned: Facebook Page/Group, TikTok, X. Branch: `claude/focus-pipeline`, dir `marketing/focus/`.

_Last updated: 2026-11-11 (run 2)_

## Standing rules (copied from the owner's brief — survive context resets)
**Where state lives:** repo `aidantorrence2/aidan-modern`, branch `claude/focus-pipeline` (pull it first every run), dir `marketing/focus/`. STATE.md = source of truth (read first). LOG.md = one dated entry per run. `scripts/` = one markdown per video (hook, steps, caption, keyword, offer). `videos/` = 1080x1920 mp4 < 8 MB + caption file. `queue/` = ready-to-post packages per platform. `owner-todo.md` = owner-only actions with exact steps and prefilled text. Repo is PUBLIC: never commit credentials, affiliate IDs or ID-bearing links, personal details or revenue. Never touch files outside `marketing/focus/`, never push another branch, no PR. Repo CLAUDE.md reel naming does not apply here; no `next build` needed.

**Choosing the step:** one concrete step per hourly run. Priority: keep ≥5 good unrendered scripts ahead → render one video per run (look at frames before calling it done) → capture landing page + keyword→offer map → post packages → occasional signals refresh → draft affiliate applications. Max one video per run. If nothing unblocked remains, log that and stop. If a previous run is still in progress, don't start a second step.

**Hard limits:** post/upload/create accounts/submit applications ONLY via a credential or connector actually present for that exact platform — otherwise prepare the package and add to owner-todo. Never ask for credentials in an unattended run, never register accounts via browser, never work around login walls/captchas/phone verification. Affiliate signups: draft only, never submit. All content original; no unsupported health/income/product claims; affiliate disclosure in every caption with a link. No email/Slack/messages to anyone. Report honestly in LOG.md. Finish every run: commit, push to `claude/focus-pipeline`, reply in 2–3 lines (done / next / needs owner).


## Stage status
| # | Stage | Status | Notes |
|---|-------|--------|-------|
| 1 | Signals | not started | No signals research committed yet; scripts 001–005 are based on general niche knowledge, not verified hooks. |
| 2 | Scripts | 5 drafts (4 unrendered) | `scripts/001`–`005`. Keywords: NIGHT, KIDS, FOCUS, TAPS, FREE. Below the ≥5-ahead target → write 006+ soon. |
| 3 | Review | not started | Self-review checklist: claims, disclosure, no logos/trademarks on screen. |
| 4 | Render | **1 of 5** | Renderer: `node render/render.mjs render/specs/NNN.json` (HTML cards → PNG → ffmpeg push-in + crossfades, silent AAC track). 001 done (24 s, 2.0 MB). Style is text-only cards; no music (add in-app). |
| 5 | Publish | **blocked (owner)** | No Facebook / TikTok / X credential or connector in session. See owner-todo #1. |
| 6 | Capture | not started | Needs: landing page (opt-in) + keyword→offer map + email provider (owner). |
| 7 | Monetize | **blocked (owner)** | Affiliate programs need owner identity/tax/payout. Drafts not written yet. |
| 8 | Measure | not started | Depends on publishing. |

## Keyword → offer map (draft)
| Keyword | Script | Primary offer | Status of offer terms |
|---------|--------|---------------|-----------------------|
| NIGHT | 001 | Timed lock box (Kitchen Safe, Amazon) | unverified |
| KIDS | 002 | Aura parental controls / Qustodio | unverified |
| FOCUS | 003 | Freedom | unverified |
| TAPS | 004 | Brick | rate unverified |
| FREE | 005 | Lead magnet only (Freedom secondary) | n/a |

## Next up (priority order)
1. Write scripts 006–007 to get back to ≥5 unrendered (then render 002 next run).
2. Render 002–005 (one per run): write `render/specs/NNN.json` from the script, render, inspect frames.
3. Possible renderer upgrade: simple drawn icons/mock UI per step (scripts mention mock UI) — currently text-only.
4. Capture landing page (static HTML in `marketing/focus/landing/`) + keyword map.
5. Post packages in `queue/` per platform.
6. Signals research refresh (Reddit / Shorts / ad libraries).
7. Draft affiliate application answers (never submit).

## Blocked on owner
- Platform accounts/credentials for Facebook, TikTok, X (owner-todo #1).
- Affiliate program signups (owner-todo #2).
- Email provider choice for opt-in (owner-todo #3).
