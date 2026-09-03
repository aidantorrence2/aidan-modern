# Pocket Ledger: phone-use tracker + hourly coach

A phone-first tracker for how the phone actually gets used, paired with an hourly Routine
that reads the last 1 hour and 12 hours and writes a critique back into the page.

## Install on the phone (no computer needed)

1. Open https://claude.ai/code/artifact/f506c17d-e479-498c-b1a3-2914a717c441 on the phone,
   signed in to the Claude account that owns it.
2. iPhone: Share → Add to Home Screen. Android: menu → Add to Home screen / Install app.
3. Tap the sliders icon and save goals (daily limit, purpose, categories to cut down on, quiet hours).
4. Log pickups ("Log a pickup") or run a live session ("I'm on my phone" → "Stop & log").

The page is `tracker/pocket-ledger.html` in this repo. Republishing it to the same URL keeps the data.

## Ready state

The tracker is **ready** when goals are saved and at least 3 entries exist in the last 24 hours.
The page writes that flag to `meta/status`. While not ready, every hourly run sends
"🚨 URGENT ALERT — not enough info" instead of a review.

## Data (artifact database, `db` capability)

| Path | Written by | Shape |
| --- | --- | --- |
| `meta/status` | page | `setupDone, ready, readyReason, entriesLast24h, lastEntryAt, tz, dailyLimitMin, purpose, avoid[], quietStart, quietEnd` |
| `days/YYYY-MM-DD` | page | `date, tz, entries[{id, ts, endTs, minutes, category, intent, feeling, note, source}]` |
| `reviews/latest` | coach | `at, status, headline, body, score, stats{h1,h12}` |
| `reviews/log` | coach | `items[{at, status, headline, score}]`, last 48 |

One document per day keeps the store far below the 5,000-document cap. Entries logged while the
page cannot reach storage are kept in the phone's local storage and synced on the next open.

## Hourly coach (Routine)

A Claude Code Routine named **Pocket Ledger hourly coach** runs `0 * * * *` (UTC), starts a fresh
session each time with `tracker/coach-prompt.md` as its prompt, and pushes its final message to the
phone. It reads the documents above via the Artifact tool, applies the readiness gate, writes
`reviews/latest` and `reviews/log`, and the page shows the result live under "Hourly coach".

To change the prompt, edit `tracker/coach-prompt.md` and update the Routine's prompt with it.
