package com.aidantorrence.syncstudy

val SAPIENS_STUDY = study("sapiens") {
    keyIdeas(
        "Three revolutions: Cognitive (about 70,000 years ago), Agricultural (about 12,000) and Scientific (about 500).",
        "Our language can describe things that don't exist: shared fictions, or imagined orders.",
        "Shared myths let millions of strangers cooperate; chimps cooperate only in groups that know each other.",
        "Agriculture was a triumph for the species but often a step down for individuals: \"history's biggest fraud\".",
        "Money, empires and universal religions pulled humanity toward unity.",
        "Science began by admitting ignorance; science, empire and capital fed each other.",
        "Power grew enormously, but happiness didn't clearly follow, because expectations rise with every gain.",
    )
    para(0) {
        mcq("Which revolution, about 70,000 years ago, gave Homo sapiens a new kind of language?",
            "The Agricultural Revolution", "The Cognitive Revolution", "The Scientific Revolution", "The Industrial Revolution", answer = 1,
            why = "The Cognitive Revolution came first, roughly 70,000 years ago, and gave us language that could describe fictions.",
            pretest = true)
        why("What did each of Harari's three revolutions change?",
            "Cognitive: a new language able to describe things that don't exist. Agricultural: tied us to fields and villages. Scientific: admitting ignorance and turning knowledge into power.")
        cloze("The Scientific Revolution taught us to admit ___ and turn knowledge into power.", "ignorance")
    }
    para(1) {
        mcq("Two strangers trade, both trusting a company neither has ever seen. According to Harari, what makes this possible?",
            "Shared genes", "Personal friendship", "A shared story both believe (an imagined order)", "Fear of punishment", answer = 2,
            why = "Companies, money and nations are shared fictions. Strangers who believe the same story can trust each other.",
            pretest = true)
        why("Why can humans cooperate in the millions while chimps manage only a few dozen?",
            "Chimps cooperate with individuals they know personally. Humans can trust strangers who believe the same story: gods, nations, money, companies.")
        cloze("A limited liability company has no ___ existence, yet it can own property and hire people.", "physical")
    }
    para(2) {
        mcq("Why does Harari call agriculture \"history's biggest fraud\"?",
            "More food per acre, but often harder work, worse diets and more disease for each farmer",
            "It shrank the human population", "It was invented by kings", "It made foragers lazy", answer = 0,
            why = "For the species it was a triumph (population exploded); for the individual farmer it was often a step down from foraging.",
            pretest = true)
        why("In what sense did wheat \"domesticate\" humans?",
            "Wheat spread across the world because humans cleared fields, watered and weeded it, and settled beside it. People became tied to the crop as much as the crop was to them.")
        cloze("Storing a ___ let some people stop farming and become priests, soldiers and kings.", "surplus")
    }
    para(3) {
        mcq("People who agree on nothing else still accept the same banknotes. How does Harari describe money?",
            "A law of nature", "The most universal story ever told", "A kind of empire", "A religion", answer = 1,
            why = "Money is the most universal story ever told: trusted by people who agree on nothing else.")
        why("Why does Harari say the forces that unified humanity were neither purely good nor purely evil?",
            "Empires spread shared languages, laws and ideas, but often through brutality, and the people living under money, empires and religions rarely had a choice.")
        cloze("Universal ___ offered a single truth for everyone.", "religions")
    }
    para(4) {
        mcq("What made modern science different from earlier traditions?",
            "It claimed everything worth knowing was already known", "It rejected mathematics",
            "It started by admitting ignorance", "It ignored observation", answer = 2,
            why = "Science began with a confession: we don't know, but observation and mathematics can help us find out.")
        why("How did science, empire and capital form a feedback loop?",
            "Explorers sailed to conquer and to discover at once; investors funded voyages because they believed the future would be richer; profits and credit paid for more science and more voyages.")
        cloze("Credit is only possible if you trust in ___.", "growth")
    }
    para(5) {
        mcq("Despite huge gains in power, why might people not be much happier?",
            "Technology causes sadness", "Money isn't real", "Empires collapsed", "Expectations rise with every gain", answer = 3,
            why = "Happiness seems to depend on expectations and biochemistry more than circumstances, and expectations climb with every gain.")
        why("What is the \"uncomfortable question\" Harari ends with?",
            "As we gain the power to redesign life itself with genetic engineering and AI, the question isn't what we'll be able to do but what we will want.")
        cloze("Industrial society replaced the family and local community with the state and the ___.", "market")
    }
}
