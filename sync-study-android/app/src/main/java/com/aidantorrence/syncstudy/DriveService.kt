package com.aidantorrence.syncstudy

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.IBinder
import android.os.PowerManager
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import androidx.media.app.NotificationCompat.MediaStyle
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** Owns the running drive session so it survives the screen turning off and the activity going away. */
object DriveController {
    private val _state = MutableStateFlow(DriveState())
    val state: StateFlow<DriveState> = _state.asStateFlow()

    private var scope: CoroutineScope? = null
    private var engine: DriveEngine? = null
    private var io: AndroidDriveIO? = null
    private var autoPaused = false

    val running: Boolean get() = scope != null

    fun start(context: Context, settings: DriveSettings) {
        if (running) return
        val app = context.applicationContext
        StudyStore.init(app)
        val memory = StoreMemory(app)
        val plan = buildDrivePlan(settings, memory)
        val voice = AndroidDriveIO(app,
            onFocusLost = { engine?.let { if (!it.isPaused) { autoPaused = true; it.pause() } } },
            onFocusGained = { if (autoPaused) { autoPaused = false; engine?.resume() } })
        val e = DriveEngine(voice, memory, settings)
        io = voice
        engine = e
        val s = CoroutineScope(SupervisorJob() + Dispatchers.Main)
        scope = s
        ContextCompat.startForegroundService(app, Intent(app, DriveService::class.java))
        voice.start()
        s.launch { e.state.collect { _state.value = it } }
        s.launch {
            try { e.run(plan) } finally { finish(app) }
        }
    }

    fun press(b: Button) { engine?.press(b) }
    fun togglePause() { autoPaused = false; engine?.togglePause() }
    fun pause() { autoPaused = false; engine?.pause() }
    fun resume() { autoPaused = false; engine?.resume() }

    fun stop(context: Context) {
        scope?.cancel()
        finish(context.applicationContext)
    }

    private fun finish(context: Context) {
        io?.shutdown(); io = null
        engine = null
        scope?.cancel(); scope = null
        _state.value = _state.value.copy(running = false, phase = DrivePhase.DONE)
        context.stopService(Intent(context, DriveService::class.java))
    }

    /** Test hook for screenshots. */
    internal fun showForTest(s: DriveState) { _state.value = s }
}

/**
 * Foreground service for a drive session: keeps the CPU awake while narrating, shows a media notification, and
 * receives steering-wheel / headset buttons through a media session (play-pause, next = skip or "I knew it",
 * previous = repeat or "I didn't").
 */
class DriveService : Service() {
    private lateinit var session: MediaSessionCompat
    private var wake: PowerManager.WakeLock? = null
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var watch: Job? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CHANNEL, "Drive mode", NotificationManager.IMPORTANCE_LOW).apply {
            description = "Hands-free study sessions"
        })
        session = MediaSessionCompat(this, "SyncStudyDrive").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() = DriveController.resume()
                override fun onPause() = DriveController.pause()
                override fun onSkipToNext() = DriveController.press(Button.NEXT)
                override fun onSkipToPrevious() = DriveController.press(Button.PREVIOUS)
                override fun onStop() = DriveController.stop(this@DriveService)
            })
            isActive = true
        }
        wake = getSystemService(PowerManager::class.java).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SyncStudy:drive").apply {
            acquire(2 * 60 * 60 * 1000L)
        }
        startInForeground(DriveController.state.value)
        watch = scope.launch { DriveController.state.collect { update(it) } }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!DriveController.running) { stopSelf(); return START_NOT_STICKY }
        androidx.media.session.MediaButtonReceiver.handleIntent(session, intent)
        return START_NOT_STICKY
    }

    private fun startInForeground(s: DriveState) {
        ServiceCompat.startForeground(this, NOTIFICATION, notification(s), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
    }

    private fun update(s: DriveState) {
        val playing = s.running && s.phase != DrivePhase.PAUSED
        session.setPlaybackState(
            PlaybackStateCompat.Builder()
                .setActions(PlaybackStateCompat.ACTION_PLAY or PlaybackStateCompat.ACTION_PAUSE or PlaybackStateCompat.ACTION_PLAY_PAUSE or
                    PlaybackStateCompat.ACTION_SKIP_TO_NEXT or PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or PlaybackStateCompat.ACTION_STOP)
                .setState(if (playing) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f)
                .build()
        )
        session.setMetadata(
            MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, s.label.ifEmpty { "Drive mode" })
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, s.title)
                .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_SUBTITLE, s.line.take(80))
                .build()
        )
        if (s.running) getSystemService(NotificationManager::class.java).notify(NOTIFICATION, notification(s))
    }

    private fun notification(s: DriveState): Notification {
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE)
        fun action(icon: Int, title: String, act: Long) = NotificationCompat.Action(icon, title,
            androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(this, act))
        val paused = s.phase == DrivePhase.PAUSED
        return NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(listOf(s.label, s.title).filter { it.isNotEmpty() }.joinToString(" · ").ifEmpty { "Drive mode" })
            .setContentText(s.line.ifEmpty { "Starting…" })
            .setContentIntent(open)
            .setOngoing(true)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(action(android.R.drawable.ic_media_previous, "Repeat", PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS))
            .addAction(if (paused) action(android.R.drawable.ic_media_play, "Resume", PlaybackStateCompat.ACTION_PLAY)
                else action(android.R.drawable.ic_media_pause, "Pause", PlaybackStateCompat.ACTION_PAUSE))
            .addAction(action(android.R.drawable.ic_media_next, "Skip", PlaybackStateCompat.ACTION_SKIP_TO_NEXT))
            .setStyle(MediaStyle().setMediaSession(session.sessionToken).setShowActionsInCompactView(0, 1, 2))
            .build()
    }

    override fun onDestroy() {
        watch?.cancel(); scope.cancel()
        session.isActive = false
        session.release()
        wake?.let { if (it.isHeld) it.release() }
        super.onDestroy()
    }

    companion object {
        private const val CHANNEL = "drive"
        private const val NOTIFICATION = 7
    }
}
