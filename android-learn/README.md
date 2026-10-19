# Learn — Android app

Offline Android wrapper for the `/learn` spaced-repetition app (`app/learn/`, `lib/learn/`).
The web app is bundled into the APK, so it runs with no network. Progress lives in the app's
WebView storage — use Settings → Export progress to back it up.

Native bits (`MainActivity.java`): Android text-to-speech for audio (WebView has no
speechSynthesis), a save dialog for exports, a file picker for imports, and back-button handling.

## Build

Requires JDK 17+ and the Android SDK (platform 35).

```sh
node android-learn/build-web.mjs          # bundle the web app into app/src/main/assets
cd android-learn
echo "sdk.dir=/path/to/android-sdk" > local.properties
./gradlew assembleRelease                 # → app/build/outputs/apk/release/app-release.apk
```

Release signing reads `keystore.properties` (not committed):

```
storeFile=learn-release.jks
storePassword=…
keyAlias=learn
keyPassword=…
```

Without it the APK is debug-signed. Updates must be signed with the same key as the installed
app, otherwise Android requires an uninstall (which erases progress). Bump `versionCode` in
`app/build.gradle.kts` for each release.
