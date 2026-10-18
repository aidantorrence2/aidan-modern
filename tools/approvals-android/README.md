# Approvals for Android

The phone side of the Approvals app (`../approvals-app`). It reads the same GitHub queue
(`data/approvals.json` on branch `ccr-d1938557-3pv196`), so a request any Claude or Codex agent
queues with `request-approval` shows up on the Mac and the phone at once; deciding on either one
writes the same commit (`Approve <id>` / `Deny <id>`), and the other side drops it on its next poll.

## What it does

- **Actionable notifications, like the Claude app.** A new request drops down as a heads-up banner
  with **Approve**, **Deny** and **Later (4h)** right in the notification; tapping a button decides it
  in the background without opening the app (no unlock or fingerprint needed). The expanded
  notification shows the photo when the request has one.
- **Persistent.** Each waiting request keeps an ongoing notification until it is decided. The oldest
  request is the app's foreground notification (no separate "inbox" line when something is
  waiting). Updates never re-alert; if you swipe one away it comes back on the next poll, silently.
- **First decision wins.** If a request was already decided on the Mac or by anyone else, a later
  tap on the phone leaves it alone and says "Already approved/denied elsewhere".
- **Tap for details.** Tapping the notification opens the review screen: what approving does in
  plain words, the full image (feed / story switch when there are two), the exact caption or email
  body, links, other fields, a note box for the agent, and Approve / Deny. Raw JSON is under
  "Technical details".
- **Polling.** A foreground service checks the queue every 60 s, on screen-on, and whenever the app
  is opened. Decisions are written through the GitHub Contents API with the file's sha (re-read and
  retried on a conflict) and are kept on the phone and retried if the network is down.

## Install (one command, from the Mac, phone on USB)

```sh
tools/approvals-android/install-phone.sh
```

It builds the APK, installs it (Play-Store-attributed `pm install`, which HyperOS accepts), grants
notifications, background running, battery exemption and the HyperOS autostart /
background ops, pipes `gh auth token` from the Mac into the app's private storage (never printed
or put on a command line; the app encrypts it with the Android Keystore and deletes the plain copy),
and starts the service. Nothing to set up on the phone. `DEVICE=<serial>` picks a device;
`--no-build` reuses the last APK.

## Phone quirks (Redmi Note 15 Pro, HyperOS)

- HyperOS files ongoing notifications in its own section below the dot divider and shows them
  collapsed: the heads-up banner has the buttons; in the shade, tap the arrow (or the notification
  for the full review screen). Installed and tested on the phone 2026-10-18 (request delivered in
  ~40 s, review screen and Deny from the phone committed).

- AppBlock blocks the Settings UI on this phone, so every grant is applied over adb.
- HyperOS can revert adb-set background/autostart ops and freeze plain foreground services. If
  notifications stop arriving after a reboot or a long idle, re-run `install-phone.sh --no-build`;
  for a durable grant, turn on Autostart through MIUI's own screen (the exact taps are in
  `~/helm/DEVELOPMENT.md`, "Phone-side facts").

## Build

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ./gradlew --no-configuration-cache assembleDebug
```

AGP 8.5.2 / Gradle 8.7 / Kotlin 2.0.21, compileSdk 34, minSdk 29. Framework views only, zero
library dependencies. Debug-signed (needed for the `run-as` token hand-off).

## Files

- `ApprovalService.kt` – foreground service: polling, actionable notifications, decisions
- `Ui.kt` – card and button builders for the inbox
- `ReviewActivity.kt`, `MainActivity.kt` – review screen and inbox
- `Queue.kt` – GitHub client, item model, decision write-back
- `Json.kt` – order-preserving JSON (same bytes as `JSON.stringify(x, null, 2)`)
- `Presentation.kt` – plain-language headline / consequence, same rules as the Mac app
- `TokenStore.kt` – Keystore-encrypted token
