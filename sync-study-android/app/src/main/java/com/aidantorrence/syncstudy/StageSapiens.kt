package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color

/** Animated explainer films for Sapiens, one per paragraph. */
val SAPIENS_STAGE = listOf(
    stage("Three revolutions", Backdrops.Dusk) {
        add("ape", Bean(Pal.Wood, Pal.Skin[2], Pal.Hair[0], 3, Color(0xFF5A3A24), seed = 51), 80, 236).with("look", 1)
        add("tApe", Tag("an unremarkable ape", Pal.Peach), 80, 128)
        add("lion", SapiensProps.Lion(), 300, 236)
        add("tStrong", Tag("stronger, faster…", Pal.Coral), 300, 150)
        add("globe", SapiensProps.Globe(48f), 200, 96)
        add("line", Arrow(370f, 0f, 0f, Pal.Paper, 2.5f), 515, 212)
        add("fire", SapiensProps.Campfire(), 580, 212)
        add("story", Bubble("Let me tell you a story…", 96f, 0f), 582, 112)
        add("t1", Tag("70,000 yrs ago · language", Pal.Gold), 585, 238)
        add("wheat", SapiensProps.Wheat(3), 690, 212)
        add("hut", SapiensProps.Hut(), 738, 212, 0.75)
        add("t2", Tag("12,000 yrs · farming", Pal.Leaf), 712, 262)
        add("scope", SapiensProps.Telescope(), 830, 212)
        add("bulb", Bulb(), 836, 120, 0.7).with("on", 0)
        add("t3", Tag("500 yrs · science", Pal.Sky), 828, 238)
        add("tPow", Tag("knowledge → power", Pal.Gold), 820, 64)
        beat("one species of ape") { show("ape", "tApe", stagger = 250) }
        beat("not the strongest") { show("lion", "tStrong", stagger = 250); set("ape", "wow", 1, 300, 300) }
        beat("dominate the planet") {
            hide("tStrong", "tApe"); dim("lion", to = 0.35)
            show("globe"); set("globe", "flag", 1, 800, 500); set("ape", "wow", 0, 300); set("ape", "arms", 1, 500, 600); set("ape", "mood", 1, 400, 600)
        }
        beat("three revolutions") { camera(690, 150, 1.0, 1500); show("line", delay = 400); play("line", dur = 1400, delay = 500) }
        beat("Cognitive Revolution") { show("fire", "t1", stagger = 250); show("story", delay = 700) }
        beat("Agricultural Revolution") { hide("story"); show("wheat", "hut", "t2", stagger = 220) }
        beat("Scientific Revolution") { show("scope", "bulb", "t3", stagger = 220) }
        beat("knowledge into power") { set("bulb", "on", 1, 700); show("tPow", delay = 300) }
    },
    stage("Shared stories", Backdrops.Night) {
        add("river", SapiensProps.River(230f), 270, 248)
        add("lion", SapiensProps.Lion(), 300, 238)
        add("teller", Bean(Pal.Wood, Pal.Skin[2], Pal.Hair[0], 3, Color(0xFF5A3A24), seed = 52), 80, 236).with("look", 1)
        add("fire", SapiensProps.Campfire(), 160, 238, 0.8)
        add("say1", Bubble("Lion by the river!", 92f, -0.3f), 110, 102)
        add("lionman", SapiensProps.LionMan(), 285, 226, 1.3)
        add("say2", Bubble("The lion spirit protects us.", 104f, -0.3f), 120, 102)
        listOf("gods", "nations", "money", "human rights").forEachIndexed { i, w ->
            add("f$i", Tag(w, listOf(Pal.Gold, Pal.Coral, Pal.Leaf, Pal.Sky)[i]), 60 + i * 92, 52)
        }
        for (i in 0 until 5) add("ch$i", SapiensProps.Chimp(if (i < 2) 1f else -1f), 600 + i * 40, 236 - (i % 2) * 6)
        add("tChimp", Tag("a few dozen who know each other", Pal.Leaf), 680, 130)
        add("crowd", SapiensProps.Multitude(30, 11, 9f), 1160, 165).with("n", 0)
        add("tStory", Tag("one shared story → strangers trust", Pal.Gold), 1160, 62)
        add("hq", SapiensProps.Company("LLC"), 1660, 236)
        add("founder", Bean(Pal.Sky, Pal.Skin[1], Pal.Hair[4], 4, seed = 53), 1570, 236).with("look", 1)
        add("tLLC", Tag("no body, yet it owns, hires, lives on", Pal.Violet), 1640, 62)
        beat("lions by the river") { show("river", "teller", "fire", "lion", stagger = 160); show("say1", delay = 700); set("teller", "point", 1, 400, 700); set("teller", "wow", 1, 300, 700) }
        beat("do not exist") {
            hide("say1", "lion"); set("teller", "wow", 0, 300); set("teller", "point", 0, 300)
            show("lionman", delay = 300); show("say2", delay = 700); set("teller", "mood", 0.8, 400, 700)
        }
        beat("imagined orders") { (0 until 4).forEach { show("f$it", delay = it * 220) } }
        beat("Chimpanzees can cooperate") { camera(680, 150, 1.0, 1500); (0 until 5).forEach { show("ch$it", delay = 500 + it * 120) }; show("tChimp", delay = 1200) }
        beat("in the millions") { camera(1160, 150, 1.0, 1500); show("crowd", delay = 400); set("crowd", "n", 330, 1800, 500, Ease.Linear) }
        beat("same story") { set("crowd", "spread", 1, 2600, 0, Ease.InOut); show("tStory", delay = 600) }
        beat("limited liability company") { camera(1630, 150, 1.0, 1500); show("hq", "founder", "tLLC", delay = 500, stagger = 250) }
        beat("outlive its founders") { dim("founder", to = 0.0); set("hq", "ghost", 0, 1400, 600) }
    },
    stage("The wheat bargain", Backdrops.Field) {
        add("wheat", SapiensProps.Wheat(4), 110, 228, 1.5)
        add("tFraud", Tag("history's biggest fraud?", Pal.Coral), 200, 52)
        add("bars", Bars(listOf(0.3f, 0.9f), listOf("forager", "farmer"), listOf(Pal.Leaf, Pal.Gold), 120f, 90f, listOf("less", "more")), 290, 150)
        add("tCal", Tag("calories per acre", Pal.Gold), 290, 232)
        add("farmer", Bean(Color(0xFF8A6A4A), Pal.Skin[1], Pal.Hair[1], 0, Color(0xFF4A3426), seed = 54), 560, 236).with("hold", 1).with("mood", -0.6)
        add("sweat", Drips(Pal.Sky, 10f), 570, 160)
        add("tHard", Tag("harder work · worse diet · disease", Pal.Coral), 640, 62)
        add("crowd", SapiensProps.Multitude(14, 6, 10f), 760, 150).with("n", 4)
        add("tPop", Tag("population explodes", Pal.Gold), 760, 200)
        add("tree", SapiensProps.FruitTree(), 1040, 236)
        add("forager", Bean(Pal.Leaf, Pal.Skin[2], Pal.Hair[3], 3, seed = 55), 1095, 236).with("sit", 1).with("mood", 0.9)
        add("tForage", Tag("varied, leisurely days", Pal.Leaf), 1080, 62)
        add("big", SapiensProps.Wheat(2), 1300, 236, 1.8)
        add("leash", Arrow(-70f, 30f, 14f, Pal.Paper, 2f, head = false), 1290, 140)
        add("farmer2", Bean(Color(0xFF8A6A4A), Pal.Skin[1], Pal.Hair[1], 0, Color(0xFF4A3426), seed = 54), 1215, 236).with("hold", 1).with("mood", -0.4)
        add("tWho", Tag("who domesticated whom?", Pal.Gold), 1220, 100)
        add("silo", SapiensProps.Silo(), 1580, 236)
        add("pyr", SapiensProps.Pyramid(), 1720, 236)
        add("tEmp", Tag("hierarchy, writing, empire", Pal.Gold), 1650, 62)
        beat("biggest fraud") { show("wheat", "tFraud", stagger = 250) }
        beat("more calories per acre") { hide("tFraud"); show("bars", "tCal", stagger = 200); play("bars", dur = 1400) }
        beat("harder work") { camera(680, 150, 1.0, 1500); show("farmer", "sweat", delay = 500, stagger = 150); show("tHard", delay = 1000) }
        beat("population exploded") { show("crowd"); set("crowd", "n", 84, 2000, 200, Ease.In); show("tPop", delay = 1600) }
        beat("leisurely life of a forager") { camera(1160, 150, 1.0, 1500); show("tree", "forager", "tForage", delay = 500, stagger = 200) }
        beat("wheat domesticated us") { show("big", "farmer2", stagger = 200); show("leash", delay = 600); play("leash", dur = 800, delay = 600); show("tWho", delay = 1100) }
        beat("store surplus") { camera(1650, 150, 1.0, 1500); show("silo", delay = 500); set("silo", "fill", 1, 2000, 700) }
        beat("priests, soldiers, and kings") { show("pyr"); play("pyr", dur = 2200, ease = Ease.Linear) }
        beat("imagined orders of empire") { show("tEmp") }
    },
    stage("What unites us", Backdrops.studio(Color(0xFF243055))) {
        add("globe", SapiensProps.Globe(56f), 200, 142)
        val starts = listOf(40 to 60, 360 to 60, 30 to 250, 370 to 250, 200 to 290, 200 to 20)
        starts.forEachIndexed { i, (x, y) -> add("tr$i", ThinkingProps.Crowd(3, 2, 9f, listOf(Pal.Coral, Pal.Sky, Pal.Leaf, Pal.Violet, Pal.Peach, Pal.Rose)[i], hats = false), x, y) }
        add("coin", Coin(18f), 70, 100)
        add("tMoney", Tag("money: trusted by everyone", Pal.Gold), 82, 140)
        add("crown", CarnegieProps.Crown(), 330, 104, 1.2)
        add("tEmp", Tag("shared laws & languages", Pal.Coral), 322, 140)
        add("temple", SapiensProps.Temple(), 200, 290, 0.75)
        add("tRel", Tag("one truth for all", Pal.Violet), 330, 262)
        add("split", SapiensProps.SplitCoin(), 200, 142)
        add("tMix", Tag("neither purely good nor purely evil", Pal.Slate, dark = false), 200, 52)
        add("tChoice", Tag("and few had a choice", Pal.Coral), 80, 262)
        beat("toward unity") {
            show("globe")
            (0 until 6).forEach { i -> show("tr$i", delay = 200 + i * 80); move("tr$i", 200, 142, 2200, 900, Ease.InOut); hide("tr$i", delay = 2700) }
        }
        beat("Money is") { show("coin", "tMoney", stagger = 300) }
        beat("Empires") { show("crown", "tEmp", stagger = 300); set("globe", "spread", 0.5, 1800, 300) }
        beat("Universal religions") { show("temple", "tRel", stagger = 300) }
        beat("neither purely good") { show("split", "tMix", stagger = 300) }
        beat("rarely had a choice") { show("tChoice") }
    },
    stage("Admitting ignorance", Backdrops.studio(Color(0xFF1D2B4A))) {
        add("scholar", Bean(Pal.Violet, Pal.Skin[0], Pal.Hair[4], 4, seed = 56), 60, 236).with("look", 1)
        add("conf", Bubble("We don't know.", 74f, 0f), 60, 100)
        add("map", SapiensProps.OldMap(), 222, 124)
        add("tOld", Tag("old maps: no empty spaces", Pal.Slate, dark = false), 222, 204)
        add("tNew", Tag("new maps: blanks to go and fill", Pal.Gold), 222, 204)
        add("scope", SapiensProps.Telescope(), 345, 236)
        add("tObs", Tag("observe + measure", Pal.Sky), 345, 172)
        add("sci", Bulb(), 680, 82, 0.7)
        add("tSci", Tag("science", Pal.Sky), 680, 130)
        add("sea", SapiensProps.Waves(170f), 805, 222)
        add("ship", SapiensProps.Ship(), 790, 222)
        add("tShip", Tag("empire", Pal.Coral), 805, 262)
        for (i in 0 until 3) add("c$i", Coin(11f), 560, 222 - i * 9)
        add("tCap", Tag("capital", Pal.Gold), 560, 262)
        add("a1", Arrow(80f, 88f, -26f, Pal.Sky, 2.5f), 708, 92)
        add("a2", Arrow(-170f, 0f, -26f, Pal.Coral, 2.5f), 750, 186)
        add("a3", Arrow(88f, -96f, -26f, Pal.Gold, 2.5f), 570, 180)
        add("tCredit", Tag("credit = trust in a richer future", Pal.Gold), 680, 40)
        beat("began with a confession") { show("scholar", "conf", stagger = 250) }
        beat("already known") { show("map", "tOld", stagger = 250) }
        beat("we are ignorant") { set("map", "blank", 1, 1600); hide("tOld"); show("tNew", delay = 600) }
        beat("observation and mathematics") { show("scope", "tObs", stagger = 250) }
        beat("feedback loop") { camera(680, 150, 1.0, 1500); show("sci", "tSci", delay = 500, stagger = 200) }
        beat("Explorers sailed") { show("sea", "ship", "tShip", stagger = 150); show("a1", delay = 300); play("a1", dur = 900, delay = 300); move("ship", 815, 222, 2500, 300) }
        beat("Investors funded") {
            (0 until 3).forEach { show("c$it", delay = it * 150) }; show("tCap", delay = 400)
            show("a2", delay = 500); play("a2", dur = 900, delay = 500)
        }
        beat("trust in growth") { show("a3"); play("a3", dur = 900); show("tCredit", delay = 700); set("sci", "on", 1, 500) }
    },
    stage("Power, but happiness?", Backdrops.City) {
        add("factory", SapiensProps.Factory(), 110, 238)
        add("tTime", Tag("clock time replaces sun time", Pal.Gold), 110, 52)
        add("hut", SapiensProps.Hut(), 300, 238, 0.8)
        add("k1", Bean(Pal.Coral, Pal.Skin[1], Pal.Hair[1], 1, seed = 57), 255, 236, 0.85).with("look", 1)
        add("k2", Bean(Pal.Gold, Pal.Skin[1], Pal.Hair[0], 0, seed = 58), 345, 236, 0.75).with("look", -1)
        add("tFam", Tag("family · village", Pal.Peach), 300, 128)
        add("state", Tile("STATE", Pal.Navy, 76f, 30f, textSize = 12f), 260, 80)
        add("market", Tile("MARKET", Pal.Gold, 76f, 30f, textSize = 12f, ink = Pal.Ink), 345, 80)
        add("power", LineChart(170f, 100f, Pal.Mint, { t -> 0.95f * t * t }, xLabel = "history", endLabel = "power"), 610, 120).with("ax", 0)
        add("happy", LineChart(170f, 100f, Pal.Gold, { t -> 0.32f + 0.04f * kotlin.math.sin(t * 9f) }, axes = false, endLabel = "happiness", labelDy = 14f), 610, 120)
        add("tread", Treadmill(), 800, 238)
        add("runner", Bean(Pal.Sky, Pal.Skin[2], Pal.Hair[2], 2, seed = 59), 795, 232).with("walk", 1).with("mood", 0.2)
        add("tExp", Tag("expectations rise with every gain", Pal.Coral), 700, 214)
        add("dna", SapiensProps.Dna(), 1060, 120)
        add("robot", SapiensProps.Robot(), 1260, 116)
        add("sap", Bean(Pal.Wood, Pal.Skin[2], Pal.Hair[0], 3, Color(0xFF5A3A24), seed = 51), 1160, 236)
        add("halo", SapiensProps.Halo(), 1160, 142)
        add("tGod", Tag("the ape that invented gods → a god?", Pal.Gold), 1160, 52)
        add("want", Bubble("…but what will we want?", 96f, 0f, thought = true), 1160, 72)
        beat("reorganized time") { show("factory", "tTime", stagger = 250); set("factory", "spin", 1, 1500, 400) }
        beat("family and the local community") { show("hut", "k1", "k2", "tFam", stagger = 160); set("k1", "mood", 0.8, 300); set("k2", "mood", 0.8, 300) }
        beat("state and the market") { dim("hut", "tFam", to = 0.35); move("k1", 220, 236, 1200, 200); move("k2", 385, 236, 1200, 200); show("state", "market", delay = 500, stagger = 200) }
        beat("made people happier") { camera(690, 150, 1.0, 1500); show("power", "happy", delay = 500); set("power", "ax", 1, 700, 500); play("power", dur = 2000, delay = 900); play("happy", dur = 2000, delay = 900) }
        beat("evidence thin") { set("happy", "p", 1, 300) }
        beat("expectations rise") { show("tread", "runner", "tExp", stagger = 200) }
        beat("genetic engineering") { camera(1160, 150, 1.0, 1500); show("dna", delay = 500) }
        beat("artificial intelligence") { show("robot") }
        beat("verge of becoming one") { show("sap", "halo", "tGod", stagger = 250); set("sap", "arms", 1, 500, 500); set("sap", "mood", 0.8, 500, 500) }
        beat("what we will want") { hide("tGod"); show("want", delay = 200); set("sap", "arms", 0, 500); set("sap", "mood", 0.1, 500) }
    },
)
