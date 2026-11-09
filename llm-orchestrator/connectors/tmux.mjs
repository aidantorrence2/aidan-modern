// tmux delivery for local interactive sessions (Claude Code / Codex running inside tmux, e.g. under Pulse,
// which hosts every session on its own `pulse` socket). A reply is typed into the pane that runs the
// session, exactly as if you had typed it at the keyboard.
//
//   findPaneForSession(kind, sessionId, { pids, cwd, files, tmux }) -> { socket, pane, session, cwd } | null
//   sendToPane(pane, text)
//
// Pane <-> session mapping: we start from the process(es) that own the session (Claude Code's
// ~/.claude/sessions/<pid>.json, the process holding a Codex rollout file open, or any process whose
// argv contains the session id, e.g. `claude --resume <id>` / `codex resume <id>`), then walk up the
// process tree until we hit a pane's root pid. Only for Codex, as a last resort, a single pane whose
// cwd matches and that runs `codex` is accepted.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(cmd, args, { input, timeoutMs = 5000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = execFile(cmd, args, { timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        err.message = `${path.basename(cmd)} ${args.slice(0, 4).join(' ')}: ${(stderr || err.message).toString().trim().slice(0, 200)}`;
        return reject(err);
      }
      resolve(stdout.toString());
    });
    if (input !== undefined) child.stdin.end(input);
  });
}

let tmuxBin = null;
export function tmuxPath() {
  if (tmuxBin) return tmuxBin;
  for (const p of ['/opt/homebrew/bin/tmux', '/usr/local/bin/tmux', '/usr/bin/tmux']) if (fs.existsSync(p)) return (tmuxBin = p);
  return (tmuxBin = 'tmux');
}

function socketDir() {
  const base = process.env.TMUX_TMPDIR || (process.platform === 'darwin' ? '/private/tmp' : '/tmp');
  return path.join(base, `tmux-${os.userInfo().uid}`);
}

