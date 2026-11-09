# Todos: today's top 10 as a floating card game

A bubble that floats over every app on the Android phone. Tap it and it opens into a deck of
**the 10 things you need to do today**. You study it like an Anki deck.

- **Install:** open the APK, tap Allow for "Display over other apps". No setup. The current list is
  bundled in the APK, so cards show on first open.
- **The list:** `data/todos.json` on branch `ccr-858db8c5-lx4rbu`, plain JSON, read by the phone
  without a token. Note the repo is public, so the list is too.
- **Who builds it:** a daily cloud scheduled task (cloud sessions from the last 24 h, commits across
  repos, pending approvals). Optionally `install-mac.sh` also runs `build-todos.mjs` on the Mac at
  07:00 and 13:00, which adds local Claude Code and Codex transcripts.

## The deck (works like Anki)

- **Question:** the to-do. Tap the card or **Show Answer**.
- **Answer:** under a divider: the first step, why it matters, time estimate and source.
- **Rate it:** **Again** (back in 1 min), **Hard** (10 min), **Good** (1 h), **Done** (retired for today).
  Cards you sent away come back when their time is up, ahead of new cards.
- **Counts** at the top: new (blue), learning (red), done (green); the current card's kind is underlined.
- **Bubble:** the number of cards due now, "…" while all remaining cards are away, ✓ when the deck is
  done; the ring fills as cards are done, and the bubble pulses when a card comes back.
- Undo the last Done from the link under the buttons. Drag the bubble anywhere; it snaps to the edge.

## List format

`{date: "YYYY-MM-DD", generated: ISO time, items: [{id, rank, title, why, next_step, minutes, source}]}`.
The phone takes a list only if `generated` is newer than the one it holds; a new `date` resets the deck.
