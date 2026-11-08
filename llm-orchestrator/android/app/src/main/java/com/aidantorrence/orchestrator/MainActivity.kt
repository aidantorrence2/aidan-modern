package com.aidantorrence.orchestrator

import android.Manifest
import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.aidantorrence.orchestrator.Ui.dp

/** Setup (relay, permissions, bubble) on top; the same Inbox/Tasks panel as the overlay below. */
class MainActivity : Activity() {

    private lateinit var panel: PanelView
    private lateinit var setup: LinearLayout
    private lateinit var permsBox: LinearLayout
    private lateinit var bubbleBtn: TextView
    private lateinit var testResult: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Hub.init(this)
        Hub.startSync()
        window.statusBarColor = Ui.BG
        window.navigationBarColor = Ui.BG
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Ui.BG)
            setPadding(dp(12), dp(28), dp(12), dp(12))
            fitsSystemWindows = true
        }

        val top = Ui.row(this, 8)
        top.addView(Ui.text(this, "LLM Orchestrator", 20f, Ui.TEXT, bold = true, serif = true), Ui.lp(0, Ui.WRAP, 1f))
        bubbleBtn = Ui.button(this, "", primary = true) { toggleBubble() }
        top.addView(bubbleBtn)
        top.addView(Ui.button(this, "⚙") { setup.visibility = if (setup.visibility == View.VISIBLE) View.GONE else View.VISIBLE })
        root.addView(top, Ui.lp())

        setup = buildSetup()
        root.addView(ScrollView(this).apply { addView(setup) }, Ui.lp().apply { topMargin = dp(8) })
        setup.visibility = if (Store.relayConfigured && Settings.canDrawOverlays(this)) View.GONE else View.VISIBLE

        panel = PanelView(this)
        root.addView(panel, Ui.lp(Ui.MATCH, 0, 1f).apply { topMargin = dp(10) })
        setContentView(root)
        panel.showItem(intent?.getStringExtra("itemId"))
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        panel.showItem(intent.getStringExtra("itemId"))
    }

    override fun onResume() {
        super.onResume()
        refreshSetup()
        if (Store.overlayEnabled && !OverlayService.running) OverlayService.start(this)
    }

    private fun buildSetup(): LinearLayout {
        val box = Ui.column(this, 8).apply {
            background = Ui.rounded(context, Ui.CARD, 14, Ui.LINE)
            setPadding(dp(12), dp(12), dp(12), dp(12))
        }
        box.addView(Ui.text(this, "Relay", 13f, Ui.ACCENT, bold = true))
        box.addView(Ui.text(this, "Claude Code (local + cloud) and Codex report completions to your relay server. See llm-orchestrator/README.md.", 12f, Ui.MUTED))
        val url = Ui.input(this, "https://your-relay.example.com").apply { setText(Store.relayUrl) }
        val token = Ui.input(this, "Relay token (ORCH_TOKEN)").apply {
            setText(Store.token)
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        box.addView(url, Ui.lp())
        box.addView(token, Ui.lp())
        testResult = Ui.text(this, "", 12f, Ui.MUTED)
        val saveRow = Ui.row(this, 8)
        saveRow.addView(Ui.button(this, "Save & test", primary = true) {
            Store.relayUrl = url.text.toString()
            Store.token = token.text.toString()
            testResult.text = "Testing…"
            Hub.restartSync()
            Hub.bg {
                val ok = RelayClient.health()
                Hub.ui {
                    testResult.text = if (ok) "✓ Relay reachable" else "✗ Couldn't reach the relay with that token"
                    testResult.setTextColor(if (ok) Ui.GOOD else Ui.BAD)
                }
            }
        })
        saveRow.addView(testResult)
        box.addView(saveRow)

        box.addView(Ui.text(this, "Phone apps", 13f, Ui.ACCENT, bold = true).apply { setPadding(0, dp(8), 0, 0) })
        box.addView(Ui.text(this, "With notification access, completions from ChatGPT, Codex and the Claude app (incl. Claude Code on the web) are captured too. Add other app package names below (comma separated).", 12f, Ui.MUTED))
        val extra = Ui.input(this, "e.g. com.google.android.apps.bard").apply { setText(Store.extraPackages) }
        extra.setOnFocusChangeListener { _, has -> if (!has) Store.extraPackages = extra.text.toString() }
        box.addView(extra, Ui.lp())

        box.addView(Ui.text(this, "Permissions", 13f, Ui.ACCENT, bold = true).apply { setPadding(0, dp(8), 0, 0) })
        permsBox = Ui.column(this, 6)
        box.addView(permsBox, Ui.lp())
        return box
    }

    private fun refreshSetup() {
        permsBox.removeAllViews()
        permRow("Draw over other apps (floating bubble)", Settings.canDrawOverlays(this)) {
            startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
        }
        permRow("Notification access (ChatGPT / Claude apps)", hasListenerAccess()) {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }
        if (Build.VERSION.SDK_INT >= 33) {
            permRow("Post alerts", checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
                requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
            }
        }
        bubbleBtn.text = if (OverlayService.running) "Hide bubble" else "Float"
    }

    private fun permRow(label: String, granted: Boolean, grant: () -> Unit) {
        val row = Ui.row(this, 8)
        row.addView(Ui.text(this, (if (granted) "✓ " else "• ") + label, 13f, if (granted) Ui.GOOD else Ui.TEXT), Ui.lp(0, Ui.WRAP, 1f))
        if (!granted) row.addView(Ui.button(this, "Grant") { grant() })
        permsBox.addView(row, Ui.lp())
    }

    private fun hasListenerAccess(): Boolean {
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners") ?: return false
        val me = ComponentName(this, LlmNotificationListener::class.java)
        return flat.split(':').any { ComponentName.unflattenFromString(it) == me }
    }

    private fun toggleBubble() {
        if (OverlayService.running) {
            Store.overlayEnabled = false
            OverlayService.stop(this)
            bubbleBtn.postDelayed({ refreshSetup() }, 300)
            return
        }
        if (!Settings.canDrawOverlays(this)) {
            Hub.toast("Allow \"Draw over other apps\" first")
            startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
            return
        }
        Store.overlayEnabled = true
        OverlayService.start(this)
        bubbleBtn.postDelayed({ refreshSetup() }, 300)
        moveTaskToBack(true)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        refreshSetup()
    }
}
