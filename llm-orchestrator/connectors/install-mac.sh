#!/bin/zsh
# Install the bridge on this Mac as a launchd agent: starts at login, restarts if it dies.
# Copies the connectors to ~/.local/share/llm-orchestrator so the agent never runs from a checkout or temp dir.
# Config: ~/.config/llm-orchestrator/config.json. Log: ~/.config/llm-orchestrator/bridge.log.
set -euo pipefail
SRC=$(cd "$(dirname "$0")" && pwd)
DEST=$HOME/.local/share/llm-orchestrator
LABEL=com.aidantorrence.orch-bridge
PLIST=$HOME/Library/LaunchAgents/$LABEL.plist
NODE=${NODE:-$(command -v node)}
mkdir -p "$DEST" "$HOME/.config/llm-orchestrator"
rsync -a --delete-after --exclude node_modules "$SRC/" "$DEST/connectors/"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$DEST/connectors/bridge.mjs</string></array>
  <key>WorkingDirectory</key><string>$DEST</string>
  <key>EnvironmentVariables</key><dict>
    <key>PATH</key><string>$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>HOME</key><string>$HOME</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>ProcessType</key><string>Interactive</string>
  <key>StandardOutPath</key><string>$HOME/.config/llm-orchestrator/bridge.log</string>
  <key>StandardErrorPath</key><string>$HOME/.config/llm-orchestrator/bridge.log</string>
</dict></plist>
PL
launchctl bootout gui/$(id -u)/$LABEL 2>/dev/null || true
# bootout returns before the job is gone; bootstrapping too soon fails with "Input/output error".
for i in {1..10}; do launchctl print gui/$(id -u)/$LABEL >/dev/null 2>&1 || break; sleep 1; done
launchctl bootstrap gui/$(id -u) "$PLIST" || { sleep 3; launchctl bootstrap gui/$(id -u) "$PLIST"; }
sleep 3
launchctl print gui/$(id -u)/$LABEL | grep -E "state =|pid =" | head -2
