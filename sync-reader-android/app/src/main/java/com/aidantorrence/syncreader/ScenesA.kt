package com.aidantorrence.syncreader

import kotlin.math.exp
import kotlin.math.pow

// Explainer scenes, one per paragraph. Coordinates are on the 400 x 300 stage.

val CARNEGIE_SCENES = listOf(
    scene("The big idea") {
        beat { person(200, 78, label = "another person") }
        beat("being right") { bar(140, 250, 56, 30, Ink.Muted, "being right") }
        beat("how we make them feel") { bar(260, 250, 56, 112, Ink.Gold, "how they feel", "matters most") }
        beat("set of habits") { text("so: a set of daily habits to practice", 200, 284, 12, Ink.Muted) }
    },
    scene("3 rules for handling people") {
        beat("do not criticize") { box(105, 75, 180, 40, "1 · Don't criticize, condemn or complain", Ink.Muted, size = 11.5) }
        beat("on the defensive") { text("they defend themselves", 300, 66, 12, Ink.Bad) }
        beat("rarely changes behavior") { text("nothing changes", 300, 86, 12, Ink.Bad) }
        beat("honest and sincere appreciation") { box(105, 150, 180, 40, "2 · Give honest appreciation", size = 12) }
        beat("feel important") { text("they feel important", 300, 141, 12, Ink.Good) }
        beat("Flattery") { text("flattery is fake, and they can tell", 300, 161, 11, Ink.Muted) }
        beat("eager want") { box(105, 225, 180, 40, "3 · Make them want it", size = 12) }
        beat("what the other person wants") { text("frame it as their win", 300, 225, 12, Ink.Good) }
    },
    scene("6 ways to be liked") {
        beat { person(200, 162) }
        beat("genuinely interested") { text("1 · be interested in them", 200, 62, 12.5) }
        beat("Smile") { text("2 · smile", 335, 105, 12.5) }
        beat("name is") { text("3 · use their name", 330, 212, 12.5) }
        beat("good listener") { text("4 · listen", 200, 268, 12.5) }
        beat("other person's interests") { text("5 · talk about their interests", 72, 212, 12.5, maxWidth = 130) }
        beat("feel important, sincerely") { text("6 · make them feel important", 72, 105, 12.5, maxWidth = 130) }
        beat("is attention") { ring(200, 158, 50, label = "attention") }
    },
    scene("Winning people over") {
        beat { person(80, 100, label = "you"); person(320, 100, label = "them") }
        beat("argument") { text("argument", 200, 92, 14, Ink.Bad, bold = true) }
        beat("avoid it") { cross(200, 92, 16) }
        beat("Even when you win, you lose") { text("win the argument, lose the person", 200, 150, 12, Ink.Bad) }
        beat("admit it quickly") { text("wrong? admit it fast", 200, 172, 12, Ink.Good) }
        beat("saying yes early") {
            box(80, 262, 46, 24, "yes", Ink.Good, size = 11)
            box(135, 242, 46, 24, "yes", Ink.Good, size = 11)
            box(190, 222, 46, 24, "yes", Ink.Good, size = 11)
        }
        beat("a larger one easier") { box(285, 200, 100, 34, "big yes", Ink.Gold, filled = true) }
        beat("idea is theirs") { text("“it was my idea!”", 320, 46, 12.5, Ink.Gold, italic = true) }
    },
    scene("Correcting without offense") {
        beat("Begin with praise") { box(105, 62, 180, 32, "1 · Praise first", size = 11.5) }
        beat("indirectly") { box(105, 104, 180, 32, "2 · Hint at the mistake", size = 11.5) }
        beat("your own mistakes") { box(105, 146, 180, 32, "3 · Admit your own first", size = 11.5) }
        beat("Ask questions") { box(105, 188, 180, 32, "4 · Ask, don't order", size = 11.5) }
        beat("save face") { box(105, 230, 180, 32, "5 · Let them save face", size = 11.5) }
        beat("Praise every improvement") { box(295, 62, 180, 32, "6 · Praise any progress", Ink.Good, size = 11.5) }
        beat("fine reputation") { box(295, 104, 180, 32, "7 · Give them a name to live up to", Ink.Good, size = 11) }
        beat("easy to correct") { box(295, 146, 180, 32, "8 · Make it feel fixable", Ink.Good, size = 11.5) }
        beat("happy about doing") { box(295, 188, 180, 32, "9 · Make them glad to do it", Ink.Good, size = 11.5) }
    },
    scene("Why it works") {
        beat("manipulation") {
            box(105, 70, 150, 36, "techniques only", Ink.Muted, size = 12)
            text("= manipulation", 105, 104, 12, Ink.Bad)
        }
        beat("sincerity") { box(295, 70, 150, 36, "techniques + real care", size = 12) }
        beat("actually care") { text("= it works", 295, 104, 12, Ink.Good) }
        beat("curiosity, generosity, and restraint") { text("curiosity · generosity · restraint", 200, 140, 12.5, Ink.Muted) }
        beat("heard") { person(200, 215); text("heard", 120, 200, 12.5) }
        beat("respected") { text("respected", 280, 200, 12.5) }
        beat("appreciated") { text("appreciated", 200, 268, 12.5) }
        beat("ends up with influence") { ring(200, 210, 42); text("influence", 330, 245, 14, Ink.Gold, bold = true) }
    },
)

