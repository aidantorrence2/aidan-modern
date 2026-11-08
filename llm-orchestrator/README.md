# LLM Orchestrator

An always-on-top Android app that collects finished turns from all your AI sessions, drafts the reply you would probably send, and lets you send it with one tap or type your own. It also keeps a short list of top tasks, and the drafted replies steer toward those tasks.

```
 Claude Code (local) ──Stop hook──┐                       ┌── floating bubble + panel (always on top)
 Claude Code (cloud) ──Stop hook──┤                       ├── heads-up alert: [Send suggestion] [Reply ▸ smart chips]
 Codex CLI ──────────notify───────┼──► relay ◄──long-poll──┤
                                  │   (Claude drafts       │
 bridge.mjs ◄── replies for idle ─┘    the reply)          └── NotificationListener: ChatGPT / Codex / Claude apps
   local sessions (claude --resume, codex exec resume)          (reply through the app's own reply action, or copy + open)
```

## How replies get back to each session

| Session | How the app hears about it | How your reply is delivered |
|---|---|---|
| **Claude Code, local** | `Stop` hook posts the turn's final message | The hook waits (default 10 min). If you reply in that time, the hook returns `decision: block` with your reply and Claude continues right away. If you reply later, `bridge.mjs` runs `claude -p --resume <id> "<reply>"` on that machine. |
| **Claude Code, cloud** (claude.ai/code) | Same `Stop` hook, committed in the repo's `.claude/settings.json` | Same live hook path. If the hook has stopped waiting, the app copies the reply and opens the session link. |
| **Codex CLI** | `notify` program in `~/.codex/config.toml` | `bridge.mjs` runs `codex exec resume <thread> "<reply>"` and reports the result back. |
| **ChatGPT / Codex / Claude apps** | Android notification access (the app's "response ready" notifications) | Through the notification's inline reply action if it has one. Otherwise the reply is copied and the conversation is opened, so you just paste. |

The **suggested reply** is drafted on the relay by Claude (`claude-opus-5-5` at `effort: low` by default, with server-side refusal fallbacks), using the session's last prompt, its response, and your top tasks. The app pre-fills it in the reply box and shows up to 3 quick alternatives as chips. If you type a few words and press **✨ Draft**, those words steer a new draft. Without an `ANTHROPIC_API_KEY`, the relay falls back to canned replies.

## 1. Run the relay

The relay is a small Node 20+ server with one dependency (`@anthropic-ai/sdk`). It has to be reachable from your phone, your computers, and (for cloud sessions) the cloud container. Any of these works: a small VPS, Fly.io, Railway, Render, or your desktop behind Tailscale or Cloudflare Tunnel.

```bash
cd llm-orchestrator/relay
npm install
ORCH_TOKEN="$(openssl rand -hex 24)" ANTHROPIC_API_KEY=sk-ant-... npm start   # listens on :8787
npm test                                                                       # end-to-end test, no API key needed
```

Docker: `docker build -t orch-relay . && docker run -p 8787:8787 -v orch:/data -e ORCH_TOKEN=... -e ANTHROPIC_API_KEY=... orch-relay`

| Env | Default | |
|---|---|---|
| `ORCH_TOKEN` | required | Shared secret. Every client sends it as `Authorization: Bearer …` |
| `ANTHROPIC_API_KEY` | none | Enables Claude-drafted replies |
| `ORCH_MODEL` / `ORCH_EFFORT` | `claude-opus-5-5` / `low` | Drafting model and effort |
| `PORT`, `ORCH_DATA` | `8787`, `./data.json` | Port and the state snapshot file |

Use HTTPS in production, because the token and the session text go over this connection.

## 2. Connect your sessions

Create `~/.config/llm-orchestrator/config.json` on each computer (or set `ORCH_RELAY_URL` and `ORCH_TOKEN`):

```json
{ "relayUrl": "https://relay.example.com", "token": "…", "waitSeconds": 600 }
```

**Claude Code, all projects on this machine:** add the hook from `connectors/claude-settings.example.json` to `~/.claude/settings.json`, using the absolute path to `claude-code-stop-hook.mjs`. Keep `timeout` above `waitSeconds`. Set `waitSeconds: 0` if you don't want the terminal to wait. In that case the bridge resumes the session when you reply.

**Claude Code cloud sessions:** commit the same hook in the repo's `.claude/settings.json` (the example uses `$CLAUDE_PROJECT_DIR`, so this folder must be in the repo), add `ORCH_RELAY_URL` and `ORCH_TOKEN` as environment variables in the cloud environment, and allow the relay's host in its network settings. The hook does nothing if those variables are missing, so committing it is safe.

**Codex CLI:** in `~/.codex/config.toml`:

```toml
notify = ["node", "/ABSOLUTE/PATH/llm-orchestrator/connectors/codex-notify.mjs"]
```

**Bridge (one per computer):** `node connectors/bridge.mjs` (run it under launchd, systemd, or pm2). It only takes replies for sessions on its own host that no hook is waiting on. You can override the resume commands in `config.json` with `"commands": { "codex": [...], "claude-code": [...] }` (placeholders: `{session}`, `{text}`).

## 3. Install the app

- **Build:** `cd android && ./gradlew assembleDebug` → `app/build/outputs/apk/debug/app-debug.apk`. It needs JDK 17+ and an Android SDK. There are no third-party libraries, only platform APIs and Kotlin.
- **Or** download the `llm-orchestrator-apk` artifact from the **LLM Orchestrator** GitHub Actions run.
- Open the app, then:
  1. Under ⚙ enter the relay URL and token, then tap **Save & test**.
  2. Grant **Draw over other apps**, **Notification access** and **Post alerts**.
  3. Tap **Float**. The ◆ bubble stays on top of every app and shows a badge with the number of unanswered completions. Tap it to open the panel, drag it to move it, and tap **—** to shrink it back to the bubble.

Each completion also arrives as a heads-up notification with **Send suggestion** and an inline **Reply** whose smart-reply chips are the draft and its alternatives. You can answer without opening anything.

### Panel

- **Inbox:** one card per session showing only its latest turn. Each card has the source, title, your last prompt, the response (tap to expand), and an editable reply already filled with the draft. The buttons are **Send**, **✨ Draft** (redraft, steered by whatever you typed), **Open** (jump to the session or app), **+Task**, and **✕**. **Recent** shows what you sent and how it was delivered: live, by the bridge, via the app, or copied.
- **Tasks:** your top tasks with priorities P1 to P3. Tap the P chip to change the priority, **↑** to move a task up, and the checkbox to mark it done. The top task appears as **Focus →** on every screen. Tasks sync through the relay, and the drafted replies take them into account.

## Relay API (for adding other sources)

All endpoints need `Authorization: Bearer $ORCH_TOKEN`.

- `POST /api/events` `{source, sessionId, title?, cwd?, host?, prompt?, text, url?, replyMode: hook|bridge|device|none}` reports a finished turn.
- `GET /api/events?since=<seq>&wait=<s>` is a long-poll that returns the events and tasks that changed since `seq`.
- `POST /api/reply` `{eventId | sessionId, text}` sends a reply. `GET /api/replies?sessionId=&wait=` is used by the hooks, and `GET /api/bridge/replies?host=&sources=&wait=` by the bridge.
- `POST /api/events/:id/suggest` `{hint?}` and `POST /api/suggest` `{source, title, text, hint?}` draft a reply.
- `GET|PUT /api/tasks`

## Limits

- ChatGPT and Claude web chats have no API for sending messages, so the app can only reach them through their Android notifications. If a notification has no inline reply action, the reply is copied and the conversation opened, and you paste it yourself.
- A reply that arrives after a cloud session's hook stopped waiting can't be injected, so it's copied and the session opened instead. Raise `waitSeconds`, along with the hook `timeout`, to keep cloud sessions listening longer.
- `bridge.mjs` resumes a local session headlessly. If the same session is also open in a terminal, that terminal won't show the resumed turn until you reopen it with `claude --resume`.
