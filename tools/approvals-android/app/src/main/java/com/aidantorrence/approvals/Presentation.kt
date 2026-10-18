package com.aidantorrence.approvals

/** Plain language for an item: what approving does, and the content that goes out. */
class Presentation(item: Item) {
    val headline: String
    val consequence: String
    val displayTitle: String
    val images = mutableListOf<Pair<String, String>>()   // label, url
    val links = mutableListOf<Pair<String, String>>()
    val fields = mutableListOf<Pair<String, String>>()
    var mainText: Pair<String, String>? = null

    init {
        val p = item.payload
        val agent = agentName(item.source)
        val channel = p["channel"]?.str?.let(::pretty) ?: ""
        val members = (p as? JV.Obj)?.members ?: emptyList()
        val mainKey = TEXT_KEYS.firstOrNull { k -> members.any { it.first == k && !it.second.str.isNullOrEmpty() } }
        mainKey?.let { k -> mainText = label(k) to members.first { it.first == k }.second.str!! }
        val seen = mutableSetOf<String>()
        for ((k, v) in members) {
            if (k == mainKey || k == "channel") continue
            when (v) {
                is JV.Str -> if (v.v.startsWith("http")) {
                    if (!seen.add(v.v)) continue
                    if (isImage(v.v)) images.add(label(k) to v.v) else links.add(label(k) to v.v)
                } else if (v.v.isNotEmpty()) fields.add(label(k) to v.v)
                is JV.Num -> fields.add(label(k) to v.raw)
                is JV.Bool -> fields.add(label(k) to if (v.v) "yes" else "no")
                is JV.Null -> {}
                else -> fields.add(label(k) to v.serialize())
            }
        }
        if (images.isEmpty() && item.previewUrl != null) images.add("Preview" to item.previewUrl)
        val to = p["to"]?.str
        val amount = (p["amount"] as? JV.Num)?.raw ?: p["amount"]?.str
        when (item.kind) {
            "post" -> {
                headline = if (channel.isEmpty()) "Publish a post" else "Post to $channel"
                consequence = "If you approve, $agent publishes this image and caption" +
                    (if (channel.isEmpty()) "" else " on $channel") + (if (p["story_image"] != null) " (feed and story)." else ".")
            }
            "email" -> {
                headline = to?.let { "Send email to $it" } ?: "Send an email"
                consequence = "If you approve, $agent sends this email exactly as written."
                fields.removeAll { it.first == "To" }
            }
            "spend" -> {
                headline = amount?.let { "Spend ${p["currency"]?.str ?: "$"}$it" } ?: "Spend money"
                consequence = "If you approve, $agent makes this payment."
                fields.removeAll { it.first == "Amount" || it.first == "Currency" }
            }
            "build" -> { headline = "Build / deploy"; consequence = "If you approve, $agent runs this build or deploy." }
            else -> { headline = item.title; consequence = "If you approve, $agent goes ahead with what is described below." }
        }
        val prefix = item.kind.lowercase() + ":"
        displayTitle = if (item.title.lowercase().startsWith(prefix)) item.title.drop(prefix.length).trim() else item.title
    }

    /** Card text: the real outgoing text without URLs (the card shows the link separately). */
    fun cardText(item: Item): String {
        var t = mainText?.second ?: item.summary
        t = t.replace(Regex("\\(link in bio\\)", RegexOption.IGNORE_CASE), "")
        t = t.replace(Regex("(https?://)?[A-Za-z0-9.-]+\\.(io|com|org|net|app|dev|co)(/\\S*)?"), "")
        return t.replace(Regex("\\s{2,}"), " ").trim()
    }

    companion object {
        val TEXT_KEYS = listOf("caption", "body", "message", "text", "content", "description", "draft")
        fun agentName(source: String): String {
            val parts = source.split(":", limit = 2)
            val base = pretty(parts[0])
            return if (parts.size > 1) "$base (${parts[1]})" else base
        }
        fun pretty(s: String) = when (s.lowercase()) {
            "instagram" -> "Instagram"; "tiktok" -> "TikTok"; "linkedin" -> "LinkedIn"
            "x", "twitter" -> "X"; "claude" -> "Claude"; "codex" -> "Codex"
            else -> s.replaceFirstChar { it.uppercase() }
        }
        fun label(key: String) = when (key) {
            "image" -> "Feed image"; "story_image" -> "Story image"; "link", "url" -> "Link"
            else -> key.replace('_', ' ').replace('-', ' ').replaceFirstChar { it.uppercase() }
        }
        fun isImage(url: String) = url.substringBefore('?').substringAfterLast('.').lowercase() in
            setOf("png", "jpg", "jpeg", "gif", "webp", "heic")
        fun shortUrl(url: String): String {
            var s = url.removePrefix("https://").removePrefix("http://").removePrefix("www.")
            s = s.substringBefore('?'); return s.trimEnd('/')
        }
        fun age(ms: Long?): String {
            if (ms == null) return ""
            val s = (System.currentTimeMillis() - ms) / 1000
            return when { s < 60 -> "now"; s < 3600 -> "${s / 60}m ago"; s < 86400 -> "${s / 3600}h ago"; else -> "${s / 86400}d ago" }
        }
        fun kindColor(kind: String) = when (kind) {
            "post" -> 0xFF9E73FF.toInt(); "email" -> 0xFF4D9EFF.toInt(); "spend" -> 0xFFFF9E33.toInt()
            "build" -> 0xFF40CCB3.toInt(); else -> 0xFFA6A6A6.toInt()
        }
    }
}
