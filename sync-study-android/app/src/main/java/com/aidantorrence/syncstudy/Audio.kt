package com.aidantorrence.syncstudy

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.speech.tts.TextToSpeech
import android.speech.tts.Voice
import java.util.Locale

val SPEECH_AUDIO: AudioAttributes by lazy {
    AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()
}

/**
 * Audio focus for narration. Taking it stops other media (music, podcasts) the way starting any player does;
 * when another app takes it back we're told to pause. A transient loss (a navigation prompt, a call) is followed
 * by [onRegained] when it's over.
 */
class MediaFocus(
    context: Context,
    private val onLost: (transient: Boolean) -> Unit,
    private val onRegained: () -> Unit = {},
) {
    private val audio = context.getSystemService(AudioManager::class.java)
    private var held = false
    private val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
        .setAudioAttributes(SPEECH_AUDIO)
        .setWillPauseWhenDucked(true)
        .setOnAudioFocusChangeListener { change ->
            when (change) {
                AudioManager.AUDIOFOCUS_GAIN -> { held = true; onRegained() }
                AudioManager.AUDIOFOCUS_LOSS -> { held = false; onLost(false) }
                AudioManager.AUDIOFOCUS_LOSS_TRANSIENT, AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> onLost(true)
            }
        }
        .build()

    /** Takes focus if we don't already hold it, pausing whatever else is playing. */
    fun take() {
        if (!held) held = audio?.requestAudioFocus(request) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    }

    fun release() {
        if (held) audio?.abandonAudioFocusRequest(request)
        held = false
    }
}

/** Google's male voice codes (en-US iol/iom/tpd, en-GB gbb/gbd/rjs, en-AU aub/aud, en-IN end); other engines say "male". */
private val MALE_CODES = setOf("iol", "iom", "tpd", "gbb", "gbd", "rjs", "aub", "aud", "end")

/** Android doesn't expose a voice's gender, so this reads it from the voice name. */
fun soundsMale(name: String): Boolean {
    val n = name.lowercase()
    if ("female" in n || "woman" in n) return false
    if (Regex("(^|[^a-z])male").containsMatchIn(n)) return true
    return n.split('-', '_', '#').any { it in MALE_CODES }
}

/**
 * The voice used for narration: a male voice when one is installed (easier to listen to for long stretches),
 * then the highest quality, offline only (a voice that needs the network can drop out mid-sentence in the car),
 * then the device's own accent, then lowest latency. Null keeps the engine's default.
 */
fun bestVoice(engine: TextToSpeech): Voice? {
    val here = Locale.getDefault()
    val voices = runCatching { engine.voices }.getOrNull().orEmpty().filter { v ->
        !v.isNetworkConnectionRequired && TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED !in v.features &&
            v.locale.language == here.language
    }
    return voices.sortedWith(
        compareByDescending<Voice> { soundsMale(it.name) && it.quality >= Voice.QUALITY_NORMAL }
            .thenByDescending { it.quality }
            .thenByDescending { it.locale.country == here.country }
            .thenBy { it.latency }
            .thenBy { it.name },
    ).firstOrNull()
}
