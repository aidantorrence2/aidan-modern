#!/bin/bash
# Build, install and arm Approvals on the connected Android phone (or an emulator). No setup on the
# phone: the GitHub token comes from the Mac's `gh auth token` and is piped over adb into the app's
# private storage (never printed, never in argv); the app encrypts it with the Android Keystore.
#
# Usage: ./install-phone.sh [--no-build]        DEVICE=<serial> to pick a device
set -euo pipefail
cd "$(dirname "$0")"
# Two adb builds live on this Mac (Homebrew vs SDK) and kill each other's server; use the SDK one.
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
PKG=com.aidantorrence.approvals
APK=app/build/outputs/apk/debug/app-debug.apk

BUILD=1; [[ "${1:-}" == "--no-build" ]] && BUILD=0
if [[ -z "${DEVICE:-}" ]]; then
  DEVICE=$(adb devices | awk 'NR>1 && $2=="device"{print $1}' | grep -v '^emulator-' | head -1 || true)
  [[ -z "$DEVICE" ]] && DEVICE=$(adb devices | awk 'NR>1 && $2=="device"{print $1}' | head -1 || true)
fi
[[ -z "$DEVICE" ]] && { echo "No device: plug the phone in by USB (USB debugging on) and run again." >&2; exit 1; }
export ANDROID_SERIAL="$DEVICE"
MIUI=$(adb shell getprop ro.miui.ui.version.name | tr -d '\r')
echo "==> Device $DEVICE ($(adb shell getprop ro.product.model | tr -d '\r'), MIUI: ${MIUI:-no})"

if [[ $BUILD == 1 ]]; then echo "==> Building"; ./gradlew --quiet --no-configuration-cache assembleDebug; fi

echo "==> Installing"
adb push "$APK" /data/local/tmp/approvals-install.apk >/dev/null
# HyperOS refuses plain `adb install` unless "Install via USB" is on; attributing to the Play Store sidesteps it.
adb shell pm install -r -i com.android.vending /data/local/tmp/approvals-install.apk \
  || adb shell pm install -r /data/local/tmp/approvals-install.apk
adb shell rm -f /data/local/tmp/approvals-install.apk

echo "==> Grants"
op()     { adb shell appops set "$PKG" "$1" "$2" >/dev/null 2>&1 || true; }
uid_op() { adb shell appops set --uid "$PKG" "$1" "$2" >/dev/null 2>&1 || true; }
adb shell pm grant "$PKG" android.permission.POST_NOTIFICATIONS || true
op RUN_IN_BACKGROUND allow; op RUN_ANY_IN_BACKGROUND allow; op START_FOREGROUND allow; op WAKE_LOCK allow
op AUTO_REVOKE_PERMISSIONS_IF_UNUSED ignore
adb shell cmd deviceidle whitelist +"$PKG" >/dev/null 2>&1 || true
if [[ -n "$MIUI" ]]; then
  # HyperOS private ops: 10008 autostart, 10017/10020 background running/service.
  for o in 10008 10017 10020; do op "$o" allow; done
  cur=$(adb shell settings get system MILLET_NO_RESTRICT_APP | tr -d '\r[:space:]')
  if [[ ",$cur," != *",$PKG,"* ]]; then
    if [[ -z "$cur" || "$cur" == "null" ]]; then nxt="$PKG"; else nxt="$cur,$PKG"; fi
    adb shell "settings put system MILLET_NO_RESTRICT_APP '$nxt'"
  fi
fi
adb shell cmd appops write-settings >/dev/null 2>&1 || true

echo "==> Token (from gh on this Mac; not printed)"
TOKEN_SRC=$(command -v gh || echo /opt/homebrew/bin/gh)
"$TOKEN_SRC" auth token | adb shell "run-as $PKG sh -c 'mkdir -p files && cat > files/token'"

echo "==> Starting"
adb shell am start -n "$PKG/.MainActivity" >/dev/null
sleep 6
adb shell dumpsys activity services "$PKG" | grep -q "ApprovalService" && echo "    service running" || echo "    WARNING: service not running" >&2
echo "==> Grant state"
adb shell "dumpsys package $PKG | grep -m1 'POST_NOTIFICATIONS: granted'" | sed 's/^/    /'
[[ -n "$MIUI" ]] && adb shell "appops get $PKG 10008" | sed 's/^/    /'
if [[ -n "$MIUI" ]]; then cat <<'NOTE'
==> NOTE (HyperOS): MIUI may revert adb-set Autostart later. If notifications stop arriving after
    a reboot, re-run this script with --no-build (see README, "Phone quirks").
NOTE
fi
echo "==> Done"
