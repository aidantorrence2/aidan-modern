package com.aidantorrence.orchestrator

import android.annotation.SuppressLint
import android.content.Context
import android.text.Editable
import android.text.TextUtils
import android.text.TextWatcher
import android.view.Gravity
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.CheckBox
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.aidantorrence.orchestrator.Ui.dp

/**
 * The orchestrator UI: Inbox (completions with a drafted reply ready to send) and Tasks.
 * Used both inside the always-on-top overlay window and in MainActivity.
 */
@SuppressLint("ViewConstructor")
class PanelView(
    ctx: Context,
    private val onMinimize: (() -> Unit)? = null,
    /** Overlay windows must be made focusable before the keyboard can appear. */
    private val onWantsKeyboard: ((Boolean) -> Unit)? = null,
) : LinearLayout(ctx) {

    private var tab = "inbox"
    private val inboxTab: TextView
    private val tasksTab: TextView
    private val status: TextView
    private val focus: TextView
    private val body = Ui.column(ctx, 10)
    private val scroll = ScrollView(ctx)
    private val cards = mutableMapOf<String, InboxCard>()
    private val listener: () -> Unit = { refresh() }
    private var expandedId: String? = null

    init {
        orientation = VERTICAL
        background = Ui.rounded(ctx, Ui.BG, 18, Ui.LINE)
        setPadding(dp(12), dp(10), dp(12), dp(12))

        val header = Ui.row(ctx, 8)
        header.addView(Ui.text(ctx, "Orchestrator", 17f, Ui.TEXT, bold = true, serif = true))
        inboxTab = Ui.chip(ctx, "Inbox", Ui.ACCENT) { tab = "inbox"; rebuild() }
        tasksTab = Ui.chip(ctx, "Tasks", Ui.MUTED) { tab = "tasks"; rebuild() }
        header.addView(inboxTab)
        header.addView(tasksTab)
        header.addView(Ui.spacer(ctx))
        if (onMinimize != null) {
            header.addView(Ui.text(ctx, "—", 20f, Ui.MUTED).apply {
                setPadding(dp(12), 0, dp(4), 0)
                setOnClickListener { hideKeyboard(); onMinimize.invoke() }
            })
        }
        addView(header, Ui.lp())

        status = Ui.text(ctx, "", 11f, Ui.MUTED)
        addView(status, Ui.lp().apply { topMargin = dp(4) })
        focus = Ui.text(ctx, "", 12f, Ui.ACCENT).apply { maxLines = 1; ellipsize = TextUtils.TruncateAt.END }
        addView(focus, Ui.lp().apply { topMargin = dp(2) })

        scroll.isFillViewport = true
        scroll.addView(body, FrameLayout.LayoutParams(Ui.MATCH, Ui.WRAP))
        addView(scroll, Ui.lp(Ui.MATCH, 0, 1f).apply { topMargin = dp(8) })
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Store.addListener(listener)
        rebuild()
    }

    override fun onDetachedFromWindow() {
        Store.removeListener(listener)
        super.onDetachedFromWindow()
    }

    fun showItem(id: String?) {
        if (id == null) return
        tab = "inbox"; expandedId = id
        rebuild()
    }

    private fun refresh() {
        val pending = Store.pending()
        inboxTab.text = if (pending.isEmpty()) "Inbox" else "Inbox ${pending.size}"
        val open = Store.openTasks()
        tasksTab.text = if (open.isEmpty()) "Tasks" else "Tasks ${open.size}"
        inboxTab.setTextColor(if (tab == "inbox") Ui.ACCENT else Ui.MUTED)
        inboxTab.background = Ui.rounded(context, 0, 14, if (tab == "inbox") Ui.ACCENT else Ui.LINE)
        tasksTab.setTextColor(if (tab == "tasks") Ui.ACCENT else Ui.MUTED)
        tasksTab.background = Ui.rounded(context, 0, 14, if (tab == "tasks") Ui.ACCENT else Ui.LINE)
        status.text = Hub.relayStatus + if (Hub.bridgeStatus.isNotBlank()) "  ·  ${Hub.bridgeStatus}" else ""
        status.setTextColor(if (Hub.relayStatus == "Connected") Ui.GOOD else Ui.MUTED)
        focus.text = open.firstOrNull()?.let { "Focus → ${it.title}" } ?: ""
        focus.visibility = if (open.isEmpty()) GONE else VISIBLE

        if (tab == "inbox") refreshInbox() else rebuildTasks()
    }

    private fun rebuild() {
        body.removeAllViews()
        cards.clear()
        refresh()
    }

    // ------------------------------------------------------------------ inbox

    private var inboxKeys = emptyList<String>()

    private fun refreshInbox() {
        val pending = Store.pending()
        val recent = Store.recent(8)
        val keys = pending.map { it.id } + listOf("--recent") + recent.map { "r:" + it.id + it.delivery }
        if (keys != inboxKeys || body.childCount == 0) {
            inboxKeys = keys
            body.removeAllViews()
            if (pending.isEmpty()) {
                body.addView(Ui.text(context, "All caught up. Completions from Claude Code, Codex, ChatGPT and Claude will land here with a drafted reply.", 13f, Ui.MUTED).apply {
                    setPadding(dp(4), dp(16), dp(4), dp(16))
                })
            }
            for (item in pending) {
                val card = cards.getOrPut(item.id) { InboxCard(item.id) }
                (card.view.parent as? LinearLayout)?.removeView(card.view)
                body.addView(card.view, Ui.lp())
            }
            cards.keys.retainAll(pending.map { it.id }.toSet())
            if (recent.isNotEmpty()) {
                body.addView(Ui.text(context, "Recent", 12f, Ui.MUTED, bold = true).apply { setPadding(dp(4), dp(10), 0, 0) })
                recent.forEach { body.addView(recentRow(it), Ui.lp()) }
            }
        }
        pending.forEach { cards[it.id]?.bind(it) }
    }

    private fun recentRow(item: InboxItem): View {
        val col = Ui.column(context, 2).apply { setPadding(dp(4), dp(2), dp(4), dp(2)); alpha = 0.7f }
        val top = Ui.row(context)
        top.addView(Ui.text(context, Hub.label(item.source), 11f, Ui.sourceColor(item.source), bold = true))
        top.addView(Ui.text(context, item.title, 12f, Ui.TEXT).apply {
            maxLines = 1; ellipsize = TextUtils.TruncateAt.END
        }, Ui.lp(0, Ui.WRAP, 1f))
        top.addView(Ui.text(context, Ui.ago(item.ts), 11f, Ui.MUTED))
        col.addView(top)
        val line = when (item.status) {
            "dismissed" -> "dismissed"
            else -> "↳ ${item.reply}" + (if (item.delivery.isNotBlank()) "  · ${deliveryLabel(item.delivery)}" else "")
        }
        col.addView(Ui.text(context, line, 12f, Ui.MUTED).apply { maxLines = 2; ellipsize = TextUtils.TruncateAt.END })
        return col
    }

    private fun deliveryLabel(d: String) = when (d) {
        "queued" -> "queued"
        "hook" -> "delivered live"
        "bridge" -> "resumed by bridge"
        "notification" -> "sent via app"
        "clipboard" -> "copied"
        "next-turn" -> "copied (session idle)"
        "manual" -> "copied"
        "failed" -> "send failed"
        else -> d
    }

    private inner class InboxCard(val id: String) {
        val view = Ui.column(context, 8)
        private val source = Ui.text(context, "", 11f, Ui.MUTED, bold = true)
        private val title = Ui.text(context, "", 14f, Ui.TEXT, bold = true).apply { maxLines = 2; ellipsize = TextUtils.TruncateAt.END }
        private val age = Ui.text(context, "", 11f, Ui.MUTED)
        private val prompt = Ui.text(context, "", 12f, Ui.MUTED).apply { maxLines = 1; ellipsize = TextUtils.TruncateAt.END }
        private val note = Ui.text(context, "", 12f, Ui.BAD)
        private val response = Ui.text(context, "", 13f, Ui.TEXT).apply { maxLines = 6; ellipsize = TextUtils.TruncateAt.END }
        private val edit = Ui.input(context, "Reply…", multiLine = true)
        private val alts = Ui.row(context, 6)
        private val sendBtn: TextView
        private var expanded = false
        private var binding = false

        init {
            view.background = Ui.rounded(context, Ui.CARD, 14, Ui.LINE)
            view.setPadding(dp(12), dp(10), dp(12), dp(10))
            val top = Ui.row(context, 8)
            top.addView(source)
            top.addView(title, Ui.lp(0, Ui.WRAP, 1f))
            top.addView(age)
            view.addView(top)
            view.addView(prompt)
            view.addView(note)
            view.addView(response)
            response.setOnClickListener {
                expanded = !expanded
                response.maxLines = if (expanded) Int.MAX_VALUE else 6
            }
            edit.imeOptions = EditorInfo.IME_FLAG_NO_EXTRACT_UI
            edit.setOnFocusChangeListener { _, has -> if (has) onWantsKeyboard?.invoke(true) }
            edit.setOnClickListener { onWantsKeyboard?.invoke(true) }
            edit.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
                override fun onTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    if (binding) return
                    val item = Store.item(id) ?: return
                    val t = s?.toString().orEmpty()
                    item.draft = if (t == item.suggestion) null else t
                }
            })
            view.addView(edit, Ui.lp())
            view.addView(HorizontalScrollView(context).apply {
                isHorizontalScrollBarEnabled = false
                addView(alts)
            })

            val actions = Ui.row(context, 6)
            sendBtn = Ui.button(context, "Send", primary = true) { send() }
            actions.addView(sendBtn)
            actions.addView(Ui.button(context, "✨ Draft") { regenerate() })
            actions.addView(Ui.button(context, "Open") { Store.item(id)?.let { Hub.open(it) } })
            actions.addView(Ui.button(context, "+Task") { toTask() })
            actions.addView(Ui.spacer(context))
            actions.addView(Ui.button(context, "✕") { Store.item(id)?.let { Hub.dismiss(it) } })
            view.addView(HorizontalScrollView(context).apply {
                isHorizontalScrollBarEnabled = false
                addView(actions)
            })
        }

        fun bind(item: InboxItem) {
            binding = true
            source.text = Hub.label(item.source)
            source.setTextColor(Ui.sourceColor(item.source))
            title.text = item.title.ifBlank { item.sessionId.take(12) }
            age.text = Ui.ago(item.ts)
            prompt.text = if (item.prompt.isNotBlank()) "You: ${item.prompt.replace(Regex("\\s+"), " ")}" else ""
            prompt.visibility = if (item.prompt.isBlank()) GONE else VISIBLE
            note.text = item.note
            note.visibility = if (item.note.isBlank()) GONE else VISIBLE
            if (response.text.toString() != item.text) response.text = item.text.ifBlank { "(no text in the completion)" }
            if (expandedId == item.id) { expanded = true; response.maxLines = Int.MAX_VALUE; expandedId = null }

            val want = item.draft ?: item.suggestion
            val canFill = !edit.hasFocus() || (item.draft == null && edit.text.isEmpty())
            if (canFill && edit.text.toString() != want) {
                edit.setText(want)
            }
            edit.hint = if (item.suggesting) "Drafting a reply…" else "Reply…"
            sendBtn.text = when {
                item.origin == "device" && item.replyMode == "device" -> "Send"
                (item.origin == "device" || item.replyMode == "none") && Hub.appPackage(item) != null && AutoSendService.connected -> "Send"
                item.origin == "device" || item.replyMode == "none" -> "Copy & open"
                else -> "Send"
            }

            alts.removeAllViews()
            if (item.suggesting) alts.addView(Ui.chip(context, "drafting…", Ui.MUTED))
            for (a in item.alternatives) {
                alts.addView(Ui.chip(context, a, Ui.ACCENT) {
                    edit.setText(a); edit.setSelection(a.length)
                    item.draft = a
                })
            }
            if (item.suggestion.isNotBlank() && item.draft != null) {
                alts.addView(Ui.chip(context, "↺ suggestion", Ui.MUTED) {
                    item.draft = null
                    edit.setText(item.suggestion)
                })
            }
            binding = false
        }

        private fun send() {
            val item = Store.item(id) ?: return
            hideKeyboard()
            Hub.send(item, edit.text.toString())
        }

        private fun regenerate() {
            val item = Store.item(id) ?: return
            // Whatever you typed (if it differs from the suggestion) steers the new draft.
            val hint = item.draft?.takeIf { it.isNotBlank() } ?: ""
            edit.clearFocus()
            Hub.requestSuggestion(item, hint)
        }

        private fun toTask() {
            val item = Store.item(id) ?: return
            Hub.addTask("Follow up: ${item.title.ifBlank { Hub.label(item.source) }}".take(120), 2, item.text.take(300))
            Hub.toast("Added to tasks")
        }
    }

    // ------------------------------------------------------------------ tasks

    private var newPriority = 1

    private fun rebuildTasks() {
        // Keep the "new task" input alive while typing.
        val existingInput = body.findViewWithTag<EditText>("newTask")
        val typed = existingInput?.text?.toString().orEmpty()
        val hadFocus = existingInput?.hasFocus() == true
        body.removeAllViews()
        inboxKeys = emptyList()

        val addRow = Ui.row(context, 6)
        val input = Ui.input(context, "Add a top task…").apply {
            tag = "newTask"
            setText(typed)
            imeOptions = EditorInfo.IME_ACTION_DONE or EditorInfo.IME_FLAG_NO_EXTRACT_UI
            setOnFocusChangeListener { _, has -> if (has) onWantsKeyboard?.invoke(true) }
            setOnClickListener { onWantsKeyboard?.invoke(true) }
        }
        val prio = Ui.chip(context, "P$newPriority", Ui.ACCENT)
        prio.setOnClickListener { newPriority = newPriority % 3 + 1; prio.text = "P$newPriority" }
        val add = {
            val t = input.text.toString()
            if (t.isNotBlank()) { input.setText(""); Hub.addTask(t, newPriority) }
        }
        input.setOnEditorActionListener { _, _, _ -> add(); true }
        addRow.addView(input, Ui.lp(0, Ui.WRAP, 1f))
        addRow.addView(prio)
        addRow.addView(Ui.button(context, "Add", primary = true) { add() })
        body.addView(addRow, Ui.lp())
        if (hadFocus) input.post { input.requestFocus(); input.setSelection(input.text.length) }

        val open = Store.openTasks()
        if (open.isEmpty()) body.addView(Ui.text(context, "No open tasks. Your top tasks steer the drafted replies.", 13f, Ui.MUTED).apply {
            setPadding(dp(4), dp(8), dp(4), dp(8))
        })
        open.forEachIndexed { i, t -> body.addView(taskRow(t, i), Ui.lp()) }

        val done = Store.doneTasks()
        if (done.isNotEmpty()) {
            val hdr = Ui.row(context)
            hdr.addView(Ui.text(context, "Done (${done.size})", 12f, Ui.MUTED, bold = true), Ui.lp(0, Ui.WRAP, 1f))
            hdr.addView(Ui.chip(context, "Clear", Ui.MUTED) { Store.tasks.removeAll { it.done }; Hub.tasksChanged() })
            body.addView(hdr, Ui.lp())
            done.take(10).forEach { body.addView(taskRow(it, -1), Ui.lp()) }
        }
    }

    private fun taskRow(t: Task, index: Int): View {
        val row = Ui.row(context, 8).apply {
            background = Ui.rounded(context, if (index == 0) Ui.CARD_HI else Ui.CARD, 12, if (index == 0) Ui.ACCENT else Ui.LINE)
            setPadding(dp(6), dp(4), dp(10), dp(4))
            alpha = if (t.done) 0.55f else 1f
        }
        row.addView(CheckBox(context).apply {
            isChecked = t.done
            buttonTintList = android.content.res.ColorStateList.valueOf(Ui.ACCENT)
            setOnCheckedChangeListener { _, c -> t.done = c; Hub.tasksChanged() }
        })
        row.addView(Ui.chip(context, "P${t.priority}", if (t.priority == 1) Ui.ACCENT else Ui.MUTED) {
            t.priority = t.priority % 3 + 1; Hub.tasksChanged()
        })
        val col = Ui.column(context, 0)
        col.addView(Ui.text(context, t.title, 14f, Ui.TEXT))
        if (t.notes.isNotBlank()) col.addView(Ui.text(context, t.notes, 11f, Ui.MUTED).apply {
            maxLines = 2; ellipsize = TextUtils.TruncateAt.END
        })
        row.addView(col, Ui.lp(0, Ui.WRAP, 1f))
        if (index > 0) row.addView(Ui.text(context, "↑", 16f, Ui.MUTED).apply {
            setPadding(dp(6), 0, dp(6), 0)
            setOnClickListener {
                // Promote: take the priority of the task above and move ahead of it.
                val above = Store.openTasks()[index - 1]
                t.priority = above.priority
                Store.tasks.remove(t); Store.tasks.add(Store.tasks.indexOf(above).coerceAtLeast(0), t)
                Hub.tasksChanged()
            }
        })
        row.addView(Ui.text(context, "✕", 14f, Ui.MUTED).apply {
            gravity = Gravity.CENTER
            setPadding(dp(6), 0, 0, 0)
            setOnClickListener { Store.tasks.remove(t); Hub.tasksChanged() }
        })
        return row
    }

    private fun hideKeyboard() {
        findFocus()?.clearFocus()
        val imm = context.getSystemService(android.view.inputmethod.InputMethodManager::class.java)
        imm?.hideSoftInputFromWindow(windowToken, 0)
        onWantsKeyboard?.invoke(false)
    }
}
