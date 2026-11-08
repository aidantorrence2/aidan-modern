# LLM Orchestrator

An always-on-top Android app that collects finished turns from all your AI sessions, drafts the reply you would probably send, and lets you send it with one tap or type your own. It also keeps a short list of top tasks, and the drafted replies steer toward those tasks.

```
 your computer: bridge.mjs ── polls ──► Claude Code sessions API   (cloud + local Remote Control sessions)
                    │                   ~/.codex/sessions/*.jsonl  (Codex CLI)
                    │                   chatgpt.com                (your ChatGPT chats, browser cookie)
                    │                   claude.ai                  (your Claude chats, browser cookie)
                    ▼
                  relay  ◄── long-poll ── Android app: floating bubble + panel, heads-up alerts
                (Claude drafts                                    with [Send suggestion] / inline Reply
                 the reply)
```

## How each source works

| Source | How a finished turn is detected | How your reply is delivered |
|---|---|---|
| **Claude Code: cloud sessions and local sessions on Remote Control** | The bridge polls the Claude Code sessions API (the one the CLI uses) with the CLI's login on your computer | Posted straight into the session as your next message, whether or not it is waiting |
| **Codex CLI** | The bridge reads the session files in `~/.codex/sessions/` | `codex exec resume <id> "<reply>"` |
| **ChatGPT chats** | The bridge polls chatgpt.com with your browser login | Posted into the conversation. If ChatGPT asks for its browser verification check, the reply comes back to the phone to copy and paste (see Limits) |
| **claude.ai chats** | The bridge polls claude.ai with your browser login | Posted into the conversation |
| **Phone apps (ChatGPT, Codex, Claude)** | Android notification access, as a backup | Through the notification's reply button, otherwise copy + open |
| **Plain local Claude Code terminal sessions** (optional) | The `Stop` hook | The hook waits for your reply and Claude continues in place. If you reply later, the bridge runs `claude -p --resume` |

When the same turn arrives twice (for example as a hook report and from the poller, or as a phone notification and from the poller), only one copy is kept.

The **suggested reply** is drafted on the relay by Claude (`claude-opus-5-5` at `effort: low` by default, with server-side refusal fallbacks), using the session's last prompt, its response, and your top tasks. The app fills it into the reply box and shows up to 3 quick alternatives as chips. If you type a few words and press **✨ Draft**, those words steer a new draft. Without an `ANTHROPIC_API_KEY`, the relay falls back to canned replies.

## 1. Run the relay

The relay is a small Node 20+ server with one dependency (`@anthropic-ai/sdk`). It has to be reachable from your phone and from the computers running the bridge. Any of these works: a small VPS, Fly.io, Railway, Render, or your desktop behind Tailscale or Cloudflare Tunnel.

```bash
cd llm-orchestrator/relay
npm install
ORCH_TOKEN="$(openssl rand -hex 24)" ANTHROPIC_API_KEY=sk-ant-... npm start   # listens on :8787
```

Docker: `docker build -t orch-relay . && docker run -p 8787:8787 -v orch:/data -e ORCH_TOKEN=... -e ANTHROPIC_API_KEY=... orch-relay`

| Env | Default | |
|---|---|---|
| `ORCH_TOKEN` | required | Shared secret. Every client sends it as `Authorization: Bearer …` |
| `ANTHROPIC_API_KEY` | none | Enables Claude-drafted replies |
| `ORCH_MODEL` / `ORCH_EFFORT` | `claude-opus-5-5` / `low` | Drafting model and effort |
| `PORT`, `ORCH_DATA` | `8787`, `./data.json` | Port and the state snapshot file |

Use HTTPS in production, because the token and the session text go over this connection.

## 2. Run the bridge on your computer

Create `~/.config/llm-orchestrator/config.json`:

```json
{
  "relayUrl": "https://relay.example.com",
  "token": "…",
  "chatgpt":   { "sessionToken": "<value of the __Secure-next-auth.session-token cookie on chatgpt.com>" },
  "claudeWeb": { "sessionKey":   "<value of the sessionKey cookie on claude.ai>" }
}
```

Then run `node llm-orchestrator/connectors/bridge.mjs`, and keep it running with launchd, systemd or pm2.

