package com.aidantorrence.syncreader

import android.app.Application
import android.content.Context
import android.media.AudioAttributes
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

enum class ViewMode { FLOW, FOCUS }

/** How the highlighted word is being kept in step with the audio. */
enum class SyncQuality { READY, EXACT, ESTIMATED, SILENT }

const val DEFAULT_CHARS_PER_SECOND = 15f
val SPEED_PRESETS = listOf(1f, 1.5f, 2f, 2.5f, 3f)
const val MIN_SPEED = 0.5f
const val MAX_SPEED = 4f
const val SPEED_STEP = 0.25f

data class ReaderUiState(
    val document: Document = Document.EMPTY,
    val currentWord: Int = 0,
    val playing: Boolean = false,
    val finished: Boolean = false,
    val speed: Float = 1f,
    val mode: ViewMode = ViewMode.FLOW,
    val silent: Boolean = false,
    val sync: SyncQuality = SyncQuality.READY,
    val ttsReady: Boolean = false,
    val error: String? = null,
    /** Measured speaking rate of the installed voice at 1x, in characters per second. */
    val charsPerSecond: Float = DEFAULT_CHARS_PER_SECOND,
) {
    private val safeWord: Int get() = currentWord.coerceIn(0, maxOf(0, document.lastWord))

    val wordsPerMinute: Int
        get() = (charsPerSecond * speed * 60f / document.averageCharsPerWord).toInt()

    val progress: Float
        get() = when {
            document.isEmpty -> 0f
            finished -> 1f
            else -> document.words[safeWord].start.toFloat() / document.text.length
        }

    val secondsRemaining: Int
        get() {
            if (document.isEmpty || finished) return 0
            val remainingChars = document.text.length - document.words[safeWord].start
            return (remainingChars / (charsPerSecond * speed)).toInt()
        }
}

/**
 * Drives Android's TextToSpeech engine and keeps [ReaderUiState.currentWord] in lockstep with it.
 *
 * Sync strategy, best first:
 *  1. The engine's onRangeStart callback tells us the exact character range being spoken (Google TTS does this).
 *  2. If the engine never reports ranges, a ticker estimates position from elapsed time and a speaking
 *     rate that is re-measured from every finished utterance.
 *  3. Silent mode uses only the ticker, for reading without audio.
 */
class ReaderViewModel(app: Application) : AndroidViewModel(app) {

    private val prefs = app.getSharedPreferences("reader", Context.MODE_PRIVATE)
    private val main = Handler(Looper.getMainLooper())

    private val _state = MutableStateFlow(loadInitialState())
    val state: StateFlow<ReaderUiState> = _state.asStateFlow()

    private var tts: TextToSpeech? = null

    // Playback bookkeeping. Only touched on the main thread.
    private var generation = 0          // bumped on every stop/restart so stale engine callbacks are ignored
    private var playingChunk = -1       // chunk the engine is currently speaking
    private var chunkFromWord = 0       // word the current utterance started at (may be mid-chunk after a seek)
    private var chunkStartedAt = 0L     // SystemClock.elapsedRealtime() when the current utterance started
    private var rangeSeenInChunk = false
    private var rangeSeenEver = false
    private var queuedUpTo = 0          // next chunk index to hand to the engine
    private val utteranceFromWord = HashMap<Int, Int>()
    private var silentStartWord = 0
    private var silentStartedAt = 0L
    private var ticker: Job? = null

    init {
        tts = TextToSpeech(app) { status -> main.post { onTtsInit(status) } }
    }

    private fun loadInitialState(): ReaderUiState {
        val text = prefs.getString("text", null) ?: SAMPLE_TEXT
        val mode = runCatching { ViewMode.valueOf(prefs.getString("mode", "FLOW")!!) }.getOrDefault(ViewMode.FLOW)
        return ReaderUiState(
            document = Document(text),
            speed = prefs.getFloat("speed", 1f).coerceIn(MIN_SPEED, MAX_SPEED),
            mode = mode,
            silent = prefs.getBoolean("silent", false),
            charsPerSecond = prefs.getFloat("cps", DEFAULT_CHARS_PER_SECOND),
        )
    }

