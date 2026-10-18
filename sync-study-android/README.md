# Sync Study (Android)

A study-focused sibling of Sync Reader. Same narrated speed reading with the word kept in sync with the voice,
rebuilt around the learning techniques with the strongest evidence behind them, and animated explainer films
for every paragraph. Installs next to Sync Reader (`com.aidantorrence.syncstudy`) with its own progress.

## How a book is studied

1. **Guess first (pretest).** Three questions before you read. No score. Trying to answer primes memory for the
   real answer, even when the guess is wrong.
2. **Listen and check.** The narrated summary plays with an animated explainer above the speed-reading word.
   At the end of every paragraph the narration pauses for a checkpoint question, answered from memory, with a
   confidence rating before the reveal. Wrong answers can replay that paragraph. The paragraph's finished scene
   stays on screen while you answer.
3. **Brain dump.** Write (or dictate) everything you remember, then tick off the key ideas you got.
4. **Spaced review.** Every card is scheduled with an SM-2 style algorithm, mixed with other books, and missed
   cards come back in the same session until you get them.

| Technique | Where |
|---|---|
| Pretesting | Guess-first questions |
| Retrieval practice | Checkpoints, review cards, brain dump |
| Spaced repetition | Review queue (10 min, 1 day, 3 days, then growing) |
| Interleaving | Review sessions mix books |
| Elaborative interrogation / self-explanation | "Explain" cards with model answers |
| Confidence + hypercorrection | Confidence rating; confident errors are flagged |
| Successive relearning | Missed cards re-queued within a session |
| Dual coding | Animated scenes, and a scene still on every card |

## Animated explainers

`Stage.kt` is a small timeline engine: a scene has a backdrop, a cast of illustrated props and a list of beats.
Each beat is pinned to a phrase in the paragraph and tweens actor properties (position, scale, rotation, opacity,
and prop-specific values like a character's mood or an ice cube's melt), with camera pans and zooms. Everything is
a pure function of time since each beat started, so it stays in sync at any speed and renders the same in tests.

- `Art.kt`: palette, shading, shadows, text, backdrops
- `Props.kt`: shared illustrated props (characters, charts, calendar, phone, icons, particles…)
- `Props<Book>.kt`, `Stage<Book>.kt`: book-specific props and scenes
- `Study<Book>.kt`: questions, explain cards, fill-in-the-blanks, key ideas

## Build and test

```
cd sync-study-android
./gradlew assembleDebug
./gradlew testDebugUnitTest
```

The unit tests check that every animation step's phrase exists, in order, in its paragraph, that every
paragraph has a checkpoint, and test the scheduler. They also render every scene to `app/build/stage`
(stills and one frame per step) and the main screens to `app/build/screens`, using Robolectric, no device
needed. `-Pstage.books=atomic-habits -Pstage.frames=true` renders 12 fps frame sequences for previews.
