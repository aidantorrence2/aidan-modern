package com.aidantorrence.todos

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.text.InputType
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import java.text.DateFormat
import java.util.Date

/** Setup + status. The real UI is the bubble; this screen only gets it running. */
class MainActivity : Activity() {
    private val listener: () -> Unit = { render() }
    private fun dp(v: Int) = Ui.dp(this, v)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Game.init(this)
        window.statusBarColor = Ui.BG; window.navigationBarColor = Ui.BG
    }

    override fun onStart() {
        super.onStart(); Game.addListener(listener)
        if (Settings.canDrawOverlays(this)) BubbleService.start(this, BubbleService.ACTION_SYNC)
        render()
    }
    override fun onStop() { Game.removeListener(listener); super.onStop() }

    private fun render() {
        val body = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setBackgroundColor(Ui.BG)
            setPadding(dp(20), dp(36), dp(20), dp(24))
        }
        body.addView(Ui.text(this, "Todos", 30f, bold = true, serif = true))
        body.addView(Ui.text(this, "Today's top 10, built each morning from the last day of Claude and Codex output. Lives in a bubble on top of every app; tap it to play the deck.", 15f, Ui.DIM).apply {
            setPadding(0, dp(6), 0, dp(20))
        })

        if (Secrets.token(this) == null || Secrets.listKey(this) == null) setupForm(body)

        val overlay = Settings.canDrawOverlays(this)
        if (!overlay) {
            body.addView(Ui.text(this, "• Allow \"Display over other apps\" so the bubble can float.", 15f, Ui.AMBER))
            body.addView(Ui.button(this, "Allow", Ui.BG, Ui.TEXT) {
                startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
            }.apply { layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(10); bottomMargin = dp(10) } })
        } else {
            body.addView(Ui.row(this,
                Ui.weighted(Ui.button(this, "Show bubble", Ui.BG, Ui.GREEN) { BubbleService.start(this) }, 4),
                Ui.weighted(Ui.button(this, "Open deck", Ui.BG, Ui.TEXT) { BubbleService.start(this, BubbleService.ACTION_EXPAND); moveTaskToBack(true) }, 4),
            ))
            body.addView(Ui.row(this,
                Ui.weighted(Ui.button(this, "Sync now", Ui.DIM, Ui.CARD) { BubbleService.start(this, BubbleService.ACTION_SYNC) }, 4),
                Ui.weighted(Ui.button(this, "Hide bubble", Ui.DIM, Ui.CARD) { BubbleService.start(this, BubbleService.ACTION_HIDE) }, 4),
            ).apply { setPadding(0, dp(8), 0, 0) })
        }

        val list = Game.list
        val lines = mutableListOf<Pair<String, Int>>()
        lines += (if (Game.lastSync > 0) "Synced ${DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(Game.lastSync))}" else "Not synced yet") to Ui.FAINT
        Game.lastError?.let { lines += it to Ui.AMBER }
        if (list != null) lines += "List for ${list.date}: ${Game.total - Game.deck().size}/${Game.total} done · ★ ${Game.points} · 🔥 ${Game.streak}" to Ui.DIM
        for ((s, c) in lines) body.addView(Ui.text(this, s, 13f, c).apply { setPadding(0, dp(10), 0, 0) })

        if (list != null) {
            val done = Game.done
            body.addView(Ui.text(this, "TODAY", 11f, Ui.FAINT, bold = true).apply { setPadding(0, dp(24), 0, dp(6)) })
            for (t in list.items) body.addView(Ui.text(this, "${if (t.id in done) "✓" else "${t.rank}."}  ${t.title}", 15f, if (t.id in done) Ui.FAINT else Ui.TEXT).apply {
                setPadding(0, dp(5), 0, dp(5))
            })
        }
        setContentView(ScrollView(this).apply { setBackgroundColor(Ui.BG); addView(body) })
    }

    /** For a sideloaded APK (install-phone.sh does this over USB instead). */
    private fun setupForm(body: LinearLayout) {
        body.addView(Ui.text(this, "SET UP", 11f, Ui.AMBER, bold = true).apply { setPadding(0, 0, 0, dp(6)) })
        body.addView(Ui.text(this, "On the Mac, copy each value and paste it here:\n1. gh auth token | pbcopy\n2. pbcopy < ~/.config/aidan-todos/key   (made by tools/todos/install-mac.sh)", 13f, Ui.DIM))
        fun field(hint: String) = EditText(this).apply {
            this.hint = hint; setHintTextColor(Ui.FAINT); setTextColor(Ui.TEXT); textSize = 14f; isSingleLine = true
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            background = Ui.round(Ui.CARD, 10, this@MainActivity)
            setPadding(dp(12), dp(12), dp(12), dp(12))
            layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(10) }
        }
        val token = field(if (Secrets.token(this) != null) "GitHub token (saved)" else "GitHub token")
        val key = field(if (Secrets.listKey(this) != null) "List key (saved)" else "List key")
        val msg = Ui.text(this, "", 13f, Ui.AMBER)
        body.addView(token); body.addView(key)
        body.addView(Ui.button(this, "Save", Ui.BG, Ui.TEXT) {
            if (token.text.isNotBlank()) Secrets.setToken(this, token.text.toString())
            if (key.text.isNotBlank() && !Secrets.setListKey(this, key.text.toString())) { msg.text = "That key isn't valid: paste the whole line from the key file."; return@button }
            if (Secrets.token(this) == null || Secrets.listKey(this) == null) { msg.text = "Both are needed."; return@button }
            BubbleService.start(this, BubbleService.ACTION_SYNC); render()
        }.apply { layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(10) } })
        body.addView(msg)
        body.addView(android.view.View(this).apply { layoutParams = LinearLayout.LayoutParams(1, dp(24)) })
    }
}
