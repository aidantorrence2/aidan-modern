#!/bin/bash
# Optional USB install of Todos (the floating to-do bubble). Sideloading the APK needs none of this;
# this script adds two things: it grants the overlay/background permissions for you, and it gives
# the app a GitHub token (`gh auth token`, piped over adb, never printed) so done cards sync back.
#
# Usage: ./install-phone.sh [path/to/Todos.apk]     (default ~/Downloads/Todos.apk)
#        DEVICE=<serial> to pick a device
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
PKG=com.aidantorrence.todos
APK="${1:-$HOME/Downloads/Todos.apk}"
[[ -f "$APK" ]] || { echo "No APK at $APK: pass the path to Todos.apk." >&2; exit 1; }
if [[ -z "${DEVICE:-}" ]]; then
  DEVICE=$(adb devices | awk 'NR>1 && $2=="device"{print $1}' | grep -v '^emulator-' | head -1 || true)
  [[ -z "$DEVICE" ]] && DEVICE=$(adb devices | awk 'NR>1 && $2=="device"{print $1}' | head -1 || true)
fi
[[ -z "$DEVICE" ]] && { echo "No device: plug the phone in by USB (USB debugging on) and run again." >&2; exit 1; }
export ANDROID_SERIAL="$DEVICE"
MIUI=$(adb shell getprop ro.miui.ui.version.name | tr -d '\r')
echo "==> Device $DEVICE ($(adb shell getprop ro.product.model | tr -d '\r'), MIUI: ${MIUI:-no})"

echo "==> Installing"
adb push "$APK" /data/local/tmp/todos-install.apk >/dev/null
# HyperOS refuses plain `adb install` unless "Install via USB" is on; attributing to the Play Store sidesteps it.
adb shell pm install -r -i com.android.vending /data/local/tmp/todos-install.apk \
  || adb shell pm install -r /data/local/tmp/todos-install.apk
adb shell rm -f /data/local/tmp/todos-install.apk

echo "==> Grants"
op() { adb shell appops set "$PKG" "$1" "$2" >/dev/null 2>&1 || true; }
op SYSTEM_ALERT_WINDOW allow                     # "Display over other apps": the floating bubble
adb shell pm grant "$PKG" android.permission.POST_NOTIFICATIONS || true
op RUN_IN_BACKGROUND allow; op RUN_ANY_IN_BACKGROUND allow; op START_FOREGROUND allow
op AUTO_REVOKE_PERMISSIONS_IF_UNUSED ignore
adb shell cmd deviceidle whitelist +"$PKG" >/dev/null 2>&1 || true
if [[ -n "$MIUI" ]]; then
  # HyperOS private ops: 10008 autostart, 10017/10020 background running/service,
  # 10021 "display pop-up windows while running in the background" (needed for the bubble).
  for o in 10008 10017 10020 10021; do op "$o" allow; done
  cur=$(adb shell settings get system MILLET_NO_RESTRICT_APP | tr -d '\r[:space:]')
  if [[ ",$cur," != *",$PKG,"* ]]; then
    if [[ -z "$cur" || "$cur" == "null" ]]; then nxt="$PKG"; else nxt="$cur,$PKG"; fi
    adb shell "settings put system MILLET_NO_RESTRICT_APP '$nxt'"
  fi
fi
adb shell cmd appops write-settings >/dev/null 2>&1 || true

echo "==> GitHub token (not printed)"
TOKEN_SRC=$(command -v gh || echo /opt/homebrew/bin/gh)
"$TOKEN_SRC" auth token | adb shell "run-as $PKG sh -c 'mkdir -p files && cat > files/token'"

echo "==> Starting"
adb shell am start -n "$PKG/.MainActivity" >/dev/null
sleep 5
adb shell dumpsys activity services "$PKG" | grep -q "BubbleService" && echo "    bubble running" || echo "    WARNING: bubble service not running (open the app and tap Allow)" >&2
adb shell "appops get $PKG SYSTEM_ALERT_WINDOW" | sed 's/^/    /'
echo "==> Done. Go to the home screen: the bubble floats on the right edge."
