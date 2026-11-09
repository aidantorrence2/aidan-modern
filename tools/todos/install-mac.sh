#!/bin/bash
# Installs the daily to-do builder on this Mac: a LaunchAgent that runs build-todos.mjs at 07:00 and
# 13:00 (and at login if a run was missed), then runs it once now.
#   ./install-mac.sh            install + run now
#   ./install-mac.sh --uninstall
set -euo pipefail
cd "$(dirname "$0")"
LABEL=com.aidantorrence.todos
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DIR="$HOME/.config/aidan-todos"
mkdir -p "$DIR" && chmod 700 "$DIR"

if [[ "${1:-}" == "--uninstall" ]]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"; echo "Removed $LABEL"; exit 0
fi

NODE=$(command -v node || echo /opt/homebrew/bin/node)
cp build-todos.mjs "$DIR/build-todos.mjs"
# launchd starts with a bare PATH; give it the places node, gh and claude live.
RUN_PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$DIR/build-todos.mjs</string></array>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>$RUN_PATH</string></dict>
  <key>StartCalendarInterval</key><array>
    <dict><key>Hour</key><integer>7</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>13</integer><key>Minute</key><integer>0</integer></dict>
  </array>
  <key>StandardOutPath</key><string>$DIR/build.log</string>
  <key>StandardErrorPath</key><string>$DIR/build.log</string>
</dict></plist>
PL
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "==> Installed $LABEL (07:00 and 13:00; log: $DIR/build.log)"
echo "==> Building today's list now"
"$NODE" "$DIR/build-todos.mjs"