val ATOMIC_HABITS_SCENES = listOf(
    scene("1% a day") {
        beat("one percent better each day") {
            counter(70, 66, 1, 1.01, decimals = 2, prefix = "×", size = 22, color = Ink.Good)
            text("day 1", 70, 88, 10.5, Ink.Muted)
        }
        beat("dramatic over a year") {
            axes(40, 105, 220, 155, xLabel = "365 days")
            curve(40, 105, 220, 155, Ink.Good, label = "×37.8") { t -> 1.01f.pow(365f * t) / 40f }
        }
        beat("one percent worse") {
            curve(40, 105, 220, 155, Ink.Bad, label = "×0.03", labelDy = -9) { t -> 0.99f.pow(365f * t) / 40f }
        }
        beat("nothing seems to be happening") { text("early on, both look flat", 150, 288, 11, Ink.Muted) }
        beat("twenty-five") {
            box(330, 115, 60, 60, "ice", Ink.Blue, id = "ice")
            counter(330, 180, 25, 31, suffix = "°F", size = 18, color = Ink.Blue, id = "temp")
        }
        beat("thirty-two") {
            hide("ice", "temp")
            box(330, 115, 60, 60, "melts!", Ink.Gold, filled = true, size = 12)
            text("32°F", 330, 180, 18, Ink.Gold, bold = true)
            text("it was building the whole time", 330, 218, 11, Ink.Muted, maxWidth = 130)
        }
    },
    scene("Systems and identity") {
        beat("Winners and losers") { person(70, 92, label = "winner"); person(170, 92, label = "loser") }
        beat("same goals") { text("same goal", 120, 50, 12, Ink.Muted) }
        beat("system of daily actions") {
            grid(70, 170, 6, 4, 11, 3.5, hi = first(24), hiColor = Ink.Good)
            grid(170, 170, 6, 4, 11, 3.5, hi = setOf(2, 9, 17))
            text("the daily system differs", 120, 214, 12, Ink.Gold)
        }
        beat("identity") { text("“I am a runner”", 305, 66, 14, Ink.Gold, italic = true) }
        beat("is a vote") {
            grid(305, 130, 6, 3, 14, 4.5, hi = setOf(0, 1, 2, 4, 6, 7, 9, 10, 12, 13, 15, 16), bad = setOf(3, 5, 8, 11, 14, 17))
            text("each action is a vote", 305, 168, 11.5, Ink.Muted)
        }
        beat("just a majority") { text("12 for, 6 against: you win", 305, 192, 12, Ink.Good) }
        beat("small wins") { text("prove it with small wins", 305, 230, 12, Ink.Gold) }
    },
    scene("The habit loop") {
        beat("a cue triggers") { box(200, 62, 100, 32, "Cue", Ink.Blue) }
        beat("triggers a craving") { arrow(250, 76, 296, 128); box(320, 150, 100, 32, "Craving", Ink.Purple) }
        beat("motivates a response") { arrow(296, 172, 250, 222); box(200, 238, 100, 32, "Response", Ink.White) }
        beat("delivers a reward") { arrow(150, 222, 104, 172); box(80, 150, 100, 32, "Reward", Ink.Gold) }
        beat("repeat the loop") { arrow(104, 128, 150, 76, Ink.Gold, width = 2.5) }
        beat("make it obvious") { text("obvious", 200, 92, 11.5, Ink.Good, bold = true) }
        beat("make it attractive") { text("attractive", 320, 180, 11.5, Ink.Good, bold = true) }
        beat("make it easy") { text("easy", 200, 268, 11.5, Ink.Good, bold = true) }
        beat("make it satisfying") { text("satisfying", 80, 180, 11.5, Ink.Good, bold = true) }
        beat("invert them") { text("to break a habit, flip all four", 200, 150, 12, Ink.Bad, maxWidth = 130) }
    },
    scene("Law 1 · Make it obvious") {
        beat("Implementation intentions") { text("“I will [run] at [7am] in [the park]”", 200, 58, 13, Ink.Gold) }
        beat("double follow-through") {
            bar(90, 205, 46, 45, Ink.Muted, "vague goal", "1×")
            bar(160, 205, 46, 90, Ink.Good, "when + where", "2×")
        }
        beat("Habit stacking") { box(305, 105, 140, 32, "pour coffee", Ink.Muted) }
        beat("meditate for one minute") { arrow(305, 123, 305, 149); box(305, 167, 140, 32, "meditate 1 min") }
        beat("guitar") { text("guitar in the middle of the room", 200, 250, 12, Ink.Good) }
        beat("out of sight") { text("junk food out of sight", 200, 272, 12, Ink.Bad) }
    },
    scene("Law 2 · Make it attractive") {
        beat("dopamine") { axes(30, 65, 200, 145, xLabel = "time", yLabel = "dopamine") }
        beat("anticipation of a reward") {
            curve(30, 65, 200, 145, Ink.Gold) { t -> 0.08f + 0.9f * exp(-((t - 0.42f) / 0.12f).pow(2)) }
            text("wanting peaks here", 114, 52, 11, Ink.Gold)
            line(165, 80, 165, 210, Ink.Muted, dashed = true)
            text("reward arrives", 170, 92, 10.5, Ink.Muted, align = Align.START)
        }
        beat("Temptation bundling") {
            box(320, 80, 130, 30, "need: treadmill", Ink.Muted, size = 12)
            text("+", 320, 106, 16)
            box(320, 132, 130, 30, "want: podcast", size = 12)
            text("only together", 320, 164, 11.5, Ink.Good)
        }
        beat("join groups") {
            person(285, 236, 0.75); person(320, 236, 0.75, Ink.Gold); person(355, 236, 0.75)
            text("join groups where it's normal", 300, 278, 11.5, Ink.Muted, maxWidth = 190)
        }
    },
    scene("Law 3 · Make it easy") {
        beat("reducing friction") { text("less friction → more reps", 200, 55, 13) }
        beat("two-minute rule") { bar(110, 215, 52, 115, Ink.Muted, "“read 30 pages”", "the goal") }
        beat("takes two minutes") { bar(200, 215, 52, 18, Ink.Gold, "“read 1 page”", "2 min") }
        beat("showing up") { text("the habit is showing up", 315, 140, 13, Ink.Gold, maxWidth = 150); check(315, 172) }
        beat("Prime your environment") { text("shoes by the door", 115, 262, 11.5, Ink.Muted) }
        beat("Automate") { text("auto-save on payday", 290, 262, 11.5, Ink.Muted) }
    },
    scene("Law 4 · Make it satisfying") {
        beat("immediate rewards") {
            bar(70, 195, 42, 105, Ink.Gold, "reward now", "feels big")
            bar(130, 195, 42, 30, Ink.Muted, "reward later", "feels small")
        }
        beat("instant pleasure") { text("so add a tiny reward now", 100, 236, 11.5, Ink.Good) }
        beat("Habit tracking") {
            grid(300, 85, 7, 3, 20, 6, hi = first(21), hiColor = Ink.Good)
            text("a streak to protect", 300, 128, 11.5, Ink.Muted)
        }
        beat("never miss twice") {
            grid(300, 178, 7, 1, 20, 6, hi = setOf(0, 1, 2, 4, 5, 6), hiColor = Ink.Good, bad = setOf(3))
            text("miss once: an accident", 300, 200, 11.5)
        }
        beat("missing twice") {
            grid(300, 238, 7, 1, 20, 6, hi = setOf(0, 1, 2, 5, 6), hiColor = Ink.Good, bad = setOf(3, 4))
            text("miss twice: a new habit", 300, 260, 11.5, Ink.Bad)
        }
    },
    scene("Keep improving") {
        beat("natural abilities") { text("play the games you're built for", 200, 52, 13) }
        beat("just-manageable difficulty") {
            line(50, 105, 350, 105, Ink.Faint, width = 3)
            text("boring", 50, 123, 11, Ink.Muted, align = Align.START)
            text("too hard", 350, 123, 11, Ink.Muted, align = Align.END)
            dot(240, 105, 8)
            text("just hard enough", 240, 86, 11.5, Ink.Gold)
        }
        beat("becomes automatic") {
            axes(45, 160, 140, 90, xLabel = "time")
            curve(45, 160, 140, 90, Ink.Muted, label = "autopilot: plateau") { t -> 0.75f * (1 - exp(-6f * t)) }
        }
        beat("reflection and review") {
            axes(220, 160, 140, 90, xLabel = "time")
            curve(220, 160, 140, 90, Ink.Good, label = "with review") { t ->
                0.75f * (1 - exp(-6f * t)) + if (t > 0.5f) (t - 0.5f) * 0.45f else 0f
            }
        }
    },
    scene("The takeaway") {
        beat("rise to the level of your goals") {
            line(70, 75, 320, 75, Ink.Muted, dashed = true)
            text("goals", 330, 75, 12, Ink.Muted, align = Align.START)
        }
        beat("fall to the level of your systems") {
            person(195, 122)
            arrow(195, 152, 195, 200, Ink.Gold)
            line(70, 212, 320, 212, Ink.Gold, width = 4)
            text("systems", 330, 212, 12, Ink.Gold, align = Align.START, bold = true)
        }
        beat("cast the votes") { grid(120, 255, 8, 2, 11, 3.5, hi = first(13), hiColor = Ink.Good) }
        beat("compounding") { curve(220, 235, 110, 45, Ink.Good) { t -> 1.01f.pow(365f * t) / 38f } }
    },
)

