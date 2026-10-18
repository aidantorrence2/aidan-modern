package com.aidantorrence.syncstudy

import kotlin.math.exp
import kotlin.math.pow

/** Animated explainer films for Atomic Habits, one per paragraph. */
val ATOMIC_STAGE = listOf(
    stage("The 1% rule", Backdrops.studio(androidx.compose.ui.graphics.Color(0xFF1F3550))) {
        add("you", Bean(Pal.Mint), 80, 236)
        add("bigStar", Star(Pal.Gold, 34f), 290, 95)
        for (i in 0 until 6) add("st$i", Star(Pal.Mint, 7f), 130 + i * 26, 226 - i * 6)
        add("chart", LineChart(220f, 140f, Pal.Mint, { t -> 1.01f.pow(365f * t) / 38f }, xLabel = "1 year", yLabel = "you",
            endLabel = "37× better", rider = Bean(Pal.Mint)), 165, 130).with("ax", 0)
        add("bad", LineChart(220f, 140f, Pal.Coral, { t -> 0.99f.pow(365f * t) / 38f }, axes = false, endLabel = "0.03×",
            labelDy = 16f, rider = Bean(Pal.Coral), riderMood = -0.7f), 165, 130)
        add("mult", Counter(28f, Pal.Mint, 2, prefix = "×", map = { 1.01f.pow(365f * it) }), 335, 92)
        add("day", Counter(13f, Pal.White, 0, prefix = "day ", halo = false, map = { 1f + 364f * it }), 335, 120)
        add("flat", Caption("first months: the two lines look the same", 7.5f, Pal.White, 700, chip = Pal.Ink.a(0.7f), maxWidth = 80f), 92, 150)
        add("warm", Warmth(r = 150f), 520, 170)
        add("table", Table(130f), 520, 214)
        add("ice", IceCube(), 512, 210)
        add("drips", Drips(androidx.compose.ui.graphics.Color(0xFF9ED7FA), 34f), 512, 186)
        add("therm", Thermometer(), 602, 172)
        add("noIce", Caption("25° … 31°: nothing visible", 11f, Pal.Sky, chip = Pal.Ink.a(0.6f)), 500, 80)
        add("melt", Caption("32°: it melts. The heat was building the whole time.", 11f, Pal.Gold, chip = Pal.Ink.a(0.6f), maxWidth = 160f), 470, 84)
        beat { show("you"); set("you", "look", 1, 600) }
        beat("big moments") { show("bigStar"); set("you", "wow", 1, 300); set("you", "arms", 0.6, 500) }
        beat("small, repeated actions") {
            scale("bigStar", 0.45, 900, ease = Ease.InOut); dim("bigStar", to = 0.35)
            set("you", "wow", 0, 300); set("you", "arms", 0, 400); set("you", "look", 0.6, 400); set("you", "mood", 0.8, 500)
            show("st0", "st1", "st2", "st3", "st4", "st5", stagger = 140)
        }
        beat("one percent better each day") {
            hide("you", "bigStar", "st0", "st1", "st2", "st3", "st4", "st5")
            show("chart", "mult", "day", delay = 300)
            set("chart", "ax", 1, 900, 300)
            set("mult", "v", 1f / 365f, 900, 900); set("day", "v", 1f / 365f, 900, 900)
        }
        beat("dramatic over a year") {
            play("chart", dur = 3600, ease = Ease.Linear)
            set("mult", "v", 1, 3600, 0, Ease.Linear); set("day", "v", 1, 3600, 0, Ease.Linear)
        }
        beat("one percent worse") { show("bad"); play("bad", dur = 3000, ease = Ease.Linear) }
        beat("nothing seems to be happening") { camera(95, 172, 2.4, 1600); show("flat", delay = 900) }
        beat("plateau of latent potential") {
            hide("flat", "chart", "bad", "mult", "day"); camera(530, 158, 1.25, 1700)
            show("table", "ice", "therm", delay = 600, stagger = 160); show("warm", delay = 600)
        }
        beat("twenty-five") { set("therm", "temp", 31, 4200, 0, Ease.Linear); set("warm", "v", 0.55, 4200); show("noIce", delay = 400) }
        beat("thirty-two") {
            set("therm", "temp", 32, 700, 0, Ease.Linear); set("warm", "v", 1, 800)
            set("ice", "melt", 1, 3600, 500, Ease.InOut); show("drips", delay = 400)
            hide("noIce"); show("melt", delay = 500)
        }
    },
    stage("Systems beat goals", Backdrops.Day) {
        add("win", Bean(Pal.Mint, Pal.Skin[1], Pal.Hair[0], 0, seed = 1), 110, 236)
        add("lose", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[2], 1, seed = 4), 230, 236)
        add("bw", Bubble("I want to win!", 92f, 0f, thought = true), 110, 100)
        add("bl", Bubble("I want to win!", 92f, 0f, thought = true), 230, 100)
        add("calW", Calendar(7, 3, "DAILY RUNS", Pal.Mint), 108, 108, 0.72)
        add("calL", Calendar(7, 3, "DAILY RUNS", Pal.Coral, misses = setOf(1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20)), 232, 108, 0.72)
        add("same", Tag("same goal", Pal.Gold), 170, 40)
        add("sys", Tag("different system", Pal.Mint), 170, 50)
        add("you", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[3], 3, seed = 7), 500, 236)
        add("badge", IdBadge("A RUNNER", Pal.Sky), 500, 100)
        add("box", BallotBox(), 620, 206)
        val ballots = listOf(true, true, false, true, false, true)
        ballots.forEachIndexed { i, f -> add("b$i", Ballot(f), 600 + (i % 3) * 20, 70) }
        add("tally", Caption("4 for, 2 against: the majority wins", 12f, Pal.Mint, chip = Pal.Ink.a(0.6f), maxWidth = 160f), 620, 140)
        add("conf", Confetti(), 500, 150)
        beat("Winners and losers") { camera(170, 150, 1.05, 900); show("win", "lose") }
        beat("same goals") { show("bw", "bl", stagger = 200); show("same", delay = 300) }
        beat("system of daily actions") {
            hide("bw", "bl", "same"); show("calW", "calL", stagger = 150); show("sys", delay = 400)
            set("calW", "done", 21, 2800, 400, Ease.Linear); set("calL", "done", 21, 2800, 400, Ease.Linear)
            set("win", "mood", 0.9, 800, 2600); set("lose", "mood", -0.5, 800, 2600)
        }
        beat("systems are what make progress") { set("win", "arms", 1, 500); set("win", "jump", 1, 400); set("win", "jump", 0, 400, 1600) }
        beat("identity") { camera(560, 150, 1.05, 1500); show("you", delay = 500) }
        beat("who you believe you are") { show("badge"); set("you", "mood", 0.8, 600); set("you", "look", 0.5, 400) }
        beat("is a vote") {
            show("box")
            ballots.indices.forEach { i ->
                val d = 300 + i * 420
                show("b$i", delay = d)
                move("b$i", 620, 196, 520, d + 240, Ease.In)
                hide("b$i", delay = d + 700, dur = 150)
            }
        }
        beat("just a majority") { show("tally") }
        beat("small wins") { set("you", "arms", 1, 500); set("you", "jump", 1, 300); show("conf"); play("conf", dur = 1800, ease = Ease.Out) }
    },
    stage("The habit loop", Backdrops.studio(androidx.compose.ui.graphics.Color(0xFF2E2350))) {
        add("loop", HabitLoop(92f), 200, 150)
        add("bell", Bell(), 200, 62, 0.9)
        add("heart", Heart(Pal.Rose), 292, 152, 0.9)
        add("doer", Bean(Pal.Mint, seed = 2), 200, 262, 0.55)
        add("trophy", Trophy(), 108, 158, 0.62)
        add("tCue", Tag("1 · CUE", Pal.Sky), 200, 20)
        add("tCrave", Tag("2 · CRAVING", Pal.Rose), 352, 112)
        add("tResp", Tag("3 · RESPONSE", Pal.Mint), 290, 266)
        add("tRew", Tag("4 · REWARD", Pal.Gold), 50, 112)
        add("lObv", Tag("make it obvious", Pal.White, 9.5f), 200, 104)
        add("lAtt", Tag("attractive", Pal.White, 9.5f), 243, 150)
        add("lEasy", Tag("easy", Pal.White, 9.5f), 200, 196)
        add("lSat", Tag("satisfying", Pal.White, 9.5f), 157, 150)
        add("iObv", Tag("invisible", Pal.Coral, 9.5f), 200, 104)
        add("iAtt", Tag("unattractive", Pal.Coral, 9.5f), 243, 150)
        add("iEasy", Tag("difficult", Pal.Coral, 9.5f), 200, 196)
        add("iSat", Tag("unsatisfying", Pal.Coral, 9.5f), 157, 150)
        add("conf", Confetti(count = 26, power = 70f), 108, 150)
        beat("four stages") { show("loop"); play("loop", dur = 1800) }
        beat("a cue triggers") { show("bell", "tCue"); set("bell", "ring", 1, 200); set("bell", "ring", 0, 600, 1500); set("loop", "orbOn", 1, 400) }
        beat("a craving") { set("loop", "orb", 1, 1100); show("heart", "tCrave", delay = 700); set("heart", "beat", 1, 300, 700) }
        beat("motivates a response") { set("loop", "orb", 2, 1100); show("doer", "tResp", delay = 700); set("doer", "walk", 1, 300, 800) }
        beat("delivers a reward") {
            set("loop", "orb", 3, 1100); show("trophy", "tRew", delay = 700)
            show("conf", delay = 900); play("conf", dur = 1500, delay = 900, ease = Ease.Out)
        }
        beat("repeat the loop") { set("loop", "orb", 8, 3400, 0, Ease.InOut); set("doer", "walk", 0, 300) }
        beat("make it obvious") { show("lObv") }
        beat("make it attractive") { show("lAtt") }
        beat("make it easy") { show("lEasy") }
        beat("make it satisfying") { show("lSat") }
        beat("invert them") {
            hide("lObv", "lAtt", "lEasy", "lSat"); set("loop", "orbOn", 0, 600)
            show("iObv", "iAtt", "iEasy", "iSat", delay = 300, stagger = 180)
            set("doer", "mood", -0.4, 600)
        }
    },
    stage("Law 1 · Make it obvious", Backdrops.room()) {
        add("you", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[1], 1, seed = 3), 80, 236)
        add("plan", Tile("I will RUN at 7 AM in the PARK", Pal.Navy, 210f, 44f, Bell(Pal.Gold), 12f, iconScale = 0.45f), 255, 62)
        add("bars", Bars(listOf(0.33f, 0.9f), listOf("vague goal", "time + place"), listOf(Pal.Slate, Pal.Mint), 150f, 100f, listOf("1×", "2–3×")), 262, 170)
        add("table", Table(110f), 560, 214)
        add("cup", CoffeeCup(), 560, 210)
        add("tAfter", Tag("after my coffee…", Pal.Sky), 560, 120)
        add("link", Arrow(110f, 0f, -40f, Pal.Mint), 600, 170)
        add("med", Bean(Pal.Violet, Pal.Skin[0], Pal.Hair[1], 2, seed = 5), 740, 236).with("sit", 1).with("mood", 0.8)
        add("tMed", Tag("…I meditate 1 min", Pal.Violet), 740, 120)
        add("glowG", Sparkles(Pal.Gold, 60f, 14), 1010, 170)
        add("guitar", Guitar(), 1010, 205)
        add("tG", Tag("guitar: in plain sight", Pal.Mint), 1010, 70)
        add("shelf", Table(90f), 1170, 214)
        add("jar", CookieJar(), 1170, 210)
        add("tJ", Tag("junk food: out of sight", Pal.Coral), 1170, 70)
        beat("designing your environment") { show("you") }
        beat("Implementation intentions") { show("plan"); set("you", "point", 1, 500); set("you", "look", 1, 300) }
        beat("double follow-through") { show("bars"); play("bars", dur = 1600); set("you", "point", 0, 400); set("you", "mood", 0.9, 400) }
        beat("Habit stacking") { camera(650, 160, 1.05, 1500); show("table", "cup", "tAfter", delay = 500) }
        beat("meditate for one minute") { show("link"); play("link", dur = 900); show("med", "tMed", delay = 600) }
        beat("guitar") { camera(1090, 160, 1.05, 1500); show("glowG", "guitar", "tG", "shelf", "jar", delay = 500, stagger = 140) }
        beat("junk food") { set("jar", "r", -8, 300); set("jar", "r", 8, 300, 300); set("jar", "r", 0, 300, 600) }
        beat("out of sight") { move("jar", 1240, 300, 1100, 0, Ease.In); hide("jar", delay = 800); show("tJ", delay = 300) }
    },
    stage("Law 2 · Make it attractive", Backdrops.studio(androidx.compose.ui.graphics.Color(0xFF3A2350))) {
        add("brain", Brain(), 70, 105, 0.9)
        add("chart", LineChart(210f, 120f, Pal.Gold, { t -> 0.08f + 0.9f * exp(-((t - 0.38f) / 0.13f).pow(2)) }, xLabel = "time", yLabel = "dopamine"), 255, 115).with("ax", 0)
        add("tWant", Tag("wanting peaks BEFORE the reward", Pal.Gold), 230, 28)
        add("gift", Gift(), 290, 228)
        add("tGot", Tag("getting it: less of a spike", Pal.Slate, dark = false), 290, 270)
        add("tread", Treadmill(), 640, 238)
        add("runner", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[0], 0, seed = 6), 630, 232).with("walk", 1)
        add("phones", Headphones(), 630, 161)
        add("tNeed", Tag("NEED: workout", Pal.Slate, dark = false), 560, 76)
        add("plus", Caption("+", 20f), 640, 76)
        add("tWant2", Tag("WANT: favourite podcast", Pal.Violet), 735, 76)
        add("tOnly", Caption("only allowed together", 12f, Pal.Mint), 645, 108)
        val crew = listOf(Pal.Mint, Pal.Gold, Pal.Sky, Pal.Rose)
        crew.forEachIndexed { i, c -> add("c$i", Bean(c, Pal.Skin[i % 4], Pal.Hair[i % 5], i % 4, seed = 10 + i), 1020 + i * 50, 236).with("walk", 1).with("mood", 0.8) }
        add("tNorm", Tag("a group where it's normal", Pal.Mint), 1095, 90)
        beat("dopamine") { show("brain", "chart"); set("chart", "ax", 1, 900) }
        beat("anticipation of a reward") {
            play("chart", dur = 2400, ease = Ease.Linear)
            set("brain", "glow", 1, 700, 500); show("tWant", delay = 900)
        }
        beat("rather than on receiving it") { show("gift"); set("gift", "open", 1, 900, 500); set("brain", "glow", 0.25, 900, 500); show("tGot", delay = 900) }
        beat("Temptation bundling") { camera(650, 160, 1.05, 1500); show("tread", "runner", "phones", delay = 500, stagger = 150) }
        beat("something you need to do") { show("tNeed") }
        beat("something you want to do") { show("plus", "tWant2"); show("tOnly", delay = 500); set("runner", "mood", 0.9, 500) }
        beat("join groups") { camera(1095, 160, 1.05, 1500); show("c0", "c1", "c2", "c3", delay = 500, stagger = 160); show("tNorm", delay = 1100) }
    },
    stage("Law 3 · Make it easy", Backdrops.room(androidx.compose.ui.graphics.Color(0xFF3B5A55))) {
        add("you", Bean(Pal.Leaf, Pal.Skin[3], Pal.Hair[0], 0, seed = 8), 80, 236).with("mood", -0.2)
        add("pages", PageStack(), 225, 232).with("n", 30)
        add("cBig", Caption("“read 30 pages”", 12f, Pal.White, chip = Pal.Ink.a(0.6f)), 225, 120)
        add("cSmall", Caption("“read 1 page”", 12f, Pal.Mint, chip = Pal.Ink.a(0.6f)), 225, 150)
        add("timer", Timer(26f, Pal.Mint, "2 minutes"), 335, 112)
        add("habit", Caption("the habit is showing up", 15f, Pal.Mint), 200, 40)
        add("ok", Mark(true, 13f), 335, 190)
        add("shoes", Shoes(), 570, 236)
        add("tShoes", Tag("shoes by the door, night before", Pal.Mint), 600, 120)
        add("piggy", PiggyBank(), 740, 236)
        for (i in 0 until 3) add("coin$i", Coin(9f), 740, 60)
        add("tAuto", Tag("automatic saving", Pal.Gold), 740, 120)
        beat("reducing friction") { show("you", "pages", "cBig", stagger = 200); set("you", "look", 1, 400); set("you", "wow", 1, 400) }
        beat("scale any new habit down") {
            set("pages", "n", 1, 1800, 200, Ease.InOut); hide("cBig", delay = 600); show("cSmall", delay = 1400)
            set("you", "wow", 0, 400); set("you", "mood", 0.9, 600, 1200)
        }
        beat("two minutes") { show("timer"); play("timer", dur = 2200, ease = Ease.Linear) }
        beat("showing up") { show("habit", "ok"); set("you", "arms", 1, 500); set("you", "jump", 1, 300); set("you", "jump", 0, 300, 1500) }
        beat("Prime your environment") { camera(650, 160, 1.05, 1500); show("shoes", "tShoes", delay = 500) }
        beat("Automate") {
            show("piggy", "tAuto")
            (0 until 3).forEach { i ->
                val d = 400 + i * 450
                show("coin$i", delay = d); move("coin$i", 740, 196, 550, d + 150, Ease.In); hide("coin$i", delay = d + 650, dur = 120)
            }
        }
    },
    stage("Law 4 · Make it satisfying", Backdrops.studio(androidx.compose.ui.graphics.Color(0xFF1F4545))) {
        add("brain", Brain(), 205, 80, 0.75)
        add("now", Gift(Pal.Mint, Pal.White), 95, 225)
        add("later", Gift(Pal.Violet), 320, 225, 1.5)
        add("tNow", Tag("reward NOW", Pal.Mint), 95, 270)
        add("tLater", Tag("reward in a year", Pal.Violet), 320, 274)
        add("pick", Arrow(-80f, 90f, 30f, Pal.Mint), 185, 112)
        add("tPick", Caption("the brain picks now", 11f, Pal.Mint), 120, 140)
        add("cal", Calendar(7, 3, "HABIT TRACKER", Pal.Mint), 600, 130)
        add("streak", Counter(22f, Pal.Gold, 0, suffix = "-day streak"), 600, 232)
        add("chain", Chain(7, listOf(2, 4, 5)), 1100, 130)
        add("once", Caption("miss once: an accident", 13f, Pal.Gold), 1100, 200)
        add("twice", Caption("miss twice: a new habit", 13f, Pal.Coral), 1100, 230)
        beat("immediate rewards") { show("brain", "now", "later", "tNow", "tLater", stagger = 120); show("pick", delay = 700); play("pick", dur = 800, delay = 700); show("tPick", delay = 1300) }
        beat("instant pleasure") { set("now", "open", 1, 900) }
        beat("Habit tracking") { camera(600, 160, 1.05, 1500); show("cal", delay = 500); set("cal", "done", 21, 2600, 700, Ease.Linear) }
        beat("streak to protect") { show("streak"); set("streak", "v", 21, 1600, 0, Ease.Out) }
        beat("never miss twice") { camera(1100, 160, 1.05, 1500); show("chain", delay = 400); set("chain", "p", 0); play("chain", dur = 1200, delay = 500, ease = Ease.Out) }
        beat("Missing once") { set("chain", "broken", 1, 700); show("once", delay = 300) }
        beat("missing twice") { set("chain", "broken", 3, 1000); show("twice", delay = 400) }
    },
    stage("Keep improving", Backdrops.Paper) {
        add("you", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[1], 2, seed = 9), 80, 236)
        add("built", Caption("play a game that suits you", 13f, Pal.White), 200, 40)
        add("gauge", Gauge(56f), 230, 160)
        add("chart", LineChart(200f, 110f, Pal.Slate, { t -> 0.7f * (1f - exp(-6f * t)) }, xLabel = "time", yLabel = "skill",
            endLabel = "autopilot: plateau", rider = Bean(Pal.Slate)), 620, 140).with("ax", 0)
        add("grow", LineChart(200f, 110f, Pal.Mint, { t -> 0.7f * (1f - exp(-6f * t)) + if (t > 0.55f) (t - 0.55f) * 0.62f else 0f },
            axes = false, endLabel = "with review", rider = Bean(Pal.Mint)), 620, 140)
        add("lens", Magnifier(), 560, 120)
        add("me", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[3], 3, seed = 11), 1040, 236)
        add("r1", Tag("runner", Pal.Coral), 960, 110)
        add("r2", Tag("writer", Pal.Gold), 1040, 80)
        add("r3", Tag("friend", Pal.Mint), 1120, 110)
        add("x1", Mark(false, 11f), 960, 110)
        add("still", Caption("one role slips; you're still you", 12f, Pal.Mint), 1040, 40)
        beat("natural abilities") { show("you", "built") }
        beat("just-manageable difficulty") {
            show("gauge"); set("gauge", "v", 0.95, 900, 300); set("you", "wow", 1, 300, 900)
            set("gauge", "v", 0, 1000, 1500, Ease.Back); set("you", "wow", 0, 300, 1700); set("you", "mood", 0.9, 500, 1800)
        }
        beat("becomes automatic") { camera(620, 150, 1.05, 1500); show("chart", delay = 400); set("chart", "ax", 1, 800, 500); play("chart", dur = 2400, delay = 900) }
        beat("reflection and review") {
            show("lens"); move("lens", 690, 110, 1600, 0, Ease.InOut); hide("lens", delay = 1700)
            show("grow", delay = 600); play("grow", dur = 2600, delay = 700)
        }
        beat("keep your identity loose") { camera(1040, 150, 1.05, 1500); show("me", "r1", "r2", "r3", delay = 500, stagger = 150) }
        beat("setback in one role") { dim("r1", to = 0.35); show("x1"); show("still", delay = 600); set("me", "mood", 0.8, 500) }
    },
    stage("The takeaway", Backdrops.Studio) {
        add("goals", Dash(250f, "GOALS"), 175, 72)
        add("you", Bean(Pal.Mint, seed = 12), 175, 70)
        add("plat", Platform(220f, Pal.Mint, "SYSTEMS"), 175, 226)
        add("cal", Calendar(7, 2, "DAILY", Pal.Mint), 335, 118, 0.75)
        add("curve", LineChart(80f, 55f, Pal.Mint, { t -> 1.01f.pow(365f * t) / 38f }, axes = false), 335, 200)
        add("conf", Confetti(), 175, 140)
        beat("rise to the level of your goals") { show("goals", "you"); set("you", "look", -0.5, 400) }
        beat("fall to the level of your systems") {
            show("plat"); set("you", "wow", 1, 250)
            move("you", 175, 218, 900, 300, Ease.In)
            set("you", "wow", 0, 250, 1250); set("you", "mood", 0.8, 400, 1300)
        }
        beat("Build the system") { show("cal"); set("cal", "done", 14, 2000, 300, Ease.Linear) }
        beat("cast the votes") { set("you", "arms", 1, 500); set("you", "jump", 1, 300); set("you", "jump", 0, 300, 1400) }
        beat("compounding") { show("curve"); play("curve", dur = 2000); show("conf", delay = 1800); play("conf", dur = 1800, delay = 1800, ease = Ease.Out) }
    },
)
