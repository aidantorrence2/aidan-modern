package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color
import com.aidantorrence.syncstudy.OutliersProps.ClubStage
import com.aidantorrence.syncstudy.OutliersProps.Cockpit
import com.aidantorrence.syncstudy.OutliersProps.Door
import com.aidantorrence.syncstudy.OutliersProps.House
import com.aidantorrence.syncstudy.OutliersProps.Ladder
import com.aidantorrence.syncstudy.OutliersProps.LongTable
import com.aidantorrence.syncstudy.OutliersProps.MonthStrip
import com.aidantorrence.syncstudy.OutliersProps.PastaPlate
import com.aidantorrence.syncstudy.OutliersProps.Player
import com.aidantorrence.syncstudy.OutliersProps.RicePaddy
import com.aidantorrence.syncstudy.OutliersProps.Terminal
import com.aidantorrence.syncstudy.OutliersProps.Wave
import com.aidantorrence.syncstudy.OutliersProps.Wine
import kotlin.math.floor
import kotlin.math.min
import kotlin.math.pow

/** Summer gap: steady learning all year vs learning only during the school year (4 years, summers flat). */
private fun schoolOnly(t: Float): Float {
    val y = 4f * t
    val full = floor(y)
    val part = min((y - full) / 0.75f, 1f)
    return 0.05f + 0.9f * 0.72f * (full + part) / 4f
}

