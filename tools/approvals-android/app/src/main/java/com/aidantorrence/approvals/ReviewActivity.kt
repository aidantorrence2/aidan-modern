package com.aidantorrence.approvals

import android.app.Activity
import android.content.Intent
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/** Full review of one request: what approving does, the exact content, links, note, decide. */
class ReviewActivity : Activity() {
    private var itemId: String? = null
    private val listener: () -> Unit = { render() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Store.init(this)
        window.statusBarColor = Ui.BG; window.navigationBarColor = Ui.BG
        itemId = intent.getStringExtra(ApprovalService.EXTRA_ID)
        render()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent); itemId = intent.getStringExtra(ApprovalService.EXTRA_ID); render()
    }

    override fun onStart() { super.onStart(); Store.addListener(listener) }
    override fun onStop() { Store.removeListener(listener); super.onStop() }
    override fun onResume() { super.onResume(); Store.reviewing = true }
    override fun onPause() { Store.reviewing = false; super.onPause() }

    private fun render() {
        val item = itemId?.let { Store.item(it) }
        val page = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setBackgroundColor(Ui.BG)
        }
        if (item == null) {
            page.addView(Ui.text(this, "This request is no longer in the queue.", 17f, Ui.DIM).apply {
                gravity = Gravity.CENTER; setPadding(dp(24), dp(80), dp(24), dp(24))
            })
            setContentView(page); return
        }
        val pres = Presentation(item)
        val body = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setPadding(dp(20), dp(28), dp(20), dp(24))
        }
        body.addView(Ui.text(this, pres.headline.uppercase(), 13f, Presentation.kindColor(item.kind), bold = true))
        body.addView(Ui.text(this, pres.displayTitle, 24f, bold = true).apply { setPadding(0, dp(6), 0, dp(6)) })
        body.addView(Ui.text(this, pres.consequence, 15f, Ui.DIM))
        val meta = listOfNotNull(
            item.created?.let { "Asked ${Presentation.age(it)}" },
            item.expires?.let {
                val m = ((it - System.currentTimeMillis()) / 60_000).coerceAtLeast(0)
                if (m < 120) "expires in ${m}m" else "expires in ${m / 60}h"
            },
            if (item.status != "pending") item.status.uppercase() else null,
        ).joinToString(" · ")
        body.addView(Ui.text(this, meta, 12f, Ui.FAINT).apply { setPadding(0, dp(6), 0, dp(16)) })

        if (pres.images.isNotEmpty()) {
            val img = ImageView(this).apply {
                adjustViewBounds = true; scaleType = ImageView.ScaleType.FIT_CENTER
                background = Ui.rounded(0x14FFFFFF, 12, this@ReviewActivity); clipToOutline = true
            }
            var idx = 0
            fun show() { Images.into(img, pres.images[idx].second, 1400) }
            show()
            if (pres.images.size > 1) {
                val tabs = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, 0, 0, dp(8)) }
                pres.images.forEachIndexed { i, (label, _) ->
                    tabs.addView(Ui.button(this, label, Ui.Style.QUIET) { idx = i; show() })
                    tabs.addView(Ui.gap(this, 6))
                }
                body.addView(tabs)
            }
            body.addView(img)
            body.addView(Ui.gap(this, 18))
        }
        pres.mainText?.let { (label, text) ->
            body.addView(section(label))
            body.addView(Ui.text(this, text, 16f).apply { setTextIsSelectable(true) })
        } ?: if (item.summary.isNotEmpty()) {
            body.addView(section("Summary")); body.addView(Ui.text(this, item.summary, 16f))
        } else Unit
        for ((label, url) in pres.links) {
            body.addView(section(label))
            body.addView(Ui.text(this, Presentation.shortUrl(url) + "  ↗", 15f, 0xFF6FB1FF.toInt()).apply {
                setOnClickListener { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
            })
        }
        if (pres.fields.isNotEmpty()) {
            body.addView(section("Details"))
            for ((label, value) in pres.fields) {
                body.addView(Ui.row(this,
                    Ui.text(this, label, 14f, Ui.FAINT).apply { layoutParams = LinearLayout.LayoutParams(dp(110), -2) },
                    Ui.text(this, value, 14f).apply { setTextIsSelectable(true); layoutParams = LinearLayout.LayoutParams(0, -2, 1f) },
                    gravity = Gravity.TOP).apply { setPadding(0, dp(3), 0, dp(3)) })
            }
        }
        body.addView(Ui.text(this, "Requested by ${item.source}  ·  ${item.id}", 12f, Ui.FAINT).apply { setPadding(0, dp(18), 0, dp(6)) })
        val raw = Ui.text(this, item.payload.serialize(), 11f, Ui.DIM).apply {
            typeface = Typeface.MONOSPACE; visibility = View.GONE; setTextIsSelectable(true)
            background = Ui.rounded(0x0FFFFFFF, 8, this@ReviewActivity); setPadding(dp(10), dp(10), dp(10), dp(10))
        }
        body.addView(Ui.text(this, "▸ Technical details", 13f, Ui.FAINT).apply {
            setPadding(0, dp(6), 0, dp(6))
            setOnClickListener { raw.visibility = if (raw.visibility == View.GONE) View.VISIBLE else View.GONE }
        })
        body.addView(raw)

        val scroll = ScrollView(this).apply { addView(body); layoutParams = LinearLayout.LayoutParams(-1, 0, 1f) }
        page.addView(scroll)

        if (item.status == "pending" && item.id !in Store.pendingDecisions) {
            val note = EditText(this).apply {
                hint = "Note for the agent (optional)"; setHintTextColor(Ui.FAINT); setTextColor(Ui.WHITE)
                inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
                background = Ui.rounded(0x14FFFFFF, 12, this@ReviewActivity)
                setPadding(dp(14), dp(12), dp(14), dp(12))
            }
            val bar = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL; setPadding(dp(16), dp(12), dp(16), dp(20))
                setBackgroundColor(0xFF141416.toInt())
            }
            bar.addView(note)
            bar.addView(Ui.row(this,
                Ui.button(this, "✕  Deny", Ui.Style.DANGER) { decide(item, "denied", note.text.toString()) }.apply {
                    layoutParams = LinearLayout.LayoutParams(0, -2, 1f) },
                Ui.gap(this, 10),
                Ui.button(this, "✓  Approve", Ui.Style.PRIMARY) { decide(item, "approved", note.text.toString()) }.apply {
                    layoutParams = LinearLayout.LayoutParams(0, -2, 1.4f) },
            ).apply { setPadding(0, dp(10), 0, 0) })
            page.addView(bar)
        }
        setContentView(page)
    }

    private fun section(title: String) = Ui.text(this, title.uppercase(), 12f, Ui.FAINT, bold = true).apply {
        setPadding(0, dp(16), 0, dp(6))
    }

    private fun decide(item: Item, status: String, note: String) {
        startForegroundService(Intent(this, ApprovalService::class.java).setAction(ApprovalService.ACTION_DECIDE)
            .putExtra(ApprovalService.EXTRA_ID, item.id).putExtra(ApprovalService.EXTRA_STATUS, status)
            .putExtra(ApprovalService.EXTRA_NOTE, note.trim()))
        finish()
    }
}