- **Claude Code** needs nothing extra. The bridge uses the login from `claude auth login` on that computer (`~/.claude/.credentials.json`, or the Keychain on macOS) and refreshes it the same way the CLI does. Long-lived `claude setup-token` tokens can't read sessions, so the regular login is required. For local sessions to appear, connect them with Remote Control. Otherwise use the optional hook below.
- **Codex CLI** needs nothing extra. The `notify` setup is no longer needed.
- **ChatGPT / claude.ai:** copy the cookie from your browser's dev tools (Application → Cookies). If you delete a section, that source turns off. If a cookie expires, the app's status line shows `chatgpt ✗` or `claude ✗` until you replace it.
- To turn a source off, set `"enabled": false` in its section (`claudeSessions`, `codex`, `chatgpt`, `claudeWeb`). Poll intervals are set with `intervalMs`.
- **Optional Stop hook**, for plain terminal sessions that aren't on Remote Control: add `connectors/claude-settings.example.json` to `~/.claude/settings.json` with the absolute path to `claude-code-stop-hook.mjs`. It does nothing inside cloud sessions, because the poller already covers them.

## 3. Install the app

- **Build:** `cd android && ./gradlew assembleDebug` → `app/build/outputs/apk/debug/app-debug.apk`. It needs JDK 17+ and an Android SDK. There are no third-party libraries, only platform APIs and Kotlin.
- **Or** download the `llm-orchestrator-apk` artifact from the **LLM Orchestrator** GitHub Actions run.
- Open the app, then:
  1. Under ⚙ enter the relay URL and token, then tap **Save & test**.
  2. Grant **Draw over other apps** and **Post alerts**. **Notification access** is optional, as a backup for the phone apps.
  3. Tap **Float**. The ◆ bubble stays on top of every app and shows a badge with the number of unanswered completions. Tap it to open the panel, drag it to move it, and tap **—** to shrink it back to the bubble.

Each completion also arrives as a heads-up notification with **Send suggestion** and an inline **Reply** whose smart-reply chips are the draft and its alternatives.

### Panel

- **Inbox:** one card per session showing only its latest turn. Each card has the source, title, your last prompt, the response (tap to expand), and an editable reply already filled with the draft. The buttons are **Send**, **✨ Draft** (redraft, steered by whatever you typed), **Open** (jump to the session or app), **+Task**, and **✕**. If a send fails, the card comes back with your reply still filled in and the reason shown. **Recent** shows what you sent and how it was delivered.
- **Tasks:** your top tasks with priorities P1 to P3. Tap the P chip to change the priority, **↑** to move a task up, and the checkbox to mark it done. The top task appears as **Focus →** on every screen. Tasks sync through the relay, and the drafted replies take them into account.
- The status line shows whether the relay is reachable and the health of each bridge source, for example `laptop: claude ✓ codex ✓ chatgpt ✓ claude ✓`.

## Tests

```bash
cd llm-orchestrator/relay && npm test                 # relay + Stop hook end to end
node llm-orchestrator/connectors/test-sources.mjs     # bridge + relay against mock versions of every service
```

## Relay API (for adding other sources)

All endpoints need `Authorization: Bearer $ORCH_TOKEN`.

- `POST /api/events` `{source, sessionId, title?, cwd?, host?, prompt?, text, url?, replyMode: hook|bridge|device|none}` reports a finished turn.
- `GET /api/events?since=<seq>&wait=<s>` is a long-poll that returns the events, tasks and bridge status that changed since `seq`.
- `POST /api/reply` `{eventId | sessionId, text}` sends a reply. `GET /api/bridge/replies?host=&sources=&wait=` is how a bridge claims replies, and `POST /api/events/:id/undeliverable` `{error}` hands one back to the phone.
- `POST /api/events/:id/suggest` `{hint?}` and `POST /api/suggest` `{source, title, text, hint?}` draft a reply.
- `GET|PUT /api/tasks`, `POST /api/bridge/status`

## Limits

- **ChatGPT and claude.ai** go through the internal endpoints their websites use. These are not public APIs, so they can change without notice, and automated use is a grey area under their terms. Reading conversations works with plain polling. For sending, ChatGPT usually requires a browser proof-of-work or Turnstile check. The bridge does not try to get around that check: when it is required, the reply returns to the phone, filled in, so you can copy and open the chat. claude.ai sending has no such check today.
- The Claude Code sessions API is also the CLI's internal API, not a documented public one.
