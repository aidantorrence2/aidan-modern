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
 * sentence it reached). During a question's silent pause NEXT reveals the answer early and PREVIOUS asks again;
 * while the answer is read, NEXT/PREVIOUS mean "I knew it" / "I didn't".
 */
class DriveEngine(
    private val io: DriveIO,
    private val memory: DriveMemory,
    private val settings: DriveSettings,
    private val timings: DriveTimings = DriveTimings(),
) {
    private val _state = MutableStateFlow(DriveState(title = findBook(settings.bookId)?.title ?: "", speed = settings.speed))
    val state: StateFlow<DriveState> = _state.asStateFlow()

    private enum class After { NEXT, REPEAT, STAY }
    @Volatile private var after = After.NEXT
    @Volatile private var segmentJob: Job? = null
    private val paused = MutableStateFlow(false)
    private val buttons = Channel<Button>(Channel.CONFLATED)
    @Volatile private var awaitingButton = false
    private val narrated = HashMap<Int, Int>()

    val isPaused: Boolean get() = paused.value

    suspend fun run(plan: List<Segment>) = coroutineScope {
        _state.update { it.copy(running = true, segments = plan.size) }
        io.setSpeed(settings.speed)
        var i = 0
        try {
            while (i < plan.size) {
                if (paused.value) {
                    _state.update { it.copy(phase = DrivePhase.PAUSED) }
                    paused.first { !it }
                }
                after = After.NEXT
                _state.update { it.copy(segment = i, phase = DrivePhase.SPEAKING) }
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

    private suspend fun learn(i: Int, seg: Segment.Learn) {
        val doc = findBook(seg.bookId)!!.document
        if (seg.section == 0 && narrated[i] == null) memory.startBook(seg.bookId)
        val r = doc.sections[seg.section]
        val parts = sentences(doc.text.substring(doc.words[r.first].start, doc.words[r.last].end))
        _state.update { it.copy(title = findBook(seg.bookId)?.title ?: "", label = "Section ${seg.section + 1} of ${doc.sections.size}") }
        if (narrated[i] == null) {
            doc.sectionTitles.getOrNull(seg.section)?.let { speak("Section ${seg.section + 1}: $it.") }
            narrated[i] = 0
        }
        for (k in narrated.getValue(i) until parts.size) {
            _state.update { it.copy(phase = DrivePhase.NARRATING, line = parts[k]) }
            io.say(parts[k], VoiceRole.NARRATOR)
            narrated[i] = k + 1
        }
        recapFor(seg.bookId, seg.section)?.let { speak(it, label = "In short") }
        memory.setSection(seg.bookId, seg.section + 1)
    }

    /** Ask, wait in silence while the listener answers in their head, then read the answer. */
    private suspend fun ask(card: Card, label: String) {
        _state.update { it.copy(title = findBook(card.bookId)?.title ?: "") }
        io.chime(Chime.QUESTION)
        speak(card.front, DrivePhase.QUESTION, label)
        _state.update { it.copy(phase = DrivePhase.THINKING) }
        if (waitButton(timings.thinkMs) == Button.PREVIOUS) { after = After.REPEAT; return }
        val answer = card.back
        // From here on, next/back mean "knew it" / "didn't", even if pressed while the answer is still being read.
        awaitingButton = true
        val pressed = try {
            speak(answer, DrivePhase.FEEDBACK)
            buttons.tryReceive().getOrNull() ?: withTimeoutOrNull(timings.gradeMs) { buttons.receive() }
        } finally {
            awaitingButton = false
        }
        when (pressed) {
            Button.NEXT -> { io.chime(Chime.RIGHT); record(card, Grade.GOOD) }
            Button.PREVIOUS -> { io.chime(Chime.WRONG); record(card, Grade.AGAIN) }
            null -> Unit
        }
    }

    private suspend fun recall(bookId: String) {
        val study = studyFor(bookId) ?: return
        val title = findBook(bookId)?.title ?: ""
        io.chime(Chime.QUESTION)
        speak("Before we finish $title: go over everything you remember from it, in your head. Take thirty seconds.", DrivePhase.RECALL, "Brain dump")
        waitButton(timings.recallMs)
        speak("Here are the key ideas. Check them against yours.", DrivePhase.FEEDBACK)
        for (idea in study.keyIdeas) speak(idea, DrivePhase.FEEDBACK)
        memory.finishBook(bookId)
    }

    private suspend fun outro() {
        io.chime(Chime.DONE)
        val s = _state.value
        val due = memory.due().size
        speak(buildString {
            append("That's the session. ")
            if (s.asked > 0) append("You knew ${s.right} of the ${s.asked} you marked. ")
            append(if (due > 0) "$due cards are ready for your next review. " else "Your next reviews are scheduled. ")
            append("See you next time.")
        }, label = "Done")
    }

    // ---- helpers -----------------------------------------------------------------------------------

    /** Waits up to [ms] for a button press, keeping the current phase on screen. */
    private suspend fun waitButton(ms: Long): Button? {
        while (buttons.tryReceive().isSuccess) Unit
        awaitingButton = true
        try {
            return withTimeoutOrNull(ms) { buttons.receive() }
        } finally {
            awaitingButton = false
        }
    }

    private fun record(card: Card, grade: Grade) {
        memory.record(card, grade)
        _state.update { it.copy(asked = it.asked + 1, right = it.right + if (grade != Grade.AGAIN) 1 else 0) }
    }
}
