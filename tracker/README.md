# Phone-use tracker + hourly coach

Automatic tracking of real phone use, with an hourly Routine that reads the last 1 h and 12 h and
critiques it. Nothing is self-reported: an iOS Shortcuts automation pings this site every time a
tracked app opens or closes, the site rebuilds sessions from those pings, and the coach reviews them.

## Pieces

| Piece | Where |
| --- | --- |
| Dashboard (add to home screen) | `https://www.aidantorrence.com/phone?k=KEY` → `app/phone/page.tsx` |
| Event ingest, hit by the phone | `GET /api/phone/ping?k=KEY&app=Instagram` → `app/api/phone/ping/route.ts` |
| Summary read by dashboard + coach | `GET /api/phone/summary?k=KEY` → `app/api/phone/summary/route.ts` |
| Coach writes its critique | `POST /api/phone/review?k=KEY` → `app/api/phone/review/route.ts` |
| Goals (limit, quiet hours, tz) | `GET/POST /api/phone/settings?k=KEY` |
| Session logic + tables | `lib/phoneTracker.ts` |
| Routine prompt | `tracker/coach-prompt.md` |

Tables (Neon, created on first use): `phone_events`, `phone_settings`, `phone_reviews`.

## Access key

There is no key in the repo or in Vercel env. The first request that presents a key of 16+ characters
claims it (stored as a SHA-256 hash in `phone_settings`); every request after that must present the
same key. The key lives in the Shortcut URL, the dashboard's local storage, and the Routine prompt.

## Setting up the phone (no computer)

1. Open the dashboard link on the phone, Share → Add to Home Screen.
2. Shortcuts app → Automation → + → App → pick the app → tick "Is Opened" and "Is Closed" →
   Run Immediately → New Blank Automation → action "Get Contents of URL" → paste the ping URL with the
   app name after `app=`. One automation per app.
3. Tap "Send test ping" on the dashboard to confirm the site is receiving.

The same URL handles open and close (it toggles per app). An open with no close is capped at 30 min.

## Sessions and windows

`pairSessions` pairs open/close events per app; `windowStats` clips sessions to a window (last 1 h,
last 12 h, local today) and reports minutes, pickups, quick checks (< 2 min), longest, minutes by app,
and minutes inside quiet hours. Local day and quiet hours use the tz the dashboard saves.

## Ready state

Ready = at least one event in the last 24 h. While not ready, every hourly run reports
"🚨 URGENT ALERT — not enough info" with the reason instead of a review.

## Hourly coach

Routine **Pocket Ledger hourly coach** (`trig_012j4PuPD4qCpjj61ddTgd2z`) runs at 44 past every hour
in a fresh session with `tracker/coach-prompt.md` as its prompt and push notifications on. It curls
the summary, applies the gate, posts the review, and the dashboard shows it under "Hourly coach".
