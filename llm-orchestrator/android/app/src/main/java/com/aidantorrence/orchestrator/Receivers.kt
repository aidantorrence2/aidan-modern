package com.aidantorrence.orchestrator

import android.app.RemoteInput
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Handles "Send suggestion" / inline "Reply" actions on our own completion notifications. */
class ActionReceiver : BroadcastReceiver() {
    companion object {
        const val SEND_SUGGESTED = "com.aidantorrence.orchestrator.SEND_SUGGESTED"
        const val REPLY = "com.aidantorrence.orchestrator.REPLY"
        const val KEY_TEXT = "reply_text"
    }

    override fun onReceive(context: Context, intent: Intent) {
        Hub.init(context)
        val item = Store.item(intent.getStringExtra("itemId") ?: return) ?: return
        val text = when (intent.action) {
            SEND_SUGGESTED -> item.draft ?: item.suggestion
            REPLY -> RemoteInput.getResultsFromIntent(intent)?.getCharSequence(KEY_TEXT)?.toString()
            else -> null
        } ?: return
        Hub.send(item, text)
    }
}

/** Restores the floating panel after reboot / app update. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED && intent.action != Intent.ACTION_MY_PACKAGE_REPLACED) return
        Hub.init(context)
        if (Store.overlayEnabled) OverlayService.start(context)
    }
}
