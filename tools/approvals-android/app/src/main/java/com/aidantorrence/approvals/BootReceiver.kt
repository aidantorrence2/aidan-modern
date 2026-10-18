package com.aidantorrence.approvals

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        try { ApprovalService.start(context) } catch (_: Exception) {}
    }
}
