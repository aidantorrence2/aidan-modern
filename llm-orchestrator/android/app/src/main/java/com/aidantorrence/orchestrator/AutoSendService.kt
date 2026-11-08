package com.aidantorrence.orchestrator

import android.accessibilityservice.AccessibilityService
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Finishes a reply the APIs can't send (ChatGPT needs a browser check; claude.ai chats are only reachable
 * through the Claude app): after the user taps Send, Hub opens the conversation in the official app and
 * this service puts the text into its message box and taps the app's own send button.
 * It does nothing unless a reply is pending, and only inside the ChatGPT and Claude apps.
 */
class AutoSendService : AccessibilityService() {
    data class Pending(val pkg: String, val text: String, val deadline: Long, var filled: Boolean = false)

    companion object {
        @Volatile var pending: Pending? = null
        @Volatile var connected = false
            private set

        fun request(pkg: String, text: String) {
            pending = Pending(pkg, text, System.currentTimeMillis() + 20_000)
        }
    }

    private val main = Handler(Looper.getMainLooper())

    override fun onServiceConnected() { connected = true }
    override fun onDestroy() { connected = false; super.onDestroy() }
    override fun onInterrupt() {}

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val p = pending ?: return
        if (System.currentTimeMillis() > p.deadline) {
            pending = null
            Hub.toast("Couldn't send automatically — the reply is on your clipboard")
            return
        }
        if (event?.packageName?.toString() != p.pkg) return
        tryStep(p)
    }

    private fun tryStep(p: Pending) {
        val root = rootInActiveWindow ?: return
        if (root.packageName?.toString() != p.pkg) return
        if (!p.filled) {
            val box = findInput(root) ?: return
            box.performAction(AccessibilityNodeInfo.ACTION_FOCUS)
            val args = Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, p.text)
            }
            if (!box.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)) return
            p.filled = true
            // The send button appears/enables once there is text: look for it on the next frames.
            main.postDelayed({ pending?.let { if (it === p) tryStep(it) } }, 400)
            return
        }
        val send = findSend(root) ?: return
        if (send.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
            pending = null
            Hub.toast("Sent")
        }
    }

    private fun walk(n: AccessibilityNodeInfo?, out: MutableList<AccessibilityNodeInfo>) {
        if (n == null) return
        out += n
        for (i in 0 until n.childCount) walk(n.getChild(i), out)
    }

    private fun findInput(root: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        val all = mutableListOf<AccessibilityNodeInfo>().also { walk(root, it) }
        return all.firstOrNull { it.isEditable && it.isFocused } ?: all.lastOrNull { it.isEditable && it.isVisibleToUser }
    }

    private fun findSend(root: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        val all = mutableListOf<AccessibilityNodeInfo>().also { walk(root, it) }
        val rx = Regex("^(send|send message|send prompt|submit)$", RegexOption.IGNORE_CASE)
        fun label(n: AccessibilityNodeInfo) = (n.contentDescription ?: n.text ?: "").toString().trim()
        val hit = all.firstOrNull { it.isVisibleToUser && it.isEnabled && rx.matches(label(it)) }
            ?: all.firstOrNull { it.isVisibleToUser && it.isEnabled && (it.viewIdResourceName ?: "").contains("send", true) }
            ?: return null
        var n: AccessibilityNodeInfo? = hit
        while (n != null && !n.isClickable) n = n.parent
        return n
    }
}
