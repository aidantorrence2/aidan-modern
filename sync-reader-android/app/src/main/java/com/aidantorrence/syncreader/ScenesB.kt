package com.aidantorrence.syncreader

import kotlin.math.floor
import kotlin.math.sin

val SAPIENS_SCENES = listOf(
    scene("Three revolutions") {
        beat("one species of ape") { person(200, 80, label = "an unremarkable ape") }
        beat("dominate the planet") { text("…runs the planet. how?", 200, 140, 13, Ink.Gold) }
        beat("three revolutions") { line(30, 210, 370, 210, Ink.Faint, width = 2) }
        beat("Cognitive Revolution") {
            dot(60, 210); text("language", 60, 188, 12.5, Ink.Gold, bold = true); text("70,000 yrs ago", 60, 230, 10.5, Ink.Muted)
        }
        beat("Agricultural Revolution") {
            dot(240, 210, color = Ink.Good); text("farming", 240, 188, 12.5, Ink.Good, bold = true); text("12,000 yrs ago", 240, 230, 10.5, Ink.Muted)
        }
        beat("Scientific Revolution") {
            dot(345, 210, color = Ink.Blue); text("science", 345, 188, 12.5, Ink.Blue, bold = true); text("500 yrs ago", 345, 230, 10.5, Ink.Muted)
        }
        beat("knowledge into power") { text("knowledge → power", 345, 254, 11, Ink.Blue) }
    },
    scene("Shared stories") {
        beat("lions by the river") { text("“lion by the river!”", 105, 56, 12.5, Ink.Muted) }
        beat("do not exist") { text("“our god protects us”", 295, 56, 12.5, Ink.Gold) }
        beat("Gods, nations") { text("gods · nations · money · rights: shared fictions", 200, 86, 12, Ink.Gold) }
        beat("Chimpanzees can cooperate") {
            grid(105, 160, 6, 5, 12, 3.5, color = Ink.Muted)
            text("chimps: a few dozen who know each other", 105, 206, 11, Ink.Muted, maxWidth = 160)
        }
        beat("in the millions") {
            grid(295, 160, 16, 9, 7, 2.2, color = Ink.Faint)
            text("humans: millions of strangers", 295, 206, 11, Ink.Muted, maxWidth = 170)
        }
        beat("same story") {
            grid(295, 160, 16, 9, 7, 2.2, hi = first(144))
            text("one shared story = trust", 295, 236, 12.5, Ink.Gold, bold = true)
        }
        beat("common myths") { text("history = myths growing bigger", 200, 274, 11.5, Ink.Muted) }
    },
    scene("The wheat bargain") {
        beat { text("forager", 110, 50, 13, Ink.Muted, bold = true); text("farmer", 290, 50, 13, Ink.Gold, bold = true) }
        beat("more calories per acre") {
            bar(110, 140, 40, 28, Ink.Muted, "food per acre")
            bar(290, 140, 40, 75, Ink.Good, "food per acre")
        }
        beat("harder work") { text("more work · worse diet · disease", 290, 176, 11, Ink.Bad, maxWidth = 170) }
        beat("population exploded") {
            grid(110, 222, 5, 2, 12, 3.5, color = Ink.Muted)
            grid(290, 225, 12, 4, 10, 3, hi = first(48), hiColor = Ink.Good)
            text("more people", 290, 258, 11, Ink.Good)
        }
        beat("leisurely life of a forager") { text("varied, easier days", 110, 176, 11, Ink.Good) }
        beat("wheat domesticated us") { text("wheat domesticated us", 200, 285, 13, Ink.Gold, bold = true) }
    },
    scene("What unites us") {
        beat("toward unity") { ring(200, 160, 32, filled = true, label = "unity", labelInside = true) }
        beat("Money is") { box(80, 70, 110, 34, "Money"); arrow(118, 90, 174, 138) }
        beat("Empires") { box(320, 70, 110, 34, "Empires", Ink.Bad); arrow(282, 90, 226, 138) }
        beat("Universal religions") { box(200, 258, 110, 34, "Religions", Ink.Purple); arrow(200, 240, 200, 196) }
        beat("neither purely good") { text("not purely good, not purely evil", 325, 240, 11.5, Ink.Muted, maxWidth = 130) }
    },
    scene("Admitting ignorance") {
        beat("already known") { text("before: “it's all already known”", 200, 52, 12.5, Ink.Muted) }
        beat("we are ignorant") { text("science: “we don't know. let's find out”", 200, 76, 12.5, Ink.Gold) }
        beat("feedback loop") { box(200, 125, 110, 32, "Science", Ink.Blue) }
        beat("Explorers sailed") { arrow(236, 142, 292, 196); box(310, 214, 110, 32, "Empire", Ink.Bad) }
        beat("Investors funded") { arrow(253, 214, 147, 214); box(90, 214, 110, 32, "Capital", Ink.Good) }
        beat("trust in growth") { arrow(108, 196, 164, 142); text("credit = trust that tomorrow is richer", 200, 268, 12, Ink.Gold) }
    },
    scene("Power, but happiness?") {
        beat("family and the local community") { box(85, 62, 120, 32, "family · village", Ink.Muted, size = 12, id = "fam") }
        beat("state and the market") {
            dim("fam"); arrow(148, 62, 232, 62); box(300, 62, 130, 32, "state · market", size = 12)
        }
        beat("made people happier") {
            axes(40, 100, 200, 120, xLabel = "history")
            curve(40, 100, 200, 120, Ink.Good, label = "power") { t -> 0.95f * t * t }
        }
        beat("evidence thin") {
            curve(40, 100, 200, 120, Ink.Gold, label = "happiness") { t -> 0.3f + 0.03f * sin(t * 9f) }
        }
        beat("expectations rise") { text("expectations rise with every gain", 140, 252, 11.5, Ink.Muted) }
        beat("genetic engineering") { text("genes", 320, 120, 12.5, Ink.Blue) }
        beat("artificial intelligence") { text("AI", 320, 143, 12.5, Ink.Blue) }
        beat("verge of becoming one") { text("ape → god?", 320, 178, 15, Ink.Gold, bold = true) }
        beat("what we will want") { text("but what will we want?", 320, 214, 12, maxWidth = 130) }
    },
)

