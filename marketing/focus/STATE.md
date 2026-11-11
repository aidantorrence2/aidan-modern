# Focus pipeline — STATE (single source of truth)

Niche: app blocking / phone & computer distraction. Short vertical videos → comment keyword → DM → email opt-in → matched affiliate offer.
Channels planned: Facebook Page/Group, TikTok, X. Branch: `claude/focus-pipeline`, dir `marketing/focus/`.

_Last updated: 2026-11-11 (run 1)_

## Stage status
| # | Stage | Status | Notes |
|---|-------|--------|-------|
| 1 | Signals | not started | No signals research committed yet; scripts 001–005 are based on general niche knowledge, not verified hooks. |
| 2 | Scripts | **5 drafts** | `scripts/001`–`005`. Keywords: NIGHT, KIDS, FOCUS, TAPS, FREE. |
| 3 | Review | not started | Self-review checklist: claims, disclosure, no logos/trademarks on screen. |
| 4 | Render | not started | Next: build a reusable Playwright (HTML frames) + ffmpeg renderer in `marketing/focus/render/`, render 001. ffmpeg + Chromium available. |
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
1. Build renderer and render video for script 001; inspect frames; write caption file next to mp4.
2. Render 002–005 (one per run).
3. Keep ≥5 unrendered scripts ahead: write 006+ as videos get rendered.
4. Capture landing page (static HTML in `marketing/focus/landing/`) + keyword map.
5. Post packages in `queue/` per platform.
6. Signals research refresh (Reddit / Shorts / ad libraries).
7. Draft affiliate application answers (never submit).

## Blocked on owner
- Platform accounts/credentials for Facebook, TikTok, X (owner-todo #1).
- Affiliate program signups (owner-todo #2).
- Email provider choice for opt-in (owner-todo #3).
