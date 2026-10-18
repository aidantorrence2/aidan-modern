# Approvals (macOS menu-bar app)

Approve or deny anything an agent wants to do (Claude Code sessions, Codex, scheduled routines)
straight from a macOS notification. GitHub is the queue: `data/approvals.json` on branch
`ccr-d1938557-3pv196` of `aidantorrence2/aidan-modern`. No server, no paid service.

## The one setup step: a GitHub token

1. Open <https://github.com/settings/personal-access-tokens/new> (fine-grained token).
2. Name it `Approvals app`, pick an expiration (1 year is fine).
3. **Repository access → Only select repositories → `aidantorrence2/aidan-modern`.**
4. **Permissions → Repository permissions → Contents: Read and write.** Leave everything else
   at "No access" (Metadata: Read-only is added automatically).
5. Generate, copy, then click the ✓ seal icon in the menu bar → **Settings…** → paste into
   *Personal access token* → **Save token** → **Test connection** (should say `OK: N items`).

The token is stored only in your login Keychain (item `com.aidantorrence.approvals`), never in a
file. During setup the app was seeded with your `gh` CLI token so it works today; replacing it
with the narrower fine-grained token above is recommended. "Use gh CLI token" in Settings does the
same seeding again if you ever need it.

Tip: System Settings → Notifications → Approvals → set style to **Alerts** so notifications
stay on screen until you press Approve or Deny (banners vanish after a few seconds; their buttons
then live in Notification Center).

## Using it

- A new `pending`, not-expired item produces a notification within one poll (default 60 s) with
  the title, summary, preview image and **Approve / Deny** buttons. Clicking the body opens the
  item window (preview image, full payload as JSON, optional note).
- The menu-bar icon shows the pending count. The panel groups items by `kind`, with Approve, Deny,
  Snooze 4h per item and "Approve all <kind>" per group.
- A decision writes `status`, `decided` (ISO 8601 UTC) and `note` back with a commit such as
  `Approve post:travel-fee`. On a sha conflict it re-reads and retries once; if GitHub is
  unreachable the decision is kept locally and retried on the next poll.
- Expired items are hidden and never notified. Quiet hours (Settings) hold notifications until
  they end. Settings also has Launch at login.

## Build and install

Needs only the Swift toolchain (Command Line Tools); no Xcode project.

```sh
cd tools/approvals-app
./build-app.sh --install   # release build -> build/Approvals.app -> /Applications, relaunch
```

`swift build` alone does a debug build. The app is ad-hoc signed; after a rebuild, store the token
again (Settings → Save token) if macOS asks for Keychain access.

Debug builds (`swift build`, binary at `.build/debug/Approvals`) have two test flags that are not
compiled into the release app, so nothing on this Mac can approve through the app headlessly:

```sh
APPROVALS_TOKEN="$(gh auth token)" .build/debug/Approvals --self-test-decide <id> <approved|denied|pending> [note] [--stale-sha <sha>]
```

`--self-test-decide` runs the same decide → PUT path the notification buttons use
(`--stale-sha` forces the 409 retry). `--list-delivered` lists delivered notifications when run
from inside an .app bundle. The release app writes its last notification outcome to
`defaults read com.aidantorrence.approvals diag.lastNotify`.

## How agents add items

The contract is `flywheel/APPROVALS.md` on the queue branch. In short: re-read the file, append
an item to `items`, write the whole file back (git push or the Contents API with the current
`sha`). Never change `status`; only the app (you) does.

```json
{
  "id": "email:pitch-acme",
  "kind": "email",
  "source": "codex",
  "title": "Email: pitch to Acme Studio",
  "summary": "One or two lines you can decide on without opening anything.",
  "preview_url": "https://.../optional.png",
  "payload": { "to": "...", "subject": "...", "body": "..." },
  "created": "2026-10-18T20:05Z",
  "expires": "2026-10-21T20:05Z",
  "status": "pending",
  "decided": null,
  "note": ""
}
```

`kind` is `post | email | spend | build | other`; `source` shows as a tag; no per-agent logic.
The app preserves key order and formatting (2-space JSON), so a decision commit diff touches only
those three lines.

## Files

- `Sources/Approvals/ApprovalsStore.swift` – polling, diffing, decisions, write-back
- `Sources/Approvals/GitHubClient.swift` – Contents API GET (ETag) / PUT
- `Sources/Approvals/Notifications.swift` – UserNotifications with Approve / Deny actions
- `Sources/Approvals/JSONValue.swift` – order-preserving JSON parse/serialize
- `Sources/Approvals/Keychain.swift` – token storage (Security framework)
- `MenuView.swift`, `ItemDetailView.swift`, `SettingsView.swift` – SwiftUI UI
