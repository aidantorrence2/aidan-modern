package com.aidantorrence.todos

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
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
        body.addView(Ui.text(this, "Your goals as fill-in-the-blank cards, refreshed each morning. Lives in a bubble on top of every app; tap it to study.", 15f, Ui.DIM).apply {
            setPadding(0, dp(6), 0, dp(20))
        })

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
        if (list != null) lines += "${Game.total} cards · ${Game.counts().first} new" to Ui.DIM
        for ((s, c) in lines) body.addView(Ui.text(this, s, 13f, c).apply { setPadding(0, dp(10), 0, 0) })

        if (list != null) {
            val done = Game.done
            body.addView(Ui.text(this, "GOALS", 11f, Ui.FAINT, bold = true).apply { setPadding(0, dp(24), 0, dp(6)) })
            for (t in list.items.filter { it.rank < 90 }.distinctBy { it.task }.sortedBy { it.rank }) body.addView(Ui.text(this, "${if (t.id in done) "✓" else "${t.rank}."}  ${t.title}", 15f, if (t.id in done) Ui.FAINT else Ui.TEXT).apply {
                setPadding(0, dp(5), 0, dp(5))
            })
        }
        setContentView(ScrollView(this).apply { setBackgroundColor(Ui.BG); addView(body) })
    }
}
