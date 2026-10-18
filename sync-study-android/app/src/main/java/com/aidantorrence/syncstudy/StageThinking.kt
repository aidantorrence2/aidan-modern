package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color
import kotlin.math.exp
import kotlin.math.pow
import kotlin.math.sin

/** Animated explainer films for Thinking, Fast and Slow, one per paragraph. */
val THINKING_STAGE = listOf(
    stage("Two systems", Backdrops.Day) {
        add("hare", ThinkingProps.Hare(), 100, 236)
        add("tort", ThinkingProps.Tortoise(), 290, 236)
        add("t1", Tag("System 1 · fast, automatic", Pal.Gold), 100, 264)
        add("t2", Tag("System 2 · slow, effortful", Pal.Sky), 290, 264)
        add("face", ThinkingProps.FaceCard(), 100, 104)
        add("tFace", Tag("angry! read instantly", Pal.Coral), 100, 56)
        add("bread", Bubble("bread and… butter!", 104f, -0.1f), 108, 108)
        add("car", ThinkingProps.Car(), -60, 292)
        add("math", Tile("17 × 24 = ?", Pal.Navy, 110f, 34f, textSize = 13f), 290, 112)
        add("note", Tile("my answer!", Pal.Gold, 92f, 30f, textSize = 11.5f, ink = Pal.Ink), 120, 104)
        add("stamp", ThinkingProps.Stamp(), 268, 104)
        add("wrong", Mark(false, 12f), 318, 82)
        add("tEnd", Tag("…even when System 1 is wrong", Pal.Coral), 215, 150)
        beat("two very different modes") { show("hare", "tort", stagger = 200) }
        beat("System One is fast") { show("t1"); set("hare", "run", 1, 300) }
        beat("reads emotions on faces") { show("face", "tFace", stagger = 200) }
        beat("bread and butter") { hide("face", "tFace"); show("bread", delay = 150) }
        beat("drives a car") { show("car"); move("car", 470, 292, 3200, 0, Ease.Linear) }
        beat("System Two is slow") { hide("bread"); set("hare", "run", 0, 300); show("t2"); set("tort", "walk", 1, 400) }
        beat("long division") { show("math"); set("tort", "sweat", 1, 300); set("tort", "walk", 0, 300) }
        beat("conserve effort") { hide("math"); set("tort", "sweat", 0, 300); set("tort", "sleep", 1, 600) }
        beat("simply endorses") {
            set("hare", "run", 1, 200); show("note"); move("note", 268, 104, 900, 200)
            set("tort", "sleep", 0.6, 300, 900)
            show("stamp", delay = 1000); play("stamp", dur = 900, delay = 1000, ease = Ease.InOut)
        }
        beat("what goes wrong") { set("hare", "run", 0, 300); show("wrong", "tEnd", stagger = 250) }
    },
    stage("Swapping the question", Backdrops.Paper) {
        val spokes = listOf("yellow" to (100 to 74), "monkey" to (300 to 74), "smoothie" to (100 to 188), "slippery!" to (300 to 188))
        spokes.forEachIndexed { i, (word, xy) ->
            add("a$i", Arrow((xy.first - 200) * 0.62f, (xy.second - 130) * 0.62f, if (i % 2 == 0) 10f else -10f, Pal.Slate, 2f), 200, 130)
            add("w${i + 1}", Tag(word, listOf(Pal.Sky, Pal.Leaf, Pal.Rose, Pal.Violet)[i]), xy.first, xy.second)
        }
        add("w0", Tag("banana", Pal.Gold, 13f), 200, 130)
        add("tAssoc", Tag("one idea lights up its neighbours", Pal.Slate, dark = false), 200, 262)
        add("you", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[0], 0, seed = 31), 590, 236).with("look", 1).with("mood", 0.1)
        add("hard", Tile("How happy am I with my life?", Pal.Navy, 184f, 42f, textSize = 12f), 712, 92)
        add("easy", Tile("What mood am I in right now?", Pal.Gold, 184f, 42f, textSize = 12f, ink = Pal.Ink), 712, 92)
        add("swap", Tag("an easier question, swapped in", Pal.Coral), 712, 140)
        add("ans", Bubble("Pretty happy!", 84f, 0.2f), 590, 104)
        add("puzzle", ThinkingProps.Puzzle(3, 2, 38f, listOf(0, 4)), 1185, 118)
        add("thinker", Bean(Pal.Violet, Pal.Skin[2], Pal.Hair[1], 1, seed = 32), 1030, 236).with("look", 1)
        add("sure", Bubble("I get it completely!", 92f, 0.1f), 1030, 104)
        add("wys", Tag("what you see is all there is", Pal.Gold), 1185, 62)
        add("bars", Bars(listOf(0.18f, 0.95f), listOf("evidence", "certainty"), listOf(Pal.Slate, Pal.Coral), 110f, 70f), 1205, 205)
        beat("association") {
            show("w0")
            (0 until 4).forEach { i -> show("a$i", delay = 200 + i * 250); play("a$i", dur = 500, delay = 200 + i * 250); show("w${i + 1}", delay = 550 + i * 250) }
            show("tAssoc", delay = 1600)
        }
        beat("hard question") { camera(700, 150, 1.0, 1500); show("you", "hard", delay = 500, stagger = 200); set("you", "mood", -0.2, 400, 900) }
        beat("swaps in an easier one") {
            move("hard", 712, -70, 900, 0, Ease.In); rotate("hard", 18, 900, 0)
            show("easy", delay = 600); show("swap", delay = 1000)
        }
        beat("answers that instead") { show("ans"); set("you", "mood", 0.85, 500) }
        beat("find coherence") { camera(1160, 150, 1.0, 1500); show("thinker", "puzzle", delay = 500); set("puzzle", "n", 2, 1200, 800) }
        beat("very little evidence") { set("puzzle", "glow", 1, 1000); show("sure", delay = 400); set("thinker", "arms", 1, 500, 400); set("thinker", "mood", 1, 500, 400) }
        beat("what you see is all there is") { show("wys") }
        beat("know the least") { show("bars"); play("bars", dur = 1400) }
    },
    stage("Mental shortcuts", Backdrops.studio(Color(0xFF2B2440))) {
        add("q", Tile("What % of UN members are African?", Pal.Navy, 228f, 30f, textSize = 10.5f), 215, 54)
        add("wheel", ThinkingProps.Wheel(), 120, 128)
        add("you", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[2], 2, seed = 33), 300, 236).with("look", -1)
        add("guess", Counter(18f, Pal.Gold, 0, prefix = "my guess: ", suffix = "%", halo = false), 300, 112).with("v", 25)
        add("tA", Tag("pulled toward 65", Pal.Coral), 300, 140)
        add("news", Tile("PLANE CRASH!", Pal.Coral, 120f, 30f, textSize = 12f), 620, 58)
        add("plane", ThinkingProps.Plane(), 625, 122)
        add("car", ThinkingProps.Car(Pal.Sky), 770, 236).with("drive", 0)
        add("tPlane", Tag("vivid: feels dangerous", Pal.Coral), 625, 172)
        add("tCar", Tag("ordinary: feels safe", Pal.Leaf), 770, 160)
        add("book", Bean(Pal.Violet, Pal.Skin[0], Pal.Hair[1], 1, seed = 34), 1065, 236).with("hold", 1).with("mood", 0.2)
        add("tQuiet", Tag("quiet, loves books", Pal.Violet), 1065, 128)
        add("lib", Bubble("Must be a librarian!", 96f, 0f, thought = true), 1065, 76)
        add("crowd", ThinkingProps.Crowd(10, 5, 13f, special = setOf(23, 36)), 1228, 148).with("n", 0)
        add("tBase", Tag("farmers far outnumber librarians", Pal.Leaf), 1210, 206)
        add("venn", ThinkingProps.Venn(), 1640, 140)
        add("tV", Tag("more detail feels likelier, but is less likely", Pal.Coral), 1640, 236)
        beat("Anchoring") { show("q", "wheel", "you", stagger = 200); play("wheel", "spin", dur = 2600, delay = 300, ease = Ease.Out) }
        beat("pulls your estimate toward it") { show("guess"); set("guess", "v", 45, 1400, 300); show("tA", delay = 1200) }
        beat("Availability") { camera(690, 150, 1.0, 1500); show("news", "plane", "car", delay = 500, stagger = 200) }
        beat("plane crashes") { set("plane", "wobble", 1, 600); show("tPlane", "tCar", delay = 300, stagger = 300) }
        beat("Representativeness") { camera(1160, 150, 1.0, 1500); show("book", "tQuiet", delay = 500, stagger = 200) }
        beat("librarian") { show("lib") }
        beat("farmers vastly outnumber librarians") { show("crowd"); set("crowd", "n", 50, 1800, 0, Ease.Linear); show("tBase", delay = 1400) }
        beat("conjunction fallacy") { camera(1640, 150, 1.0, 1500); show("venn", delay = 500); play("venn", dur = 900, delay = 1100, ease = Ease.Out); show("tV", delay = 1500) }
    },
    stage("Overconfidence", Backdrops.City) {
        add("expert", Bean(Pal.Navy.lighten(0.3f), Pal.Skin[1], Pal.Hair[4], 4, seed = 35), 90, 236).with("look", 1)
        add("stock", LineChart(150f, 80f, Pal.Mint, { t -> 0.5f + 0.22f * sin(t * 17f) + 0.12f * sin(t * 43f) - 0.08f * sin(t * 7f) },
            xLabel = "time", yLabel = "stock"), 280, 100)
        add("coin", ThinkingProps.CoinFlip(), 280, 190)
        add("tCoin", Tag("≈ a coin flip", Pal.Gold), 280, 226)
        add("sure", Bubble("Definitely going up!", 96f, 0.2f), 100, 104)
        add("hind", Bubble("I knew it all along.", 96f, 0.2f), 100, 104)
        add("builder", Bean(Pal.Gold, Pal.Skin[3], Pal.Hair[0], 0, seed = 36), 575, 236).with("look", 1)
        add("bars", Bars(listOf(0.35f, 0.9f, 0.3f, 0.85f), listOf("time", "time", "cost", "cost"),
            listOf(Pal.Sky, Pal.Coral, Pal.Sky, Pal.Coral), 230f, 110f, listOf("plan", "real", "plan", "real")), 740, 160)
        add("tPlan", Tag("always longer, always pricier", Pal.Coral), 700, 60)
        add("you", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[2], 2, seed = 37), 1050, 236).with("look", 1)
        for (i in 0 until 6) add("p$i", Tile("past\nproject", Pal.Slate, 50f, 38f, textSize = 8.5f), 1150 + (i % 3) * 58, 108 + (i / 3) * 50)
        for (i in 0 until 6) add("x$i", Mark(i == 4, 7f), 1168 + (i % 3) * 58, 96 + (i / 3) * 50)
        add("lens", Magnifier(), 1120, 110)
        add("tOut", Tag("ask: how did similar cases go?", Pal.Mint), 1180, 210)
        beat("Experts in unpredictable fields") { show("expert", "stock", stagger = 200); play("stock", dur = 1800, delay = 300, ease = Ease.Linear) }
        beat("as well as chance") { show("coin", "tCoin", stagger = 250) }
        beat("remain sure of themselves") { show("sure"); set("expert", "arms", 0.7, 400); set("expert", "mood", 1, 400) }
        beat("Hindsight") { hide("sure"); show("hind", delay = 200); set("expert", "arms", 0, 400) }
        beat("planning fallacy") {
            camera(690, 150, 1.0, 1500); show("builder", "bars", delay = 500); play("bars", dur = 1800, delay = 700)
            show("tPlan", delay = 2000); set("builder", "mood", -0.4, 500, 2000)
        }
        beat("outside view") {
            camera(1170, 150, 1.0, 1500); show("you", delay = 500)
            (0 until 6).forEach { show("p$it", delay = 700 + it * 120) }
            (0 until 6).forEach { show("x$it", delay = 1500 + it * 120) }
            show("lens", delay = 900); move("lens", 1300, 160, 1800, 1000)
            show("tOut", delay = 1900)
        }
    },
    stage("Losses loom larger", Backdrops.studio(Color(0xFF1F4540))) {
        add("you", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[0], 0, seed = 38), 66, 236).with("look", 1)
        add("ref", Tag("your reference point: now", Pal.Sky), 90, 120)
        add("scale", ThinkingProps.Scale("+$100", "−$100"), 245, 238)
        add("tTwice", Tag("a loss hurts about twice as much", Pal.Coral), 230, 52)
        add("gambler", Bean(Pal.Gold, Pal.Skin[2], Pal.Hair[1], 1, seed = 39), 560, 236).with("look", 1)
        add("bet", Tile("heads: win $110 · tails: lose $100", Pal.Navy, 176f, 30f, textSize = 10.5f), 640, 56)
        add("coin", ThinkingProps.CoinFlip(), 620, 120)
        add("no", Mark(false, 11f), 646, 98)
        add("tKeep", Tag("keep what I have", Pal.Sky), 560, 130)
        add("table", Table(90f), 780, 214)
        add("mug", ThinkingProps.Mug(), 780, 210)
        add("sell", Tag("to give it up: $$$", Pal.Gold), 780, 118)
        add("buy", Tag("to buy it: $", Pal.Slate, dark = false), 780, 144)
        add("ticket", ThinkingProps.Ticket(), 1095, 100)
        add("umb", ThinkingProps.Umbrella(), 1225, 116)
        add("tSmall", Tag("tiny odds feel big", Pal.Violet), 1160, 56)
        add("f1", Tile("90% survive", Pal.Leaf, 110f, 36f, textSize = 13f, ink = Pal.Ink), 1095, 190)
        add("f2", Tile("10% die", Pal.Coral, 110f, 36f, textSize = 13f), 1225, 190)
        add("tSame", Tag("same surgery, different feeling", Pal.Gold), 1160, 236)
        beat("reference point") { show("you", "ref", stagger = 250) }
        beat("losses loom roughly twice") { show("scale"); set("scale", "tilt", 0.85, 1300, 600, Ease.Back); show("tTwice", delay = 1200); set("you", "mood", -0.4, 400, 1200) }
        beat("reject fair bets") { camera(680, 150, 1.0, 1500); show("gambler", "bet", "coin", delay = 500, stagger = 200); show("no", delay = 1600); set("gambler", "mood", -0.4, 400, 1500) }
        beat("status quo") { show("tKeep") }
        beat("give up an object") { show("table", "mug", "sell", "buy", stagger = 220) }
        beat("small probabilities") { camera(1160, 150, 1.0, 1500); show("ticket", "umb", "tSmall", delay = 500, stagger = 220) }
        beat("ninety percent survival") { show("f1") }
        beat("ten percent mortality") { show("f2"); show("tSame", delay = 500) }
    },
    stage("Peak and end", Backdrops.Paper) {
        add("exp", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[2], 2, seed = 40), 110, 236).with("look", 1)
        add("rem", Bean(Pal.Gold, Pal.Skin[3], Pal.Hair[1], 1, seed = 41), 290, 236).with("look", -1)
        add("tExp", Tag("lives each moment", Pal.Sky), 110, 128)
        add("tRem", Tag("keeps score", Pal.Gold), 290, 128)
        add("score", Tile("★ 7 / 10", Pal.Paper, 64f, 26f, textSize = 11f, ink = Pal.Ink), 352, 182)
        add("chart", LineChart(220f, 100f, Pal.Coral, { t -> 0.2f + 0.7f * exp(-((t - 0.4f) / 0.12f).pow(2)) + 0.3f * t * t * t },
            xLabel = "time", yLabel = "pain"), 680, 150).with("ax", 0)
        add("peak", Star(Pal.Gold, 10f), 658, 92)
        add("end", Star(Pal.Gold, 10f), 790, 132)
        add("tPE", Tag("memory = peak + end", Pal.Gold), 680, 62)
        add("dur", Arrow(220f, 0f, 0f, Pal.Slate, 2f, dashed = true), 570, 222)
        add("tDur", Tag("duration: mostly ignored", Pal.Slate, dark = false), 680, 244)
        add("post", ThinkingProps.Postcard(), 610, 110)
        add("strip", ThinkingProps.DayStrip(), 730, 190)
        add("tVac", Tag("remembered: best day + last day", Pal.Gold), 690, 62)
        add("long", LineChart(220f, 100f, Pal.Sky, { t -> peakEnd(t, true) }, xLabel = "time", yLabel = "pain", endLabel = "longer, gentle end",
            labelDy = -14f), 1190, 140).with("ax", 0)
        add("short", LineChart(220f, 100f, Pal.Coral, { t -> peakEnd(t, false) }, axes = false, tEnd = 0.5f, fill = false), 1190, 140)
        add("tShort", Tag("shorter, sharp end", Pal.Coral), 1135, 62)
        add("rem2", Bean(Pal.Gold, Pal.Skin[3], Pal.Hair[1], 1, seed = 41), 1015, 236).with("look", 1)
        add("pick", Bubble("The longer one was less bad.", 92f, 0f), 1015, 104)
        beat("experiencing self") { show("exp", "tExp", stagger = 200); set("exp", "walk", 1, 300) }
        beat("remembering self") { set("exp", "walk", 0, 300); show("rem", "tRem", "score", stagger = 200) }
        beat("peak and its ending") {
            camera(680, 150, 1.0, 1500); show("chart", delay = 500); set("chart", "ax", 1, 700, 600); play("chart", dur = 1800, delay = 900, ease = Ease.Linear)
            show("peak", delay = 1700); show("end", delay = 2700); show("tPE", delay = 2900)
        }
        beat("ignores its duration") { show("dur", "tDur", stagger = 300); play("dur", dur = 1000) }
        beat("vacation") {
            hide("chart", "peak", "end", "tPE", "dur", "tDur")
            show("post", "strip", delay = 300, stagger = 200); set("strip", "mark", 1, 900, 1100); show("tVac", delay = 1200)
        }
        beat("ends gently") { camera(1160, 150, 1.0, 1500); show("long", delay = 500); set("long", "ax", 1, 600, 600); play("long", dur = 2200, delay = 900, ease = Ease.Linear) }
        beat("ends sharply") { show("short", "tShort"); play("short", dur = 1300, ease = Ease.Linear) }
        beat("make decisions") { show("rem2", "pick", stagger = 300) }
    },
    stage("What actually helps", Backdrops.room(Color(0xFF34495E))) {
        add("reader", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 42), 80, 236).with("hold", 1).with("look", 1)
        add("book", Tile("BIASES", Pal.Coral, 46f, 30f, textSize = 8.5f), 84, 186)
        add("ill", ThinkingProps.MullerLyer(), 262, 120)
        add("tStill", Tag("the top line still looks longer", Pal.Coral), 262, 192)
        add("tSame", Tag("same length. still fooled.", Pal.Gold), 262, 192)
        add("p2", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[3], 3, seed = 43), 580, 236).with("look", 1)
        add("warn", ThinkingProps.Warning(), 580, 110)
        add("tort", ThinkingProps.Tortoise(), 900, 236).with("walk", 1)
        add("helper", Bean(Pal.Mint, Pal.Skin[0], Pal.Hair[1], 1, seed = 44), 820, 236).with("look", -1)
        add("lens", Magnifier(), 790, 150)
        add("tEyes", Tag("borrow other eyes", Pal.Mint), 760, 62)
        add("table", Table(140f), 1150, 214)
        add("m1", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[2], 2, seed = 45), 1060, 236).with("look", 1)
        add("m2", Bean(Pal.Violet, Pal.Skin[3], Pal.Hair[0], 0, seed = 46), 1240, 236).with("look", -1)
        add("prem", Tile("Imagine it failed. Why?", Pal.Navy, 172f, 34f, textSize = 12f), 1150, 62)
        add("clip", ThinkingProps.Checklist(listOf("assumptions?", "risks?", "2nd opinion?")), 1150, 140)
        add("tOn", Tag("the slow system shows up", Pal.Mint), 1150, 270)
        add("yay", Confetti(), 1150, 140)
        beat("Knowing about biases") { show("reader", "book", stagger = 200) }
        beat("does little to prevent them") { show("ill", "tStill", stagger = 300); set("reader", "wow", 1, 400, 400) }
        beat("cannot be switched off") { set("ill", "ruler", 1, 800); hide("tStill"); show("tSame", delay = 400); set("reader", "wow", 0, 300, 800); set("reader", "mood", -0.3, 400, 800) }
        beat("recognize situations") { camera(700, 150, 1.0, 1500); show("p2", "warn", delay = 500, stagger = 200); set("p2", "wow", 1, 400, 900) }
        beat("slow down") { show("tort"); move("tort", 690, 236, 2800, 0, Ease.Linear); set("tort", "walk", 0, 400, 2800); set("p2", "wow", 0, 400, 400) }
        beat("eyes of others") { show("helper", "lens", "tEyes", stagger = 220); set("p2", "mood", 0.7, 400, 400) }
        beat("premortems") { camera(1150, 150, 1.0, 1500); show("table", "m1", "m2", "prem", delay = 500, stagger = 180) }
        beat("checklists") { show("clip"); set("clip", "done", 3, 2000, 400, Ease.Linear) }
        beat("show up") { show("tOn"); show("yay", delay = 200); play("yay", dur = 1700, delay = 200, ease = Ease.Out) }
    },
)

/** Pain for the peak-end procedure example: same peak; the gentle version tapers off. */
private fun peakEnd(t: Float, gentle: Boolean): Float = when {
    t < 0.3f -> 0.2f + t / 0.3f * 0.65f
    t < 0.5f || !gentle -> 0.85f - (t - 0.3f) * 0.5f
    else -> 0.75f - (t - 0.5f) / 0.5f * 0.6f
}
