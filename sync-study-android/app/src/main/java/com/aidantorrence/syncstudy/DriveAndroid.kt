package com.aidantorrence.syncstudy

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlin.coroutines.resume
import kotlin.math.PI
import kotlin.math.min
import kotlin.math.sin

/**
 * The phone's speaker and chimes for drive mode (it never uses the microphone).
 * Narration and questions use different voices (or a different pitch when only one voice is installed) so the
 * listener always knows whether they're hearing the book or being asked something.
 */
class AndroidDriveIO(
    private val context: Context,
    private val onFocusLost: () -> Unit,
    private val onFocusGained: () -> Unit,
) : DriveIO {
    private var tts: TextToSpeech? = null
    private val ready = CompletableDeferred<Boolean>()
    private val pending = ConcurrentHashMap<String, CancellableContinuation<Unit>>()
    private var narrator: Voice? = null
    private var coach: Voice? = null
    private var coachPitch = 1f
    @Volatile private var speed = 1f
    private val audio = context.getSystemService(AudioManager::class.java)
    private var focus: AudioFocusRequest? = null

    private val speech = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()

    fun start() {
        tts = TextToSpeech(context.applicationContext) { status ->
            val ok = status == TextToSpeech.SUCCESS
            if (ok) setupVoices()
            ready.complete(ok)
        }.apply {
            setAudioAttributes(speech)
            setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(id: String?) = Unit
                override fun onDone(id: String?) { id?.let { pending.remove(it)?.let { c -> if (c.isActive) c.resume(Unit) } } }
                @Deprecated("Deprecated in Java")
                override fun onError(id: String?) { onDone(id) }
                override fun onError(id: String?, code: Int) { onDone(id) }
                override fun onStop(id: String?, interrupted: Boolean) { onDone(id) }
            })
        }
        requestFocus()
    }

    fun shutdown() {
        pending.values.forEach { if (it.isActive) it.resume(Unit) }
        pending.clear()
        tts?.stop(); tts?.shutdown(); tts = null
        focus?.let { audio.abandonAudioFocusRequest(it) }
    }

    private fun setupVoices() {
        val engine = tts ?: return
        val base = runCatching { engine.voice }.getOrNull() ?: runCatching { engine.defaultVoice }.getOrNull()
        narrator = base
        val usable = runCatching { engine.voices }.getOrNull().orEmpty().filter { v ->
            !v.isNetworkConnectionRequired && TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED !in v.features &&
                v.locale.language == (base?.locale?.language ?: Locale.getDefault().language)
        }.sortedBy { it.name }
        coach = usable.firstOrNull { it.name != base?.name && it.locale.country == base?.locale?.country }
            ?: usable.firstOrNull { it.name != base?.name }
        coachPitch = if (coach == null) 1.14f else 1f
    }

    override fun setSpeed(speed: Float) { this.speed = speed }

    override suspend fun say(text: String, role: VoiceRole) {
        if (!ready.await()) { delay(text.length * 45L); return }
        val engine = tts ?: return
        val id = UUID.randomUUID().toString()
        suspendCancellableCoroutine { cont ->
            pending[id] = cont
            cont.invokeOnCancellation { pending.remove(id); engine.stop() }
            when (role) {
                VoiceRole.NARRATOR -> { narrator?.let { runCatching { engine.voice = it } }; engine.setPitch(1f); engine.setSpeechRate(speed) }
                VoiceRole.COACH -> { (coach ?: narrator)?.let { runCatching { engine.voice = it } }; engine.setPitch(coachPitch); engine.setSpeechRate(speed) }
            }
            if (engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, id) != TextToSpeech.SUCCESS) {
                pending.remove(id); if (cont.isActive) cont.resume(Unit)
            }
        }
    }

    // ---- chimes --------------------------------------------------------------------------------------

    override suspend fun chime(c: Chime) {
        val notes = when (c) {
            Chime.QUESTION -> listOf(659.3f to 90, 880f to 150)
            Chime.RIGHT -> listOf(523.3f to 80, 659.3f to 80, 784f to 170)
            Chime.WRONG -> listOf(392f to 130, 329.6f to 220)
            Chime.DONE -> listOf(523.3f to 90, 659.3f to 90, 784f to 90, 1046.5f to 260)
        }
        val pcm = tones(notes)
        withContext(Dispatchers.Default) {
            val track = AudioTrack.Builder()
                .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                .setAudioFormat(AudioFormat.Builder().setSampleRate(RATE).setEncoding(AudioFormat.ENCODING_PCM_16BIT).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                .setTransferMode(AudioTrack.MODE_STATIC)
                .setBufferSizeInBytes(pcm.size * 2)
                .build()
            try {
                track.write(pcm, 0, pcm.size)
                track.play()
                delay(pcm.size * 1000L / RATE + 30)
            } finally {
                runCatching { track.stop() }; track.release()
            }
        }
    }

    private fun tones(notes: List<Pair<Float, Int>>): ShortArray {
        val out = ArrayList<Short>()
        for ((f, ms) in notes) {
            val n = RATE * ms / 1000
            for (i in 0 until n) {
                val t = i.toFloat() / RATE
                val env = min(1f, i / (RATE * 0.008f)) * (1f - i.toFloat() / n).let { it * it }
                val v = (sin(2 * PI * f * t) * 0.75 + sin(4 * PI * f * t) * 0.18) * env * 0.42
                out += (v * Short.MAX_VALUE).toInt().toShort()
            }
        }
        return out.toShortArray()
    }

    // ---- audio focus: pause for navigation prompts and calls --------------------------------------------

    private fun requestFocus() {
        val req = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
            .setAudioAttributes(speech)
            .setWillPauseWhenDucked(true)
            .setOnAudioFocusChangeListener { change ->
                when (change) {
                    AudioManager.AUDIOFOCUS_LOSS, AudioManager.AUDIOFOCUS_LOSS_TRANSIENT,
                    AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> onFocusLost()
                    AudioManager.AUDIOFOCUS_GAIN -> onFocusGained()
                }
            }
            .build()
        focus = req
        audio.requestAudioFocus(req)
    }

    companion object { private const val RATE = 44_100 }
}

/** Drive sessions read and write the same progress as the rest of the app. */
class StoreMemory(context: Context) : DriveMemory {
    private val prefs = context.getSharedPreferences("drive", Context.MODE_PRIVATE)
    override fun record(card: Card, grade: Grade, correct: Boolean) = StudyStore.record(card, grade, correct)
    override fun due(): List<Card> = StudyStore.due().sortedBy { StudyStore.state(it.id)?.due ?: 0L }
    override fun paragraph(bookId: String) = prefs.getInt("para:$bookId", 0)
    override fun setParagraph(bookId: String, p: Int) { prefs.edit().putInt("para:$bookId", p).apply() }
    override fun isNew(bookId: String) = StudyStore.stage(bookId) == Stage.NEW
    override fun startBook(bookId: String) = StudyStore.advance(bookId, Stage.PRETESTED)
    override fun finishBook(bookId: String) { StudyStore.advance(bookId, Stage.DONE); StudyStore.introduce(bookId) }
    fun restart(bookId: String) { prefs.edit().putInt("para:$bookId", 0).apply() }
}
