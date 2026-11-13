# Focus pipeline — LOG

## 2026-11-11 — run 1
- Created branch `claude/focus-pipeline` from `main` (did not exist on origin) and the `marketing/focus/` structure: STATE.md, LOG.md, owner-todo.md, scripts/, videos/, queue/.
- Wrote 5 original draft scripts (001–005) with hook, steps, caption, comment keyword, matched offer, disclosure and a claims check.
- Checked session for posting credentials: no Facebook, TikTok or X connector/credential present → publishing is owner-blocked (owner-todo #1).
- Verified: ffmpeg at /usr/bin/ffmpeg; existing reel render scripts under `marketing/bts-reels/` to learn from.
- Not verified: affiliate terms listed in the brief (all still marked unverified); no signals research done yet — hooks are educated guesses.
- Next: build renderer, render script 001, inspect frames.

## 2026-11-11 — run 2
- Copied the standing rules (where state lives / choosing the step / hard limits) into the top of STATE.md.
- Built `render/render.mjs` (Playwright HTML cards → PNG → ffmpeg zoompan + xfade, silent AAC) and spec `render/specs/001.json`.
- Rendered `videos/001-phone-out-of-bedroom.mp4` + `.txt` caption: h264 1080x1920 30fps, 24.0 s, 2.0 MB.
- Inspected frames at several timestamps. First pass had the CTA keyword box nearly touching the right edge and "7-day" splitting across lines → fixed (two-tier keyword box, no-wrap on "N-word") and re-rendered; second-pass frames look clean.
- Fixed a caption error in script 001: said "3 changes" but the video shows 4 steps.
- Honest limits: video is text cards with a slow push-in only — no icons, no music, no voiceover. Not yet human-reviewed.
- Note: repo-root .gitignore excludes *.mp4; added `videos/.gitignore` with `!*.mp4` so rendered videos are committed.
- Next: write scripts 006–007 (unrendered buffer is 4, target ≥5), then render 002.

## 2026-11-11 — run 3
- Wrote scripts 006 (50-minute study session, keyword STUDY → Freedom / lock box) and 007 (first hour without the phone, keyword MORNING → Freedom). Unrendered buffer now 6 (target ≥5).
- Added both to the keyword→offer map in STATE.md. Offer terms still unverified.
- No render this run (one step per run). Next: render 002 (KIDS).

## 2026-11-11 — run 4
- Rendered `videos/002-kids-phone-settings.mp4` + `.txt` caption from new spec `render/specs/002.json` (teal accent, 5 step cards incl. bonus): 26.6 s, 2.08 MB, 1080x1920.
- Frame check found "step-by-step" breaking at a hyphen on the CTA card → generalised the renderer's no-wrap rule to any hyphenated word, re-rendered, re-checked the CTA frame: clean.
- Removed the unsupported "takes about 10 minutes" from the 002 caption (script + video caption file).
- Unrendered buffer is now exactly 5 (003–007). Next: write 008 to keep the buffer, or render 003.

## 2026-11-11 — run 5
- Rendered `videos/003-block-sites-on-computer.mp4` + `.txt` caption from `render/specs/003.json` (blue accent): 24.0 s, 1.70 MB, 1080x1920.
- Frame check (hook, steps 1/2/4, CTA): text fits, no bad wraps or edge crowding.
- Changed the CTA from "my exact blocklist" to "a ready-made blocklist" (avoids implying a personal persona/usage claim); script updated to match.
- Unrendered buffer now 4 (004–007). Next: write script 008, then render 004.

## 2026-11-12 — run 6
- Wrote scripts 008 (kid's first phone setup, keyword FIRST → Aura/Qustodio; parents are the highest-value audience) and 009 (notification cleanup, keyword QUIET → lead magnet). Unrendered buffer now 6.
- Added both to the keyword→offer map. Offer terms still unverified.
- Next: render 004 (TAPS), or 008 early for the higher-value parent offer.

## 2026-11-12 — run 7
- Rendered `videos/008-kids-first-phone.mp4` + `.txt` caption (spec `render/specs/008.json`, orange accent): 24.4 s, 2.10 MB. Chose 008 ahead of 004 because parent offers (Aura/Qustodio) are the highest-value in the list.
- Frame check: all cards fit; the CTA sub-line left "free." orphaned on its own line → reworded and re-rendered; final CTA frame checked clean.
- Rendered so far: 001, 002, 003, 008. Unrendered buffer: 5 (004–007, 009).
- Next: write 010 to keep the buffer above 5, then render 004.

## 2026-11-12 — run 8
- Chose capture over another render: 4 videos exist but no way to capture a lead yet.
- Built `landing/index.html` (single static file, no dependencies): reads `?k=KEYWORD`, sets accent/title/pitch per keyword, email form, checklist revealed instantly on submit, footer "not medical advice". Content for all 9 keywords written (derived from the scripts).
- Config is two blanks at the top of the script: `FORM_ACTION` (email tool) and `OFFER_LINKS` (affiliate links). Empty → page still delivers the checklist; offer cards stay hidden (no dead links). No IDs committed.
- Wrote `keyword-map.md` (keyword → video → freebie → offer, DM reply templates, config notes).
- Verified in Chromium at 390x844: KIDS page renders; submit hides the form and shows 6 steps; no-keyword fallback lists all 9 checklists; offer hidden without link; with a test link (scratch copy only) the offer card shows with `rel="sponsored"` and the disclosure; no JS errors. Fixed two bugs found while checking: form stayed visible after submit (CSS overrode `hidden`), and the "copy by email" promise showed with no email tool connected.
- Not verified: actual email delivery (no provider yet); page not deployed.
- Added owner-todo #4 (host the page). Next: render 004, then post packages in `queue/`.

## 2026-11-12 — run 9
- Rendered `videos/004-friction-trick.mp4` + `.txt` caption (spec `render/specs/004.json`, purple accent): 23.6 s, 1.79 MB.
- Frame check found four one-word last lines (hook, steps 2 and 4, CTA sub). Fixed at renderer level: `text-wrap: balance` on hook/title/CTA and `pretty` on body/sub (benefits all future renders; 001–003 and 008 not re-rendered — their frames were already checked OK). One remaining orphan ("bump.") fixed by rewording the step-2 body. Re-checked frames: clean.
- Rendered: 001–004, 008. Unrendered buffer now 4 (005–007, 009) → below target.
- Next: write script 010, then render 005.

## 2026-11-12 — run 10
- Wrote scripts 010 (autoplay off for kids, keyword AUTOPLAY → Qustodio/Aura) and 011 (email twice a day, keyword INBOX → Freedom). Unrendered buffer now 6 (005–007, 009–011).
- Added both keywords to the landing page (`K` object) and `keyword-map.md`, so the funnel covers every script. Verified in Chromium: AUTOPLAY, INBOX, QUIET pages render with 5 steps each; no-keyword fallback lists all 11; no JS errors.
- Rule added to STATE: every new script also needs a landing-page entry + keyword-map row.
- Next: render 010 (parent offer) or 005.

## 2026-11-12 — run 11
- Rendered `videos/010-autoplay-off.mp4` + `.txt` caption (spec `render/specs/010.json`, cyan accent): 24.0 s, 1.96 MB. Chose 010 for its higher-value parent offer.
- Frame check caught a real defect: the 8-letter keyword "AUTOPLAY" ran off the right edge of the CTA card. Fixed in the renderer: the keyword now shrinks until its box fits inside the side padding (protects MORNING and future long keywords). Also reworded step 2 to remove a one-word last line. Re-checked CTA and step-2 frames: clean.
- Earlier renders (001–004, 008) use keywords of ≤5 letters and were checked fine; not re-rendered.
- Rendered: 001–004, 008, 010. Unrendered: 005–007, 009, 011 (5).
- Next: render 005 (or write 012 if the buffer drops below 5).

## 2026-11-12 — run 12
- Chose post packages over a 7th render: 6 videos exist, nothing was ready to post, and publishing is the bottleneck.
- Added `queue/make-packages.mjs`: for every rendered spec it writes `queue/<video>.md` with Facebook Reel caption + pinned first comment, TikTok caption + first comment, X post (length-checked ≤280; all 6 are 115–146) + self-reply carrying the link, and the DM reply. Also writes `queue/README.md` (index, first-week order, posting checklist).
- Generated 6 packages (001–004, 008, 010). Links use the `{LANDING_URL}` placeholder; every place a link appears carries the affiliate disclosure. Checked: no affiliate IDs/tracking params in queue/.
- Updated owner-todo #1 to point at the queue, and STATE (Publish = packages ready, blocked on accounts).
- Not verified: platform caption/hashtag limits beyond X's 280 (FB/TikTok captions are short, well under their limits).
- Next: render 005, then regenerate packages.

## 2026-11-12 — run 13
- Rendered `videos/005-free-screen-time-lock.mp4` + `.txt` caption (spec `render/specs/005.json`, green accent): 23.8 s, 1.94 MB.
- Frame check (hook, 4 steps, CTA): text fits, keyword box inside margins, no one-word last lines.
- Softened the caption claim from "it actually works when you can't override it" to "it works best when…"; script updated to match.
- Regenerated post packages: queue now has 7 (added 005).
- Rendered: 001–005, 008, 010. Unrendered: 006, 007, 009, 011 (4 → below target).
- Next: write script 012, then render 006.

## 2026-11-12 — run 14
- Wrote scripts 012 (console/phone game limits, keyword GAMES → Qustodio/Aura) and 013 (phone-free dinner table, keyword TABLE → lock box). Unrendered buffer now 6 (006, 007, 009, 011–013).
- Added both to the landing page and keyword map. Verified in Chromium: both pages render with 5 steps; fallback lists all 13; no JS errors.
- Caught an unbacked promise while checking: TABLE originally offered "30 questions in the email", but no email sequence exists. Changed to 7 questions shown on the page; removed "30" from the script and landing title.
- Next: render 012 (parent offer) or 006.

## 2026-11-12 — run 15
- Rendered `videos/012-game-time-limits.mp4` + `.txt` caption (spec `render/specs/012.json`, pink accent): 24.0 s, 1.91 MB. Picked 012 for its parent offer.
- Frame check (hook, 4 steps, CTA): all text inside margins, keyword fits, no one-word last lines. No brand names or logos on screen.
- Regenerated post packages: 8 in queue/.
- Rendered: 001–005, 008, 010, 012. Unrendered: 006, 007, 009, 011, 013 (5).
- Next: render 006.

## 2026-11-12 — run 16
- Rendered `videos/006-study-session-phone-jail.mp4` + `.txt` caption (spec `render/specs/006.json`, yellow accent): 23.8 s, 1.89 MB.
- Frame check (hook, 4 steps, CTA): text fits, keyword inside margins, no one-word last lines.
- Removed the persona claim "the blocker setup I use" from the CTA (video and script now say "the laptop + phone blocker setup").
- Regenerated post packages: 9 in queue/.
- Rendered: 001–006, 008, 010, 012. Unrendered: 007, 009, 011, 013 (4 → below target).
- Next: write script 014, then render 007.

## 2026-11-12 — run 17
- Wrote scripts 014 (weekend-only social apps, keyword WEEKEND → Freedom) and 015 (Wi-Fi bedtime for kids' devices, keyword WIFI → Qustodio/Aura). Unrendered buffer now 6 (007, 009, 011, 013–015).
- Added both to the landing page and keyword map. Verified in Chromium: both pages render with 5 steps; fallback lists all 15; no JS errors.
- 015 explicitly says router schedules don't cover mobile data (avoids an overclaim), and avoids router brand names.
- Observation: 17 runs in, nothing has been posted — every remaining stage depends on owner-todo #1 (accounts). Content is ahead of distribution; after the buffer is used, runs may shift to signals research (hooks are still unvalidated guesses) rather than piling up more videos.
- Next: render 015 (parent offer) or 007.

## 2026-11-12 — run 18
- Rendered `videos/015-wifi-bedtime.mp4` + `.txt` caption (spec `render/specs/015.json`, indigo accent): 24.0 s, 1.67 MB.
- Frame check (hook, 4 steps, CTA): text fits, keyword inside margins, no orphan lines. Indigo keyword is slightly lower-contrast than other accents but legible.
- Regenerated post packages: 10 in queue/.
- Rendered: 10 of 15. Unrendered: 007, 009, 011, 013, 014 (5).
- Next: render 007. Noted in STATE: prefer signals research over more scripts when the buffer next needs refilling, since nothing is posted yet.

## 2026-11-12 — owner instruction (between runs)
- Owner: "stop creating videos until I've reviewed". Added a HOLD block at the top of STATE.md (no renders or re-renders until the owner lifts it) and owner-todo #0 listing the 10 videos to review. Nothing rendered in this entry.

## 2026-11-12 — run 19
- HOLD respected: no renders.
- Signals research (3 web searches) → `signals/2026-11-12.md`: user-reported failure modes and fixes (browser loophole, feed reset, streaks), parent guidance from article/study coverage (precise co-created rules, routines over caps, modeling, rewards/punishments not helping), and 4 new script angles. No study numbers put into content; sources listed.
- Aura terms: two third-party directories show $65 first-purchase CPA, 60-day cookie (one says up to $125 tiered via Impact). Not confirmed by Aura.
- Limits: no Reddit threads for the parent query (articles only); mirrors used for Reddit; vendor blogs discounted.
- Next: draft affiliate application answers (affiliate-drafts/), no submission.

## 2026-11-12 — run 20
- HOLD respected: no renders.
- Wrote `affiliate-drafts/`: README with shared application answers (channel description, audience, promotion method, disclosure) and per-program notes for Aura, Qustodio, Freedom, Brick, Amazon Associates. Placeholders only for owner identity/URLs; no IDs or personal data. Nothing submitted.
- Flagged: Amazon's own disclosure wording and its 3-sales-in-180-days rule; Brick program existence unverified.
- Updated STATE (Monetize = drafts ready) and owner-todo #2.
- Status: every remaining stage now needs the owner (review → hold lift, accounts, email tool, hosting, applications). Future runs should log "idle, waiting on owner" and stop rather than invent work.

## 2026-11-12 15:26 UTC — run 21 (idle)
- HOLD still active (no owner review yet). No unblocked work of value: scripts buffer 5, packages/landing/affiliate drafts done, signals done today. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 16:27 UTC — run 22 (idle)
- HOLD still active; no owner input since. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 17:27 UTC — run 23 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 18:27 UTC — run 24 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 19:27 UTC — run 25 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 20:28 UTC — run 26 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 21:26 UTC — run 27 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 22:26 UTC — run 28 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-12 23:26 UTC — run 29 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 00:27 UTC — run 30 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 01:26 UTC — run 31 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 02:26 UTC — run 32 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 03:26 UTC — run 33 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 04:26 UTC — run 34 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 05:26 UTC — run 35 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 06:29 UTC — run 36 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 07:26 UTC — run 37 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 08:27 UTC — run 38 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 09:27 UTC — run 39 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 10:29 UTC — run 40 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 11:26 UTC — run 41 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).

## 2026-11-13 12:27 UTC — run 42 (idle)
- HOLD still active; no owner input. Nothing changed; waiting on owner (owner-todo #0–#4).
