#!/bin/sh
# Builds Approvals.app with the Swift toolchain (no Xcode needed).
#   ./build-app.sh            -> build/Approvals.app
#   ./build-app.sh --install  -> also copies it to /Applications and relaunches it
set -e
cd "$(dirname "$0")"
swift build -c release
APP=build/Approvals.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp .build/release/Approvals "$APP/Contents/MacOS/Approvals"
cp Info.plist "$APP/Contents/Info.plist"
codesign --force --sign - "$APP" >/dev/null 2>&1
echo "built $APP"
if [ "$1" = "--install" ]; then
  pkill -x Approvals 2>/dev/null || true
  ditto "$APP" /Applications/Approvals.app
  open /Applications/Approvals.app
  echo "installed and launched /Applications/Approvals.app"
fi
