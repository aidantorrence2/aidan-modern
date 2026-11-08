#!/bin/zsh
# Install or update the app on a Xiaomi/HyperOS phone over USB and leave the overlay running.
#
# Why not `adb install`: HyperOS shows its USB-install confirmation inside the Security app, and an
# app blocker that locks the Security app cancels every adb install (INSTALL_FAILED_USER_RESTRICTED).
# Opening the APK in the normal package installer avoids the Security app entirely.
# HyperOS also resets "Display over other apps" and Autostart on every update, so they are re-granted here.
#
# Usage: ./install-hyperos.sh [path/to/app.apk]
#   ORCH_DEVICE_PIN=1234  optional: answers the PIN prompt Play Protect shows for "Install anyway"
#   ADB=/path/to/adb      defaults to the Android SDK adb (never mix with Homebrew adb)
set -euo pipefail
APK=${1:-$(dirname $0)/app/build/outputs/apk/debug/app-debug.apk}
ADB=${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}
PKG=com.aidantorrence.orchestrator
NAME=orch-$(date +%s).apk

ui() { $ADB shell uiautomator dump /data/local/tmp/orch-ui.xml >/dev/null 2>&1; $ADB shell cat /data/local/tmp/orch-ui.xml; }
# Tap the centre of the first node whose text matches $1. Returns 1 if none.
tap_text() {
  local b=$(ui | grep -o "text=\"$1\"[^>]*bounds=\"[^\"]*\"" | head -1 | sed -E 's/.*bounds="\[([0-9]+),([0-9]+)\]\[([0-9]+),([0-9]+)\]".*/\1 \2 \3 \4/')
  [[ -z "$b" ]] && return 1
  local x1 y1 x2 y2; read x1 y1 x2 y2 <<< "$b"
  $ADB shell input tap $(( (x1 + x2) / 2 )) $(( (y1 + y2) / 2 ))
}
# Play Protect's "Install anyway" link sits at the end of a longer text node: tap that node's last line.
tap_install_anyway() {
  local b=$(ui | grep -o 'text="[^"]*Install anyway"[^>]*bounds="[^"]*"' | head -1 | sed -E 's/.*bounds="\[([0-9]+),([0-9]+)\]\[([0-9]+),([0-9]+)\]".*/\1 \2 \3 \4/')
  [[ -z "$b" ]] && return 1
  local x1 y1 x2 y2; read x1 y1 x2 y2 <<< "$b"
  $ADB shell input tap $(( x1 + 120 )) $(( y2 - 30 ))
}
installed_at() { $ADB shell dumpsys package $PKG 2>/dev/null | grep -m1 lastUpdateTime || true; }

before=$(installed_at)
$ADB push "$APK" /sdcard/Download/$NAME >/dev/null
$ADB shell content call --uri content://media --method scan_file --arg /sdcard/Download/$NAME >/dev/null
sleep 1
ID=$($ADB shell content query --uri content://media/external/file --projection _id --where "_display_name=\'$NAME\'" | sed -n 's/.*_id=\([0-9]*\).*/\1/p' | tail -1)
[[ -z "$ID" ]] && { echo "MediaStore did not index $NAME"; exit 1; }
$ADB shell appops set com.android.shell REQUEST_INSTALL_PACKAGES allow
$ADB shell am start -a android.intent.action.VIEW -d content://media/external/file/$ID \
  -t application/vnd.android.package-archive --grant-read-uri-permission \
  -n com.google.android.packageinstaller/com.android.packageinstaller.InstallStart >/dev/null

for i in {1..40}; do
  sleep 1.5
  [[ "$(installed_at)" != "$before" && -n "$(installed_at)" ]] && { echo "installed"; break; }
  tap_text "Install" || tap_text "Update" || tap_text "Don’t send" || tap_text "Don't send" \
    || tap_text "More details" || tap_text "Install anyway" || tap_install_anyway || tap_text "Install without scanning" || {
      if [[ -n "${ORCH_DEVICE_PIN:-}" ]] && tap_text "Use PIN"; then
        sleep 1.5; $ADB shell input text "$ORCH_DEVICE_PIN"; $ADB shell input keyevent 66
      fi
    } || true
done
[[ "$(installed_at)" == "$before" ]] && { echo "install did not complete (check the phone screen)"; exit 1; }

# HyperOS re-applies its stored denies on update: grant again.
$ADB shell appops set $PKG SYSTEM_ALERT_WINDOW allow
$ADB shell appops set $PKG 10008 allow   # MIUI Autostart: boot / update restarts and the notification listener
$ADB shell appops set $PKG 10021 allow   # MIUI "open new windows while running in the background"
$ADB shell pm grant $PKG android.permission.POST_NOTIFICATIONS 2>/dev/null || true
$ADB shell cmd notification allow_listener $PKG/$PKG.LlmNotificationListener
# Auto-send (accessibility) for replies that go through the ChatGPT / Claude apps. HyperOS blocks
# accessibility for sideloaded apps until "restricted settings" are allowed. Append, never replace:
# other apps' services (blockers) live in the same list.
$ADB shell appops set $PKG ACCESS_RESTRICTED_SETTINGS allow
SVC=$PKG/$PKG.AutoSendService
CUR=$($ADB shell settings get secure enabled_accessibility_services | tr -d '\r')
if [[ "$CUR" != *"$SVC"* ]]; then
  if [[ -z "$CUR" || "$CUR" == "null" ]]; then NEW=$SVC; else NEW="$CUR:$SVC"; fi
  $ADB shell settings put secure enabled_accessibility_services "$NEW"
fi
$ADB shell settings put secure accessibility_enabled 1
$ADB shell mv /sdcard/Download/$NAME /sdcard/Download/.$NAME.installed 2>/dev/null || true

# Opening the app restarts the overlay (bubble or panel); then return to whatever was on screen.
$ADB shell input keyevent KEYCODE_HOME
$ADB shell am start -n $PKG/.MainActivity >/dev/null
sleep 2
$ADB shell input keyevent KEYCODE_BACK
n=$($ADB shell dumpsys window windows | grep -c "u0 $PKG}" || true)
echo "overlay windows: $n"
[[ "$n" -ge 1 ]] || { echo "overlay is not showing"; exit 1; }
