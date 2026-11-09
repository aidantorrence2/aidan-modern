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

## The deck (Anki cloze cards)

- **Tasks:** 10 higher-level tasks a day for the photography career and the consumer apps, each asked
  2 or 3 different ways (variations hide a different part).
- **Question:** a sentence about the task with the key part hidden as **[...]**. Tap the card or **Show Answer**.
- **Answer:** the hidden part is revealed in place (blue), with the task and a note under a divider.
- **Rate it:** **Again** (back in 1 min), **Hard** (10 min), **Good** (1 h), **Done** (the task is
  finished: all its cards leave the deck). Cards you sent away come back when their time is up.
- **Counts** at the top: new (blue), learning (red), done (green).
- **Bubble:** cards due now, "…" while the rest are away, ✓ when the deck is done; it pulses when a card comes back.

## List format

`{date, generated, items: [card]}`; card = `{id, task, rank, title, text, note, minutes, source}`.
`text` holds the hidden part in `{{double braces}}`; cards with the same `task` are variations of one
task. File order is study order. The phone takes a list only if `generated` is newer than the one it
holds; a new `date` starts a fresh deck.
