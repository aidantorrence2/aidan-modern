package com.aidantorrence.syncstudy

import androidx.compose.ui.graphics.Color
import com.aidantorrence.syncstudy.MansSearchProps.Candle
import com.aidantorrence.syncstudy.MansSearchProps.Compass
import com.aidantorrence.syncstudy.MansSearchProps.Crown
import com.aidantorrence.syncstudy.MansSearchProps.Hut
import com.aidantorrence.syncstudy.MansSearchProps.Keepsake
import com.aidantorrence.syncstudy.MansSearchProps.OpenBook
import com.aidantorrence.syncstudy.MansSearchProps.Road
import com.aidantorrence.syncstudy.MansSearchProps.Seedling
import com.aidantorrence.syncstudy.MansSearchProps.Signpost
import com.aidantorrence.syncstudy.MansSearchProps.Storm
import com.aidantorrence.syncstudy.MansSearchProps.Sun
import com.aidantorrence.syncstudy.MansSearchProps.SunsetWindow
import com.aidantorrence.syncstudy.MansSearchProps.Vacuum
import com.aidantorrence.syncstudy.MansSearchProps.Butterfly

private val FranklShirt = Color(0xFF4A5D7E)
private val Grey = Color(0xFF6B7088)

/** Animated explainer films for Man's Search for Meaning, one per paragraph. Symbolic, never graphic. */
val MANS_SEARCH_STAGE = listOf(
    stage("The book in two halves", Backdrops.Night) {
        add("hut", Hut(180f), 130, 236).with("lit", 0.15)
        add("years", Counter(24f, Pal.Slate, 0, suffix = " years", halo = false), 130, 128)
        add("frankl", Bean(FranklShirt, Pal.Skin[0], Pal.Hair[0], 0, seed = 2), 300, 236).with("mood", 0.1)
        add("tPsych", Tag("Viennese psychiatrist", Pal.Sky), 300, 118)
        add("book", OpenBook("how people endured", "logotherapy"), 175, 128)
        add("pleasure", Gift(Pal.Rose), 510, 196, 0.9)
        add("power", Crown(), 600, 186, 1.2)
        add("meaning", Compass(26f), 690, 180).with("settle", 0)
        add("tPl", Tag("pleasure?", Pal.Rose), 510, 240)
        add("tPo", Tag("power?", Pal.Gold), 600, 240)
        add("tMe", Tag("meaning", Pal.Mint), 690, 240)
        add("why", Caption("the deepest drive", 12f, Pal.Mint), 690, 110)
        beat("Viennese psychiatrist") { show("frankl"); show("tPsych", delay = 300) }
        beat("three years") {
            show("hut", "years"); set("years", "v", 3, 1400, 200, Ease.Out)
            set("frankl", "look", -1, 500); set("frankl", "mood", -0.3, 600)
        }
        beat("first half of his book") {
            hide("hut", "years", "tPsych"); move("frankl", 352, 236, 900)
            show("book", delay = 300); set("book", "left", 1, 700, 700)
            set("frankl", "look", -1, 400, 600); set("frankl", "mood", 0.2, 500)
        }
        beat("second half") { set("book", "left", 0.35, 600); set("book", "right", 1, 700); set("frankl", "point", 1, 500) }
        beat("not pleasure") { camera(600, 160, 1.05, 1400); show("pleasure", "tPl", delay = 600) }
        beat("or power") { show("power", "tPo") }
        beat("search for meaning") {
            show("meaning", "tMe"); set("meaning", "settle", 1, 1600, 500, Ease.InOut)
            scale("meaning", 1.35, 700, 1900); dim("pleasure", "power", "tPl", "tPo", to = 0.3, delay = 1600)
            show("why", delay = 2000)
        }
    },
    stage("Three phases", Backdrops.Night) {
        add("road", Road(1120f, 0f, Pal.Slate), 30, 252)
        add("p", Bean(Grey, Pal.Skin[1], Pal.Hair[0], 0, seed = 5), 200, 236).with("mood", 0)
        add("t1", Tag("1 · SHOCK", Pal.Coral), 200, 70)
        add("q", Bubble("Will I survive?", 92f, -0.4f, thought = true, italic = true), 268, 112)
        add("t2", Tag("2 · APATHY", Pal.Slate, dark = false), 600, 70)
        add("armor", Ring(48f, Pal.Slate, 6f), 600, 194)
        add("tArmor", Caption("numbness as armor", 11f, Pal.Slate), 600, 104)
        add("day", Timer(18f, Pal.Slate, "one more day"), 690, 160)
        add("t3", Tag("3 · RELEASE", Pal.Sky), 1000, 70)
        add("sun", Sun(22f), 1080, 252)
        add("q3", Bubble("…now what?", 80f, -0.4f, thought = true, italic = true), 1062, 112)
        add("moved", Caption("the world had moved on", 11f, Pal.Sky, chip = Pal.Ink.a(0.6f)), 1000, 286)
        beat("three phases") { show("road"); play("road", dur = 2200, ease = Ease.Out) }
        beat("came shock") { show("p", "t1"); set("p", "wow", 1, 250, 400); set("p", "arms", 0.5, 400, 400) }
        beat("detached curiosity") { set("p", "wow", 0, 300); set("p", "arms", 0, 400); set("p", "look", 1, 400); show("q") }
        beat("apathy") {
            hide("q", "t1"); camera(600, 150, 1.0, 1800)
            set("p", "walk", 1, 200); move("p", 600, 236, 1800, 0, Ease.InOut); set("p", "walk", 0, 200, 1800)
            set("p", "look", 0, 300, 1800); show("t2", delay = 1400)
        }
        beat("armor") { show("armor"); play("armor", dur = 1200); show("tArmor", delay = 400) }
        beat("getting through the day") { show("day"); play("day", dur = 2400, ease = Ease.Linear) }
        beat("liberated") {
            hide("armor", "tArmor", "day", "t2"); camera(1000, 150, 1.0, 1800)
            set("p", "walk", 1, 200); move("p", 1000, 236, 1800, 0, Ease.InOut); set("p", "walk", 0, 200, 1800)
            show("t3", "sun", delay = 1300); set("sun", "rise", 0.75, 2500, 1300)
        }
        beat("confusing rather than joyful") { show("q3"); set("p", "mood", -0.3, 500); set("p", "look", 1, 400) }
        beat("not been waiting") { show("moved"); set("p", "look", -0.6, 500) }
    },
    stage("A reason to live", Backdrops.studio(Color(0xFF221D33))) {
        add("heart", Heart(Pal.Rose), 50, 98, 0.75)
        add("work", PageStack(), 110, 104, 0.55).with("n", 6)
        add("faith", Star(Pal.Gold, 13f), 170, 92)
        add("th1", Arrow(54f, 50f, -10f, Pal.Rose, 1.6f, head = false), 56, 108)
        add("th2", Arrow(0f, 44f, 0f, Pal.Gold, 1.6f, head = false), 110, 110)
        add("th3", Arrow(-54f, 56f, 10f, Pal.Gold, 1.6f, head = false), 166, 104)
        add("a", Bean(Pal.Peach, Pal.Skin[0], Pal.Hair[1], 1, seed = 3), 110, 236).with("mood", 0.2)
        add("tA", Tag("has a why", Pal.Gold), 110, 274)
        add("b", Bean(Grey, Pal.Skin[2], Pal.Hair[0], 0, seed = 8), 300, 236).with("mood", -0.2)
        add("bq", Bubble("no tomorrow", 80f, -0.3f, thought = true, italic = true), 312, 112)
        add("tB", Tag("lost the why", Pal.Slate, dark = false), 300, 274)
        add("quote", Caption("“He who has a why to live can bear almost any how.”", 13f, Pal.Gold, 700, italic = true, maxWidth = 300f), 200, 50)
        add("window", SunsetWindow(100f, 76f), 610, 118).with("glow", 0)
        add("c", Bean(Pal.Peach, Pal.Skin[0], Pal.Hair[1], 1, seed = 3), 560, 236).with("look", 1).with("mood", 0.2)
        add("ha", Bubble("ha!", 46f, -0.5f, textSize = 13f), 520, 128)
        add("wife", Heart(Pal.Rose), 668, 196)
        add("spark", Sparkles(Pal.Rose, 34f, 8), 668, 196)
        add("love", Caption("love: the highest goal", 11f, Pal.Rose, chip = Pal.Ink.a(0.7f)), 640, 258)
        beat("something to live for") { show("a"); set("a", "look", 0.3, 400) }
        beat("a person they loved") { show("heart"); show("th1"); play("th1", dur = 700, delay = 200); set("heart", "beat", 1, 300) }
        beat("a work left unfinished") { show("work"); show("th2"); play("th2", dur = 700, delay = 200) }
        beat("a faith") { show("faith"); show("th3"); play("th3", dur = 700, delay = 200) }
        beat("more likely to endure") { set("a", "mood", 0.7, 600); show("tA") }
        beat("lost their sense of a future") { show("b"); show("bq", delay = 400) }
        beat("declined quickly") { hide("bq"); set("b", "sit", 1, 900); set("b", "mood", -0.7, 700); dim("b", to = 0.45, delay = 600); show("tB") }
        beat("a why to live") { show("quote") }
        beat("a sunset") {
            hide("quote"); camera(610, 160, 1.0, 1500)
            show("window", "c", delay = 500); set("window", "glow", 1, 2200, 900, Ease.InOut); set("c", "mood", 0.5, 800, 1500)
        }
        beat("humor") { show("ha"); set("c", "mood", 1, 300); set("c", "jump", 0.4, 200); set("c", "jump", 0, 300, 900) }
        beat("thought of his wife") { show("wife", "spark"); set("c", "look", 0.6, 400); set("wife", "beat", 1, 300) }
        beat("love is the ultimate goal") { camera(630, 168, 1.18, 1500); show("love", delay = 900); scale("wife", 1.4, 800, 300) }
    },
    stage("The last freedom", Backdrops.studio(Color(0xFF232433))) {
        add("you", Bean(Grey, Pal.Skin[1], Pal.Hair[0], 0, seed = 4), 200, 236).with("mood", -0.3)
        add("k0", Keepsake(0), 90, 92)
        add("k1", Keepsake(1), 310, 92)
        add("k2", Keepsake(2), 70, 176)
        add("k3", Keepsake(3), 330, 176)
        add("ring", Ring(56f, Pal.Gold, 4f), 200, 192)
        add("glowS", Sparkles(Pal.Gold, 60f, 12), 200, 186)
        add("bitter", Tag("bitterness", Pal.Slate, dark = false), 96, 128)
        add("dignity", Tag("dignity", Pal.Gold), 304, 128)
        add("cap", Caption("the one thing no one can take", 12f, Pal.Gold), 200, 60)
        val crowd = 7
        for (i in 0 until crowd) add("m$i", Bean(Grey, Pal.Skin[i % 4], Pal.Hair[i % 5], i % 4, seed = 20 + i), 480 + i * 40, 236, 0.55).with("mood", -0.3)
        add("s1", Star(Pal.Gold, 7f), 520, 166)
        add("s2", Star(Pal.Gold, 7f), 640, 166)
        add("tMost", Tag("most could not", Pal.Slate, dark = false), 600, 110)
        add("tSome", Tag("some did", Pal.Gold), 600, 136)
        add("cond", Tile("conditions", Pal.Navy, 104f, 34f, textSize = 11.5f), 510, 64)
        add("char", Tile("who you are", Color(0xFF3A3A50), 104f, 34f, textSize = 11.5f), 690, 64)
        add("link", Arrow(66f, 0f, 0f, Pal.Slate, 2.5f), 567, 64)
        add("no", Mark(false, 11f), 600, 64)
        add("become", Caption("you decide who you become", 13f, Pal.Mint), 200, 60)
        beat("everything can be taken") {
            show("you", "k0", "k1", "k2", "k3", stagger = 120)
            listOf("k0" to (-60 to 60), "k1" to (460 to 60), "k2" to (-60 to 200), "k3" to (460 to 200)).forEachIndexed { i, (id, xy) ->
                move(id, xy.first, xy.second, 900, 1300 + i * 250, Ease.In); hide(id, delay = 1900 + i * 250)
            }
            set("you", "mood", -0.6, 800, 1500)
        }
        beat("the last of the human freedoms") { show("ring", "glowS"); play("ring", dur = 1500); show("cap", delay = 600) }
        beat("choose one's attitude") {
            hide("cap"); show("bitter", "dignity", stagger = 250)
            set("you", "look", -1, 400, 600); set("you", "look", 1, 500, 1400)
            dim("bitter", to = 0.3, delay = 2000); scale("dignity", 1.2, 600, 2000); set("you", "mood", 0.5, 800, 2000)
        }
        beat("most prisoners did not") {
            camera(600, 160, 1.0, 1500)
            show("m0", "m1", "m2", "m3", "m4", "m5", "m6", delay = 600, stagger = 90); show("tMost", delay = 1200)
        }
        beat("But some did") {
            show("tSome", "s1", "s2"); set("m1", "mood", 0.7, 500); set("m4", "mood", 0.7, 500)
            set("m1", "arms", 0.3, 500); set("m4", "arms", 0.3, 500)
        }
        beat("does not determine character") {
            show("cond", "char", stagger = 200); show("link", delay = 300); play("link", dur = 700, delay = 300); show("no", delay = 1000)
        }
        beat("who they become") { camera(200, 150, 1.0, 1500); hide("bitter", "dignity"); show("become", delay = 1200); set("you", "arms", 0.6, 600, 1200); set("you", "mood", 0.8, 600, 1200) }
    },
    stage("Three roads to meaning", Backdrops.Dusk) {
        add("pleasure", Gift(Pal.Rose), 90, 168, 0.85)
        add("power", Crown(), 200, 160, 1.15)
        add("meaning", Compass(24f), 310, 156).with("settle", 0)
        add("tF", Tag("Freud: pleasure", Pal.Rose), 90, 214)
        add("tA", Tag("Adler: power", Pal.Gold), 200, 214)
        add("tM", Tag("Frankl: meaning", Pal.Mint), 310, 214)
        add("void", Vacuum(46f), 600, 150)
        add("tVoid", Caption("the empty feeling", 11f, Pal.Violet, chip = Pal.Ink.a(0.6f)), 600, 236)
        add("e1", Tag("boredom", Pal.Slate, dark = false), 500, 80)
        add("e2", Tag("addiction", Pal.Slate, dark = false), 700, 90)
        add("e3", Tag("aggression", Pal.Slate, dark = false), 520, 210)
        add("lens", Magnifier(), 520, 110)
        add("found", Star(Pal.Gold, 14f), 700, 150)
        add("tFound", Caption("found, not invented", 11f, Pal.Gold), 700, 186)
        add("rL", Road(-120f, -130f, Pal.Sky), 1000, 262)
        add("rC", Road(0f, -150f, Pal.Rose), 1000, 262)
        add("rR", Road(120f, -130f, Pal.Violet), 1000, 262)
        add("sL", Signpost("create, do", Pal.Sky, right = false), 885, 138)
        add("sC", Signpost("love, experience", Pal.Rose), 1000, 116)
        add("sR", Signpost("your attitude", Pal.Violet), 1115, 138)
        add("traveller", Bean(Pal.Mint, Pal.Skin[2], Pal.Hair[3], 3, seed = 6), 1000, 286, 0.8)
        add("iL", Trophy(), 860, 196, 0.5)
        add("iC", Heart(Pal.Rose), 1000, 182, 0.6)
        add("storm", Storm(70f), 1158, 40)
        add("tMean", Caption("suffering with a meaning", 11f, Pal.Gold, chip = Pal.Ink.a(0.6f)), 1130, 190)
        beat("will to pleasure") { show("pleasure", "tF") }
        beat("will to power") { show("power", "tA") }
        beat("will to meaning") {
            show("meaning", "tM"); set("meaning", "settle", 1, 1500, 400, Ease.InOut); scale("meaning", 1.3, 600, 1700)
            dim("pleasure", "power", "tF", "tA", to = 0.35, delay = 1500)
        }
        beat("existential vacuum") {
            camera(600, 150, 1.0, 1500); show("void", delay = 500); show("tVoid", delay = 900)
            show("e1", "e2", "e3", delay = 1100, stagger = 200)
            listOf("e1", "e2", "e3").forEachIndexed { i, id -> move(id, 600, 150, 1300, 2300 + i * 300, Ease.In); set(id, "s", 0.2, 1300, 2300 + i * 300, Ease.In); hide(id, delay = 3300 + i * 300) }
        }
        beat("has to be discovered") {
            show("lens"); move("lens", 690, 140, 1600, 0, Ease.InOut); hide("lens", delay = 1900)
            show("found", delay = 1500); show("tFound", delay = 1800)
        }
        beat("three roads") { camera(1000, 165, 1.0, 1600); show("traveller", "rL", "rC", "rR", delay = 600); set("traveller", "look", 0, 0) }
        beat("creating a work") { play("rL", dur = 900); set("rL", "lit", 1, 600, 600); show("sL", "iL", delay = 700); set("traveller", "look", -1, 400) }
        beat("experiencing something") { play("rC", dur = 900); set("rC", "lit", 1, 600, 600); show("sC", "iC", delay = 700); set("traveller", "look", 0, 400) }
        beat("unavoidable suffering") { play("rR", dur = 900); show("sR", delay = 700); show("storm", delay = 900); set("traveller", "look", 1, 400); set("traveller", "mood", -0.3, 500) }
        beat("finds a meaning") { set("storm", "clear", 1, 1800, 300); set("rR", "lit", 1, 900, 600); show("tMean", delay = 900); set("traveller", "mood", 0.6, 600, 900) }
    },
    stage("Practical tools", Backdrops.room(Color(0xFF3B3F5E))) {
        add("anx", Bean(Pal.Sky, Pal.Skin[0], Pal.Hair[2], 1, seed = 9), 120, 236).with("mood", -0.5)
        add("sweat", Drips(Color(0xFF9ED7FA), 24f), 120, 144)
        add("b1", Bubble("don't sweat, don't sweat…", 120f, -0.4f, thought = true, italic = true), 205, 92)
        add("b2", Bubble("Let me sweat buckets!", 120f, -0.4f, italic = true), 205, 92)
        add("laugh", Sparkles(Pal.Gold, 44f, 10), 120, 170)
        add("tFear", Caption("the fear loop breaks", 12f, Pal.Mint), 290, 176)
        add("self", Bean(Pal.Coral, Pal.Skin[3], Pal.Hair[0], 0, seed = 12), 560, 236).with("mood", -0.3).with("look", -1)
        add("lens", Magnifier(), 528, 156, 0.9, -30)
        add("tSelf", Tag("watching yourself", Pal.Slate, dark = false), 560, 90)
        add("friend", Bean(Pal.Leaf, Pal.Skin[1], Pal.Hair[1], 2, seed = 13), 680, 236)
        add("tOut", Tag("look outward", Pal.Mint), 620, 90)
        add("chaser", Bean(Pal.Gold, Pal.Skin[2], Pal.Hair[3], 3, seed = 14), 900, 236)
        add("fly", Butterfly(Pal.Violet), 975, 150)
        add("plant", Seedling(), 1060, 238)
        add("tSide", Caption("happiness follows meaning", 12f, Pal.Gold, chip = Pal.Ink.a(0.5f)), 1000, 70)
        add("tChase", Caption("chase it and it flies off", 11f, Pal.Coral, chip = Pal.Ink.a(0.5f)), 1000, 100)
        beat("Paradoxical intention") { show("anx", "sweat"); show("b1", delay = 400) }
        beat("wish for exactly the thing they fear") { hide("b1"); show("b2", delay = 200); set("anx", "wow", 1, 300, 200); set("anx", "wow", 0, 300, 1100) }
        beat("brings humor") { hide("sweat"); set("anx", "mood", 1, 500); show("laugh"); show("tFear", delay = 500); set("anx", "jump", 0.5, 200); set("anx", "jump", 0, 300, 1100) }
        beat("Dereflection") { camera(620, 150, 1.0, 1500); show("self", "lens", delay = 500); show("tSelf", delay = 900) }
        beat("toward the task or person") {
            show("friend"); hide("lens", "tSelf", delay = 300); show("tOut", delay = 500)
            set("self", "look", 1, 500, 300); set("self", "mood", 0.7, 600, 500); set("self", "point", 0.6, 500, 500); set("friend", "wave", 1, 400, 800)
        }
        beat("aiming at happiness directly") {
            camera(1000, 150, 1.0, 1500); show("chaser", "fly", delay = 500)
            set("chaser", "walk", 1, 200, 900); move("chaser", 990, 236, 1800, 900, Ease.InOut); set("chaser", "arms", 0.8, 500, 900)
            move("fly", 1150, 92, 1800, 900, Ease.InOut); set("chaser", "walk", 0, 200, 2700); show("tChase", delay = 2200)
        }
        beat("side effect") {
            hide("tChase"); set("chaser", "arms", 0, 400); set("chaser", "look", 1, 300); set("chaser", "hold", 1, 500)
            show("plant"); set("plant", "grow", 1, 2200, 300, Ease.InOut); set("chaser", "mood", 0.8, 600, 1200)
            move("fly", 1010, 140, 1800, 1600, Ease.InOut); show("tSide", delay = 2600)
        }
        beat("eludes you") { show("tChase") }
    },
    stage("Tragic optimism", Backdrops.Dusk) {
        add("sun", Sun(28f), 300, 262)
        add("frankl", Bean(FranklShirt, Pal.Skin[0], Pal.Hair[0], 0, seed = 2), 150, 236).with("mood", 0.1)
        add("yes", Caption("yes to life", 22f, Pal.Gold), 200, 58)
        add("c1", Storm(60f), 80, 118)
        add("c2", Storm(60f), 200, 104)
        add("c3", Storm(60f), 320, 118)
        add("t1", Tag("pain", Pal.Slate, dark = false), 80, 120)
        add("t2", Tag("guilt", Pal.Slate, dark = false), 200, 106)
        add("t3", Tag("death", Pal.Slate, dark = false), 320, 120)
        add("f1", Bean(Grey, Pal.Skin[0], Pal.Hair[1], 1, seed = 30), 60, 236, 0.6)
        add("f2", Bean(Grey, Pal.Skin[0], Pal.Hair[4], 0, seed = 31), 98, 236, 0.6)
        add("f3", Bean(Grey, Pal.Skin[0], Pal.Hair[0], 0, seed = 32), 232, 236, 0.6)
        add("tVienna", Tag("back in Vienna", Pal.Sky), 560, 80)
        add("me", Bean(FranklShirt, Pal.Skin[0], Pal.Hair[0], 0, seed = 2), 540, 236)
        add("candle0", Candle(), 566, 242, 0.6)
        for (i in 0 until 4) {
            add("o$i", Bean(listOf(Pal.Coral, Pal.Leaf, Pal.Sky, Pal.Violet)[i], Pal.Skin[i % 4], Pal.Hair[(i + 1) % 5], i % 4, seed = 40 + i), 620 + i * 44, 236, 0.85).with("mood", -0.2)
            add("cd$i", Candle(), 640 + i * 44, 242, 0.55).with("lit", 0)
        }
        add("tReasons", Caption("helping others find a reason to go on", 12f, Pal.Gold), 640, 70)
        beat("say yes to life") { show("frankl", "sun"); set("sun", "rise", 1, 2600, 200, Ease.InOut); show("yes", delay = 900); set("frankl", "arms", 0.6, 600, 1200); set("frankl", "mood", 0.6, 600, 1200) }
        beat("pain, guilt, and death") {
            hide("yes"); show("c1", "c2", "c3", stagger = 200); show("t1", "t2", "t3", delay = 300, stagger = 200)
            set("frankl", "arms", 0, 500); set("frankl", "mood", 0.2, 600)
        }
        beat("He lost") {
            show("f1", "f2", "f3", stagger = 150); dim("f1", "f2", "f3", to = 0.15, delay = 1600)
            set("frankl", "mood", -0.5, 600, 1200)
        }
        beat("returned to Vienna") {
            hide("c1", "c2", "c3", "t1", "t2", "t3"); camera(640, 150, 1.0, 1700)
            show("me", "candle0", delay = 900); show("tVienna", delay = 1200)
        }
        beat("rebuilt a career") { show("o0", "o1", "o2", "o3", "cd0", "cd1", "cd2", "cd3", stagger = 100); set("me", "mood", 0.6, 500) }
        beat("reasons to continue") {
            (0 until 4).forEach { i ->
                set("cd$i", "lit", 1, 700, 300 + i * 500, Ease.Out); set("o$i", "mood", 0.8, 500, 500 + i * 500)
            }
            hide("tVienna"); show("tReasons", delay = 2400)
        }
    },
)
