# Approvals for Android

The phone side of the Approvals app (`../approvals-app`). It reads the same GitHub queue
(`data/approvals.json` on branch `ccr-d1938557-3pv196`), so a request any Claude or Codex agent
queues with `request-approval` shows up on the Mac and the phone at once; deciding on either one
writes the same commit (`Approve <id>` / `Deny <id>`), and the other side drops it on its next poll.

## What it does

- **Pop-up card over any app.** When a request is waiting, a card is drawn over whatever is on
  screen (Android "display over other apps"): what approving does in plain words, the image, the
  real text, who asked, and **Approve / Deny / 4h / Review**. It stays until you decide, snooze or
  close it with ✕; the next waiting request replaces it.
- **Persistent notifications.** One ongoing notification per waiting request with Approve / Deny /
  4h actions. It comes back every poll until the request is decided, but only alerts the first
  time; re-posts go to a silent channel.
- **Review screen.** Tap a card or notification: full image (feed / story switch when there are
  two), the exact caption or email body, links, other fields, a note box for the agent, and
  Approve / Deny. Raw JSON is under "Technical details". The pop-up steps aside while it's open.
- **Polling.** A foreground service checks the queue every 60 s, on screen-on, and whenever the app
  is opened. Decisions are written through the GitHub Contents API with the file's sha (re-read and
  retried on a conflict) and are kept on the phone and retried if the network is down.

## Install (one command, from the Mac, phone on USB)

```sh
tools/approvals-android/install-phone.sh
```

It builds the APK, installs it (Play-Store-attributed `pm install`, which HyperOS accepts), grants
notifications, draw-over-apps, background running, battery exemption and the HyperOS autostart /
background ops, pipes `gh auth token` from the Mac into the app's private storage (never printed
or put on a command line; the app encrypts it with the Android Keystore and deletes the plain copy),
and starts the service. Nothing to set up on the phone. `DEVICE=<serial>` picks a device;
`--no-build` reuses the last APK.

## Phone quirks (Redmi Note 15 Pro, HyperOS)

- AppBlock blocks the Settings UI on this phone, so every grant is applied over adb.
- HyperOS can revert adb-set background/autostart ops and freeze plain foreground services. If cards
  stop popping after a reboot or a long idle, re-run `install-phone.sh --no-build`; for a durable
  grant, set Autostart and "Display pop-up windows while running in the background" to allow via
  MIUI's own screens (the exact taps are in `~/helm/DEVELOPMENT.md`, "Phone-side facts").

## Build

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ./gradlew --no-configuration-cache assembleDebug
```

AGP 8.5.2 / Gradle 8.7 / Kotlin 2.0.21, compileSdk 34, minSdk 29. Framework views only, zero
library dependencies. Debug-signed (needed for the `run-as` token hand-off).

## Files

- `ApprovalService.kt` – foreground service: polling, persistent notifications, decisions, overlay
- `Overlay.kt` – the draw-over-other-apps card
- `Ui.kt` – card and button builders shared by the overlay and the inbox
- `ReviewActivity.kt`, `MainActivity.kt` – review screen and inbox
- `Queue.kt` – GitHub client, item model, decision write-back
- `Json.kt` – order-preserving JSON (same bytes as `JSON.stringify(x, null, 2)`)
- `Presentation.kt` – plain-language headline / consequence, same rules as the Mac app
- `TokenStore.kt` – Keystore-encrypted token
