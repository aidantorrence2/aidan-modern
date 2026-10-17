package com.aidantorrence.syncreader

/** One whitespace-delimited token and where it sits in the full text. */
class Word(val text: String, val start: Int, val end: Int, val paragraph: Int)

/** A run of words spoken as a single text-to-speech utterance. [endWord] is exclusive. */
class Chunk(val index: Int, val firstWord: Int, val endWord: Int)

/**
 * Immutable, pre-indexed view of the text being read: words with character offsets,
 * paragraph ranges, and the utterance chunks the speech engine will be fed.
 */
class Document(val text: String) {
    val words: List<Word>
    val paragraphs: List<IntRange>
    val chunks: List<Chunk>
    private val chunkOfWord: IntArray

    init {
        val ws = ArrayList<Word>()
        var prevEnd = 0
        var para = 0
        for (m in WORD.findAll(text)) {
            val s = m.range.first
            val e = m.range.last + 1
            if (ws.isNotEmpty() && text.substring(prevEnd, s).contains('\n')) para++
            ws.add(Word(m.value, s, e, para))
            prevEnd = e
        }
        words = ws

        val ps = ArrayList<IntRange>()
        var pStart = 0
        for (i in ws.indices) {
            if (i > 0 && ws[i].paragraph != ws[i - 1].paragraph) {
                ps.add(pStart until i)
                pStart = i
            }
        }
        if (ws.isNotEmpty()) ps.add(pStart until ws.size)
        paragraphs = ps

        // Chunk on sentence ends and paragraph breaks so utterance joins land on natural pauses.
        val cs = ArrayList<Chunk>()
        var cStart = 0
        var count = 0
        for (i in ws.indices) {
            count++
            val w = ws[i]
            val sentenceEnd = SENTENCE_END.containsMatchIn(w.text)
            val paraBreak = i + 1 < ws.size && ws[i + 1].paragraph != w.paragraph
            val last = i == ws.size - 1
            if (last || paraBreak || (sentenceEnd && count >= MIN_CHUNK_WORDS) || count >= MAX_CHUNK_WORDS) {
                cs.add(Chunk(cs.size, cStart, i + 1))
                cStart = i + 1
                count = 0
            }
        }
        chunks = cs
        chunkOfWord = IntArray(ws.size)
        for (c in cs) for (i in c.firstWord until c.endWord) chunkOfWord[i] = c.index
    }

    val isEmpty: Boolean get() = words.isEmpty()
    val lastWord: Int get() = words.size - 1
    val averageCharsPerWord: Float get() = if (words.isEmpty()) 6f else text.length.toFloat() / words.size

    fun chunkOf(word: Int): Chunk = chunks[chunkOfWord[word.coerceIn(0, lastWord)]]

    /** Index in [lo, hi) of the word containing character [c], or the next word if [c] is in a gap. */
    fun wordAtChar(c: Int, lo: Int, hi: Int): Int {
        if (words.isEmpty()) return 0
        if (hi <= lo) return lo.coerceIn(0, lastWord)
        var a = lo
        var b = hi - 1
        if (c < words[a].start) return a
        while (a < b) {
            val m = (a + b + 1) ushr 1
            if (words[m].start <= c) a = m else b = m - 1
        }
        return if (c >= words[a].end && a + 1 < hi) a + 1 else a
    }

    /** Text to hand the speech engine for [chunk], starting at [fromWord] (clamped into the chunk). */
    fun chunkText(chunk: Chunk, fromWord: Int): String {
        val from = fromWord.coerceIn(chunk.firstWord, chunk.endWord - 1)
        return text.substring(words[from].start, words[chunk.endWord - 1].end)
    }

    companion object {
        private val WORD = Regex("\\S+")
        private val SENTENCE_END = Regex("[.!?…][\"'”’)\\]]*$")
        const val MIN_CHUNK_WORDS = 6
        const val MAX_CHUNK_WORDS = 40
        val EMPTY = Document("")
    }
}

/** Optimal recognition point: the letter the eye should land on for a word of [length]. */
fun orpIndex(length: Int): Int = when {
    length <= 1 -> 0
    length <= 5 -> 1
    length <= 9 -> 2
    length <= 13 -> 3
    else -> 4
}

val SAMPLE_TEXT = """
Reading and listening at the same time is one of the oldest tricks for staying focused. The voice carries you forward so you cannot drift, and the highlighted word gives your eyes an anchor so you never lose your place.

Start at normal speed and let the two lock together. When it feels easy, step up to one and a half times, then two. Most people find that comprehension holds up well past the point where plain reading or plain listening would start to slip, because each channel covers for the other.

At three times normal speed the voice stops sounding like speech and becomes a rhythm. That is fine. Keep your eyes on the highlight and let the words arrive. Tap any word to jump back, or switch to Focus view to see one word at a time with the key letter marked, which cuts down on eye movement.

Paste in an article, a chapter, or notes you need to get through, pick a speed, and press play.
""".trim()
