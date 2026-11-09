# Todos: today's top 10 as a floating card game

A bubble that floats over every app on the Android phone. Tap it and it opens into a deck of
**the 10 things you need to do today**. You play it like Anki: flip a card, then grade it.

- **Install:** open the APK, tap Allow for "Display over other apps". No setup. The current list is
  bundled in the APK, so cards show on first open.
- **The list:** `data/todos.json` on branch `ccr-858db8c5-lx4rbu`, plain JSON, read by the phone
  without a token. Note the repo is public, so the list is too.
- **Who builds it:** a daily cloud scheduled task (cloud sessions from the last 24 h, commits across
  repos, pending approvals). Optionally `install-mac.sh` also runs `build-todos.mjs` on the Mac at
  07:00 and 13:00, which adds local Claude Code and Codex transcripts.

## The game

- **Front:** rank, time estimate, source, the task. Tap (or **Show**) to flip.
- **Back:** why it matters and the **first step**.
- **Done ✓** (or swipe right): +10 points × combo (up to ×5), haptic tick.
- **Again** (or swipe left): comes back two cards later. **Later:** bottom of the deck.
- Undo the last Done from the link under the buttons. Half the deck cleared counts toward the 🔥 streak.
- Drag the bubble anywhere; it snaps to the nearest edge. Tap outside the deck or **—** to collapse.

## List format

`{date: "YYYY-MM-DD", generated: ISO time, items: [{id, rank, title, why, next_step, minutes, source}]}`.
The phone takes a list only if `generated` is newer than the one it holds; a new `date` resets the deck.
