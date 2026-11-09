#!/bin/bash
# Orchestrator for macOS: a floating panel on the middle of the left screen edge (280 pt wide, middle
# third of the screen height), always on top and on every Space. Reads the same relay as the phone,
# configured by ~/.config/llm-orchestrator/config.json (relayUrl, token).
#   ./build.sh            build → dist/stage/Orchestrator.app
#   ./build.sh --install  + archive the old /Applications copy, install, launch, check it stays up
# Nothing is deleted: previous bundles go to dist/archive/.
set -euo pipefail
cd "$(dirname "$0")"
APP_NAME="Orchestrator.app"; BIN="OrchestratorMac"; BUNDLE_ID="com.aidantorrence.orchestrator.mac"
SIGN_ID="Apple Development: Aidan Torrence (4FV7VDRJ8S)"
VERSION="1.0.0"; BUILD="$(date +%Y%m%d%H%M)"; TS="$(date +%Y%m%d-%H%M%S)"
STAGE="dist/stage"; ARCHIVE="dist/archive"; APP="$STAGE/$APP_NAME"; INSTALLED="/Applications/$APP_NAME"

if ! swift build -c release > /tmp/orch-mac-build.log 2>&1; then grep -E "error" /tmp/orch-mac-build.log | head -5; echo "build failed"; exit 1; fi
BIN_PATH="$(swift build -c release --show-bin-path)/$BIN"
[[ -x "$BIN_PATH" ]] || { echo "build failed"; exit 1; }

mkdir -p "$STAGE" "$ARCHIVE"
[[ -d "$APP" ]] && mv "$APP" "$ARCHIVE/stage-$TS.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$BIN_PATH" "$APP/Contents/MacOS/$BIN"
sed -e "s/__VERSION__/$VERSION/g" -e "s/__BUILD__/$BUILD/g" Resources/Info.plist > "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"

# The app needs no privacy permissions, so ad-hoc signing is acceptable when the developer
# certificate isn't in the keychain (it would only matter for TCC grants).
if security find-identity -v -p codesigning 2>/dev/null | grep -Fq "\"$SIGN_ID\""; then
  codesign --force --deep --sign "$SIGN_ID" --identifier "$BUNDLE_ID" "$APP"
else
  echo "note: $SIGN_ID not in keychain, signing ad-hoc"
  codesign --force --deep --sign - --identifier "$BUNDLE_ID" "$APP"
fi
codesign --verify --deep --strict "$APP"
echo "built $APP ($BUILD)"

[[ "${1:-}" == "--install" ]] || exit 0
pkill -x "$BIN" 2>/dev/null || true; sleep 1
[[ -d "$INSTALLED" ]] && mv "$INSTALLED" "$ARCHIVE/installed-$TS.app"
cp -R "$APP" "$INSTALLED"
open "$INSTALLED"
sleep 5
if pgrep -x "$BIN" >/dev/null; then
  echo "installed and running: $INSTALLED"
else
  echo "app exited on launch; restoring the previous copy"
  PREV=$(ls -dt "$ARCHIVE"/installed-*.app 2>/dev/null | head -1)
  mv "$INSTALLED" "$ARCHIVE/failed-$TS.app"
  [[ -n "$PREV" ]] && cp -R "$PREV" "$INSTALLED" && open "$INSTALLED"
  exit 1
fi