val THINKING_SCENES = listOf(
    scene("Two systems") {
        beat("System One is fast") {
            box(105, 66, 150, 36, "System 1", Ink.Gold, filled = true)
            text("fast · automatic · effortless", 105, 98, 11, Ink.Muted)
        }
        beat("bread and butter") { text("“bread and …” → butter", 105, 132, 12.5) }
        beat("System Two is slow") {
            box(295, 66, 150, 36, "System 2", Ink.Blue, filled = true)
            text("slow · deliberate · lazy", 295, 98, 11, Ink.Muted)
        }
        beat("long division") { text("17 × 24 = ?", 295, 132, 13) }
        beat("conserve effort") { text("prefers to save energy", 295, 156, 11, Ink.Muted) }
        beat("simply endorses") {
            box(105, 210, 150, 34, "proposes an answer", Ink.Gold, size = 12)
            arrow(182, 210, 218, 210)
            box(295, 210, 150, 34, "“looks fine” ✓", Ink.Blue, size = 12)
        }
        beat("what goes wrong") { text("…and that's where errors slip through", 200, 262, 12, Ink.Bad) }
    },
    scene("Swapping the question") {
        beat("hard question") { box(200, 60, 260, 34, "How happy am I with my life?", Ink.Muted, id = "hard") }
        beat("easier one") { arrow(200, 80, 200, 108, Ink.Gold); box(200, 128, 260, 34, "What mood am I in right now?") }
        beat("answers that instead") { dim("hard"); text("answers the easy one instead", 200, 160, 11.5, Ink.Good) }
        beat("very little evidence") {
            grid(100, 222, 5, 1, 16, 5, hi = first(2), hiColor = Ink.Blue)
            text("a little evidence", 100, 244, 11, Ink.Muted)
        }
        beat("what you see is all there is") { text("“what you see is all there is”", 200, 192, 12.5, Ink.Gold, italic = true) }
        beat("know the least") {
            arrow(150, 222, 270, 222)
            text("a confident story", 330, 222, 12.5, Ink.Bad, bold = true, maxWidth = 120)
            text("certainty comes from fit, not facts", 200, 276, 11.5, Ink.Muted)
        }
    },
    scene("Mental shortcuts") {
        beat("Anchoring") { text("Anchoring", 105, 48, 13, Ink.Gold, bold = true) }
        beat("pulls your estimate toward it") { text("see 65 → guess higher", 105, 70, 11.5, Ink.Muted) }
        beat("Availability") { text("Availability", 295, 48, 13, Ink.Gold, bold = true) }
        beat("plane crashes") { text("vivid = feels common", 295, 70, 11.5, Ink.Muted) }
        beat("Representativeness") { text("Representativeness", 200, 104, 13, Ink.Gold, bold = true) }
        beat("quiet, bookish person") {
            person(200, 146, 0.8)
            text("quiet, bookish → librarian?", 200, 180, 11.5)
        }
        beat("farmers vastly outnumber") {
            grid(200, 218, 20, 3, 13, 4, color = Ink.Muted, hi = setOf(29), hiColor = Ink.Blue)
            text("farmers far outnumber librarians, so: probably a farmer", 200, 248, 11, Ink.Good)
        }
        beat("conjunction fallacy") { text("more detail feels likelier, but isn't", 200, 276, 11, Ink.Bad) }
    },
    scene("Overconfidence") {
        beat("perform about as well as chance") {
            bar(70, 195, 44, 70, Ink.Muted, "experts", "50%")
            bar(130, 195, 44, 70, Ink.Muted, "coin flip", "50%")
        }
        beat("remain sure of themselves") { text("but feel sure", 100, 92, 12.5, Ink.Bad, bold = true) }
        beat("Hindsight") { text("hindsight: “I knew it”", 100, 236, 11.5, Ink.Muted) }
        beat("planning fallacy") { bar(270, 195, 44, 45, Ink.Gold, "planned", "3 mo") }
        beat("turn out to be") { bar(330, 195, 44, 115, Ink.Bad, "actual", "8 mo") }
        beat("outside view") { text("outside view: how did similar projects go?", 200, 274, 12.5, Ink.Good) }
    },
    scene("Losses loom larger") {
        beat("reference point") {
            line(40, 140, 250, 140, Ink.Muted)
            text("where you are now", 45, 154, 10.5, Ink.Muted, align = Align.START)
        }
        beat("twice as large") {
            bar(110, 140, 50, 40, Ink.Good, value = "+$100")
            bar(190, 140, 50, -80, Ink.Bad, value = "−$100")
            text("losing hurts about 2×", 150, 262, 12, Ink.Bad)
        }
        beat("fair bets") { text("so we refuse fair bets", 325, 70, 11.5, maxWidth = 140) }
        beat("status quo") { text("and cling to what we have", 325, 94, 11.5, maxWidth = 140) }
        beat("ninety percent survival") { box(325, 160, 120, 32, "90% survive", Ink.Good) }
        beat("ten percent mortality") {
            box(325, 202, 120, 32, "10% die", Ink.Bad)
            text("same facts, different feeling", 325, 236, 11, Ink.Muted, maxWidth = 140)
        }
    },
    scene("Peak and end") {
        beat("experiencing self") { text("experiencing self: lives it", 110, 48, 11.5, Ink.Blue) }
        beat("remembering self") { text("remembering self: keeps score", 290, 48, 11.5, Ink.Gold) }
        beat("peak and its ending") {
            axes(40, 75, 320, 140, xLabel = "time", yLabel = "pain")
            text("memory = the peak + the end", 200, 240, 12.5)
        }
        beat("ends gently") {
            curve(40, 75, 320, 140, Ink.Blue, label = "longer, ends gently") { t -> peakPain(t, gentle = true) }
        }
        beat("ends sharply") {
            curve(40, 75, 320, 140, Ink.Bad, tEnd = 0.5, label = "shorter, ends sharply", labelDx = 8, labelDy = -12, labelAlign = Align.START) { t -> peakPain(t, gentle = false) }
        }
        beat("make decisions") { text("memory prefers the longer one, and memory decides", 200, 268, 12, Ink.Gold) }
    },
    scene("What actually helps") {
        beat("does little to prevent them") { text("knowing about biases ≠ immune", 200, 58, 13, Ink.Bad) }
        beat("recognize situations") { box(80, 125, 120, 36, "spot the trap", size = 12) }
        beat("slow down") { arrow(142, 125, 158, 125); box(220, 125, 110, 36, "slow down", Ink.Blue, size = 12) }
        beat("eyes of others") { arrow(277, 125, 293, 125); box(340, 125, 100, 36, "ask others", Ink.Good, size = 12) }
        beat("premortems") { text("premortem: “it failed. why?”", 200, 196, 12.5) }
        beat("checklists") { text("checklists", 200, 220, 12.5) }
        beat("show up") { text("they force System 2 to show up", 200, 258, 13, Ink.Gold, bold = true) }
    },
)

/** Pain over time for the peak-end example: same peak, the gentle version tapers off at the end. */
private fun peakPain(t: Float, gentle: Boolean): Float = when {
    t < 0.3f -> 0.2f + t / 0.3f * 0.65f
    t < 0.5f || !gentle -> 0.85f - (t - 0.3f) * 0.5f
    else -> 0.75f - (t - 0.5f) / 0.5f * 0.6f
}
