package com.aidantorrence.syncstudy

val CARNEGIE_STUDY = study("carnegie") {
    keyIdeas(
        "Success with people depends less on being right than on how you make them feel.",
        "Don't criticize, condemn or complain: criticism makes people defensive and rarely changes them.",
        "Give honest, sincere appreciation. Flattery is counterfeit, and people can tell.",
        "Arouse an eager want: frame every request in terms of what the other person wants.",
        "Be interested, smile, use names, listen, talk about their interests: it all comes down to attention.",
        "Avoid arguments; admit mistakes fast, get early yeses, and let the idea feel like theirs.",
        "Correct indirectly, let people save face, and praise every improvement.",
        "The techniques only work when you sincerely care.",
    )
    para(0) {
        mcq("A coworker made a small mistake. According to Carnegie's central claim, what matters most in how you respond?",
            "Proving you were right", "How you make them feel", "Pointing out every flaw honestly", "Getting it settled in writing", answer = 1,
            why = "Carnegie's core claim: success with people has less to do with being right than with how you make them feel.",
            pretest = true)
        why("Why does Carnegie say being right matters less than how people feel?",
            "People act on feelings. Win the point but leave someone feeling small and they resist you; leave them feeling respected and valued and they cooperate.")
        cloze("Carnegie's book reads less like theory than like a set of ___ to practice.", "habits")
    }
    para(1) {
        mcq("Your roommate keeps leaving dishes in the sink. Which approach best follows Carnegie's three rules?",
            "Leave a passive-aggressive note", "Tell them it's disgusting and unfair", "Complain to your other friends",
            "Thank them for what they do well, then frame a clear sink as something they'd want", answer = 3,
            why = "No criticizing or complaining, start from honest appreciation, and appeal to what they want rather than what you need.",
            pretest = true)
        why("Why does criticism rarely change behavior?",
            "It puts people on the defensive. They spend their energy justifying themselves instead of changing, and you lose goodwill in the process.")
        cloze("Flattery is ___ appreciation, and people can usually tell the difference.", "counterfeit", "fake")
    }
    para(2) {
        mcq("At a party you want people to like you. Which single thread ties together all six of Carnegie's ways?",
            "Telling great stories", "Paying attention to the other person", "Dressing well", "Agreeing with everything", answer = 1,
            why = "Interest, smiling, names, listening, their interests, making them feel important: all six are forms of attention.",
            pretest = true)
        why("Why does remembering and using someone's name matter so much?",
            "To a person, their name is the sweetest sound in any language. Using it shows you noticed them as an individual, which makes them feel important.")
        cloze("Be a good ___ and encourage others to talk about themselves.", "listener")
    }
    para(3) {
        mcq("You're sure a colleague's plan is wrong. What would Carnegie do?",
            "Prove it with data in front of everyone", "Tell them flatly that they're wrong",
            "Avoid an argument, start from points of agreement, and let them reach the better idea", "Go over their head to the boss", answer = 2,
            why = "The only way to win an argument is to avoid it. Begin friendly, get early yeses, and let them feel the idea is theirs.")
        why("Why does Carnegie say that even when you win an argument, you lose?",
            "The other person feels defeated and resents you, so they're less likely to change their mind or cooperate with you later.")
        cloze("Get the other person saying ___ early, because small agreements make a larger one easier.", "yes")
    }
    para(4) {
        mcq("Which opening best follows Carnegie's way of correcting someone?",
            "Start with sincere praise, then point to the mistake indirectly", "State the error first so it's clear",
            "Correct them in front of the team so everyone learns", "Send a written warning", answer = 0,
            why = "Begin with praise and honest appreciation, call attention to mistakes indirectly, and let the person save face.")
        why("What does \"give the person a fine reputation to live up to\" mean?",
            "Describe them as already having the quality you want, like \"you're our detail person\". People work to live up to the reputation you give them.")
        cloze("Ask ___ instead of giving direct orders.", "questions")
    }
    para(5) {
        mcq("Someone uses every Carnegie technique but doesn't actually care about you. According to the book, what happens?",
            "It works just as well", "It works better because it's more controlled", "It tends to fail: it comes across as manipulation", "It only works on strangers", answer = 2,
            why = "Carnegie keeps returning to sincerity. The techniques only work when you actually care about the person in front of you.")
        why("Why has Carnegie's advice held up for nearly a century?",
            "The underlying facts haven't changed: people want to be heard, respected and appreciated, and whoever consistently provides that gains influence without demanding it.")
        cloze("People want to be heard, respected, and ___.", "appreciated")
    }
}
