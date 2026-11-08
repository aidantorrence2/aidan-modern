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
  if (pane) {
    await sendToPane(pane, reply.text);
    return true;
  }
  if (owners.length) {
    throw new Error(`${kind === 'codex' ? 'Codex' : 'Claude Code'} session is open outside tmux (pid ${owners.join(', ')}); answer it in that terminal`);
  }
  return false;
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
  await sleep(150); // let the TUI finish handling the paste before the submit key arrives
  await t(['send-keys', '-t', target.pane, 'Enter']);
}
