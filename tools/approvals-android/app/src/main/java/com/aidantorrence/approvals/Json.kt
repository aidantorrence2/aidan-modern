package com.aidantorrence.approvals

/**
 * Order-preserving JSON tree. The queue file is written by Node (JSON.stringify(x, null, 2)), the
 * Mac app and other agents; parsing and re-serializing an untouched file gives the same bytes, so a
 * decision commit changes only the fields we set. (org.json would rewrite every "/" as "\/".)
 */
sealed class JV {
    object Null : JV()
    data class Bool(val v: Boolean) : JV()
    data class Num(val raw: String) : JV()
    data class Str(val v: String) : JV()
    data class Arr(val items: MutableList<JV>) : JV()
    data class Obj(val members: MutableList<Pair<String, JV>>) : JV() {
        override operator fun get(key: String): JV? = members.firstOrNull { it.first == key }?.second
        operator fun set(key: String, value: JV) {
            val i = members.indexOfFirst { it.first == key }
            if (i >= 0) members[i] = key to value else members.add(key to value)
        }
    }

    val str: String? get() = (this as? Str)?.v
    open operator fun get(key: String): JV? = null

    fun serialize(): String = StringBuilder().also { write(it, 0) }.toString()

    private fun write(sb: StringBuilder, level: Int) {
        fun pad(l: Int) = "  ".repeat(l)
        when (this) {
            is Null -> sb.append("null")
            is Bool -> sb.append(if (v) "true" else "false")
            is Num -> sb.append(raw)
            is Str -> sb.append(quote(v))
            is Arr -> if (items.isEmpty()) sb.append("[]") else {
                sb.append("[\n")
                items.forEachIndexed { i, v ->
                    sb.append(pad(level + 1)); v.write(sb, level + 1)
                    if (i < items.size - 1) sb.append(','); sb.append('\n')
                }
                sb.append(pad(level)).append(']')
            }
            is Obj -> if (members.isEmpty()) sb.append("{}") else {
                sb.append("{\n")
                members.forEachIndexed { i, (k, v) ->
                    sb.append(pad(level + 1)).append(quote(k)).append(": "); v.write(sb, level + 1)
                    if (i < members.size - 1) sb.append(','); sb.append('\n')
                }
                sb.append(pad(level)).append('}')
            }
        }
    }

    companion object {
        fun quote(s: String): String {
            val sb = StringBuilder("\"")
            for (c in s) when (c) {
                '"' -> sb.append("\\\"")
                '\\' -> sb.append("\\\\")
                '\n' -> sb.append("\\n")
                '\r' -> sb.append("\\r")
                '\t' -> sb.append("\\t")
                '\b' -> sb.append("\\b")
                '\u000C' -> sb.append("\\f")
                else -> if (c < ' ') sb.append(String.format("\\u%04x", c.code)) else sb.append(c)
            }
            return sb.append('"').toString()
        }

        fun parse(text: String): JV {
            val p = Parser(text)
            p.ws(); val v = p.value(); p.ws()
            if (p.i != text.length) throw IllegalArgumentException("trailing characters at ${p.i}")
            return v
        }
    }

    private class Parser(val s: String) {
        var i = 0
        fun ws() { while (i < s.length && s[i] in " \n\r\t") i++ }
        fun fail(m: String): Nothing = throw IllegalArgumentException("JSON: $m at $i")
        fun value(): JV {
            if (i >= s.length) fail("unexpected end")
            return when (s[i]) {
                '{' -> obj()
                '[' -> arr()
                '"' -> Str(string())
                't' -> { expect("true"); Bool(true) }
                'f' -> { expect("false"); Bool(false) }
                'n' -> { expect("null"); Null }
                else -> num()
            }
        }
        fun expect(w: String) { if (!s.startsWith(w, i)) fail("expected $w"); i += w.length }
        fun num(): JV {
            val start = i
            while (i < s.length && s[i] in "+-0123456789.eE") i++
            if (i == start) fail("unexpected character")
            val raw = s.substring(start, i)
            raw.toDoubleOrNull() ?: fail("bad number $raw")
            return Num(raw)
        }
        fun string(): String {
            i++
            val sb = StringBuilder()
            while (i < s.length) {
                val c = s[i++]
                if (c == '"') return sb.toString()
                if (c != '\\') { sb.append(c); continue }
                if (i >= s.length) break
                when (val e = s[i++]) {
                    '"' -> sb.append('"'); '\\' -> sb.append('\\'); '/' -> sb.append('/')
                    'b' -> sb.append('\b'); 'f' -> sb.append('\u000C'); 'n' -> sb.append('\n')
                    'r' -> sb.append('\r'); 't' -> sb.append('\t')
                    'u' -> { if (i + 4 > s.length) fail("bad \\u"); sb.append(s.substring(i, i + 4).toInt(16).toChar()); i += 4 }
                    else -> fail("bad escape \\$e")
                }
            }
            fail("unterminated string")
        }
        fun arr(): JV {
            i++; val items = mutableListOf<JV>(); ws()
            if (i < s.length && s[i] == ']') { i++; return Arr(items) }
            while (true) {
                ws(); items.add(value()); ws()
                if (i >= s.length) fail("unterminated array")
                when (s[i++]) { ',' -> continue; ']' -> return Arr(items); else -> fail("expected , or ]") }
            }
        }
        fun obj(): JV {
            i++; val m = mutableListOf<Pair<String, JV>>(); ws()
            if (i < s.length && s[i] == '}') { i++; return Obj(m) }
            while (true) {
                ws(); if (i >= s.length || s[i] != '"') fail("expected key")
                val k = string(); ws()
                if (i >= s.length || s[i] != ':') fail("expected :"); i++; ws()
                m.add(k to value()); ws()
                if (i >= s.length) fail("unterminated object")
                when (s[i++]) { ',' -> continue; '}' -> return Obj(m); else -> fail("expected , or }") }
            }
        }
    }
}
