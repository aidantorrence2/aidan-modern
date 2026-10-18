package com.aidantorrence.syncstudy

import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Plays a drive session. Each segment runs as its own child job so the listener's buttons can cut in at any time:
 * NEXT skips the segment, PREVIOUS replays it, pause stops it and resumes it later (narration resumes at the
 * sentence it reached). While the engine is waiting for a "did you know it?" press, NEXT/PREVIOUS answer that
 * instead.
 */
class DriveEngine(
    private val io: DriveIO,
    private val memory: DriveMemory,
    private val settings: DriveSettings,
    private val timings: DriveTimings = DriveTimings(),
) {
    private val _state = MutableStateFlow(
        DriveState(title = findBook(settings.bookId)?.title ?: "", speed = settings.speed, voiceAnswers = settings.voiceAnswers)
    )
    val state: StateFlow<DriveState> = _state.asStateFlow()

    private enum class After { NEXT, REPEAT, STAY }
    @Volatile private var after = After.NEXT
    @Volatile private var segmentJob: Job? = null
    private val paused = MutableStateFlow(false)
    private val buttons = Channel<Button>(Channel.CONFLATED)
    @Volatile private var awaitingButton = false
    private val narrated = HashMap<Int, Int>()
    private val docs = HashMap<String, Document>()
    private var voiceOk = settings.voiceAnswers
    private var speed = settings.speed

    val isPaused: Boolean get() = paused.value

    suspend fun run(plan: List<Segment>) = coroutineScope {
        _state.update { it.copy(running = true, segments = plan.size) }
        io.setNarrationSpeed(speed)
        var i = 0
        try {
            while (i < plan.size) {
                if (paused.value) {
                    _state.update { it.copy(phase = DrivePhase.PAUSED) }
                    paused.first { !it }
                }
                after = After.NEXT
                _state.update { it.copy(segment = i, heard = "", phase = DrivePhase.SPEAKING) }
                val job = launch { runSegment(i, plan[i]) }
                segmentJob = job
                job.join()
                segmentJob = null
                when (after) {
                    After.NEXT -> i++
                    After.REPEAT -> narrated.remove(i)
                    After.STAY -> Unit
                }
            }
        } finally {
            _state.update { it.copy(running = false, phase = DrivePhase.DONE, line = "Session complete") }
        }
    }

    // ---- controls ----------------------------------------------------------------------------------

    fun press(b: Button) {
        if (awaitingButton) { buttons.trySend(b); return }
        if (paused.value) return
        interrupt(if (b == Button.NEXT) After.NEXT else After.REPEAT)
    }

    fun pause() {
        if (paused.value) return
        paused.value = true
        _state.update { it.copy(phase = DrivePhase.PAUSED) }
        interrupt(After.STAY)
    }

    fun resume() { paused.value = false }

    fun togglePause() = if (paused.value) resume() else pause()

    private fun interrupt(a: After) {
        after = a
        segmentJob?.cancel()
    }

    // ---- segments ----------------------------------------------------------------------------------

    private suspend fun runSegment(i: Int, seg: Segment) {
        when (seg) {
            is Segment.Line -> speak(seg.text)
            is Segment.Pretest -> pretest(seg.card)
            is Segment.Learn -> learn(i, seg)
            is Segment.Ask -> ask(seg.card, seg.label)
            is Segment.Recall -> recall(seg.bookId)
            Segment.Outro -> outro()
        }
    }

    private suspend fun speak(text: String, phase: DrivePhase = DrivePhase.SPEAKING, label: String? = null) {
        _state.update { it.copy(phase = phase, line = text, label = label ?: it.label) }
        io.say(text, VoiceRole.COACH)
    }

    private fun doc(bookId: String) = docs.getOrPut(bookId) { Document(findBook(bookId)!!.summary) }

    private suspend fun learn(i: Int, seg: Segment.Learn) {
        val doc = doc(seg.bookId)
        if (seg.paragraph == 0 && narrated[i] == null) memory.startBook(seg.bookId)
        val r = doc.paragraphs[seg.paragraph]
        val parts = sentences(doc.text.substring(doc.words[r.first].start, doc.words[r.last].end))
        _state.update { it.copy(title = findBook(seg.bookId)?.title ?: "", label = "Part ${seg.paragraph + 1} of ${doc.paragraphs.size}") }
        for (k in (narrated[i] ?: 0) until parts.size) {
            _state.update { it.copy(phase = DrivePhase.NARRATING, line = parts[k]) }
            io.say(parts[k], VoiceRole.NARRATOR)
            narrated[i] = k + 1
        }
        recapFor(seg.bookId, seg.paragraph)?.let { speak(it, label = "In short") }
        memory.setParagraph(seg.bookId, seg.paragraph + 1)
    }

    private suspend fun pretest(card: Mcq) {
        val q = spoken(card, 7)
        _state.update { it.copy(title = findBook(card.bookId)?.title ?: "") }
        io.chime(Chime.QUESTION)
        speak("Guess first. No score, it just primes your memory. ${q.prompt}", DrivePhase.QUESTION, "Guess first")
        if (voiceOk) {
            val h = listen(timings.answerMs)
            if (h == Heard.Unavailable) voiceOff()
            speak(if (h is Heard.Words) "Got it. Listen for the answer." else "Hold that guess, and listen for the answer.")
        } else {
            waitButton(timings.thinkMs)
            speak("Hold that guess, and listen for the answer.")
        }
    }

    private suspend fun ask(card: Card, label: String) {
        val book = findBook(card.bookId)?.title ?: ""
        val q = spoken(card, _state.value.asked)
        _state.update { it.copy(title = book) }
        io.chime(Chime.QUESTION)
        speak(q.prompt, DrivePhase.QUESTION, label)
        if (!voiceOk) return selfGrade(card, q)
        var tries = 0
        while (true) {
            when (val heard = listen(if (card is Recall) timings.explainMs else timings.answerMs)) {
                Heard.Unavailable -> {
                    voiceOff()
                    speak("I can't hear you right now, so let's use the buttons.")
                    return selfGrade(card, q, alreadyAsked = true)
                }
                Heard.Silence -> {
                    reveal(card, q, "Here's the answer.")
                    record(card, Grade.AGAIN, false)
                    return
                }
                is Heard.Words -> {
                    _state.update { it.copy(heard = heard.text) }
                    when (command(heard.text)) {
                        Command.REPEAT -> if (tries++ < 2) { speak(q.prompt, DrivePhase.QUESTION); continue }
                        Command.SKIP -> { speak("Skipping that one."); return }
                        Command.DONT_KNOW -> { reveal(card, q, "No problem."); record(card, Grade.AGAIN, false); return }
                        Command.PAUSE -> { pause(); return }
                        Command.SLOWER, Command.FASTER -> {
                            changeSpeed(if (command(heard.text) == Command.FASTER) 0.15f else -0.15f)
                            speak("Okay. Your answer?")
                            continue
                        }
                        else -> Unit
                    }
                    if (card is Recall) return explainCheck(card, heard)
                    val verdict = judge(card, q, heard)
                    if (verdict == Verdict.UNCLEAR && card is Mcq && tries++ < 1) {
                        speak("Sorry, was it ${q.options[0]}, or ${q.options[1]}?", DrivePhase.QUESTION)
                        continue
                    }
                    if (verdict == Verdict.RIGHT) {
                        io.chime(Chime.RIGHT)
                        speak("Right. ${if (card is Mcq) card.why else explanation(card)}", DrivePhase.FEEDBACK)
                        record(card, Grade.GOOD, true)
                    } else {
                        io.chime(Chime.WRONG)
                        speak("Not quite. It's ${q.answer.trimEnd('.')}. ${if (card is Mcq) card.why else ""}".trim(), DrivePhase.FEEDBACK)
                        record(card, Grade.AGAIN, false)
                    }
                    return
                }
            }
        }
    }

    /** Out-loud explanation: auto-credit when the key words are there, otherwise compare and self-assess. */
    private suspend fun explainCheck(card: Recall, heard: Heard.Words) {
        val keys = keywords(card.answer)
        val best = heard.alternatives.maxOf { coverage(it, keys) }
        if (keys.isNotEmpty() && best >= 0.4f && best * keys.size >= 2f) {
            io.chime(Chime.RIGHT)
            speak("Nice, you covered the key points. ${card.answer}", DrivePhase.FEEDBACK)
            record(card, Grade.GOOD, true)
            return
        }
        speak("Here's a strong answer: ${card.answer}", DrivePhase.FEEDBACK)
        speak("Did you get the main idea? Yes or no.", DrivePhase.QUESTION)
        val h = listen(timings.yesNoMs)
        when (if (h is Heard.Words) yesNo(h.text) else null) {
            true -> { io.chime(Chime.RIGHT); speak("Great."); record(card, Grade.GOOD, true) }
            false -> { speak("Okay, it'll come back soon."); record(card, Grade.AGAIN, false) }
            null -> speak("We'll come back to it.")
        }
    }

    /** No microphone: think, hear the answer, then press NEXT if you knew it or PREVIOUS if you didn't. */
    private suspend fun selfGrade(card: Card, q: SpokenQuestion, alreadyAsked: Boolean = false) {
        if (!alreadyAsked) speak("Think of your answer.", DrivePhase.THINKING)
        waitButton(timings.thinkMs)
        val answer = when (card) { is Recall -> card.answer; is Mcq -> "${q.answer.trimEnd('.')}. ${card.why}"; is Cloze -> explanation(card) }
        // From here on, next/back answer "did you know it?", even if pressed while the answer is still being read.
        while (buttons.tryReceive().isSuccess) Unit
        awaitingButton = true
        val pressed = try {
            speak("The answer: $answer", DrivePhase.FEEDBACK)
            buttons.tryReceive().getOrNull() ?: run {
                speak("Press next if you knew it, or back if you didn't.", DrivePhase.AWAIT_BUTTON)
                waitButton(timings.buttonMs, drain = false)
            }
        } finally {
            awaitingButton = false
        }
        when (pressed) {
            Button.NEXT -> { io.chime(Chime.RIGHT); record(card, Grade.GOOD, true) }
            Button.PREVIOUS -> { io.chime(Chime.WRONG); record(card, Grade.AGAIN, false) }
            null -> Unit
        }
    }

    private suspend fun reveal(card: Card, q: SpokenQuestion, prefix: String) {
        val body = when (card) { is Recall -> card.answer; is Mcq -> "It's ${q.answer.trimEnd('.')}. ${card.why}"; is Cloze -> explanation(card) }
        speak("$prefix $body", DrivePhase.FEEDBACK)
    }

    private suspend fun recall(bookId: String) {
        val study = studyFor(bookId) ?: return
        val title = findBook(bookId)?.title ?: ""
        io.chime(Chime.QUESTION)
        speak("Before we finish $title: tell me everything you remember. Take your time, and say done when you're finished.", DrivePhase.RECALL, "Brain dump")
        val said = StringBuilder()
        if (voiceOk) {
            for (round in 0 until timings.recallRounds) {
                val h = listen(timings.recallMs)
                if (h == Heard.Unavailable) { voiceOff(); break }
                if (h !is Heard.Words) { if (said.isNotEmpty()) break else continue }
                _state.update { it.copy(heard = h.text, phase = DrivePhase.RECALL) }
                if (command(h.text) == Command.DONE) break
                said.append(' ').append(h.text)
                if (normalizeSpeech(h.text).lastOrNull() == "done") break
            }
        }
        if (said.isBlank()) {
            speak("Take a moment and go over everything you can remember.", DrivePhase.THINKING)
            waitButton(timings.silentRecallMs)
        }
        val got = if (said.isNotBlank()) recalledIdeas(said.toString(), study.keyIdeas) else List(study.keyIdeas.size) { false }
        if (said.isNotBlank()) speak("You covered ${got.count { it }} of ${study.keyIdeas.size} key ideas.", DrivePhase.FEEDBACK)
        val missed = study.keyIdeas.filterIndexed { i, _ -> !got[i] }
        if (missed.isEmpty()) {
            io.chime(Chime.RIGHT)
            speak("You got all of them. Excellent.", DrivePhase.FEEDBACK)
        } else {
            speak(if (said.isBlank()) "Here are the key ideas." else "Here's what you missed.", DrivePhase.FEEDBACK)
            for (m in missed) speak(m, DrivePhase.FEEDBACK)
        }
        memory.finishBook(bookId)
    }

    private suspend fun outro() {
        io.chime(Chime.DONE)
        val s = _state.value
        val due = memory.due().size
        speak(buildString {
            append("That's the session. ")
            if (s.asked > 0) append("You got ${s.right} of ${s.asked} right. ")
            append(if (due > 0) "$due cards are ready for your next review. " else "Your next reviews are scheduled. ")
            append("See you next time.")
        }, label = "Done")
    }

    // ---- helpers -----------------------------------------------------------------------------------

    private suspend fun listen(ms: Long): Heard {
        _state.update { it.copy(phase = DrivePhase.LISTENING) }
        io.chime(Chime.LISTEN)
        return io.listen(ms)
    }

    private suspend fun waitButton(ms: Long, drain: Boolean = true): Button? {
        if (drain) while (buttons.tryReceive().isSuccess) Unit
        awaitingButton = true
        if (_state.value.phase != DrivePhase.THINKING) _state.update { it.copy(phase = DrivePhase.AWAIT_BUTTON) }
        try {
            return withTimeoutOrNull(ms) { buttons.receive() }
        } finally {
            awaitingButton = false
        }
    }

    private fun voiceOff() {
        voiceOk = false
        _state.update { it.copy(voiceAnswers = false) }
    }

    private fun changeSpeed(delta: Float) {
        speed = (speed + delta).coerceIn(0.75f, 2.5f)
        io.setNarrationSpeed(speed)
        _state.update { it.copy(speed = speed) }
    }

    private fun judge(card: Card, q: SpokenQuestion, heard: Heard.Words): Verdict = when (card) {
        is Mcq -> heard.alternatives.map { judgeEitherOr(it, q) }.let { v ->
            when { Verdict.RIGHT in v -> Verdict.RIGHT; Verdict.WRONG in v -> Verdict.WRONG; else -> Verdict.UNCLEAR }
        }
        is Cloze -> if (heard.alternatives.any { judgeCloze(it, card) }) Verdict.RIGHT else Verdict.WRONG
        is Recall -> Verdict.UNCLEAR
    }

    private fun record(card: Card, grade: Grade, correct: Boolean) {
        memory.record(card, grade, correct)
        _state.update { it.copy(asked = it.asked + 1, right = it.right + if (correct) 1 else 0) }
    }
}
