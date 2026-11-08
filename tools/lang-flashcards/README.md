# Ouvido — Portuguese flashcards (Android)

Frequency flashcards: the 2,000 most common words + most common phrases, in levels
(Top 100 → 101–250 → 251–450 → 451–700 → 701–1000 → 1001–1400 → 1401–2000).
Brazilian Portuguese.

- **Study** — see the word, recall the meaning, tap to flip (it speaks the word), rate Again / Hard / Good / Easy.
  Anki-style spaced repetition (SM-2 variant). 20 new cards per session plus whatever's due.
- **Audio** — hands-free. Says the word, waits for you to answer out loud (nothing is recorded), says the English,
  moves on. Keeps playing with the screen off. Unrated cards count as Good;
  tap the card to peek or tap a rating any time — it never pauses.
- Tap a level to study just that level.

Install: `dist/flashcards.apk` (allow "install unknown apps"). Audio uses the phone's text-to-speech;
if a voice is missing: Settings › Text-to-speech › Google › Install voice data.

Build: `./build.sh` (JDK + Android SDK platform 34 / build-tools 34.0.0, no Gradle).
Deck: `app/src/main/assets/pt.json`. `release.keystore` (not committed) signs the APK; a build with a new key must be uninstalled before installing.
