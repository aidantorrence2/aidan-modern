# Approvals (macOS menu-bar app)

Approve or deny anything an agent wants to do (Claude Code sessions, Codex, scheduled routines)
from the app's own floating cards. GitHub is the queue: `data/approvals.json` on branch
`ccr-d1938557-3pv196` of `aidantorrence2/aidan-modern`. No server, no paid service.

## Setup

None. The app takes the token your GitHub CLI already has (`gh auth token`), keeps it only in the
login Keychain (item `com.aidantorrence.approvals`), and refreshes it from `gh` if GitHub ever
rejects it. It registers itself as a login item on first launch (turn off in Settings).

Optional: to use a narrower token instead, create a fine-grained token at
<https://github.com/settings/personal-access-tokens/new> with only `aidantorrence2/aidan-modern`
and **Contents: Read and write**, then paste it in Settings → Save token.

## Using it

- Requests show as the app's own floating cards in the top-right corner (not macOS
  notifications). They appear on every Space and over full-screen apps, never steal focus, and
  stay until you act. Each card leads with what approving does in plain words ("Post to
  Instagram", "Send email to …", "Spend $40"), then the image and the real text that goes out,
  who asked, and the link. Buttons: **Approve**, **Deny**, **4h** (snooze, the card comes back
  after) and **Review**.
- **Review** (or clicking the card) opens a window that says what happens if you approve, shows the
  image full size (feed / story switch), the full caption or email body, clickable links, any other
  fields as labeled rows, a note box, and Approve / Deny. Raw JSON is under "Technical details".
  The ✕ hides a card; the item stays in the menu-bar list ("Show cards" brings them back).
- Up to three cards show at once with a "+N more waiting" row; the next slides in as you decide.
  A soft sound plays when a new request arrives (Settings to turn off).
- New items appear within one poll (default 60 s).
- The menu-bar icon shows the pending count. Its panel groups items by `kind`, with Approve, Deny,
  Snooze 4h per item and "Approve all <kind>" per group.
- A decision writes `status`, `decided` (ISO 8601 UTC) and `note` back with a commit such as
  `Approve post:travel-fee` and shows a small ✓ toast. On a sha conflict it re-reads and retries
  once; if GitHub is unreachable the decision is kept on the Mac and retried on the next poll.
- Expired items are hidden. Quiet hours (Settings) hide cards until they end.

## Build and install

Needs only the Swift toolchain (Command Line Tools); no Xcode project.

```sh
cd tools/approvals-app
./build-app.sh --install   # release build -> build/Approvals.app -> /Applications, relaunch
```

`swift build` alone does a debug build. The app is ad-hoc signed; after a rebuild run
`gh auth token | /Applications/Approvals.app/Contents/MacOS/Approvals --set-token` so the new
binary owns the Keychain item and macOS doesn't ask.

Debug builds (`.build/debug/Approvals`) have two test flags that are not compiled into the release
app, so nothing on this Mac can approve through the app headlessly:

```sh
APPROVALS_TOKEN="$(gh auth token)" .build/debug/Approvals --self-test-decide <id> <approved|denied|pending> [note] [--stale-sha <sha>]
APPROVALS_TOKEN="$(gh auth token)" .build/debug/Approvals --render-cards /tmp/cards.png
```

`--self-test-decide` runs the same decide → PUT path the card buttons use (`--stale-sha` forces
the 409 retry). `--render-cards` renders the live queue's card stack to a PNG.

## How agents ask (Claude Code, Codex, routines)

Every agent uses one command, `request-approval` (source: `bin/request-approval.mjs`; installed as
`~/.local/bin/request-approval`; also on the queue branch as `scripts/approvals/request-approval.mjs`
for cloud routines). The rule telling agents to use it, instead of asking in chat, Slack or email,
is in `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md`.

```sh
request-approval add --kind email --title "Send email to Ana Diaz: NY test shoot" \
  --summary "Follow-up about the 24 Oct shoot" \
  --payload '{"to":"ana@x.com","subject":"...","body":"..."}' --expires-hours 72
request-approval status <id>            # or: wait <id> --timeout 900 (exit 0 approved, 3 denied/expired, 4 pending)
request-approval result <id> "sent:<messageId>"   # after acting; refused unless approved
request-approval list --pending
```

It writes through the GitHub API (token from `GH_TOKEN`/`GITHUB_TOKEN` or `gh auth token`) and falls
back to a sparse git clone + push when no token exists. After editing `bin/request-approval.mjs`,
copy it again to `~/.local/bin/request-approval` and to the queue branch.

`kind` is `post | email | spend | build | other`; `source` shows as a tag; no per-agent logic. The
item schema is in `flywheel/APPROVALS.md` on the queue branch. Agents never change `status`.

## Files

- `bin/request-approval.mjs` – the command every agent uses to ask
- `Sources/Approvals/ApprovalsStore.swift` – polling, card queue, decisions, write-back, gh token import
- `Sources/Approvals/GitHubClient.swift` – Contents API GET (ETag) / PUT
- `Sources/Approvals/CardPanel.swift` – the floating card panel (custom notifications)
- `Sources/Approvals/Presentation.swift` – turns kind + payload into plain language and readable fields
- `Sources/Approvals/JSONValue.swift` – order-preserving JSON parse/serialize
- `Sources/Approvals/Keychain.swift` – token storage (Security framework)
- `MenuView.swift`, `ItemDetailView.swift`, `SettingsView.swift` – SwiftUI UI
