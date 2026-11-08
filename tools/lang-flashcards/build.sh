#!/usr/bin/env bash
# Builds dist/flashcards.apk with the plain Android SDK tools (no Gradle).
# Needs: JDK, $ANDROID_HOME with platforms;android-34 and build-tools;34.0.0
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:-/opt/android-sdk}"
BT="$SDK/build-tools/34.0.0"
JAR="$SDK/platforms/android-34/android.jar"
SRC=app/src/main
OUT=build
rm -rf "$OUT" && mkdir -p "$OUT/classes" "$OUT/dex" dist

"$BT/aapt2" compile --dir "$SRC/res" -o "$OUT/res.zip"
"$BT/aapt2" link -I "$JAR" --manifest "$SRC/AndroidManifest.xml" -A "$SRC/assets" \
  -o "$OUT/unsigned.apk" "$OUT/res.zip" --java "$OUT/gen" --auto-add-overlay
javac --release 8 -Xlint:-options -classpath "$JAR" -encoding UTF-8 \
  -d "$OUT/classes" $(find "$SRC/java" "$OUT/gen" -name '*.java')
(cd "$OUT/classes" && jar cf ../classes.jar .)
"$BT/d8" --release --min-api 26 --lib "$JAR" --output "$OUT/dex" "$OUT/classes.jar"
cp "$OUT/unsigned.apk" "$OUT/app.apk"
(cd "$OUT/dex" && zip -q -j ../app.apk classes.dex)
"$BT/zipalign" -f -p 4 "$OUT/app.apk" "$OUT/aligned.apk"
[ -f release.keystore ] || keytool -genkeypair -keystore release.keystore -storepass flashcards -keypass flashcards \
  -alias flashcards -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Flashcards"
"$BT/apksigner" sign --ks release.keystore --ks-pass pass:flashcards --key-pass pass:flashcards \
  --out dist/flashcards.apk "$OUT/aligned.apk"
"$BT/apksigner" verify dist/flashcards.apk && ls -la dist/flashcards.apk