val SEVEN_HABITS_SCENES = listOf(
    scene("Character over technique") {
        beat("personality ethic") { text("Personality ethic", 110, 52, 13, Ink.Muted, bold = true) }
        beat("character ethic") { text("Character ethic", 290, 52, 13, Ink.Gold, bold = true) }
        beat("techniques, image") { text("techniques\nimage\nquick fixes", 110, 98, 12, Ink.Muted) }
        beat("integrity, fairness") { text("integrity\nfairness\npatience", 290, 98, 12, Ink.Gold) }
        beat("comes from character") { text("short-lived", 110, 146, 11.5, Ink.Bad); check(290, 148) }
        beat("paradigms") { text("paradigm = your mental map", 200, 190, 13) }
        beat("Small changes") { text("work on behavior → small shifts", 200, 226, 11.5, Ink.Muted) }
        beat("changing the map") { text("change the map → big shifts", 200, 252, 12.5, Ink.Gold, bold = true) }
    },
    scene("From me to we") {
        beat("dependence") { box(90, 235, 150, 44, "dependence\n“take care of me”", Ink.Muted, size = 11) }
        beat("independence") { box(200, 170, 150, 44, "independence\n“I can do it”", Ink.Blue, size = 11) }
        beat("interdependence") { box(310, 105, 150, 44, "interdependence\n“we do more together”", size = 11) }
        beat("private victories") { text("habits 1–3: private victories, the work on yourself", 115, 85, 11.5, Ink.Blue, maxWidth = 170) }
    },
    scene("Habit 1 · Be proactive") {
        beat("Between stimulus") { box(65, 68, 100, 32, "stimulus", Ink.Muted) }
        beat("there is a gap") {
            arrow(117, 68, 158, 68); box(200, 68, 76, 32, "pause", Ink.Gold, filled = true)
            arrow(240, 68, 281, 68); box(333, 68, 100, 32, "response", Ink.Muted)
        }
        beat("freedom to choose") { text("your freedom to choose lives in the pause", 200, 100, 11.5, Ink.Gold) }
        beat("circle of influence") {
            text("proactive", 110, 132, 12, Ink.Good, bold = true)
            ring(110, 200, 58, Ink.Faint, width = 2, label = "concern")
            ring(110, 200, 26, filled = true, id = "in1")
        }
        beat("that circle grows") { hide("in1"); ring(110, 200, 44, filled = true, label = "influence", labelInside = true) }
        beat("circle of concern") {
            text("reactive", 290, 132, 12, Ink.Bad, bold = true)
            ring(290, 200, 58, Ink.Bad, width = 2, label = "concern")
            ring(290, 200, 26, filled = true, id = "in2")
        }
        beat("influence shrinks") { hide("in2"); ring(290, 200, 12, filled = true) }
    },
    scene("Habit 2 · Begin with the end in mind") {
        beat("imagine their own funeral") { text("“What would they say about you?”", 200, 58, 13.5, italic = true) }
        beat("mission statement") { box(200, 104, 220, 34, "your mission statement") }
        beat("created twice") { box(105, 165, 150, 36, "1 · in your mind", Ink.Blue) }
        beat("then physically") { arrow(182, 165, 218, 165); box(295, 165, 150, 36, "2 · in the world", Ink.Good) }
        beat("ladder is leaning against") {
            line(140, 282, 192, 216, Ink.Muted); line(162, 282, 214, 216, Ink.Muted)
            line(150, 268, 172, 268, Ink.Muted); line(163, 251, 185, 251, Ink.Muted); line(177, 234, 199, 234, Ink.Muted)
            line(222, 206, 222, 288, Ink.White, width = 4)
            text("is it on the right wall?", 305, 244, 12.5, Ink.Gold, maxWidth = 150)
        }
    },
    scene("Habit 3 · Put first things first") {
        beat("four quadrants") {
            text("urgent", 150, 52, 11.5, Ink.Muted); text("not urgent", 290, 52, 11.5, Ink.Muted)
            text("important", 16, 102, 10.5, Ink.Muted, align = Align.START, maxWidth = 64)
            text("not important", 16, 182, 10.5, Ink.Muted, align = Align.START, maxWidth = 64)
            box(150, 102, 130, 66, "crises, deadlines", Ink.Faint, size = 11.5)
            box(290, 102, 130, 66, "planning, relationships", Ink.Faint, size = 11.5)
            box(150, 182, 130, 66, "interruptions, most email", Ink.Faint, size = 11.5)
            box(290, 182, 130, 66, "time wasters", Ink.Faint, size = 11.5)
        }
        beat("urgent quadrants") {
            box(150, 102, 130, 66, "crises, deadlines", Ink.Bad, size = 11.5)
            box(150, 182, 130, 66, "interruptions, most email", Ink.Bad, size = 11.5)
            text("most people live here", 150, 232, 11.5, Ink.Bad)
        }
        beat("important but not urgent") {
            box(290, 102, 130, 66, "planning, relationships, prevention", Ink.Gold, filled = true, size = 11.5)
            text("effective people live here", 290, 252, 11.5, Ink.Gold)
        }
        beat("weekly planning") { text("plan the week, not just the day", 200, 280, 12, Ink.Good) }
    },
    scene("Habit 4 · Think win-win") {
        beat("public victories") { text("habits 4–6: public victories, with others", 200, 52, 12, Ink.Blue) }
        beat("scarcity mentality") {
            ring(105, 150, 45, Ink.Muted, label = "a fixed pie")
            line(105, 105, 105, 195, Ink.Muted)
            text("your gain = my loss", 105, 226, 11.5, Ink.Bad)
        }
        beat("abundance mentality") {
            ring(290, 150, 65, filled = true, label = "a bigger pie")
            text("both win", 290, 150, 14, Ink.Gold, bold = true)
        }
        beat("no deal") { text("no win-win possible? then no deal", 200, 274, 12, Ink.Muted) }
    },
    scene("Habit 5 · Seek first to understand") {
        beat { person(80, 115, label = "you"); person(320, 115, label = "them") }
        beat("intent to reply") { text("(just waiting to talk)", 80, 62, 11.5, Ink.Bad, italic = true) }
        beat("Empathic listening") { text("reflect what they said", 200, 96, 11.5, Ink.Gold) }
        beat("and the feeling") { text("+ how they feel", 200, 116, 11.5, Ink.Gold) }
        beat("feel understood") { check(320, 62) }
        beat("open to your view") {
            arrow(115, 180, 285, 180, Ink.Good, width = 2.5)
            text("now they can hear you", 200, 196, 11.5, Ink.Good)
        }
        beat("diagnoses before prescribing") {
            box(130, 250, 130, 32, "diagnose", Ink.Blue); arrow(197, 250, 213, 250); box(280, 250, 130, 32, "then prescribe", Ink.Muted)
        }
    },
    scene("Habit 6 · Synergize") {
        beat("different perspectives") {
            dot(90, 90, 9, Ink.Blue); text("my way", 90, 116, 12, Ink.Blue)
            dot(310, 90, 9, Ink.Bad); text("your way", 310, 116, 12, Ink.Bad)
        }
        beat("trust each other") { line(112, 90, 288, 90, Ink.Faint, dashed = true); text("trust + open talk", 200, 76, 11, Ink.Muted) }
        beat("third alternative") {
            arrow(100, 128, 186, 206, Ink.Blue); arrow(300, 128, 214, 206, Ink.Bad)
            dot(200, 220, 12)
            text("a better third way", 200, 250, 13, Ink.Gold, bold = true)
        }
        beat("raw material of creativity") { text("differences become raw material", 200, 278, 11.5, Ink.Muted) }
    },
    scene("Habit 7 · Sharpen the saw") {
        beat("sawing a tree") {
            axes(30, 70, 160, 100, xLabel = "hours", yLabel = "cutting speed")
            curve(30, 70, 160, 100, Ink.Bad, label = "never stops", labelDy = 13) { t -> 0.9f - 0.75f * t }
        }
        beat("too busy sawing") {
            curve(30, 70, 160, 100, Ink.Good, label = "sharpens", labelDy = -14) { t -> 0.92f - (t * 3f - floor(t * 3f)) * 0.28f }
        }
        beat("four dimensions") { text("4 ways to renew", 300, 58, 12.5, Ink.Gold, bold = true) }
        beat("physical") { box(252, 100, 90, 34, "body", Ink.Good, size = 12) }
        beat("mental, through") { box(348, 100, 90, 34, "mind", Ink.Blue, size = 12) }
        beat("social and emotional") { box(252, 144, 90, 34, "people", Ink.Purple, size = 12) }
        beat("spiritual, through") { box(348, 144, 90, 34, "values", Ink.Gold, size = 12) }
        beat("other six habits decay") { text("skip renewal and the other six decay", 200, 232, 12.5, Ink.Bad) }
    },
    scene("The emotional bank account") {
        beat("emotional bank account") {
            line(55, 252, 205, 252, Ink.Muted, width = 2)
            text("trust balance", 130, 268, 11, Ink.Muted)
        }
        beat("Keeping promises") { box(130, 232, 140, 30, "keep promises", Ink.Good, size = 11.5) }
        beat("clarifying expectations") { box(130, 198, 140, 30, "clear expectations", Ink.Good, size = 11.5) }
        beat("apologizing sincerely") { box(130, 164, 140, 30, "sincere apologies", Ink.Good, size = 11.5) }
        beat("loyalty to those who are absent") { box(130, 130, 140, 30, "loyal to the absent", Ink.Good, size = 11.5) }
        beat("make deposits") { counter(300, 140, 0, 4, prefix = "+", suffix = " deposits", size = 22, color = Ink.Good) }
        beat("principles that do not change") { text("built on principles that don't change", 300, 200, 12, Ink.Gold, maxWidth = 160) }
    },
)

