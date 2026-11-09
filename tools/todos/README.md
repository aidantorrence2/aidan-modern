# Todos: today's top 10 as a floating card game

A bubble that floats over every app on the Android phone. Tap it and it opens into a deck of
**the 10 things you need to do today**, ranked by Claude from the last 24 hours of everything your
agents said and did. You play it like Anki: flip a card, then grade it.

```
 Mac, 07:00 + 13:00                         GitHub (queue branch)            Phone
 build-todos.mjs ── digest ── Claude ──▶  data/todos.enc.json  ──poll──▶  bubble ─tap─▶ deck
     ▲                                     data/todos-state.json ◀─done──┘
     └──────── reads yesterday's done ids ─┘
```

## What it reads (last 24 h, each capped so one call is cheap)

| Source | What it takes |
|---|---|
| Claude Code (`~/.claude/projects`) | per session: every ask you typed (short) + the agent's last two replies (where "you need to…" lives) |
| Codex (`~/.codex/sessions`) | same |
| Commits, all your repos | first lines of commits by you in 24 h (cloud sessions commit too) |
| Approvals queue | every pending request: each one is waiting on you |
| Yesterday's list + phone state | unfinished items can carry over with the same id; done ones never come back |

Newest sessions first, up to ~90k characters of excerpts (about 25k tokens); one call to
`claude-fable-5-2` (ranking the day is planning work) through the `claude` CLI you are already logged into (falls back to the
Anthropic SDK if `ANTHROPIC_API_KEY` is set and the CLI is missing).

## The game

- **Front:** rank, time estimate, source, the task. Tap (or **Show**) to flip.
- **Back:** why it matters and the **first step**, something you can start in two minutes.
- **Done ✓** (or swipe right): +10 points × combo (up to ×5 for a run without Again), haptic tick.
- **Again** (or swipe left): comes back two cards later and resets the combo. **Later:** bottom of the deck.
- Undo the last Done from the link under the buttons. Clearing half the deck counts the day toward the 🔥 streak.
- The bubble shows cards left with a green ring for progress; ✓ when the deck is cleared.
- Drag it anywhere; it snaps to the nearest edge. Tap outside the deck or tap **—** to collapse.

## Install

- **Phone:** install the APK and tap Allow for "Display over other apps". Nothing to type or paste.
- **Mac (once):** `tools/todos/install-mac.sh`, or without a checkout:
  `curl -fsSL https://raw.githubusercontent.com/aidantorrence2/aidan-modern/ccr-858db8c5-lx4rbu/tools/todos/install-mac.sh | bash`.
  It schedules 07:00 + 13:00 and builds today's list now. No keys.
- Optional, phone on USB: `tools/todos-android/install-phone.sh ~/Downloads/Todos.apk` also grants the
  permissions for you and gives the phone a GitHub token, so done cards sync back and tomorrow's
  list knows for sure. Without it, done state stays on the phone and the builder judges carry-overs
  from the transcripts.

Run a build by hand any time with `node ~/.config/aidan-todos/build-todos.mjs` (`--dry-run` to
print without pushing, `--digest` to see exactly what is sent to Claude). The last list in plain text is
`~/.config/aidan-todos/today.json`; the log is `~/.config/aidan-todos/build.log`.

## Privacy

`aidan-modern` is a public repo, so the list is pushed **encrypted** to the phone app's public key
(RSA-OAEP wrapping a one-time AES-256-GCM key; the public key is in `build-todos.mjs`). The private
key exists only inside the APK: **never commit an APK**. Building a new APK from source needs that
key in `~/.config/aidan-todos/phone-private.b64`; without it, generate a new pair and replace
`PHONE_PUBLIC_KEY` in `build-todos.mjs`.

## Settings (env vars for build-todos.mjs)

`TODOS_HOURS` (default 24), `TODOS_MODEL` (default `claude-fable-5-2`), `TODOS_BRANCH`,
`TODOS_REPO`, `TODOS_USE_SDK=1` to skip the CLI.
