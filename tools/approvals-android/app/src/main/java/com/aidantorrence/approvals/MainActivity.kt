package com.aidantorrence.approvals

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.ScrollView
import java.text.DateFormat
import java.util.Date

/** Inbox: setup status, then every waiting request as a card. */
class MainActivity : Activity(), Ui.CardActions {
    private val listener: () -> Unit = { render() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Store.init(this)
        window.statusBarColor = Ui.BG; window.navigationBarColor = Ui.BG
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
        render()
    }

    override fun onStart() {
        super.onStart(); Store.addListener(listener)
        ApprovalService.start(this, ApprovalService.ACTION_POLL)   // opening the app always refreshes
        render()
    }
    override fun onStop() { Store.removeListener(listener); super.onStop() }

    private fun render() {
        val body = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setBackgroundColor(Ui.BG)
            setPadding(dp(16), dp(28), dp(16), dp(24))
        }
        body.addView(Ui.row(this,
            Ui.text(this, "Approvals", 28f, bold = true), Ui.spacer(this),
            Ui.button(this, "Refresh", Ui.Style.QUIET) { ApprovalService.start(this, ApprovalService.ACTION_POLL) }))
        val status = mutableListOf<String>()
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) status += "Notifications are off."
        Store.lastError?.let { status += it }
        val synced = if (Store.lastSync > 0) "Synced ${DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(Store.lastSync))}" else "Not synced yet"
        body.addView(Ui.text(this, synced, 13f, Ui.FAINT).apply { setPadding(0, dp(4), 0, dp(8)) })
        for (s in status) body.addView(Ui.text(this, "• $s", 14f, 0xFFFFB454.toInt()).apply { setPadding(0, dp(2), 0, dp(2)) })

        val visible = Store.visible()
        body.addView(Ui.text(this, if (visible.isEmpty()) "Nothing waiting for you." else "${visible.size} waiting", 15f, Ui.DIM).apply {
            setPadding(0, dp(18), 0, dp(10)); if (visible.isEmpty()) gravity = Gravity.CENTER
        })
        for (item in visible) {
            body.addView(Ui.card(this, item, this, showClose = false).apply {
                layoutParams = LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(12) }
            })
        }
        setContentView(ScrollView(this).apply { setBackgroundColor(Ui.BG); addView(body) })
    }

    private fun send(action: String, item: Item) {
        startForegroundService(Intent(this, ApprovalService::class.java).setAction(action).putExtra(ApprovalService.EXTRA_ID, item.id))
    }

    override fun approve(item: Item) { send(ApprovalService.ACTION_APPROVE, item) }
    override fun deny(item: Item) { send(ApprovalService.ACTION_DENY, item) }
    override fun snooze(item: Item) { send(ApprovalService.ACTION_SNOOZE, item) }
    override fun close(item: Item) {}
    override fun review(item: Item) {
        startActivity(Intent(this, ReviewActivity::class.java).putExtra(ApprovalService.EXTRA_ID, item.id))
    }
}