/** Animated explainer films for Outliers, one per paragraph. */
val OUTLIERS_STAGE = listOf(
    stage("Look around, not just at", Backdrops.Day) {
        add("h1", House(Pal.Paper, Pal.Coral), 80, 236)
        add("h2", House(Color(0xFFF2D9B0), Pal.Navy), 160, 236)
        add("h3", House(Pal.Paper, Pal.Leaf.darken(0.2f)), 240, 236)
        add("tTown", Tag("Roseto, Pennsylvania", Pal.Gold), 160, 120)
        add("heart", Heart(Pal.Rose), 330, 74, 0.7)
        add("bars", Bars(listOf(0.25f, 0.85f), listOf("Roseto", "nearby"), listOf(Pal.Leaf, Pal.Coral), 100f, 70f), 335, 160)
        add("tHeart", Caption("heart disease", 10f, Pal.Ink, 800), 335, 108)
        add("f0", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[0], 0, seed = 1), 520, 236, 0.9)
        add("f1", Bean(Pal.Gold, Pal.Skin[0], Pal.Hair[1], 1, seed = 2), 580, 236, 0.9)
        add("f2", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[4], 0, seed = 3), 640, 236, 0.9)
        add("f3", Bean(Pal.Leaf, Pal.Skin[0], Pal.Hair[2], 2, seed = 4), 700, 236, 0.9)
        add("table", LongTable(240f), 610, 200)
        add("p0", PastaPlate(), 545, 196)
        add("p1", PastaPlate(), 625, 196)
        add("wine", Wine(), 690, 197)
        add("tHeavy", Tag("pasta, wine, cigars", Pal.Coral), 610, 70)
        add("tComm", Tag("the community", Pal.Leaf), 610, 70)
        add("plat", Platform(250f, Pal.Gold), 1000, 150)
        add("star", Bean(Pal.Gold, Pal.Skin[2], Pal.Hair[3], 3, seed = 5), 1000, 140).with("arms", 1).with("mood", 0.9)
        add("tTal", Tag("talent", Pal.Gold), 920, 80)
        add("tGrit", Tag("grit", Pal.Gold), 1080, 80)
        add("s0", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[0], 0, seed = 6), 955, 236).with("arms", 1)
        add("s1", Bean(Pal.Violet, Pal.Skin[3], Pal.Hair[1], 1, seed = 7), 1045, 236).with("arms", 1)
        add("s2", Bean(Pal.Leaf, Pal.Skin[0], Pal.Hair[2], 2, seed = 8), 885, 236).with("arms", 1)
        add("s3", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[4], 0, seed = 9), 1115, 236).with("arms", 1)
        add("tAdv", Tag("hidden advantages", Pal.Mint), 920, 280)
        add("tCult", Tag("cultural legacy", Pal.Violet), 1080, 280)
        add("tOpp", Tag("extraordinary opportunities", Pal.Sky), 1000, 300)
        add("look", Caption("look around them, not just at them", 13f, Pal.White, chip = Pal.Ink.a(0.6f)), 1000, 330)
        beat("called Roseto") { show("h1", "h2", "h3", stagger = 150); show("tTown", delay = 500) }
        beat("heart disease") { show("heart", "tHeart", "bars"); play("bars", dur = 1400, delay = 300); set("heart", "beat", 1, 300) }
        beat("smoking, drinking") {
            hide("tTown"); camera(610, 150, 1.0, 1500)
            show("table", "p0", "p1", "wine", delay = 700, stagger = 150); show("tHeavy", delay = 1200)
        }
        beat("the community itself") { hide("tHeavy"); show("f0", "f1", "f2", "f3", stagger = 150); show("tComm", delay = 600) }
        beat("shared meals") { listOf("f0", "f1", "f2", "f3").forEachIndexed { i, id -> set(id, "mood", 0.95, 500, i * 120); set(id, "look", if (i < 2) 1 else -1, 400, i * 120) } }
        beat("talent and grit") { camera(1000, 150, 1.0, 1500); show("plat", "star", delay = 700); show("tTal", "tGrit", delay = 1200) }
        beat("hidden advantages") { camera(1000, 175, 0.9, 1200); show("s0", "s1", stagger = 200); show("tAdv", delay = 500) }
        beat("cultural legacies") { show("s2", "s3", stagger = 200); show("tCult", delay = 400) }
        beat("extraordinary opportunities") { show("tOpp") }
        beat("look around them") { camera(1000, 180, 0.8, 1200); show("look", delay = 600) }
    },
    stage("The birthday advantage", Backdrops.studio(Color(0xFF22405A))) {
        add("months", MonthStrip(), 200, 62)
        val jerseys = listOf(Pal.Coral, Pal.Coral, Pal.Coral, Pal.Navy, Pal.Navy)
        val born = listOf("Jan", "Feb", "Mar", "Jul", "Nov")
        for (i in 0 until 5) {
            add("pl$i", Player(jerseys[i], "${7 + i * 4}", Pal.Skin[i % 4], Pal.Hair[i % 5], seed = 20 + i), 70 + i * 66, 236, 0.85)
            add("b$i", Tag(born[i], if (i < 3) Pal.Gold else Pal.Slate, dark = i < 3), 70 + i * 66, 272)
        }
        add("old", Player(Pal.Coral, "1", Pal.Skin[1], Pal.Hair[0], seed = 30), 560, 236)
        add("young", Player(Pal.Navy, "2", Pal.Skin[0], Pal.Hair[2], seed = 31), 650, 236, 0.78)
        add("tOld", Tag("born January", Pal.Gold), 560, 280)
        add("tYoung", Tag("born December", Pal.Slate, dark = false), 650, 280)
        add("team", Platform(110f, Pal.Gold, "ALL-STARS"), 520, 226)
        add("calO", Calendar(7, 2, "PRACTICE", Pal.Gold), 470, 100, 0.7)
        add("calY", Calendar(7, 2, "PRACTICE", Pal.Slate, misses = setOf(1, 2, 4, 5, 6, 8, 9, 11, 12, 13)), 690, 100, 0.7)
        add("trophy", Trophy(), 600, 150, 0.6)
        add("gap", LineChart(220f, 120f, Pal.Gold, { t -> 0.15f + 0.8f * t.pow(1.4f) }, xLabel = "age", yLabel = "skill", endLabel = "picked early"), 1000, 140).with("ax", 0)
        add("gap2", LineChart(220f, 120f, Pal.Slate, { t -> 0.08f + 0.32f * t }, axes = false, endLabel = "picked late", labelDy = 14f), 1000, 140)
        add("tAcc", Tag("accumulative advantage", Pal.Gold), 1000, 236)
        add("tSchool", Caption("same in school: the youngest are flagged \"gifted\" less often", 11f, Pal.White, chip = Pal.Ink.a(0.6f), maxWidth = 300f), 1000, 272)
        beat("elite Canadian hockey players") { show("pl0", "pl1", "pl2", "pl3", "pl4", stagger = 120) }
        beat("January, February, or March") { show("months"); set("months", "hi", 1, 800, 300); show("b0", "b1", "b2", "b3", "b4", delay = 500, stagger = 100) }
        beat("cutoff date") { set("months", "cut", 1, 900) }
        beat("the oldest children") {
            camera(590, 150, 1.0, 1500); show("old", "young", delay = 700); show("tOld", "tYoung", delay = 1000)
        }
        beat("better teams") { hide("tOld"); show("team"); move("old", 520, 216, 900, 300); set("old", "jump", 0.6, 200, 300); set("old", "jump", 0, 300, 1200); set("young", "mood", -0.2, 500) }
        beat("more coaching") { show("calO", "calY", stagger = 150); set("calO", "done", 14, 1800, 300, Ease.Linear); set("calY", "done", 14, 1800, 300, Ease.Linear) }
        beat("really are better") { scale("old", 1.2, 900); show("trophy", delay = 300); set("old", "arms", 1, 500, 300); set("young", "mood", -0.5, 500) }
        beat("compounds into a large one") {
            camera(1000, 150, 1.0, 1500); show("gap", "gap2", delay = 700); set("gap", "ax", 1, 700, 800)
            play("gap", dur = 2200, delay = 1100); play("gap2", dur = 2200, delay = 1100); show("tAcc", delay = 2600)
        }
        beat("identified as gifted") { show("tSchool") }
    },
    stage("10,000 hours", Backdrops.studio(Color(0xFF2B2240))) {
        add("ring", Ring(52f, Pal.Gold, 7f, "mastery", 13f), 200, 150)
        add("hours", Counter(30f, Pal.Gold, 0, suffix = " hours"), 200, 52)
        add("club", ClubStage("HAMBURG"), 600, 224)
        for (i in 0 until 3) {
            add("m$i", Bean(listOf(Pal.Slate, Pal.Navy, Color(0xFF3A3A3A))[i], Pal.Skin[0], Pal.Hair[i % 2], i % 2, seed = 40 + i), 540 + i * 60, 224, 0.8)
            add("g$i", Guitar(), 546 + i * 60, 202, 0.42)
        }
        add("set", Counter(18f, Pal.Rose, 0, prefix = "", suffix = " shows before fame", halo = false), 600, 60)
        add("term", Terminal(), 1030, 236)
        add("teen", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[2], 0, seed = 44), 945, 236, 0.85).with("point", 1)
        add("t68", Tag("1968: rare computer time", Pal.Mint), 1000, 70)
        add("teenHours", Tag("unlimited access", Pal.Mint, dark = true), 1000, 98)
        add("luck", Tag("luck", Pal.Gold), 900, 130)
        add("fam", Tag("family", Pal.Rose), 945, 106)
        add("time", Tag("timing", Pal.Sky), 1105, 130)
        add("wave", Wave(280f), 1400, 170)
        add("surfer", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[0], 0, seed = 45), 1430, 112, 0.55).with("arms", 0.6)
        add("line", Dash(300f, "", Pal.Slate), 1400, 256)
        add("d1830", Star(Pal.Slate, 8f), 1300, 256)
        add("t1830", Tag("born 1830s", Pal.Slate, dark = false), 1300, 280)
        add("d1955", Star(Pal.Gold, 9f), 1500, 256)
        add("t1955", Tag("born ~1955", Pal.Gold), 1500, 280)
        add("tWave", Caption("the right moment to catch the wave", 12f, Pal.White, chip = Pal.Ink.a(0.6f)), 1400, 40)
        beat("ten thousand hour rule") { show("ring", "hours"); play("ring", dur = 2600, ease = Ease.InOut); set("hours", "v", 10000, 2600, 0, Ease.InOut) }
        beat("Beatles played eight-hour sets") {
            camera(600, 150, 1.0, 1500); show("club", delay = 600)
            show("m0", "m1", "m2", "g0", "g1", "g2", delay = 900, stagger = 100); show("set", delay = 1300); set("set", "v", 1200, 3000, 1300, Ease.InOut)
            listOf("m0", "m1", "m2").forEach { set(it, "mood", 0.9, 400, 1300) }
        }
        beat("Gates had rare") { camera(1000, 150, 1.0, 1500); show("term", "teen", delay = 700) }
        beat("1968") { show("t68"); show("teenHours", delay = 300) }
        beat("enormous practice") { set("teen", "mood", 0.9, 400) }
        beat("luck, family, and timing") { show("luck", "fam", "time", stagger = 200) }
        beat("1830s") { camera(1400, 150, 1.0, 1500); show("line", "d1830", "t1830", delay = 700, stagger = 150) }
        beat("born around 1955") { show("d1955", "t1955") }
        beat("specific wave") {
            show("wave"); set("wave", "rise", 0, 0); set("wave", "rise", 1, 1400, 200, Ease.Out)
            show("surfer", delay = 900); set("surfer", "jump", 0.3, 200, 1000); show("tWave", delay = 1200)
        }
    },
    stage("Smart enough, then what?", Backdrops.Paper) {
        add("brain", Brain(Pal.Rose), 90, 110, 0.9)
        add("iq", Counter(18f, Pal.Gold, 0, prefix = "IQ ", suffix = "+", halo = false), 90, 168)
        for (i in 0 until 6) add("k$i", Bean(listOf(Pal.Sky, Pal.Coral, Pal.Mint, Pal.Gold, Pal.Violet, Pal.Leaf)[i], Pal.Skin[i % 4], Pal.Hair[i % 5], i % 4, seed = 50 + i), 190 + i * 36, 236, 0.55)
        add("tTerman", Tag("high-IQ kids, studied for life", Pal.Sky), 280, 136)
        add("kStar", Star(Pal.Gold, 9f), 262, 172)
        add("tFew", Tag("few stood out", Pal.Slate, dark = false), 280, 280)
        add("langan", Bean(Pal.Slate, Pal.Skin[0], Pal.Hair[0], 0, seed = 56), 510, 236)
        add("lBrain", Brain(Pal.Rose), 510, 112, 0.55).with("glow", 1)
        add("closed", Door(Pal.Slate), 575, 236)
        add("tLangan", Tag("brilliant, but alone", Pal.Slate, dark = false), 530, 280)
        add("opp", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 57), 670, 236)
        add("official", Bean(Pal.Navy, Pal.Skin[0], Pal.Hair[4], 0, seed = 58), 740, 236, 1.08).with("mood", -0.1)
        add("talk", Bubble("Here's why it makes sense…", 100f, -0.3f), 655, 112)
        add("tOpp", Tag("talks his way through", Pal.Gold), 700, 280)
        add("chart", LineChart(220f, 110f, Pal.Sky, { t -> if (t < 0.45f) t * 1.4f else 0.63f + (t - 0.45f) * 0.12f }, xLabel = "IQ", yLabel = "success",
            endLabel = "levels off"), 1000, 120).with("ax", 0)
        add("thresh", Arrow(0f, -112f, 0f, Pal.Coral, 2f, dashed = true, head = false), 989, 176)
        add("tThresh", Tag("enough", Pal.Coral), 989, 52)
        add("pi1", Tag("read situations", Pal.Mint), 1000, 214)
        add("pi2", Tag("talk to authority", Pal.Mint), 1000, 240)
        add("pi3", Tag("get what you want", Pal.Mint), 1000, 266)
        add("hA", House(Pal.Paper, Pal.Sky), 1310, 236, 0.8)
        add("hB", House(Color(0xFFD9CBB4), Pal.Slate), 1490, 236, 0.8)
        add("kidA", Bean(Pal.Mint, Pal.Skin[0], Pal.Hair[2], 2, seed = 59), 1355, 236, 0.7)
        add("askA", Bubble("Can I ask a question?", 92f, -0.3f), 1360, 126)
        add("tCult", Tag("taught to negotiate", Pal.Mint), 1330, 280)
        add("kidB", Bean(Pal.Coral, Pal.Skin[2], Pal.Hair[0], 0, seed = 60), 1428, 236, 0.7).with("mood", -0.1)
        add("quietB", Bubble("(stays quiet)", 72f, -0.2f, thought = true, italic = true), 1440, 140)
        add("tDef", Tag("taught to defer", Pal.Slate, dark = false), 1475, 280)
        beat("raw intelligence") { show("brain", "iq"); set("brain", "glow", 1, 800); set("iq", "v", 140, 1500, 200, Ease.Out) }
        beat("Terman's long study") { show("k0", "k1", "k2", "k3", "k4", "k5", stagger = 90); show("tTerman", delay = 500) }
        beat("few remarkable achievements") {
            show("kStar", "tFew"); listOf("k0", "k1", "k3", "k4", "k5").forEach { dim(it, to = 0.45, delay = 300) }; set("k2", "arms", 1, 500)
        }
        beat("Chris Langan") { camera(620, 150, 1.0, 1500); show("langan", "lBrain", "closed", delay = 700); show("tLangan", delay = 1100); set("langan", "mood", -0.2, 400, 1000) }
        beat("Robert Oppenheimer") {
            show("opp", "official"); show("talk", delay = 400); show("tOpp", delay = 700)
            set("opp", "point", 1, 400, 300); set("official", "mood", 0.6, 500, 1200)
        }
        beat("beyond a threshold") {
            camera(1000, 150, 1.0, 1500); show("chart", delay = 600); set("chart", "ax", 1, 700, 700); play("chart", dur = 2000, delay = 1000)
            show("thresh", delay = 2000); play("thresh", dur = 600, delay = 2000); show("tThresh", delay = 2400)
        }
        beat("practical intelligence") { show("pi1", "pi2", "pi3", stagger = 250) }
        beat("taught by class") { camera(1400, 150, 1.0, 1500); show("hA", "hB", delay = 700) }
        beat("concerted cultivation") { show("kidA"); show("askA", delay = 300); set("kidA", "point", 1, 400, 300); show("tCult", delay = 500) }
        beat("taught deference") { show("kidB"); show("quietB", delay = 300); set("kidB", "look", -0.5, 400); show("tDef", delay = 500) }
    },
    stage("Cultural legacy", Backdrops.studio(Color(0xFF2E2A40))) {
        add("g0", Bean(Pal.Slate, Pal.Skin[0], Pal.Hair[4], 0, seed = 61), 90, 236)
        add("g1", Bean(Pal.Wood, Pal.Skin[0], Pal.Hair[1], 0, seed = 62), 200, 236, 0.95)
        add("g2", Bean(Pal.Coral, Pal.Skin[0], Pal.Hair[0], 0, seed = 63), 310, 236, 0.85)
        add("a01", Arrow(66f, 0f, -18f, Pal.Gold, 2f), 117, 130)
        add("a12", Arrow(66f, 0f, -18f, Pal.Gold, 2f), 227, 130)
        add("tHonor", Tag("a culture of honor", Pal.Gold), 90, 92)
        add("tGen", Tag("still there, generations later", Pal.Gold), 250, 60)
        add("cockpit", Cockpit(260f), 600, 118)
        add("capt", Bean(Pal.Navy, Pal.Skin[0], Pal.Hair[4], 0, seed = 64), 540, 236)
        add("co", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[0], 0, seed = 65), 660, 236, 0.92)
        add("hint", Bubble("…the weather looks a bit bad?", 104f, -0.7f, italic = true, textSize = 10.5f), 746, 196)
        add("direct", Bubble("Captain, we must turn back now.", 110f, -0.7f, textSize = 10.5f), 748, 196)
        add("ok", Mark(true, 12f), 600, 220)
        add("tDefer", Tag("hints instead of speaking up", Pal.Coral), 600, 284)
        add("paddy", RicePaddy(240f), 1000, 150).with("grow", 0)
        add("farmer", Bean(Pal.Leaf, Pal.Skin[1], Pal.Hair[0], 0, seed = 66), 1000, 236).with("hold", 1)
        add("tRice", Tag("patience and precision", Pal.Leaf), 1000, 280)
        add("n11", Tile("11 = ten-one", Pal.Navy, 104f, 30f, textSize = 11.5f), 940, 60)
        add("n21", Tile("21 = two-ten-one", Pal.Navy, 120f, 30f, textSize = 11.5f), 1070, 60)
        add("rich", LineChart(230f, 120f, Pal.Gold, { t -> 0.05f + 0.85f * t }, xLabel = "4 school years", yLabel = "reading", endLabel = "richer kids"), 1400, 130).with("ax", 0)
        add("poor", LineChart(230f, 120f, Pal.Slate, { t -> schoolOnly(t) }, axes = false, endLabel = "poorer kids", labelDy = 16f), 1400, 130)
        add("tSum", Tag("summers: gap opens", Pal.Coral), 1340, 226)
        add("ext", LineChart(230f, 120f, Pal.Mint, { t -> 0.05f + 0.84f * t }, axes = false, endLabel = "longer school year", labelDy = -44f), 1400, 130)
        beat("culture of honor") { show("g0", "tHonor") }
        beat("generations later") {
            show("g1", "g2", delay = 200, stagger = 500); show("a01", delay = 200); play("a01", dur = 600, delay = 200)
            show("a12", delay = 700); play("a12", dur = 600, delay = 700); show("tGen", delay = 1200)
        }
        beat("deference to authority") { camera(600, 150, 1.0, 1500); show("cockpit", "capt", "co", delay = 700); set("co", "look", -1, 300, 1200) }
        beat("captain's mistake") { set("cockpit", "storm", 1, 1500); show("hint", delay = 600); show("tDefer", delay = 900); set("co", "mood", -0.3, 400, 600) }
        beat("retraining how its pilots communicated") {
            hide("hint", "tDefer"); show("direct", delay = 300); set("co", "mood", 0.5, 400, 300); set("capt", "look", 1, 400, 800)
            set("cockpit", "storm", 0, 1600, 1400); show("ok", delay = 1600)
        }
        beat("rice farming") { camera(1000, 150, 1.0, 1500); show("paddy", "farmer", delay = 700); set("paddy", "grow", 1, 2400, 900); show("tRice", delay = 1300) }
        beat("simpler to learn") { show("n11", "n21", stagger = 250) }
        beat("summer gap") {
            camera(1400, 150, 1.0, 1500); show("rich", "poor", delay = 700); set("rich", "ax", 1, 700, 800)
            play("rich", dur = 2600, delay = 1100, ease = Ease.Linear); play("poor", dur = 2600, delay = 1100, ease = Ease.Linear)
        }
        beat("rich and poor") { show("tSum") }
        beat("extends the school day") { show("ext"); play("ext", dur = 2400, ease = Ease.Linear) }
    },
    stage("Build the ladders", Backdrops.Day) {
        add("d1", Door(Pal.Sky), 150, 236)
        add("d2", Door(Pal.Leaf), 240, 236)
        add("d3", Door(Pal.Coral), 330, 236)
        add("mom", Bean(Pal.Violet, Pal.Skin[3], Pal.Hair[0], 1, seed = 70), 60, 236)
        add("tJam", Tag("from Jamaica", Pal.Gold), 60, 120)
        add("tLuck", Tag("a chain of lucky breaks", Pal.Gold), 240, 60)
        add("tMerit", Caption("not earned by merit alone", 11f, Pal.Ink, 800, chip = Pal.Paper.a(0.85f)), 240, 86)
        add("doorE", Door(Pal.Navy), 640, 236)
        add("worker", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[2], 0, seed = 71), 590, 236).with("hold", 1)
        add("sweat", Drips(Color(0xFF9ED7FA), 18f), 590, 150)
        add("tEff", Tag("effort", Pal.Coral), 590, 280)
        add("tOpp", Tag("× opportunity", Pal.Gold), 660, 280)
        val crew = listOf(Pal.Mint, Pal.Gold, Pal.Sky, Pal.Rose, Pal.Leaf)
        for (i in 0 until 5) {
            add("lad$i", Ladder(80f), 880 + i * 60, 236).with("p", 0)
            add("c$i", Bean(crew[i], Pal.Skin[i % 4], Pal.Hair[i % 5], i % 4, seed = 72 + i), 880 + i * 60, 236, 0.7)
        }
        add("tBuild", Tag("build the ladders", Pal.Mint), 1000, 50)
        add("lone", Bulb(), 1176, 128, 0.6).with("on", 0)
        add("tWait", Caption("instead of waiting for a genius", 11f, Pal.Ink, 800, chip = Pal.Paper.a(0.85f)), 1000, 66)
        beat("from Jamaica") { show("mom", "tJam") }
        beat("chain of opportunities") {
            hide("tJam"); show("d1", "d2", "d3", stagger = 120); set("mom", "walk", 1, 200, 400)
            listOf("d1", "d2", "d3").forEachIndexed { i, d ->
                set(d, "open", 1, 500, 500 + i * 1100)
                move("mom", 150 + i * 90, 236, 900, 600 + i * 1100, Ease.InOut)
            }
            set("mom", "walk", 0, 200, 3800); set("mom", "mood", 0.9, 400, 3800); show("tLuck", delay = 1200)
        }
        beat("nothing to do with merit") { show("tMerit") }
        beat("effort is unimportant") { camera(620, 150, 1.0, 1500); show("doorE", "worker", "sweat", delay = 700); show("tEff", delay = 1000); set("worker", "mood", -0.2, 400) }
        beat("opportunity exists") {
            set("doorE", "open", 1, 700); show("tOpp", delay = 300); hide("sweat")
            set("worker", "hold", 0, 300, 600); set("worker", "walk", 1, 200, 700); move("worker", 640, 236, 900, 700, Ease.InOut)
            set("worker", "walk", 0, 200, 1600); set("worker", "arms", 1, 400, 1600); set("worker", "mood", 0.9, 400, 1600)
        }
        beat("build the structures") {
            camera(1000, 150, 1.0, 1500); show("c0", "c1", "c2", "c3", "c4", delay = 600, stagger = 100); show("tBuild", delay = 900)
            (0 until 5).forEach { i ->
                show("lad$i", delay = 1000 + i * 250); set("lad$i", "p", 1, 700, 1000 + i * 250)
                move("c$i", 880 + i * 60, 160, 700, 1800 + i * 250, Ease.Out); set("c$i", "arms", 1, 400, 2400 + i * 250); set("c$i", "mood", 0.9, 400, 2400 + i * 250)
            }
        }
        beat("wait for geniuses") { hide("tBuild"); show("lone", "tWait") }
    },
)
