package com.aidantorrence.syncstudy

val DEEP_WORK_STUDY = study("deep-work") {
    keyIdeas(
        "Deep work is distraction-free concentration that pushes your abilities to their limit; shallow work is easy to replicate and creates little value.",
        "Deep work is getting more valuable and rarer at the same time, so it's a real advantage.",
        "High-quality output = time spent × intensity of focus. Attention residue lowers the intensity.",
        "Willpower is limited, so use rituals, a schedule philosophy and a shutdown ritual to make depth the default.",
        "Concentration is trained: take breaks from focus, not breaks from distraction.",
        "Adopt tools like a craftsman: only when benefits substantially outweigh costs.",
        "Drain the shallows: time-block every minute, budget shallow work, and finish at a fixed time.",
    )
    para(0) {
        mcq("Which of these is deep work?",
            "Replying to a dozen routine emails", "Formatting a slide deck while on a call", "Two silent hours solving a hard proof", "Scheduling next week's meetings", answer = 2,
            why = "Deep work is distraction-free concentration that pushes your abilities to their limit. The others are logistical, easily replicated shallow tasks.",
            pretest = true)
        why("What are the two halves of Newport's argument?",
            "First, deep work is becoming more valuable at the same time it is becoming rarer. Second, anyone who builds a deep work habit gets an outsized advantage.")
        cloze("Logistical, easily replicated tasks that create little new value are ___ work.", "shallow")
    }
    para(1) {
        mcq("You write for an hour but check email every ten minutes. What does Newport say this does to your output?",
            "Nothing, as long as total time is the same", "Lowers your focus intensity through attention residue", "Raises output by keeping you fresh", "Only matters for creative work", answer = 1,
            why = "Output = time × intensity of focus. Each glance leaves attention residue that lingers and lowers the intensity of what you return to.",
            pretest = true)
        why("Why do the two key skills of the modern economy both depend on focus?",
            "Quickly mastering hard things needs deliberate practice, which you can't do half-attending. Producing at an elite level in quality and speed needs high intensity. Both fall apart with divided attention.")
        cloze("High-quality output equals time spent multiplied by ___ of focus.", "intensity")
    }
    para(2) {
        mcq("In an open-plan office, Sam answers every chat within a minute and looks very busy, but ships little. Which idea explains why this persists?",
            "Busyness is a proxy for productivity", "Deliberate practice", "The craftsman approach", "Lead measures", answer = 0,
            why = "Knowledge work is hard to measure, so people default to looking responsive. Being visibly busy stands in for actually producing.",
            pretest = true)
        why("Why is distraction so hard to resist without a structure?",
            "Distraction feels good. Quick hits of novelty are rewarding in the moment, so willpower alone loses unless you set up a deliberate structure.")
        cloze("Newport suggests that ___ has become a proxy for productivity.", "busyness", "being busy")
    }
    para(3) {
        mcq("A novelist blocks 6–9 am every weekday for writing, no matter what. Which scheduling philosophy is that?",
            "Monastic", "Bimodal", "Journalistic", "Rhythmic", answer = 3,
            why = "Blocking the same hours every day is the rhythmic approach. Monastic cuts shallow work almost entirely; bimodal takes whole days or weeks; journalistic grabs any gap.")
        why("Why does a shutdown ritual at the end of the day matter for deep work?",
            "Downtime lets the mind rest and recover. A firm shutdown closes the day's open loops so you're not half-working all evening, and you come back with full capacity for depth.")
        cloze("Tracking hours of deep work is a ___ measure, not a lag measure.", "lead")
    }
    para(4) {
        mcq("You're waiting in a line for two minutes. What would Newport suggest?",
            "Check your email quickly", "Stay with the boredom and don't reach for your phone", "Scroll social media to relax", "Listen to a podcast at 2×", answer = 1,
            why = "Every time you reach for your phone in a dull moment you weaken your concentration. Tolerating boredom trains it.")
        why("What's the difference between a break from distraction and a break from focus?",
            "Most people focus by default and occasionally take a break from distraction. Newport flips it: decide in advance when you'll go online, and stay offline the rest of the time, so distraction is the scheduled exception.")
        cloze("Holding one problem in mind while walking or doing chores is called productive ___.", "meditation")
    }
    para(5) {
        mcq("An app gives you a few minor perks but eats an hour a day. Under the craftsman approach, should you keep it?",
            "Yes, any benefit justifies it", "Yes, if your friends use it", "No: its benefits don't substantially outweigh its costs", "Only on weekends", answer = 2,
            why = "Adopt a tool only if its benefits to what you value substantially outweigh its costs. Some benefit is not enough.")
        why("What is the point of a thirty-day break from a tool?",
            "It's an experiment. Afterwards, ask whether anyone cared that you were gone and whether your life got worse. If not, you probably don't need it.")
        cloze("Newport proposes the ___ approach: adopt a tool only if its benefits substantially outweigh its costs.", "craftsman", "craftsman's")
    }
    para(6) {
        mcq("By Newport's test, which task is the shallowest?",
            "Designing a new research study", "Writing the core argument of a book", "Debugging a novel algorithm", "Filling in an expense report", answer = 3,
            why = "Ask how long it would take to train a smart recent graduate to do it. An expense report takes minutes to teach, so it's shallow.")
        why("Why does finishing by a fixed time help you go deeper?",
            "A hard end time forces you to decline low-value commitments and protect the deep hours you have, instead of letting shallow work spill into the evening.")
        cloze("Ask your boss for an explicit shallow work ___.", "budget")
    }
    para(7) {
        mcq("What does Newport say makes a deep life more satisfying, not just more productive?",
            "Higher pay", "Flow and craftsmanship", "Fewer working hours", "Being always reachable", answer = 1,
            why = "Flow and craftsmanship give work a meaning that scattered attention never can.")
        why("How would you start building a deep life this week, using the four rules?",
            "Pick a time and place for deep work and protect it (rule 1), sit with boredom instead of reaching for the phone (rule 2), cut a tool that doesn't earn its keep (rule 3), and time-block the day with a fixed finish (rule 4).")
    }
}