/** Socket paths to search. opts.sockets: names (`pulse`) or absolute paths; default = every socket of this user. */
export function listSockets(opts = {}) {
  if (Array.isArray(opts.sockets)) return opts.sockets.map((s) => (s.includes('/') ? s : path.join(socketDir(), s)));
  try {
    return fs
      .readdirSync(socketDir())
      .map((n) => path.join(socketDir(), n))
      .filter((p) => {
        try {
          return fs.statSync(p).isSocket();
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}

export async function listPanes(opts = {}) {
  if (opts.enabled === false) return [];
  const out = [];
  for (const socket of listSockets(opts)) {
    let text;
    try {
      text = await run(tmuxPath(), ['-S', socket, 'list-panes', '-a', '-F', '#{pane_id}\t#{pane_pid}\t#{session_name}\t#{pane_current_path}\t#{pane_dead}']);
    } catch {
      continue; // stale socket / no server
    }
    for (const l of text.split('\n')) {
      const [pane, pid, session, cwd, dead] = l.split('\t');
      if (pane && dead !== '1') out.push({ socket, pane, panePid: Number(pid), session, cwd });
    }
  }
  return out;
}

/** pid -> { ppid, args } for every process. */
export async function processTable() {
  const map = new Map();
  const text = await run(fs.existsSync('/bin/ps') ? '/bin/ps' : 'ps', ['-axww', '-o', 'pid=,ppid=,command=']);
  for (const l of text.split('\n')) {
    const m = l.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/);
    if (m) map.set(Number(m[1]), { ppid: Number(m[2]), args: m[3] });
  }
  return map;
}

export function isAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

function paneForPid(pid, panes, procs) {
  const byPid = new Map(panes.map((p) => [p.panePid, p]));
  for (let p = pid, hops = 0; p > 1 && hops < 64; hops++) {
    if (byPid.has(p)) return byPid.get(p);
    p = procs.get(p)?.ppid;
  }
  return null;
}

/** Pids holding any of these files open (Codex keeps its rollout file open while the session runs). */
async function pidsWithFileOpen(files) {
  const existing = (files || []).filter((f) => f && fs.existsSync(f));
  if (!existing.length) return [];
  try {
    return (await run(fs.existsSync('/usr/sbin/lsof') ? '/usr/sbin/lsof' : 'lsof', ['-t', ...existing])).split('\n').map(Number).filter(Boolean);
  } catch {
    return []; // lsof exits 1 when nobody has it open
  }
}

function descendants(pid, procs) {
  const out = [];
  const stack = [pid];
  while (stack.length) {
    const p = stack.pop();
    for (const [c, info] of procs) {
      if (info.ppid !== p) continue;
      out.push(c);
      stack.push(c);
    }
  }
  return out;
}

/**
 * Locates a session: { pane, owners }. kind: 'claude' | 'codex'. owners = live pids that own the session
 * (whether or not they run in tmux). opts.pids: known owner pids; opts.files: files the owner keeps open;
 * opts.cwd: session cwd; opts.tmux: { sockets, enabled }.
 */
export async function locateSession(kind, sessionId, opts = {}) {
  const procs = await processTable();
  const owners = [...(opts.pids || []).filter(isAlive), ...(await pidsWithFileOpen(opts.files))];
  const bin = kind === 'codex' ? /(^|\/)codex(\s|$)/ : /(^|\/)claude(\s|$)/;
  if (sessionId) for (const [pid, info] of procs) if (info.args.includes(sessionId) && bin.test(info.args)) owners.push(pid);
  const unique = [...new Set(owners)].filter((p) => p !== process.pid);
  const panes = await listPanes(opts.tmux);
  for (const pid of unique) {
    const p = paneForPid(pid, panes, procs);
    if (p) return { pane: { ...p, via: `pid ${pid}` }, owners: unique };
  }
  if (kind === 'codex' && opts.cwd && !unique.length) {
    const matches = panes.filter((p) => p.cwd === opts.cwd && descendants(p.panePid, procs).concat(p.panePid).some((d) => bin.test(procs.get(d)?.args || '')));
    if (matches.length === 1) return { pane: { ...matches[0], via: 'cwd' }, owners: unique };
  }
  return { pane: null, owners: unique };
}

export async function findPaneForSession(kind, sessionId, opts = {}) {
  return (await locateSession(kind, sessionId, opts)).pane;
}

/**
 * Shared send() for local sources: tmux pane first; a session that is running but not in tmux can't be
 * reached (throws, so the relay hands the reply back to the phone); otherwise returns false so the
 * bridge's command fallback (`claude -p --resume` / `codex exec resume`) resumes it headless.
 */
export async function deliverLocal(kind, reply, opts = {}) {
  const { pane, owners } = await locateSession(kind, reply.sessionId, opts);
  const since = Date.now();
  if (pane) {
    await sendToPane(pane, reply.text);
    await confirmSubmitted(kind, reply.sessionId, reply.text, since, owners, () => pressReturnInPane(pane));
    return true;
  }
  if (owners.length) {
    // Not in tmux: type it into the Terminal.app / iTerm2 tab that hosts the session.
    for (const pid of owners) {
      if (await sendToTerminalTab(pid, reply.text)) {
        await confirmSubmitted(kind, reply.sessionId, reply.text, since, owners, () => sendToTerminalTab(pid, '', { allowEmpty: true }));
        return true;
      }
    }
    throw new Error(`${kind === 'codex' ? 'Codex' : 'Claude Code'} session (pid ${owners.join(', ')}) is in a terminal I can't type into; answer it there`);
  }
  return false;
}

const TERMINAL_SCRIPT = `on run argv
  set theTTY to item 1 of argv
  set theText to item 2 of argv
  tell application "Terminal"
    repeat with w in windows
      repeat with t in tabs of w
        if tty of t is theTTY then
          do script theText in t
          return "ok"
        end if
      end repeat
    end repeat
  end tell
  return "missing"
end run`;

const ITERM_SCRIPT = `on run argv
  set theTTY to item 1 of argv
  set theText to item 2 of argv
  tell application "iTerm2"
    repeat with w in windows
      repeat with t in tabs of w
        repeat with s in sessions of t
          if tty of s is theTTY then
            tell s to write text theText
            return "ok"
          end if
        end repeat
      end repeat
    end repeat
  end tell
  return "missing"
end run`;

/**
 * Types a reply into the terminal tab whose tty the session's process uses (Terminal.app or iTerm2),
 * followed by Return. Newlines are flattened to spaces: each one would otherwise submit a separate message.
 * The first time, macOS asks to allow the bridge to control Terminal (Automation permission).
 */
export async function sendToTerminalTab(pid, text, { allowEmpty = false } = {}) {
  let tty = '';
  try {
    tty = (await run('/bin/ps', ['-o', 'tty=', '-p', String(pid)])).trim();
  } catch {
    return false;
  }
  if (!tty || tty === '??') return false;
  const procs = await processTable();
  let app = null;
  for (let p = pid, i = 0; p > 1 && i < 30; i++) {
    const args = procs.get(p)?.args || '';
    if (/Terminal\.app\/Contents\/MacOS\/Terminal/.test(args)) { app = 'Terminal'; break; }
    if (/iTerm\.app\/Contents\/MacOS\/iTerm2/.test(args)) { app = 'iTerm2'; break; }
    p = procs.get(p)?.ppid;
  }
  if (!app) return false;
  const flat = String(text).replace(/\s*\n+\s*/g, ' ').trim();
  if (!flat && !allowEmpty) return false; // allowEmpty: `do script ""` = a bare Return (used to resubmit)
  const out = await run('/usr/bin/osascript', ['-e', app === 'Terminal' ? TERMINAL_SCRIPT : ITERM_SCRIPT, `/dev/${tty}`, flat], { timeoutMs: 15_000 });
  return out.trim() === 'ok';
}

/** Types text into a pane and presses Enter. Multi-line text goes in as one bracketed paste so it isn't submitted line by line. */
export async function sendToPane(target, text) {
  const t = (args, o) => run(tmuxPath(), ['-S', target.socket, ...args], o);
  // Leave copy/scroll mode first, otherwise the keys would drive the scrollback instead of the program.
  try {
    if ((await t(['display', '-p', '-t', target.pane, '#{pane_in_mode}'])).trim() === '1') await t(['send-keys', '-t', target.pane, '-X', 'cancel']);
  } catch {
    /* older tmux */
  }
  const body = String(text).replace(/\r\n?/g, '\n').replace(/\n+$/, '');
  if (body.includes('\n')) {
    const buf = `orch-${process.pid}-${Date.now()}`;
    await t(['load-buffer', '-b', buf, '-'], { input: body });
    await t(['paste-buffer', '-p', '-d', '-r', '-b', buf, '-t', target.pane]);
  } else if (body) {
    await t(['send-keys', '-t', target.pane, '-l', '--', body]);
  }
  // Let the TUI finish handling the typed burst before the submit key arrives: Claude Code treats a fast burst
  // as a paste, and an Enter that lands inside it becomes part of the paste instead of submitting.
  await sleep(Math.min(900, 250 + body.length * 2));
  await t(['send-keys', '-t', target.pane, 'Enter']);
}

async function pressReturnInPane(target) {
  await run(tmuxPath(), ['-S', target.socket, 'send-keys', '-t', target.pane, 'Enter']);
}

/* ---------- submit confirmation ----------
 * Typing a reply is not the same as sending it: Terminal.app's `do script` delivers text+Return in one burst,
 * which Claude Code reads as a paste, so the Return can end up inside the input box and the reply just sits
 * there unsent (seen 2026-11-09). For Claude sessions we check the session's transcript for the reply (as a
 * user turn, or as a queued_command when the session was busy) and press Return again only if it is missing.
 * We also stand down as soon as the session reports a status change after the send, so a stray Return can
 * never answer a dialog the new turn opened. */
function transcriptPath(sessionId) {
  const root = path.join(os.homedir(), '.claude', 'projects');
  try {
    for (const d of fs.readdirSync(root)) {
      const f = path.join(root, d, `${sessionId}.jsonl`);
      if (fs.existsSync(f)) return f;
    }
  } catch {}
  return null;
}

function tail(file, bytes = 512 * 1024) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size, len = Math.min(size, bytes), buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    return buf.toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
}

const norm = (x) => String(x).replace(/\s+/g, ' ').trim();

/** True when the transcript holds this reply (user turn or queued command) written after `since`. */
export function replyInTranscript(file, text, since) {
  const probe = norm(text).slice(0, 80);
  if (!probe) return true;
  for (const line of tail(file).split('\n').reverse()) {
    if (!line.includes('"timestamp"')) continue;
    let d;
    try { d = JSON.parse(line); } catch { continue; }
    if (Date.parse(d.timestamp) < since - 5000) break;
    const c = d.type === 'user' ? d.message?.content : d.type === 'attachment' && d.attachment?.type === 'queued_command' ? d.attachment.prompt : null;
    const textOf = typeof c === 'string' ? c : Array.isArray(c) ? c.map((b) => b?.text || '').join(' ') : '';
    if (textOf && norm(textOf).includes(probe)) return true;
  }
  return false;
}

/** Session moved on (Claude Code rewrites ~/.claude/sessions/<pid>.json on every status change). */
function statusChangedSince(pids, since) {
  for (const pid of pids || []) {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'sessions', `${pid}.json`), 'utf8'));
      if ((s.statusUpdatedAt || 0) > since && s.status === 'busy') return true;
    } catch {}
  }
  return false;
}

export async function confirmSubmitted(kind, sessionId, text, since, pids, pressReturn, { waits = [1500, 2500, 4000] } = {}) {
  if (kind !== 'claude' || !sessionId) return 'unchecked';
  if (!transcriptPath(sessionId) && !(pids || []).length) return 'unchecked';
  for (const [i, wait] of waits.entries()) {
    await sleep(wait);
    const file = transcriptPath(sessionId); // a brand-new session only creates its transcript on the first turn
    if ((file && replyInTranscript(file, text, since)) || statusChangedSince(pids, since)) return i ? `resubmitted x${i}` : 'ok';
    if (i < waits.length - 1) await pressReturn();
  }
  // Still running a turn: Claude Code queues a submitted message and only logs it when the turn picks it up.
  for (const pid of pids || []) {
    try {
      if (JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'sessions', `${pid}.json`), 'utf8')).status === 'busy') return 'queued';
    } catch {}
  }
  throw new Error('reply was typed into the session but did not submit; press Return there');
}
