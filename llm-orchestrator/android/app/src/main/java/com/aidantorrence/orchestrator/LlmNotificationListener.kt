package com.aidantorrence.orchestrator

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

/**
 * Watches notifications from AI apps on the phone (ChatGPT incl. Codex cloud tasks, the Claude app incl.
 * Claude Code on the web) and turns "response ready" notifications into inbox items. If the notification
 * has an inline reply action we reply through it; otherwise we copy the reply and open the conversation.
 */
class LlmNotificationListener : NotificationListenerService() {

    companion object {
        val DEFAULT_PACKAGES = mapOf(
            "com.openai.chatgpt" to "chatgpt",
            "com.openai.codex" to "codex",
            "com.anthropic.claude" to "claude-app",
        )
    }

    override fun onListenerConnected() {
        Hub.init(this)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        Hub.init(this)
        val extra = Store.extraPackages.split(',', ' ', '\n').map { it.trim() }.filter { it.isNotEmpty() }
        val source = DEFAULT_PACKAGES[sbn.packageName]
            ?: if (sbn.packageName in extra) sbn.packageName.substringAfterLast('.') else return

        val n = sbn.notification
        if (sbn.isOngoing || (n.flags and Notification.FLAG_GROUP_SUMMARY) != 0) return
        if (n.category == Notification.CATEGORY_PROGRESS || n.category == Notification.CATEGORY_SERVICE) return

        val ex = n.extras
        val title = ex.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
        val text = (ex.getCharSequence(Notification.EXTRA_BIG_TEXT) ?: ex.getCharSequence(Notification.EXTRA_TEXT))
            ?.toString().orEmpty()
        val messages = ex.getParcelableArray(Notification.EXTRA_MESSAGES)
            // MessagingStyle messages are Bundles with a "text" key (parsed by hand to support API 26+).
            ?.mapNotNull { (it as? android.os.Bundle)?.getCharSequence("text")?.toString() }
            ?.takeLast(3)
            ?.joinToString("\n")
            .orEmpty()
        val body = messages.ifBlank { text }
        if (title.isBlank() && body.isBlank()) return

        val reply = n.actions?.firstOrNull { a -> a.remoteInputs?.any { it.allowFreeFormInput } == true }
        // Conversation key: notification tag/id identifies the chat; fall back to the title.
        val key = sbn.tag ?: if (sbn.id != 0) sbn.id.toString() else title
        Hub.onDeviceCompletion(
            pkg = sbn.packageName,
            source = source,
            key = key,
            title = title.ifBlank { Hub.label(source) },
            text = body,
            handle = DeviceHandle(n.contentIntent, reply),
        )
    }
}
