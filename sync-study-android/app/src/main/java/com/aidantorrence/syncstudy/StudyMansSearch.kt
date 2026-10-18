package com.aidantorrence.syncstudy

val MANS_SEARCH_STUDY = study("mans-search") {
    keyIdeas(
        "The primary human drive is the search for meaning, not pleasure or power.",
        "Camp life passed through three phases: shock, apathy, and a confusing release.",
        "Those with a \"why\" to live (a person, a work, a faith) were more likely to endure.",
        "The last human freedom is choosing your attitude in any circumstances.",
        "Meaning is discovered, not invented, through work, love, or the stance you take toward suffering.",
        "Happiness can't be pursued directly; it ensues from a meaningful pursuit.",
        "Tragic optimism: saying yes to life in spite of pain, guilt and death.",
    )
    para(0) {
        mcq("According to Frankl, what is the primary drive in human beings?",
            "Seeking pleasure", "Gaining power", "The search for meaning", "Avoiding pain", answer = 2,
            why = "Frankl built logotherapy on one conviction: people are driven most deeply by the search for meaning, not pleasure (Freud) or power (Adler).",
            pretest = true)
        why("What are the two halves of Man's Search for Meaning?",
            "The first half is a memoir of the camps, studying how ordinary prisoners responded to extreme suffering. The second half explains logotherapy, his therapy built on the search for meaning.")
        cloze("Frankl's school of psychotherapy is called ___.", "logotherapy")
    }
    para(1) {
        mcq("A prisoner has stopped reacting to anything around him and only tries to get through each day. Which phase is this?",
            "Shock", "Apathy", "Release", "Curiosity", answer = 1,
            why = "Apathy was the second phase: an emotional deadening that worked like armor against constant degradation.",
            pretest = true)
        why("Why was liberation often confusing rather than joyful?",
            "Released prisoners felt bitterness and found that the world outside had moved on and was not waiting for them.")
        cloze("The three phases: shock, ___, and release.", "apathy")
    }
    para(2) {
        mcq("Which prisoner did Frankl observe was most likely to endure?",
            "The physically strongest", "The one with a loved one or unfinished work to live for", "The one who avoided thinking about the future", "The one with the most possessions", answer = 1,
            why = "Prisoners with something to live for, a person they loved, a work left unfinished, a faith, were more likely to endure. Those who lost a sense of future declined quickly.",
            pretest = true)
        why("Explain Nietzsche's line that Frankl quotes: \"He who has a why to live can bear almost any how.\"",
            "A clear reason to keep going makes almost any hardship bearable. Without a why, even smaller hardships can break a person.")
        cloze("Frankl concludes that ___ is the ultimate goal to which a person can aspire.", "love")
    }
    para(3) {
        mcq("Everything has been taken from you. What, according to Frankl, can no one take?",
            "Your memories of home", "Your freedom to choose your attitude", "Your physical health", "Your reputation", answer = 1,
            why = "The last of the human freedoms is to choose one's attitude in any set of circumstances.")
        why("Does Frankl claim that everyone rose above suffering? What does he actually conclude?",
            "No. Most prisoners did not. But some did, and that is enough to show suffering does not determine character: within limits, people decide who they become.")
        cloze("The last of the human freedoms: to choose one's ___.", "attitude")
    }
    para(4) {
        mcq("A friend is bored, restless and drinking more, though nothing is \"wrong\". Which Frankl idea fits best?",
            "The will to power", "An existential vacuum", "Paradoxical intention", "The first phase of shock", answer = 1,
            why = "Frankl traced boredom, addiction and aggression to an existential vacuum: a frustrated will to meaning.")
        why("Name Frankl's three roads to meaning, with an example of each.",
            "1) Creating a work or doing a deed (building something). 2) Experiencing something or loving someone. 3) The attitude we take toward suffering we cannot change.")
        cloze("Meaning cannot be invented; it has to be ___.", "discovered", "found")
    }
    para(5) {
        mcq("Someone afraid of blushing on stage tries to blush as much as they can. Which technique is this?",
            "Dereflection", "Paradoxical intention", "Free association", "Exposure to the past", answer = 1,
            why = "Paradoxical intention: wishing for the feared thing breaks the cycle of anticipatory anxiety and often brings humor.")
        why("Why does Frankl warn against chasing happiness directly?",
            "Happiness must ensue as a side effect of a meaningful pursuit. The more you aim at it, the more it eludes you.")
        cloze("Turning attention away from yourself and toward a task or person is called ___.", "dereflection")
    }
    para(6) {
        mcq("What does \"tragic optimism\" mean?",
            "Expecting the worst so you're never disappointed", "Saying yes to life in spite of pain, guilt and death", "Believing suffering always has a happy ending", "Ignoring painful facts", answer = 1,
            why = "Tragic optimism is the capacity to affirm life despite the tragic triad of pain, guilt and death.")
        why("How was Frankl's own life evidence for his ideas?",
            "He lost his wife, parents and brother, yet returned to Vienna and rebuilt a career helping others find reasons to continue.")
    }
}
