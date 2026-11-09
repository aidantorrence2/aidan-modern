# Todos: today's top 10 as a floating card game

A bubble that floats over every app on the Android phone. Tap it and it opens into a deck of
**your goals as fill-in-the-blank cards**. You study it like an Anki deck.

- **Install:** open the APK, tap Allow for "Display over other apps". No setup. The current list is
  bundled in the APK, so cards show on first open.
- **The list:** `data/todos.json` on branch `ccr-858db8c5-lx4rbu`, plain JSON, read by the phone
  without a token. Note the repo is public, so the list is too.
- **Who builds it:** a daily cloud scheduled task (cloud sessions from the last 24 h, commits across
  repos, pending approvals). Optionally `install-mac.sh` also runs `build-todos.mjs` on the Mac at
  07:00 and 13:00, which adds local Claude Code and Codex transcripts.

## The deck (Anki cloze cards, never ends)

- **Goals, not errands:** about 50 cards over ~10 goals for the photography career and the consumer
  apps. Each goal is asked several ways, hiding its outcome, why, deadline, measure of success or
  next milestone.
- **Question:** a sentence with the key part hidden as **[...]**. Tap the card or **Show Answer**.
- **Answer:** the hidden part is revealed in place (blue), with the goal and a note under a divider.
- **Rate it:** **Again** (1 min), **Hard** (10 min), **Good** (1 h), **Easy** (1 day). The card comes
  back when its time is up. Nothing is retired.
- **Never ends:** with nothing due and nothing new, the deck serves the card seen longest ago.
- **Counts** at the top: new (blue), due again (red), sent away (green). Progress is kept per card id
  across days, so unchanged cards keep their timing when the list is refreshed.

## List format

`{date, generated, items: [card]}`; card = `{id, task, rank, title, text, note, minutes, source}`.
`text` holds the hidden part in `{{double braces}}`; cards with the same `task` are variations of one
task. File order is study order. The phone takes a list only if `generated` is newer than the one it
holds; progress is kept per card `id`.
