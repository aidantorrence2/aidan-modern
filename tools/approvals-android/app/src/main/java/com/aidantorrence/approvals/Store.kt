package com.aidantorrence.approvals

import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper

/** App state shared by the service and activities (main thread for reads/writes). */
object Store {
    var items: List<Item> = emptyList(); private set
    var lastSync: Long = 0; private set
    var lastError: String? = null
    private lateinit var prefs: SharedPreferences
    private val listeners = mutableListOf<() -> Unit>()
    private val main = Handler(Looper.getMainLooper())

    fun init(ctx: Context) {
        if (!::prefs.isInitialized) prefs = ctx.applicationContext.getSharedPreferences("state", Context.MODE_PRIVATE)
    }

    // --- persisted sets/maps ---
    private fun set(key: String): MutableSet<String> = prefs.getStringSet(key, emptySet())!!.toMutableSet()
    private fun putSet(key: String, v: Set<String>) = prefs.edit().putStringSet(key, v).apply()

    var pendingDecisions: Map<String, Decision>
        get() {
            val raw = prefs.getString("decisions", null) ?: return emptyMap()
            val o = JV.parse(raw) as? JV.Obj ?: return emptyMap()
            return o.members.associate { (id, v) -> id to Decision(v["status"]?.str ?: "", v["decided"]?.str ?: "", v["note"]?.str ?: "") }
        }
        set(m) {
            val o = JV.Obj(m.map { (id, d) ->
                id to (JV.Obj(mutableListOf("status" to JV.Str(d.status), "decided" to JV.Str(d.decided), "note" to JV.Str(d.note))) as JV)
            }.toMutableList())
            prefs.edit().putString("decisions", o.serialize()).apply()
        }

    var chimed: Set<String>
        get() = set("chimed")
        set(v) = putSet("chimed", v)

    /** Requests whose notification was swiped away: they come back, but silently. */
    var swiped: Set<String>
        get() = set("swiped")
        set(v) = putSet("swiped", v)

    fun snoozedUntil(id: String): Long = prefs.getLong("snooze:$id", 0)
    fun snooze(id: String, hours: Int = 4) =
        prefs.edit().putLong("snooze:$id", System.currentTimeMillis() + hours * 3_600_000L).apply()

    // --- derived ---
    /** Pending, not expired, not decided on this phone, not snoozed. Oldest first. */
    fun visible(): List<Item> {
        val decided = pendingDecisions.keys
        val now = System.currentTimeMillis()
        return items.filter { it.pending && it.id !in decided && snoozedUntil(it.id) < now }
            .sortedBy { it.created ?: 0 }
    }

    fun item(id: String) = items.firstOrNull { it.id == id }

    fun setItems(list: List<Item>) {
        items = list; lastSync = System.currentTimeMillis()
        val ids = list.map { it.id }.toSet()
        chimed = chimed.intersect(ids); swiped = swiped.intersect(ids)
        changed()
    }

    fun addListener(l: () -> Unit) { listeners.add(l) }
    fun removeListener(l: () -> Unit) { listeners.remove(l) }
    fun changed() = main.post { listeners.toList().forEach { it() } }
}
