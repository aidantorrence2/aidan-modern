# Approvals queue (shared by every agent and the Mac approval app)

One file, `data/approvals.json` on the working branch, is the inbox. Any agent (Claude flywheel
runs, Codex, anything else) appends an item it needs a human decision on; the Mac app shows it as a
notification with Approve / Deny and writes the decision back; the agent acts on the next run.
Nothing outward (a post, a sent email, a spend) happens on an item that is not `approved`.

## Item schema

```json
{
  "id": "post:travel-fee",             // unique, stable; prefix with the kind
  "kind": "post | email | spend | build | other",
  "source": "claude:flywheel-code",    // which agent asked
  "title": "Post: Travel Fee hook card",
  "summary": "One or two lines a human can decide on without opening anything.",
  "preview_url": "https://.../posts/travel-fee-feed.png",   // optional
  "payload": { },                       // what the agent will do verbatim once approved
  "created": "2026-10-18T20:05Z",
  "expires": "2026-10-21T20:05Z",       // optional; the app hides expired items, agents treat as denied
  "status": "pending | approved | denied",
  "decided": null,                      // ISO time when the human decided
  "note": ""                            // optional human note, e.g. "post it Tuesday"
}
```

## Rules

- Agents only add items and only change their own items from `approved` or `denied` to a
  terminal result note (e.g. `payload.result = "posted:instagram:1789..."`). They never flip
  `status` themselves.
- The app only changes `status`, `decided`, `note`.
- Both sides write through the GitHub Contents API (or git) on the working branch and re-read the
  file before writing to avoid clobbering; the file is small on purpose.
- Approvals in Slack (`approve all`, `approve <names>`) remain valid for email drafts until the app
  is running; once it is, the app is the one place to approve.

## How to ask (any agent: Claude Code, Codex, routines)

Use the command; never hand-edit the file and never ask Aidan in Slack, email or chat instead.

```sh
node scripts/approvals/request-approval.mjs add --kind email \
  --title "Send email to Ana Diaz: NY test shoot" \
  --summary "Follow-up to Ana about the 24 Oct shoot; asks her to confirm the time." \
  --payload '{"to":"ana@x.com","subject":"...","body":"..."}' --expires-hours 72
node scripts/approvals/request-approval.mjs status <id>     # or: wait <id> --timeout 900
node scripts/approvals/request-approval.mjs result <id> "sent:<messageId>"   # after acting on an approved item
```

On Aidan's Mac the same command is installed as `request-approval`. The title must say plainly
what happens if he approves; the payload must hold exactly what will be done. Before ending your
turn, block on `wait <id>` (up to 30 min): a run that ends while the request is pending never hears
the answer. Do what the output's `instruction` says: act only on `approved` (following his `note`),
treat denied or expired as no, and treat a denial note as feedback: revise and queue a NEW request.
