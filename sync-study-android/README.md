# Sync Study (Android)

A study-focused sibling of Sync Reader. Same narrated speed reading with the word kept in sync with the voice,
built around full summaries, flashcards and the learning techniques with the strongest evidence behind them, with an
animated explainer film for every section. Installs next to Sync Reader (`com.aidantorrence.syncstudy`) with its own
progress.

## The summaries

Each of the 10 books is a full, original summary of roughly 3,600–4,500 words (about 22–27 minutes at 1x). It goes
chapter by chapter through every major idea, the reasoning and evidence behind it, the book's key examples, and how
to use it. Each summary is split into 6–10 titled sections (`## Title` lines in `Library.kt`). Titles are shown in the
text view and announced in Drive mode, but never read as part of the text.

## How a book is studied

1. **Listen and check.** The narrated summary plays with an animated explainer above the speed-reading word. At the
   end of each section, the narration pauses for that section's two key flashcards. Answer from memory, flip, and
   say how well you knew it. If you missed one, you can replay the section.
2. **Brain dump.** Write (or dictate) everything you remember, then tick off the key ideas you got.
3. **Spaced review.** Every flashcard (4–6 per section, around 30–45 per book) is scheduled with an SM-2 style
   algorithm and mixed with your other books. Missed cards come back in the same session until you know them.

Flashcards ask about the important ideas: what a principle means, why it works, how to apply it, and the evidence
behind it. The back is a one-to-three sentence synthesis. There are no trivia, fill-in-the-blank or multiple-choice
questions.

| Technique | Where |
|---|---|
| Retrieval practice | Flashcards after each section, review queue, brain dump |
| Spaced repetition | Review queue (10 min, 1 day, 3 days, then growing) |
| Interleaving | Review sessions mix books |
| Successive relearning | Missed cards re-queued within a session |
| Dual coding | Animated scenes, and the section's scene on every card |

## Drive mode (hands-free)

The Drive tab runs a study session you can do in the car, on a walk or at the gym, with the screen off.
Pick a book, a length (10–45 min) and a speed (1x to 3x) before you set off. It never uses the microphone.

- **Session shape:** two warm-up reviews, then the book narrated section by section (no pre-read questions). Each
  section starts with its title and ends with a one-line spoken takeaway. Each section's two key flashcards are asked
  one section later (a short lag makes recall effortful), due reviews from other books are mixed in, a 30-second
  brain dump followed by the key ideas closes a finished book, and spare time carries on into your next unfinished
  book.
- **Ask, pause, answer:** each flashcard's question is read, then 10 seconds of silence to answer in your head, then
  the back of the card.
- **One speed for everything:** the book, questions and answers are all read at the chosen speed.
- **Buttons (steering wheel / headset / screen):** play-pause pauses. Next skips, or during the pause reveals the
  answer now. Back repeats. While the answer is read, next = "I knew it" and back = "I didn't", which schedules
  the card in the same spaced-repetition queue as the rest of the app. No press, nothing recorded.
- **Car-friendly audio:** a foreground media service keeps playing with the screen off, shows lock-screen and
  notification controls, pauses music and podcasts while it plays, pauses for navigation prompts and calls,
  and reads everything in one voice (the best one installed), with a chime before each question.

Code: `DriveModel.kt` (planning, questions, answer scoring), `DriveEngine.kt` (session engine),
`DriveAndroid.kt` (voices, chimes, audio focus), `DriveService.kt` (foreground media service),
`DriveScreen.kt` (setup and live screens), `DriveLines.kt` (spoken takeaways).

![Drive mode](docs/drive.png)

## Animated explainers

`Stage.kt` is a small timeline engine: a scene has a backdrop, a cast of illustrated props and a list of beats.
Each beat is pinned to a phrase in the section and tweens actor properties (position, scale, rotation, opacity,
and prop-specific values like a character's mood or an ice cube's melt), with camera pans and zooms. Everything is
a pure function of time since each beat started, so it stays in sync at any speed and renders the same in tests.

- `Art.kt`: palette, shading, shadows, text, backdrops
- `Props.kt`: shared illustrated props (characters, charts, calendar, phone, icons, particles…)
- `Props<Book>.kt`, `Stage<Book>.kt`: book-specific props and scenes
- `Study<Book>.kt`: questions, explain cards, fill-in-the-blanks, key ideas

![Scenes](docs/scenes.png)
![Screens](docs/screens.png)

Animated previews (one scene each, 1x narration timing): `docs/previews/*.mp4`.

## Build and test

```
cd sync-study-android
./gradlew assembleDebug
./gradlew testDebugUnitTest
```

The unit tests check that every summary is full length, that every animation step's phrase exists, in order, in its
section, that every section has 4–6 flashcards whose fronts are questions, and test the scheduler. They also render every scene to `app/build/stage`
(stills and one frame per step) and the main screens to `app/build/screens`, using Robolectric, no device
needed. `-Pstage.books=atomic-habits -Pstage.frames=true` renders 12 fps frame sequences for previews.