    private fun onTtsInit(status: Int) {
        val engine = tts
        if (status != TextToSpeech.SUCCESS || engine == null) {
            _state.update { it.copy(ttsReady = false, error = "No text-to-speech engine found. Install Google Speech Services, or use silent mode.") }
            return
        }
        engine.setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()
        )
        engine.setOnUtteranceProgressListener(progressListener)
        _state.update { it.copy(ttsReady = true, error = null) }
    }

    // ---- public controls -------------------------------------------------------------------

    fun togglePlay() {
        if (_state.value.playing) pause() else play()
    }

    fun play() {
        val s = _state.value
        if (s.document.isEmpty) return
        val from = if (s.finished || s.currentWord > s.document.lastWord) 0 else s.currentWord
        startFrom(from)
    }

    fun pause() {
        generation++
        tts?.stop()
        ticker?.cancel()
        playingChunk = -1
        _state.update { it.copy(playing = false) }
    }

    fun restart() {
        pause()
        _state.update { it.copy(currentWord = 0, finished = false) }
    }

    fun seekToWord(word: Int) {
        val doc = _state.value.document
        if (doc.isEmpty) return
        val w = word.coerceIn(0, doc.lastWord)
        if (_state.value.playing) startFrom(w)
        else _state.update { it.copy(currentWord = w, finished = false) }
    }

    fun seekToProgress(fraction: Float) {
        val doc = _state.value.document
        if (doc.isEmpty) return
        val c = (fraction.coerceIn(0f, 1f) * doc.text.length).toInt()
        seekToWord(doc.wordAtChar(c, 0, doc.words.size))
    }

    fun skipWords(delta: Int) = seekToWord(_state.value.currentWord + delta)

    fun setSpeed(speed: Float) {
        val s = (Math.round(speed / SPEED_STEP) * SPEED_STEP).coerceIn(MIN_SPEED, MAX_SPEED)
        prefs.edit().putFloat("speed", s).apply()
        _state.update { it.copy(speed = s) }
        if (_state.value.playing) startFrom(_state.value.currentWord)
    }

    fun stepSpeed(direction: Int) = setSpeed(_state.value.speed + direction * SPEED_STEP)

    fun setMode(mode: ViewMode) {
        prefs.edit().putString("mode", mode.name).apply()
        _state.update { it.copy(mode = mode) }
    }

    fun setSilent(silent: Boolean) {
        prefs.edit().putBoolean("silent", silent).apply()
        _state.update { it.copy(silent = silent) }
        if (_state.value.playing) startFrom(_state.value.currentWord)
    }

    fun setText(text: String) {
        pause()
        val clean = text.trim()
        prefs.edit().putString("text", clean).apply()
        _state.update { it.copy(document = Document(clean), currentWord = 0, finished = false, sync = SyncQuality.READY) }
    }

    // ---- engine ------------------------------------------------------------------------------

    private fun startFrom(word: Int) {
        val s = _state.value
        val doc = s.document
        if (doc.isEmpty) return
        val from = word.coerceIn(0, doc.lastWord)

        generation++
        tts?.stop()
        utteranceFromWord.clear()
        rangeSeenInChunk = false
        playingChunk = -1

        _state.update { it.copy(currentWord = from, playing = true, finished = false, error = null) }

        if (s.silent || !s.ttsReady) {
            silentStartWord = from
            silentStartedAt = SystemClock.elapsedRealtime()
            _state.update { it.copy(sync = SyncQuality.SILENT) }
        } else {
            val engine = tts ?: return
            engine.setSpeechRate(s.speed)
            val chunk = doc.chunkOf(from)
            playingChunk = chunk.index
            chunkFromWord = from
            chunkStartedAt = SystemClock.elapsedRealtime()
            queuedUpTo = chunk.index
            enqueueChunk(chunk, from)
            fillQueue()
        }
        startTicker()
    }

    private fun enqueueChunk(chunk: Chunk, fromWord: Int) {
        val doc = _state.value.document
        val engine = tts ?: return
        val from = fromWord.coerceIn(chunk.firstWord, chunk.endWord - 1)
        utteranceFromWord[chunk.index] = from
        val id = "$generation:${chunk.index}"
        val result = engine.speak(doc.chunkText(chunk, from), TextToSpeech.QUEUE_ADD, null, id)
        queuedUpTo = chunk.index + 1
        if (result != TextToSpeech.SUCCESS) {
            pause()
            _state.update { it.copy(error = "The text-to-speech engine refused to speak. Try silent mode.") }
        }
    }

    /** Keep a few utterances queued so the engine can pre-synthesize and transitions stay seamless. */
    private fun fillQueue() {
        val chunks = _state.value.document.chunks
        while (queuedUpTo < chunks.size && queuedUpTo < playingChunk + LOOKAHEAD) {
            val c = chunks[queuedUpTo]
            enqueueChunk(c, c.firstWord)
        }
    }

    private fun parseUtterance(id: String?): Int? {
        val parts = id?.split(':') ?: return null
        if (parts.size != 2 || parts[0].toIntOrNull() != generation) return null
        return parts[1].toIntOrNull()
    }

    private val progressListener = object : UtteranceProgressListener() {
        override fun onStart(utteranceId: String?) {
            main.post { onUtteranceStart(utteranceId) }
        }

        override fun onRangeStart(utteranceId: String?, start: Int, end: Int, frame: Int) {
            main.post { onUtteranceRange(utteranceId, start) }
        }

        override fun onDone(utteranceId: String?) {
            main.post { onUtteranceDone(utteranceId) }
        }

        @Deprecated("Deprecated in Java")
        override fun onError(utteranceId: String?) {
            main.post { onUtteranceError(utteranceId, -1) }
        }

        override fun onError(utteranceId: String?, errorCode: Int) {
            main.post { onUtteranceError(utteranceId, errorCode) }
        }
    }

    private fun onUtteranceStart(id: String?) {
        val idx = parseUtterance(id) ?: return
        val doc = _state.value.document
        if (idx >= doc.chunks.size) return
        playingChunk = idx
        chunkFromWord = utteranceFromWord[idx] ?: doc.chunks[idx].firstWord
        chunkStartedAt = SystemClock.elapsedRealtime()
        rangeSeenInChunk = false
        _state.update { it.copy(currentWord = chunkFromWord) }
        fillQueue()
    }

    private fun onUtteranceRange(id: String?, start: Int) {
        val idx = parseUtterance(id) ?: return
        val doc = _state.value.document
        if (idx >= doc.chunks.size) return
        val chunk = doc.chunks[idx]
        val fromWord = utteranceFromWord[idx] ?: chunk.firstWord
        val globalChar = doc.words[fromWord].start + start
        val word = doc.wordAtChar(globalChar, fromWord, chunk.endWord)
        rangeSeenInChunk = true
        rangeSeenEver = true
        _state.update { it.copy(currentWord = word, sync = SyncQuality.EXACT) }
    }

    private fun onUtteranceDone(id: String?) {
        val idx = parseUtterance(id) ?: return
        val s = _state.value
        val doc = s.document
        if (idx >= doc.chunks.size) return
        utteranceFromWord.remove(idx)

        // Re-measure the voice's real speaking rate from this utterance.
        val chunk = doc.chunks[idx]
        val fromWord = chunkFromWord.coerceIn(chunk.firstWord, chunk.endWord - 1)
        val chars = doc.words[chunk.endWord - 1].end - doc.words[fromWord].start
        val elapsed = (SystemClock.elapsedRealtime() - chunkStartedAt) / 1000f
        if (idx == playingChunk && chars >= 20 && elapsed > 0.4f) {
            val measured = chars / (elapsed * s.speed)
            val cps = (s.charsPerSecond * 0.6f + measured * 0.4f).coerceIn(5f, 60f)
            prefs.edit().putFloat("cps", cps).apply()
            _state.update { it.copy(charsPerSecond = cps) }
        }
        if (!rangeSeenEver) _state.update { it.copy(sync = SyncQuality.ESTIMATED) }

        if (idx == doc.chunks.size - 1) finish()
    }

    private fun onUtteranceError(id: String?, code: Int) {
        parseUtterance(id) ?: return
        pause()
        _state.update { it.copy(error = "Text-to-speech error ($code). Check that a speech engine is installed and has a voice for this language.") }
    }

    private fun finish() {
        generation++
        ticker?.cancel()
        playingChunk = -1
        _state.update { it.copy(playing = false, finished = true, currentWord = it.document.lastWord) }
    }

    /** Estimates the spoken position between (or instead of) engine range callbacks. */
    private fun startTicker() {
        ticker?.cancel()
        ticker = viewModelScope.launch {
            while (isActive) {
                tick()
                delay(40)
            }
        }
    }

    private fun tick() {
        val s = _state.value
        if (!s.playing) return
        val doc = s.document
        val cps = s.charsPerSecond * s.speed
        val now = SystemClock.elapsedRealtime()

        if (s.silent || !s.ttsReady) {
            val charPos = doc.words[silentStartWord].start + (now - silentStartedAt) / 1000f * cps
            if (charPos >= doc.text.length) {
                finish()
                return
            }
            val word = doc.wordAtChar(charPos.toInt(), silentStartWord, doc.words.size)
            if (word != s.currentWord) _state.update { it.copy(currentWord = word) }
            return
        }

        if (rangeSeenInChunk || playingChunk < 0) return
        val chunk = doc.chunks[playingChunk]
        val from = chunkFromWord.coerceIn(chunk.firstWord, chunk.endWord - 1)
        val charPos = doc.words[from].start + (now - chunkStartedAt) / 1000f * cps
        val word = doc.wordAtChar(charPos.toInt(), from, chunk.endWord)
        if (word != s.currentWord) {
            _state.update { it.copy(currentWord = word, sync = if (rangeSeenEver) it.sync else SyncQuality.ESTIMATED) }
        }
    }

    override fun onCleared() {
        ticker?.cancel()
        tts?.stop()
        tts?.shutdown()
        tts = null
        super.onCleared()
    }

    companion object {
        private const val LOOKAHEAD = 4
    }
}
