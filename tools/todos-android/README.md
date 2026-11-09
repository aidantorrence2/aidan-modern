# Todos for Android

The phone side of `../todos`: a chat-head style bubble drawn over every app
(`SYSTEM_ALERT_WINDOW`) that expands into the to-do card game. See `../todos/README.md` for how
the list is built and how the game plays.

- Install: `./install-phone.sh` (needs `../todos/install-mac.sh` to have run once for the key).
- Syncs every 15 min, on screen-on and whenever you open the deck. Works offline on the last list.
- Done state is written to `data/todos-state.json` on the queue branch so tomorrow's build knows.
- The notification "Today's to-dos" opens the deck too; the app screen has Show / Hide bubble.
- Framework views only, no AndroidX (same setup as `../approvals-android`).
