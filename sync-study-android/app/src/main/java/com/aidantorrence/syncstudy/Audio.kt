package com.aidantorrence.syncstudy

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.speech.tts.TextToSpeech
import android.speech.tts.Voice
import java.util.Locale

val SPEECH_AUDIO: AudioAttributes = AudioAttributes.Builder()
    .setUsage(AudioAttributes.USAGE_MEDIA)
    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
    .build()

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

/**
 * The best-sounding voice installed for the device language: highest quality first, offline only (a voice that
 * needs the network can drop out mid-sentence in the car), then the device's own accent, then lowest latency.
 * Null keeps the engine's default.
 */
fun bestVoice(engine: TextToSpeech): Voice? {
    val here = Locale.getDefault()
    val voices = runCatching { engine.voices }.getOrNull().orEmpty().filter { v ->
        !v.isNetworkConnectionRequired && TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED !in v.features &&
            v.locale.language == here.language
    }
    return voices.sortedWith(
        compareByDescending<Voice> { it.quality }
            .thenByDescending { it.locale.country == here.country }
            .thenBy { it.latency }
            .thenBy { it.name },
    ).firstOrNull()
}
