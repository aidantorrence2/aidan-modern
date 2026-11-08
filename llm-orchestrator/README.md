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
| **Claude Code cloud sessions** | The bridge polls the Claude Code sessions API (the one the CLI uses) | Posted straight into the session |
| **Claude Code local sessions** | Set `"remoteControlAtStartup": true` in `~/.claude.json` and every new local session is on Remote Control, so it is polled and answered exactly like a cloud session. Sessions started without it are read from `~/.claude/projects/` by the Mac bridge (`claude-local`) | Remote Control: posted into the session. Otherwise typed into its tmux pane (Pulse), or `claude -p --resume` if the session isn't running; a session open in a plain terminal can't be typed into, so the reply comes back marked undeliverable |
| **Codex CLI** | The bridge reads `~/.codex/sessions/` | Typed into its tmux pane, else `codex exec resume <id> "<reply>"` |
| **ChatGPT** | The bridge polls chatgpt.com with a ChatGPT OAuth login from `codex login` (`"chatgpt": {"authFile": "~/.codex/auth.json"}`), refreshed automatically. No browser cookie | ChatGPT requires a browser check to accept a message, so the phone sends it: Send opens the conversation in the ChatGPT app and the app's accessibility service types and sends it |
| **claude.ai chats** | The Claude Android app's "completion" notifications (notification access) | Send opens the chat in the Claude app and the accessibility service sends it. claude.ai's API sits behind a Cloudflare bot check and the Claude Code login has no chat scope, so there is no server-side poller |
| **Other phone apps (Codex)** | Notification access | The notification's reply button, otherwise copy + open |

When the same turn arrives twice (for example as a hook report and from the poller, or as a phone notification and from the poller), only one copy is kept.

The **suggested reply** is drafted on the relay by Claude (`claude-opus-5-5` at `effort: low` by default, with server-side refusal fallbacks), using the session's last prompt, its response, and your top tasks. The app fills it into the reply box and shows up to 3 quick alternatives as chips. If you type a few words and press **✨ Draft**, those words steer a new draft. Without an `ANTHROPIC_API_KEY`, the relay drafts with `claude -p` on your Claude subscription when the `claude` CLI is installed and logged in on the relay machine. If neither is available, it falls back to canned replies.

## Where things run

- **Relay:** on an always-on server, so the phone works anywhere (cellular, laptop asleep). Ours runs as the `orch-relay` container from `Dockerfile.server` behind Caddy on a small VM. Drafts on a host without the `claude` CLI use `DEEPSEEK_API_KEY` (or `ANTHROPIC_API_KEY`).
- **Mac bridge:** `connectors/install-mac.sh` installs it as a launchd agent (starts at login, restarts on crash), copied to `~/.local/share/llm-orchestrator`. It covers local Codex and Claude Code, plus cloud sessions and ChatGPT while the Mac is awake.
- **Server bridge (optional):** the same image running `node connectors/bridge.mjs` keeps cloud sessions and ChatGPT flowing while the Mac sleeps. It needs its own logins (refresh tokens rotate; sharing the Mac's logs one of them out).
- **Bridges queue finished turns** in a saved outbox until the relay accepts them, and the relay requeues any reply a bridge claimed but didn't confirm within 90 seconds.

## Always-on browser (claude.ai, ChatGPT)

Neither service has an API for your chats, so the server runs a real Chromium (`browser/`, container `orch-browser`) that you sign in to once through its noVNC remote view at `https://<relay host>/view-<secret>/vnc.html` (secret in `~/.config/llm-orchestrator/browser-view-secret`). `poller.mjs` reads your conversations from inside the signed-in tabs every 30 s and posts finished replies to the relay; replies from the phone or Mac are typed into the real chat box. No automation flags or bot-check workarounds: if a site asks you to verify, it shows up in the remote view. The server has 3 GB of swap so Chromium can't starve the relay.

    docker run -d --name orch-browser --restart unless-stopped --network <caddy network> --shm-size 256m \
      -e ORCH_RELAY_URL=http://orch-relay:8787 -e ORCH_TOKEN=... -v ~/llm-orchestrator/browser-data:/data orch-browser

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
| `ORCH_SUGGEST` | `auto` | `api`, `cli` or `auto`. `auto` uses the API when a key is set, else `claude -p` |
| `ORCH_CLAUDE_BIN` / `ORCH_CLI_MODEL` | `claude` / `haiku` | CLI binary and model for `claude -p` drafts |
| `PORT`, `ORCH_DATA` | `8787`, `./data.json` | Port and the state snapshot file |

Use HTTPS in production, because the token and the session text go over this connection.

For USB-only testing with the relay on your laptop, run `adb reverse tcp:8787 tcp:8787` and enter `http://127.0.0.1:8787` in the app.

To restart the relay or bridge, match the script name, not the path: `pkill -f server.mjs` and `pkill -f bridge.mjs`. A pattern that includes the directory misses processes started from inside it, and two bridges post every completion twice.

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
- **Xiaomi / HyperOS:** use `android/install-hyperos.sh`. `adb install` goes through the Security app's USB-install screen, which an app blocker locking the Security app cancels (`INSTALL_FAILED_USER_RESTRICTED`); the script opens the APK in the normal package installer instead. HyperOS also resets *Display over other apps* and *Autostart* on every update, and the script grants them again.
- Open the app, then:
  1. Under ⚙ enter the relay URL and token, then tap **Save & test**.
  2. Grant **Draw over other apps** and **Post alerts**. **Notification access** is optional, as a backup for the phone apps.
  3. Tap **Float**. The ◆ bubble stays on top of every app and shows a badge with the number of unanswered completions. Tap it to open the panel, drag it to move it, and tap **—** to shrink it back to the bubble. A new completion opens the panel by itself.

Each completion also arrives as a heads-up notification with **Send suggestion** and an inline **Reply** whose smart-reply chips are the draft and its alternatives.

### Panel

- **Inbox:** one card per session showing only its latest turn. Each card has the source, title, your last prompt, the response (tap to expand), and an editable reply already filled with the draft. The buttons are **Send**, **✨ Draft** (redraft, steered by whatever you typed), **Open** (jump to the session or app), **+Task**, and **✕**. If a send fails, the card comes back with your reply still filled in and the reason shown. **Recent** shows what you sent and how it was delivered.
- **Tasks:** your top tasks with priorities P1 to P3. Tap the P chip to change the priority, **↑** to move a task up, and the checkbox to mark it done. The top task appears as **Focus →** on every screen. Tasks sync through the relay, and the drafted replies take them into account.
- The status line shows whether the relay is reachable and the health of each bridge source, for example `laptop: claude ✓ codex ✓ chatgpt ✓ claude ✓`.

## Mac panel

`mac/build.sh --install` builds `Orchestrator.app` into /Applications: a floating panel on the middle of the left screen edge (280 pt wide, the middle third of the screen height), on top of every app and Space, starting at login. It reads the same relay as the phone using `~/.config/llm-orchestrator/config.json`. Send, ✨ Draft (what you typed steers it), Open and ✕ work as on the phone; ⌘↩ sends. ChatGPT and claude.ai replies are copied and the chat is opened, because nothing on the Mac can post into those.

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