val DEEP_WORK_SCENES = listOf(
    scene("Deep vs. shallow") {
        beat("distraction-free concentration") { box(110, 78, 165, 48, "DEEP\nfull focus, hard thinking", size = 11.5) }
        beat("Shallow work") { box(290, 78, 165, 48, "SHALLOW\nemail, admin, easy to copy", Ink.Muted, size = 11.5) }
        beat("little new value") { text("little new value", 290, 116, 11, Ink.Muted) }
        beat("more valuable") { bar(80, 230, 44, 85, Ink.Good, "value", "rising") }
        beat("becoming rarer") { bar(140, 230, 44, 30, Ink.Bad, "supply", "falling") }
        beat("outsized advantage") { text("rare + valuable = your edge", 290, 185, 13.5, Ink.Gold, bold = true, maxWidth = 170) }
    },
    scene("Output = time × focus") {
        beat("master hard things") { text("1 · learn hard things fast", 110, 50, 12, Ink.Blue) }
        beat("elite level") { text("2 · produce at an elite level", 295, 50, 12, Ink.Blue) }
        beat("sustained focus") { text("both need sustained focus", 200, 74, 12, Ink.Gold) }
        beat("time spent multiplied by intensity") {
            box(115, 160, 150, 90, "time × focus", Ink.Gold, filled = true)
            text("1 hour, full focus", 115, 220, 11, Ink.Muted)
        }
        beat("glance at email") {
            box(290, 185, 150, 40, "time × less focus", Ink.Bad, size = 12)
            text("1 hour, checking email", 290, 220, 11, Ink.Muted)
        }
        beat("attention residue") { text("attention residue lingers", 290, 145, 12, Ink.Bad) }
        beat("lowers the intensity") { text("same hours, less output", 200, 262, 13, Ink.Muted) }
    },
    scene("Why deep work is rare") {
        beat("open offices") { box(80, 70, 110, 32, "open offices", Ink.Muted, size = 11.5) }
        beat("instant messaging") { box(200, 70, 110, 32, "instant chat", Ink.Muted, size = 11.5) }
        beat("constant availability") { box(320, 70, 110, 32, "always on", Ink.Muted, size = 11.5) }
        beat("busyness") { bar(150, 205, 50, 85, Ink.Bad, "looking busy") }
        beat("hard to measure") { bar(250, 205, 50, 35, Ink.Muted, "real output") }
        beat("distraction feels good") { text("distraction feels good, so you need structure", 200, 262, 12, Ink.Gold) }
    },
    scene("Rule 1 · Work deeply") {
        beat("four scheduling philosophies") { text("your week  (● = deep work)", 255, 52, 10.5, Ink.Muted) }
        beat("monastic approach") {
            text("monastic", 24, 82, 12.5, Ink.Gold, align = Align.START)
            grid(255, 82, 7, 1, 26, 7, hi = first(7))
        }
        beat("bimodal approach") {
            text("bimodal", 24, 116, 12.5, Ink.Gold, align = Align.START)
            grid(255, 116, 7, 1, 26, 7, hi = first(3))
        }
        beat("rhythmic approach") {
            text("rhythmic", 24, 150, 12.5, Ink.Blue, align = Align.START)
            grid(255, 150, 7, 1, 26, 4, hi = first(7), hiColor = Ink.Blue)
        }
        beat("journalistic approach") {
            text("journalistic", 24, 184, 12.5, Ink.Purple, align = Align.START)
            grid(255, 184, 7, 1, 26, 5, hi = setOf(1, 4, 5), hiColor = Ink.Purple)
        }
        beat("scoreboard") { text("count deep hours on a visible scoreboard", 200, 232, 12, Ink.Good) }
        beat("shutdown ritual") { text("then a firm shutdown at day's end", 200, 260, 12, Ink.Blue) }
    },
    scene("Rule 2 · Embrace boredom") {
        beat("has to be trained") { text("focus is a muscle", 200, 54, 14, Ink.Gold, bold = true) }
        beat("reach for your phone") {
            box(80, 102, 100, 32, "bored", Ink.Muted); arrow(132, 102, 168, 102)
            box(220, 102, 90, 32, "phone", Ink.Bad); arrow(267, 102, 300, 102)
            text("weaker", 340, 102, 12.5, Ink.Bad, bold = true)
        }
        beat("schedule breaks from focus") {
            text("plan when you go online", 200, 148, 11.5, Ink.Muted)
            box(100, 175, 110, 26, "offline", Ink.Gold, filled = true, size = 11)
            box(178, 175, 36, 26, "web", Ink.Blue, filled = true, size = 10)
            box(256, 175, 110, 26, "offline", Ink.Gold, filled = true, size = 11)
            box(334, 175, 36, 26, "web", Ink.Blue, filled = true, size = 10)
        }
        beat("productive meditation") { text("walk + hold one problem in mind", 200, 240, 12.5, Ink.Good) }
    },
    scene("Rule 3 · Quit social media") {
        beat("stop using tools by default") { text("use tools by choice, not by default", 200, 52, 13) }
        beat("craftsman approach") { text("the craftsman test", 140, 86, 12, Ink.Gold, bold = true) }
        beat("benefits") { bar(105, 200, 50, 50, Ink.Good, "benefits") }
        beat("outweigh its costs") {
            bar(175, 200, 50, 90, Ink.Bad, "costs")
            text("keep it only if benefits win by a lot", 140, 236, 11, Ink.Muted, maxWidth = 200)
        }
        beat("thirty-day break") {
            grid(305, 120, 6, 5, 16, 4.5, hi = first(30), hiColor = Ink.Blue)
            text("30 days off", 305, 170, 12, Ink.Blue)
        }
        beat("anyone cared") { text("did anyone notice?", 305, 196, 12, Ink.Gold) }
        beat("life got worse") { text("was life worse?", 305, 218, 12, Ink.Gold) }
    },
    scene("Rule 4 · Drain the shallows") {
        beat("every minute of your day in blocks") {
            box(70, 70, 90, 34, "deep", Ink.Gold, filled = true, size = 11)
            box(150, 70, 60, 34, "email", Ink.Muted, size = 10.5)
            box(230, 70, 90, 34, "deep", Ink.Gold, filled = true, size = 11)
            box(305, 70, 50, 34, "calls", Ink.Muted, size = 10.5)
            box(357, 70, 44, 34, "admin", Ink.Muted, size = 9.5)
        }
        beat("contained") { text("shallow work gets a box, not every gap", 200, 106, 11.5, Ink.Muted) }
        beat("smart recent graduate") { text("“How long to train a smart graduate to do this?”", 200, 146, 12, italic = true, maxWidth = 330) }
        beat("to do it") { text("months = deep · days = shallow", 200, 172, 12, Ink.Gold) }
        beat("shallow work budget") { text("agree on a shallow-work budget", 200, 206, 12, Ink.Blue) }
        beat("fixed time each day") { text("stop at a fixed time", 200, 234, 12, Ink.Good) }
        beat("close loops") { text("write emails that close loops", 200, 262, 12, Ink.Good) }
    },
    scene("A deep life") {
        beat("more productive") { bar(150, 220, 54, 80, Ink.Good, "output") }
        beat("more satisfying") { bar(250, 220, 54, 110, Ink.Gold, "satisfaction") }
        beat("flow and craftsmanship") { text("flow + craft = meaning", 200, 62, 15, Ink.Gold, bold = true) }
        beat("scattered attention") { text("scattered attention can't give that", 200, 262, 12, Ink.Muted) }
    },
)
