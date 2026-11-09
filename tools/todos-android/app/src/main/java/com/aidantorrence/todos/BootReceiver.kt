package com.aidantorrence.todos

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Settings

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (!Settings.canDrawOverlays(context)) return
        try { BubbleService.start(context) } catch (_: Exception) {}
    }
}
