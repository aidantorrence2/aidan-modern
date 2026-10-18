package com.aidantorrence.syncstudy

val THINKING_STUDY = study("thinking-fast-slow") {
    keyIdeas(
        "System 1 is fast, automatic and effortless; System 2 is slow, deliberate and lazy.",
        "System 2 mostly endorses whatever System 1 proposes, which is where errors slip through.",
        "System 1 swaps hard questions for easy ones and builds confident stories from little evidence (what you see is all there is).",
        "Heuristics create biases: anchoring, availability, and representativeness (ignoring base rates).",
        "Experts are often overconfident; use the outside view against the planning fallacy.",
        "Losses loom about twice as large as gains, and framing changes choices.",
        "The remembering self judges by the peak and the end, and it makes our decisions.",
        "System 1 can't be switched off: spot risky situations, slow down, and use checklists and premortems.",
    )
    para(0) {
        mcq("You glance at a stranger and instantly know they're angry. Which system did that?",
            "System 2", "System 1", "Both equally", "Neither: it's a learned rule", answer = 1,
            why = "Reading emotions on faces is fast, automatic and effortless: classic System 1.",
            pretest = true)
        why("Why does Kahneman call System 2 \"lazy\", and why does it matter?",
            "It conserves effort, so most of the time it simply endorses what System 1 proposes. When System 1 is wrong, the error slips through unchecked.")
        cloze("System Two does long ___, fills out tax forms and checks arguments.", "division")
    }
    para(1) {
        mcq("Asked \"How happy are you with your life?\", someone answers from today's good mood. What happened?",
            "Loss aversion", "The peak-end rule", "System 1 swapped in an easier question", "They took the outside view", answer = 2,
            why = "Substitution: System 1 quietly replaces a hard question (life satisfaction) with an easy one (current mood) and answers that.",
            pretest = true)
        why("What does \"what you see is all there is\" mean?",
            "System 1 builds the best story it can from the information in front of it and ignores what's missing. How well the pieces fit, not how much evidence there is, drives confidence.")
        cloze("We feel most certain exactly when we know the ___.", "least")
    }
    para(2) {
        mcq("People spin a wheel that lands on 65 before estimating a percentage, and their estimates rise. This is…",
            "Anchoring", "Availability", "Representativeness", "Framing", answer = 0,
            why = "Anchoring: any number you see before estimating pulls your estimate toward it, even an obviously irrelevant one.",
            pretest = true)
        why("Why do people guess \"librarian\" for a quiet, bookish person even though \"farmer\" is more likely?",
            "Representativeness: we judge by resemblance to a stereotype and ignore base rates. Farmers vastly outnumber librarians, so a random quiet person is more likely a farmer.")
        cloze("Availability bias: vivid ___ crashes feel more dangerous than ordinary car trips.", "plane")
    }
    para(3) {
        mcq("Your team estimates a project will take 3 months. What's Kahneman's remedy?",
            "Add 10% for safety", "Ask how long similar projects actually took", "Trust the most confident expert", "Plan each step in more detail", answer = 1,
            why = "The outside view: before estimating your own case, look at how similar cases usually went. It counters the planning fallacy.")
        why("Why do experts in unpredictable fields stay confident despite performing about as well as chance?",
            "System 1 rewards coherent stories rather than accuracy, and hindsight makes past events seem inevitable, so the feeling of understanding survives a poor record.")
        cloze("The planning ___ makes every project seem faster and cheaper than it will turn out to be.", "fallacy")
    }
    para(4) {
        mcq("A coin flip: heads you win $110, tails you lose $100. Most people refuse. Why?",
            "They overweight small probabilities", "The peak-end rule", "They can't do the arithmetic", "A loss feels about twice as big as an equal gain", answer = 3,
            why = "Loss aversion, from prospect theory: losses loom roughly twice as large as gains, so a fair (even slightly favourable) bet feels bad.")
        why("Why does \"90% survival\" feel safer than \"10% mortality\"?",
            "Framing: we treat the description as if it were the substance. The facts are identical, but one frame highlights gains and the other highlights losses.")
        cloze("Prospect theory says people judge outcomes relative to a ___ point.", "reference")
    }
    para(5) {
        mcq("Two procedures reach the same peak pain; one is longer but ends gently. Which is remembered as less bad?",
            "The shorter one", "The longer one that ends gently", "Both are remembered the same", "Whichever had less total pain", answer = 1,
            why = "The remembering self judges by the peak and the ending and largely ignores duration, so the gentle ending wins.")
        why("What's the difference between the experiencing self and the remembering self?",
            "The experiencing self lives each moment; the remembering self keeps score using the peak and the end. We make decisions for the remembering self, though the experiencing self lives through them.")
        cloze("The remembering self judges an episode by its peak and its ___.", "ending", "end")
    }
    para(6) {
        mcq("What does Kahneman say about knowing your own biases?",
            "It does little by itself; procedures like checklists and premortems help more", "It prevents them almost completely",
            "It lets you switch System 1 off", "It only helps experts", answer = 0,
            why = "System 1 can't be switched off. Recognise risky situations, slow down, borrow others' eyes, and build procedures.")
        why("What is a premortem, and why does it help?",
            "Before deciding, the team imagines the plan has already failed and explains why. It makes doubts legitimate and forces the slow, deliberate system to look for weaknesses.")
        cloze("Organizations can build procedures such as premortems and ___ that force the slow system to show up.", "checklists")
    }
}
