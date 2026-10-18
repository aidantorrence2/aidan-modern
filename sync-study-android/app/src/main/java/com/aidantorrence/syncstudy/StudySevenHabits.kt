package com.aidantorrence.syncstudy

val SEVEN_HABITS_STUDY = study("seven-habits") {
    keyIdeas(
        "Character over technique: lasting effectiveness comes from principles, not quick-fix personality tricks.",
        "Paradigms are mental maps. Small changes come from attitudes; big changes come from changing the map.",
        "The habits move from dependence to independence (private victories) to interdependence (public victories).",
        "Be proactive: in the gap between stimulus and response lies your freedom to choose. Work your circle of influence.",
        "Begin with the end in mind, and put first things first: live in important-but-not-urgent work.",
        "Think win-win, seek first to understand, then synergize toward a third alternative.",
        "Sharpen the saw in four dimensions, and make steady deposits in the emotional bank account.",
    )
    para(0) {
        mcq("A colleague wants to be trusted by their team, so they take a course on firm handshakes and confident small talk. Which ethic is that?",
            "The character ethic", "The abundance mentality", "The personality ethic", "A paradigm shift", answer = 2,
            why = "Techniques, image and quick fixes are the personality ethic. Covey argues that trust comes from character: integrity, fairness, patience.",
            pretest = true)
        why("Why does Covey say big changes come from changing the map rather than the behaviour?",
            "Our paradigms are the mental maps we see the world through without noticing. Working on attitudes and behaviour gives small changes; when the map itself changes, everything we see and do changes with it.")
        cloze("Covey calls the mental maps we use without noticing them ___.", "paradigms", "paradigm")
    }
    para(1) {
        mcq("Someone wants to build great partnerships but can't yet keep promises to themselves. According to Covey's sequence, where should they start?",
            "Public victories with others", "Private victories on themselves", "Finding a better mentor", "Thinking win-win first", answer = 1,
            why = "The habits run from dependence to independence to interdependence. The first three are private victories, the work on yourself that comes before working well with others.",
            pretest = true)
        why("Why do private victories come before public ones?",
            "You can't build real interdependence from dependence. Independence (being able to run your own life) is what you bring to a partnership; without it, collaboration just becomes leaning on others.")
        cloze("The habits move from dependence, to independence, to ___.", "interdependence")
    }
    para(2) {
        mcq("A driver cuts you off. You notice the anger, pause, and choose to let it go. Which habit is that?",
            "Be proactive", "Sharpen the saw", "Synergize", "Think win-win", answer = 0,
            why = "Between stimulus (being cut off) and response there is a gap. Using that gap to choose is being proactive.",
            pretest = true)
        why("What happens to your circle of influence when you focus on it, and when you focus on your circle of concern?",
            "Focusing energy on what you can actually affect makes your influence grow. Complaining about what you can't control (the circle of concern) makes it shrink.")
        cloze("Between stimulus and response there is a ___, and in it lies your freedom to choose.", "gap", "space")
    }
    para(3) {
        mcq("You picture your own funeral and listen to what you'd want your family to say. What is that exercise meant to produce?",
            "A weekly schedule", "A personal mission statement", "A list of fears", "A win-win agreement", answer = 1,
            why = "Imagining the end clarifies the principles and roles that matter most, which you then write down as a personal mission statement.")
        why("What does \"everything is created twice\" mean, and where does the ladder fit in?",
            "Things are made first mentally, then physically. The mental creation is where you decide what the ladder of success is leaning against, so you don't climb fast up the wrong wall.")
        cloze("Everything is created twice: first ___, then physically.", "mentally", "in the mind")
    }
    para(4) {
        mcq("Which of these belongs in the important-but-not-urgent quadrant?",
            "Answering a ringing phone", "A fire alarm going off", "Scrolling a news feed", "Planning next quarter and visiting a friend", answer = 3,
            why = "Planning, relationships, prevention and renewal are important but rarely urgent. Effective people make time for them on purpose.")
        why("Why does Covey prefer weekly planning around roles and goals over a daily to-do list?",
            "A daily list fills with whatever is loudest, which is the urgent work. Planning a week around your roles lets you put the important-not-urgent work in first, before the urgent fills the gaps.")
        cloze("Most people live in the urgent quadrants, answering whatever is ___.", "loudest")
    }
    para(5) {
        mcq("A coworker gets the promotion you wanted, and you think \"their win is my loss.\" What is Covey's name for that mindset?",
            "Abundance mentality", "Scarcity mentality", "Proactivity", "Synergy", answer = 1,
            why = "Scarcity assumes there's only one pie, so someone else's gain shrinks yours. Abundance assumes there's enough to go around.")
        why("Why does win-win include the option of \"no deal\"?",
            "If no agreement can benefit both sides, walking away is better than a win-lose deal that drains the relationship. Being free to say no deal keeps both sides honest.")
        cloze("Covey argues for an ___ mentality instead of a scarcity one.", "abundance", "abundant")
    }
    para(6) {
        mcq("Your friend says \"I'm so stressed about this move.\" Which reply is empathic listening?",
            "\"When I moved, I just hired movers.\"", "\"You'll be fine, don't worry.\"", "\"It sounds like you're overwhelmed by everything at once.\"", "\"Have you tried making a checklist?\"", answer = 2,
            why = "Empathic listening reflects both the content and the feeling until the person feels understood. The others are advice or autobiography.")
        why("Why does Covey compare listening to a doctor?",
            "A good doctor diagnoses before prescribing. Offering advice before you understand someone is like prescribing glasses without an eye exam, so they won't be open to your view.")
        cloze("Most people listen with the intent to ___, not to understand.", "reply", "respond")
    }
    para(7) {
        mcq("Two designers disagree: one wants a bold layout, one wants a minimal one. With trust and open talk, what does synergy aim for?",
            "Splitting the difference 50/50", "Letting the senior designer decide", "A third alternative better than either original", "Voting and moving on", answer = 2,
            why = "Synergy produces a third alternative that is better than either side's starting position. A compromise just gives each side less.")
        why("Why does synergy need differences between people?",
            "Differences are the raw material of creativity. If everyone thinks the same, there is nothing new to combine. Trust is what turns those differences from conflict into ideas.")
        cloze("Synergy produces a third ___ that is better than either side's original position.", "alternative", "option")
    }
    para(8) {
        mcq("You've worked 70-hour weeks for months, skipping sleep, exercise and friends. What does habit seven say is happening?",
            "You're proving your proactivity", "Your saw is getting dull and the other habits will decay", "You're in Quadrant 2", "You're building an abundance mentality", answer = 1,
            why = "Like the man too busy sawing to sharpen the blade, skipping renewal makes every hour less effective, and without renewal the other six habits decay.")
        why("Name the four dimensions of renewal and one example of each.",
            "Physical: exercise and rest. Mental: reading and writing. Social/emotional: service and relationships. Spiritual: reflecting on your values.")
        cloze("The man refuses to sharpen the blade because he is too busy ___.", "sawing")
    }
    para(9) {
        mcq("Which action is a deposit in the emotional bank account?",
            "Defending a colleague who isn't in the room", "Promising more than you can deliver", "Leaving expectations vague", "Gossiping to build rapport", answer = 0,
            why = "Loyalty to the absent is a deposit. So are keeping promises, clarifying expectations and apologizing sincerely.")
        why("Why does Covey insist effectiveness is \"not a trick\"?",
            "Techniques can be faked for a while, but trust is built or drained by every interaction. Only living in line with principles that don't change keeps the account in credit over time.")
        cloze("Keeping promises, clarifying expectations and apologizing sincerely all make ___.", "deposits", "deposit")
    }
}
