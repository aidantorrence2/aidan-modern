package com.aidantorrence.syncstudy

/** A built-in title: an original summary of a popular nonfiction book, ready to read and hear. */
data class Book(
    val id: String,
    val title: String,
    val author: String,
    val year: Int,
    val blurb: String,
    val color: Long,
    val visual: VisualStyle,
    val summary: String,
)

const val CUSTOM_BOOK_ID = "custom"

val LIBRARY: List<Book> = listOf(
    Book(
        id = "carnegie",
        title = "How to Win Friends and Influence People",
        author = "Dale Carnegie",
        year = 1936,
        blurb = "The original playbook for getting along with people and bringing them around to your way of thinking.",
        color = 0xFFB5543A,
        visual = VisualStyle.CONNECTIONS,
        summary = """
Dale Carnegie's central claim is simple and a little uncomfortable: most of our success with other people has less to do with being right than with how we make them feel. He wrote the book from decades of teaching adults how to speak and deal with colleagues, and it reads less like theory than like a set of habits to practice.

The foundation is three rules for handling people. First, do not criticize, condemn, or complain. Criticism puts people on the defensive and makes them justify themselves, so it rarely changes behavior and usually costs you goodwill. Second, give honest and sincere appreciation. Everyone wants to feel important, and noticing what someone does well is the cheapest and most reliable way to meet that need. Flattery is counterfeit appreciation and people can usually tell the difference. Third, arouse in the other person an eager want. Instead of talking about what you need, frame every request in terms of what the other person wants.

From there Carnegie lays out six ways to make people like you. Become genuinely interested in them. Smile. Remember that a person's name is, to them, the sweetest sound in any language, so learn it and use it. Be a good listener and encourage others to talk about themselves. Talk in terms of the other person's interests. And make the other person feel important, sincerely, without expecting anything back. The thread running through all six is attention. People are drawn to those who pay attention to them.

The longest section covers how to win people to your way of thinking, and it begins with a warning: the only way to get the best of an argument is to avoid it. Even when you win, you lose, because the other person resents you. Carnegie suggests showing respect for other opinions and never telling someone flatly that they are wrong. If you are wrong, admit it quickly and emphatically, which disarms people and often makes them generous. Begin in a friendly way. Get the other person saying yes early, because a chain of small agreements makes a larger one easier. Let them do most of the talking and let them feel the idea is theirs. Try honestly to see things from their point of view, be sympathetic to their ideas and desires, and appeal to their nobler motives. Dramatize your ideas so they land, and when nothing else works, throw down a challenge, because people like to prove what they can do.

The final part is about leading without giving offense. Begin with praise and honest appreciation before pointing out a problem. Call attention to mistakes indirectly. Talk about your own mistakes before criticizing someone else's. Ask questions instead of giving direct orders. Let the other person save face. Praise every improvement, even a slight one, and be lavish about it. Give the person a fine reputation to live up to. Use encouragement and make the fault seem easy to correct. Finally, make the other person happy about doing the thing you suggest.

Critics sometimes read the book as a manual for manipulation, but Carnegie keeps returning to sincerity. The techniques only work when you actually care about the person in front of you. Read that way, the book is less about winning and more about a daily discipline of curiosity, generosity, and restraint. Nearly a century later, the advice holds up because the underlying facts have not changed. People want to be heard, respected, and appreciated, and the person who provides that consistently ends up with influence they never had to demand.
        """.trimIndent(),
    ),
    Book(
        id = "atomic-habits",
        title = "Atomic Habits",
        author = "James Clear",
        year = 2018,
        blurb = "Why tiny changes compound into remarkable results, and a four-step system for building habits that stick.",
        color = 0xFF2F6F8F,
        visual = VisualStyle.COMPOUND,
        summary = """
James Clear argues that we overrate big moments and underrate small, repeated actions. A habit that makes you one percent better each day compounds into something dramatic over a year, while a habit that makes you one percent worse quietly erodes everything. The problem is that the results of habits are delayed, so in the moment nothing seems to be happening. He calls this the plateau of latent potential: the work is building up long before the payoff shows, like ice that stays frozen as the room warms from twenty-five to thirty-one degrees and only melts at thirty-two.

His first big reframe is to focus on systems rather than goals. Winners and losers often share the same goals, so the goal cannot be what separates them. What separates them is the system of daily actions. Goals are good for setting direction, but systems are what make progress. The second reframe is identity. Most people try to change outcomes or processes, but lasting change starts with who you believe you are. Every action is a vote for the type of person you want to become. You do not need a unanimous election, just a majority, and the way to build a new identity is to prove it to yourself with small wins.

The core of the book is a model of how habits work. Every habit moves through four stages: a cue triggers a craving, the craving motivates a response, and the response delivers a reward that teaches the brain to repeat the loop. From those four stages Clear derives four laws of behavior change. To build a good habit, make it obvious, make it attractive, make it easy, and make it satisfying. To break a bad one, invert them: make it invisible, unattractive, difficult, and unsatisfying.

Making it obvious means designing your environment and your schedule. Implementation intentions, which state when and where you will act, roughly double follow-through. Habit stacking attaches a new behavior to an existing one, so that after you pour your morning coffee you meditate for one minute. Visual cues matter more than motivation, so put the guitar in the middle of the room and the junk food out of sight.

Making it attractive draws on dopamine, which spikes in anticipation of a reward rather than on receiving it. Temptation bundling pairs something you need to do with something you want to do. The culture you belong to also shapes what feels attractive, so join groups where your desired behavior is normal.

Making it easy is about reducing friction. The two-minute rule says to scale any new habit down to something that takes two minutes, because the hard part is showing up, not performing. Prime your environment so the next action is the default. Automate what you can with one-time choices that lock in good behavior.

Making it satisfying closes the loop. The brain prioritizes immediate rewards, so attach a small, instant pleasure to a habit whose real payoff is distant. Habit tracking makes progress visible and gives you a streak to protect. When you slip, never miss twice. Missing once is an accident; missing twice is the start of a new habit.

The later chapters add nuance. Pick habits that fit your natural abilities so the work feels easier for you than for others. Stay in the zone of just-manageable difficulty, where tasks are hard enough to keep you engaged. Watch out for the trap where a habit becomes automatic and stops improving, and build reflection and review into your system so you keep refining it. Above all, keep your identity loose enough that a setback in one role does not feel like the loss of who you are.

The thesis is that you do not rise to the level of your goals; you fall to the level of your systems. Build the system, cast the votes, and let compounding do the rest.
        """.trimIndent(),
    ),
    Book(
        id = "thinking-fast-slow",
        title = "Thinking, Fast and Slow",
        author = "Daniel Kahneman",
        year = 2011,
        blurb = "A Nobel laureate's tour of the two systems in your head and the predictable ways they mislead you.",
        color = 0xFF5B4E8C,
        visual = VisualStyle.TWO_SYSTEMS,
        summary = """
Daniel Kahneman spent a career studying how people actually make judgments, and his conclusion is that the mind runs on two very different modes. System One is fast, automatic, and effortless. It reads emotions on faces, completes the phrase bread and butter, and drives a car on an empty road. System Two is slow, deliberate, and lazy. It does long division, fills out tax forms, and checks whether an argument holds up. The trouble is that System Two likes to conserve effort, so most of the time it simply endorses whatever System One proposes. The book is a catalog of what goes wrong when it does.

System One works by association and by substitution. When asked a hard question, such as how happy you are with your life, it quietly swaps in an easier one, such as what mood you are in right now, and answers that instead. It is built to find coherence, so it constructs confident stories from very little evidence. Kahneman calls this what you see is all there is. The quality of a story depends on how well the pieces fit, not on how much information it contains, which is why we feel most certain exactly when we know the least.

A large section covers heuristics and the biases they produce. Anchoring means that any number you encounter before making an estimate pulls your estimate toward it, even when the number is obviously irrelevant. Availability means we judge how common something is by how easily examples come to mind, so vivid plane crashes feel more dangerous than ordinary car trips. Representativeness means we judge probability by resemblance to a stereotype and ignore base rates, which is why a quiet, bookish person is assumed to be a librarian even though farmers vastly outnumber librarians. The conjunction fallacy, where a detailed scenario seems more likely than a general one, is the same error in another costume.

Kahneman is especially hard on overconfidence. Experts in unpredictable fields, from stock pickers to political forecasters, perform about as well as chance yet remain sure of themselves, because System One rewards coherent narratives rather than accuracy. Hindsight makes past events seem inevitable, and the planning fallacy makes every project seem faster and cheaper than it will turn out to be. His remedy is the outside view: before estimating your own case, ask how similar cases have usually gone.

The book then turns to choices. Prospect theory, which won Kahneman the Nobel Prize, describes how people evaluate outcomes relative to a reference point rather than in absolute terms, and how losses loom roughly twice as large as equivalent gains. Loss aversion explains why people reject fair bets, cling to the status quo, and demand far more to give up an object than they would pay to acquire it. We also overweight small probabilities, which sells both lottery tickets and insurance, and we treat framing as substance, so the same surgery described as ninety percent survival feels safer than ten percent mortality.

Finally Kahneman separates the experiencing self, which lives each moment, from the remembering self, which keeps score. The remembering self judges an episode by its peak and its ending and largely ignores its duration. A vacation is remembered by its best moment and its last day, and a painful procedure that ends gently is recalled as less bad than a shorter one that ends sharply. We make decisions for the remembering self even though the experiencing self is the one who has to live through them.

Kahneman is modest about the practical payoff. Knowing about biases does little to prevent them in yourself, because System One cannot be switched off. The useful move is to recognize situations where errors are likely, slow down, and borrow the eyes of others. Organizations can do better than individuals by building procedures, such as premortems and checklists, that force the slow system to show up.
        """.trimIndent(),
    ),
    Book(
        id = "sapiens",
        title = "Sapiens",
        author = "Yuval Noah Harari",
        year = 2011,
        blurb = "A brief history of humankind, from an unremarkable ape to the species that runs the planet.",
        color = 0xFF8C6A3F,
        visual = VisualStyle.STAR_TRAILS,
        summary = """
Yuval Noah Harari asks a blunt question: how did one species of ape, not the strongest or the fastest, come to dominate the planet? His answer is organized around three revolutions. The Cognitive Revolution, roughly seventy thousand years ago, gave Homo sapiens a new kind of language. The Agricultural Revolution, about twelve thousand years ago, tied us to fields and villages. The Scientific Revolution, five hundred years ago, taught us to admit ignorance and turn knowledge into power.

The key idea in the first part is that our language is unique not because it can describe lions by the river but because it can describe things that do not exist. Gods, nations, corporations, money, and human rights are all shared fictions, what Harari calls imagined orders. Chimpanzees can cooperate in groups of a few dozen because they know each other personally. Humans can cooperate in the millions because strangers who believe in the same story can trust each other. A limited liability company has no physical existence, yet it can own property, hire people, and outlive its founders. The power of sapiens is the power to believe in common myths, and most of history is the story of those myths growing larger and swallowing one another.

Harari's treatment of agriculture is deliberately provocative. He calls it history's biggest fraud. Wheat did not give humans an easier life; it gave them more calories per acre at the cost of harder work, worse diets, more disease, and a dependence on a few crops that could fail. From the point of view of the species, agriculture was a triumph, because population exploded. From the point of view of the individual farmer, it was often a step down from the varied, leisurely life of a forager. He suggests that wheat domesticated us as much as we domesticated it. Agriculture also made it possible to store surplus, which meant some people could stop farming and become priests, soldiers, and kings. Hierarchy, written records, and the large imagined orders of empire followed.

The middle of the book traces the forces that pulled humanity toward unity. Money is the most universal story ever told, trusted by people who agree on nothing else. Empires, for all their brutality, spread common languages, laws, and ideas across huge regions. Universal religions offered a single truth for everyone. Harari insists that these unifiers were neither purely good nor purely evil, and that the people who lived under them rarely had a choice.

The Scientific Revolution, in his telling, began with a confession. Earlier traditions assumed that everything worth knowing was already known. Modern science started from the admission that we are ignorant and that observation and mathematics can fix that. This created a feedback loop among science, empire, and capital. Explorers sailed to conquer and to discover at the same time. Investors funded voyages because they believed the future would be richer than the present, and credit is only possible if you trust in growth. Capitalism, for Harari, is less an economic system than a faith in progress that happens to have delivered on many of its promises.

The last chapters widen the lens. Industrial society reorganized time, dissolved the family and the local community, and replaced them with the state and the market. Harari then asks whether any of this made people happier, and finds the evidence thin. Happiness seems to depend on expectations and biochemistry more than on circumstances, and expectations rise with every gain. He closes by noting that sapiens are now beginning to redesign life itself through genetic engineering and artificial intelligence. The ape that invented gods may be on the verge of becoming one, and the uncomfortable question is not what we will be able to do but what we will want.
        """.trimIndent(),
    ),
    Book(
        id = "seven-habits",
        title = "The 7 Habits of Highly Effective People",
        author = "Stephen R. Covey",
        year = 1989,
        blurb = "A character-first framework for moving from dependence to independence to real collaboration.",
        color = 0xFF3C7A5A,
        visual = VisualStyle.CIRCLES,
        summary = """
Stephen Covey opens by drawing a line between what he calls the personality ethic and the character ethic. The personality ethic, which dominated self-help in the twentieth century, is about techniques, image, and quick fixes. The character ethic, which he traces to older writing, is about principles such as integrity, fairness, and patience. Covey's claim is that lasting effectiveness comes from character, and that the seven habits are a way to build it. He also introduces the idea of paradigms, the mental maps we use without noticing them. Small changes in behavior come from working on attitudes; big changes come from changing the map.

The habits are arranged as a progression from dependence to independence to interdependence. The first three are private victories, the work you do on yourself.

Habit one is to be proactive. Between stimulus and response there is a gap, and in that gap lies your freedom to choose. Proactive people focus their energy on their circle of influence, the things they can actually affect, and that circle grows. Reactive people focus on their circle of concern, complain about what they cannot control, and their influence shrinks.

Habit two is to begin with the end in mind. Covey asks the reader to imagine their own funeral and what they would want said about them. From that exercise comes a personal mission statement, a written description of the principles and roles that matter most. Everything is created twice, first mentally and then physically, and the first creation is where you decide what the ladder is leaning against.

Habit three is to put first things first. He sorts activities into four quadrants by urgency and importance. Most people live in the urgent quadrants, answering whatever is loudest. Effective people spend as much time as possible in the quadrant of important but not urgent work, such as planning, relationships, prevention, and renewal. The tool is weekly planning around roles and goals rather than a daily to-do list.

The next three habits are public victories, about working with others. Habit four is to think win-win. Most people carry a scarcity mentality, assuming that another person's gain is their loss. Covey argues for an abundance mentality and for agreements where everyone benefits, including the option of no deal when that is impossible.

Habit five is to seek first to understand, then to be understood. Most people listen with the intent to reply, filtering everything through their own autobiography. Empathic listening means reflecting both the content and the feeling of what someone says until they feel understood. Only then will they be open to your view. He compares it to a doctor who diagnoses before prescribing.

Habit six is to synergize. When people with different perspectives trust each other and communicate openly, they can produce a third alternative that is better than either side's original position. Differences become the raw material of creativity rather than sources of conflict.

Habit seven is to sharpen the saw. Covey tells of a man sawing a tree for hours who refuses to stop and sharpen the blade because he is too busy sawing. Renewal happens in four dimensions: physical, through exercise and rest; mental, through reading and writing; social and emotional, through service and relationships; and spiritual, through reflection on your values. Without regular renewal, the other six habits decay.

Running beneath all seven is the emotional bank account, the trust built up or drained by every interaction. Keeping promises, clarifying expectations, apologizing sincerely, and showing loyalty to those who are absent all make deposits. Covey's lasting contribution is the insistence that effectiveness is not a trick but a way of living in line with principles that do not change.
        """.trimIndent(),
    ),
    Book(
        id = "deep-work",
        title = "Deep Work",
        author = "Cal Newport",
        year = 2016,
        blurb = "Why focused, distraction-free work is becoming rare and valuable, and how to build a life around it.",
        color = 0xFF2E5E6E,
        visual = VisualStyle.DEPTH,
        summary = """
Cal Newport defines deep work as professional activity performed in a state of distraction-free concentration that pushes your abilities to their limit. Shallow work is the opposite: logistical, easily replicated tasks, often done while distracted, that create little new value. His argument has two halves. First, deep work is becoming more valuable at the same time it is becoming rarer. Second, anyone who builds a deep work habit will have an outsized advantage.

The value comes from the shape of the modern economy. Two skills matter most: the ability to quickly master hard things, and the ability to produce at an elite level in both quality and speed. Both depend on sustained focus. Learning complex skills requires deliberate practice, which is impossible while half-attending to a chat window. High-quality output, Newport argues, equals time spent multiplied by intensity of focus. Every time you glance at email, attention residue from that task lingers and lowers the intensity of whatever you return to.

The rarity comes from the culture of open offices, instant messaging, and the expectation of constant availability. Newport suggests that busyness has become a proxy for productivity because knowledge work is hard to measure, so people default to looking responsive. He also notes that distraction feels good, which makes it hard to resist without a deliberate structure.

The second half of the book is four rules. Rule one is to work deeply. Since willpower is limited, you need rituals and routines that make deep work the default. Newport describes four scheduling philosophies: the monastic approach, which eliminates shallow obligations almost entirely; the bimodal approach, which dedicates whole days or weeks to depth; the rhythmic approach, which blocks the same hours every day; and the journalistic approach, which fits deep work into any available gap and requires a lot of practice. He recommends setting a specific location and time, defining rules for the session, and taking care of food and movement so the body does not interrupt. He also borrows from business the idea of focusing on a small number of wildly important goals, tracking lead measures such as hours of deep work, keeping a visible scoreboard, and reviewing weekly. Downtime matters too: a firm shutdown ritual at the end of the day lets the mind rest and recover.

Rule two is to embrace boredom. Concentration is a skill that has to be trained, and every time you reach for your phone in a dull moment you weaken it. Instead of taking breaks from distraction, schedule breaks from focus: decide in advance when you will go online and stay offline the rest of the time. Practice productive meditation, holding one problem in mind while walking or doing chores.

Rule three is to quit social media, or at least to stop using tools by default. Newport proposes the craftsman approach: adopt a tool only if its benefits to the things you value substantially outweigh its costs. Try a thirty-day break and notice whether anyone cared and whether your life got worse.

Rule four is to drain the shallows. Schedule every minute of your day in blocks, revising as needed, so that shallow work is contained rather than filling every gap. Quantify the depth of each activity by asking how long it would take to train a smart recent graduate to do it. Ask your boss for an explicit shallow work budget. Finish by a fixed time each day, which forces you to decline low-value commitments. Make yourself harder to reach by filtering email and by writing messages that close loops instead of opening them.

Newport closes by arguing that a deep life is not only more productive but more satisfying, because flow and craftsmanship give work a meaning that scattered attention never can.
        """.trimIndent(),
    ),
    Book(
        id = "power-of-habit",
        title = "The Power of Habit",
        author = "Charles Duhigg",
        year = 2012,
        blurb = "How the habit loop runs individuals, companies, and movements, and where to press to change it.",
        color = 0xFF9A4F6A,
        visual = VisualStyle.LOOP,
        summary = """
Charles Duhigg builds his book around one piece of neuroscience and then follows it everywhere. The piece of neuroscience is the habit loop. A cue triggers a routine, the routine produces a reward, and over time the brain learns to anticipate the reward as soon as it sees the cue. Once a loop is established, the basal ganglia take over and the conscious mind steps back, which is why you can drive home without remembering the trip. Habits never truly disappear; they are overwritten by new loops that use the same cue and deliver the same reward.

That last point is the golden rule of habit change. You cannot easily remove a cue or a craving, but you can keep the cue and the reward and swap in a new routine. Duhigg illustrates it with Alcoholics Anonymous, which replaces drinking with meetings and conversation while serving the same underlying needs for relief and companionship, and with a football coach who retrained players to react to a few key cues automatically instead of thinking. He adds one ingredient that experiments kept revealing: belief. For a new routine to hold under stress, people need to believe change is possible, and belief is easiest to sustain inside a group.

The second section moves from individuals to organizations. Some habits are keystone habits, small changes that start chain reactions. When Paul O'Neill took over Alcoa and announced that his only priority was worker safety, investors panicked. But fixing safety required fixing communication, manufacturing processes, and accountability, and profits followed. Exercise is a keystone habit for many people, because once it takes hold, eating, spending, and sleeping tend to improve without any direct effort. Keystone habits work by producing small wins, by creating structures that help other habits grow, and by building a culture where new values feel normal.

Willpower, Duhigg argues, is itself a habit that can be strengthened and that gets depleted. Starbucks trains employees to plan in advance how they will respond to a rude customer, so that at the moment of stress the response is already scripted. Organizations that give people a sense of autonomy, even over small things, find that willpower lasts longer.

He also examines institutional habits that nobody designs. A hospital with a culture of deference to surgeons produces preventable errors. The London Underground's rigid division of responsibilities meant that a fire nobody owned turned deadly. Crises, Duhigg notes, are the moments when organizational habits become visible and can be rewritten, and good leaders sometimes prolong a sense of emergency precisely to make change possible.

The chapter on Target shows how companies use habits commercially. By analyzing purchases, the retailer could predict a pregnancy before the family had announced it, then quietly mix baby coupons among unrelated offers so the targeting felt like coincidence. The lesson is that new habits are most easily sold when they are dressed in old ones, which is also how a pop song becomes a hit through repeated radio exposure.

The final section asks how movements happen. The Montgomery bus boycott spread through strong ties of friendship, which started it, and weak ties of community, which made it costly to stand aside. It lasted because participants acquired new habits of identity and self-direction that the movement gave them. Duhigg closes with the question of responsibility: if habits are automatic, are we responsible for them? His answer is that once you know a habit exists, you have the responsibility to change it, and the framework for doing so is in your hands. Identify the routine, experiment with rewards until you find the craving underneath, isolate the cue, and write a plan.
        """.trimIndent(),
    ),
    Book(
        id = "mans-search",
        title = "Man's Search for Meaning",
        author = "Viktor E. Frankl",
        year = 1946,
        blurb = "A psychiatrist's account of the concentration camps and the therapy he built from what survived there.",
        color = 0xFF6B6B6B,
        visual = VisualStyle.FLAME,
        summary = """
Viktor Frankl was a Viennese psychiatrist who spent three years in Nazi concentration camps, including Auschwitz and Dachau. The first half of his book is a memoir of that experience, written not as a catalog of horrors but as a study of how ordinary prisoners reacted to extreme suffering. The second half describes logotherapy, the school of psychotherapy he developed around a single conviction: the primary drive in human beings is not pleasure or power but the search for meaning.

Frankl describes the psychology of the camps in three phases. On arrival came shock, and with it a strange, detached curiosity about whether one would survive. Then came apathy, an emotional deadening that served as armor against constant degradation. Prisoners stopped reacting to beatings, to corpses, to hunger, and cared only about getting through the day. Finally, for those who were liberated, came a release that was often confusing rather than joyful, marked by bitterness and the discovery that the world outside had not been waiting for them.

Within that account are the observations that became his philosophy. He noticed that prisoners who had something to live for, a person they loved, a work left unfinished, a faith, were more likely to endure. Those who lost their sense of a future, who could no longer picture a reason to survive, declined quickly, and often died within days of giving up. He quotes Nietzsche: whoever has a why to live can bear almost any how. He also describes moments of inner life that persisted even there, such as a sunset watched from the barracks, a few words of humor, or the thought of his wife, and he concludes that love is the ultimate goal to which a person can aspire.

The most quoted idea in the book is that everything can be taken from a person except one thing, the last of the human freedoms: the ability to choose one's attitude in any set of circumstances. Frankl does not romanticize this. He says most prisoners did not rise to it. But some did, and that is enough to show that suffering does not determine character. A person is not fully the product of conditions; they decide, within whatever limits, who they become.

Logotherapy follows directly. Where Freud saw a will to pleasure and Adler a will to power, Frankl sees a will to meaning, and he argues that many modern troubles, from boredom to addiction to aggression, stem from an existential vacuum in which that will is frustrated. Meaning cannot be invented or prescribed by a therapist; it has to be discovered, and it is specific to each person and each moment. He identifies three roads to it. The first is creating a work or doing a deed. The second is experiencing something or encountering someone, especially through love. The third is the attitude we take toward unavoidable suffering. When a situation cannot be changed, we are challenged to change ourselves, and suffering ceases to be suffering the moment it finds a meaning.

Frankl adds practical techniques. Paradoxical intention asks the anxious patient to wish for exactly the thing they fear, which breaks the cycle of anticipatory anxiety and often brings humor with it. Dereflection redirects attention away from obsessive self-observation and toward the task or person in front of you. He also warns against aiming at happiness directly; happiness must ensue as the side effect of a meaningful pursuit, and the more you chase it the more it eludes you.

The book ends on tragic optimism, the capacity to say yes to life in spite of pain, guilt, and death. Frankl's life was his evidence. He lost his wife, parents, and brother, returned to Vienna, and rebuilt a career devoted to helping others find reasons to continue.
        """.trimIndent(),
    ),
    Book(
        id = "mindset",
        title = "Mindset",
        author = "Carol S. Dweck",
        year = 2006,
        blurb = "The research behind fixed and growth mindsets, and how a single belief shapes learning, work, and love.",
        color = 0xFF3F7F7A,
        visual = VisualStyle.GROWTH,
        summary = """
Carol Dweck, a Stanford psychologist, spent decades studying why some people wilt in the face of difficulty while others dig in. Her answer comes down to a belief about the nature of ability. People with a fixed mindset believe that intelligence, talent, and character are set traits. People with a growth mindset believe they can be developed through effort, strategy, and help from others. The belief is often unconscious, it varies from one area of life to another, and it quietly shapes almost everything that follows.

In a fixed mindset, every task becomes a test of whether you have the trait. Failure is not an event but a verdict, so it must be avoided or explained away. That leads to a predictable set of behaviors: choosing tasks you already know you can do, hiding mistakes, giving up when things get hard, feeling threatened by others' success, and treating effort as a sign that you lack natural ability. Dweck's experiments with children showed that praising them for being smart pushed them into this pattern. After a single round of praise for intelligence, children chose easier puzzles, enjoyed the hard ones less, and lied about their scores more often.

In a growth mindset, a task is an opportunity to get better. Failure is information. Effort is what turns ability into achievement, and it is the path everyone has to walk, including the gifted. Children praised for their process, for their effort, strategies, and persistence, chose harder puzzles and kept improving. Dweck is careful to say that a growth mindset does not claim everyone is equally talented or that anyone can become anything. It claims that a person's true potential is unknown and unknowable in advance, and that years of passion and training can take people much further than their starting point suggests.

She applies the idea across domains. In sports, she contrasts athletes who believed in natural talent and faded with those who treated setbacks as training problems. In business, she describes leaders who needed to be the smartest in the room, surrounded themselves with yes-men, and drove companies into the ground, and growth-minded leaders who asked questions, admitted mistakes, and built organizations that learned. In relationships, a fixed mindset holds that a good partnership should be effortless and that conflict reveals a fundamental flaw, while a growth mindset treats problems as things to work on together. In parenting and teaching, the most important lesson is to praise process rather than person, to treat a bad grade as a signal about strategy, and to add the word yet to any statement of what a child cannot do.

Dweck also addresses a misunderstanding that spread as her work became popular. A growth mindset is not just about praising effort. Effort that goes nowhere is not a virtue. The point is to keep trying new strategies, seek feedback, and learn from people who are better, which is a different thing from grinding harder at a failing approach. She also warns against a false growth mindset, where people claim the belief without acting on it, and acknowledges that everyone carries a mixture of both mindsets that shift with circumstances.

The last chapter is a guide to change. Learn to notice the fixed-mindset voice, the one that says you will fail and everyone will see. Recognize that you have a choice about how to interpret it. Answer it with a growth-mindset response, and then take the growth-mindset action: try, ask, study, stretch. Dweck frames this not as a one-time conversion but as a practice. The belief that abilities grow is itself an ability that grows with use, and the payoff is a life in which difficulty becomes interesting rather than threatening.
        """.trimIndent(),
    ),
    Book(
        id = "outliers",
        title = "Outliers",
        author = "Malcolm Gladwell",
        year = 2008,
        blurb = "Why success has more to do with timing, culture, and opportunity than the myth of the self-made genius.",
        color = 0xFF8F5F2F,
        visual = VisualStyle.OUTLIERS,
        summary = """
Malcolm Gladwell opens with a town in Pennsylvania called Roseto, where Italian immigrants had strikingly low rates of heart disease despite smoking, drinking, and eating heavily. Researchers eventually concluded that the explanation was the community itself: tight families, shared meals, and a culture that discouraged showing off. Gladwell uses the story to announce his thesis. We like to explain success through individual traits such as talent and grit, but the people we call outliers are products of hidden advantages, cultural legacies, and extraordinary opportunities. To understand them, you have to look around them, not just at them.

The first evidence is a roster of elite Canadian hockey players, most of whom were born in January, February, or March. The cutoff date for youth leagues is January first, so the oldest children in each age group are bigger and more coordinated, get picked for the better teams, receive more coaching and more games, and by the teenage years really are better. A small initial advantage, created by an arbitrary calendar, compounds into a large one. Gladwell calls this accumulative advantage and finds the same pattern in school, where the youngest children in a grade are less likely to be identified as gifted.

Next comes the ten thousand hour rule, drawn from research on musicians and from the stories of the Beatles and Bill Gates. The Beatles played eight-hour sets in Hamburg clubs for years before they were famous, and Gates had rare, unlimited access to a computer terminal as a teenager in 1968. The point is less the exact number than the fact that mastery requires enormous practice, and that getting the chance to practice that much depends on luck, family, and timing. Gladwell notes that a disproportionate number of the richest people in history were born in the 1830s in America and that the software billionaires were born around 1955, each generation positioned to catch a specific wave.

He then questions the role of raw intelligence. Lewis Terman's long study of high-IQ children produced few remarkable achievements, and a comparison between a brilliant but isolated man named Chris Langan and the Nobel laureate Robert Oppenheimer suggests that beyond a threshold, IQ matters less than practical intelligence: the ability to read situations, talk to authority, and get what you want. That skill, Gladwell argues, is taught by class. Middle-class parents practice what sociologists call concerted cultivation, teaching children to negotiate with adults and to see institutions as theirs to use, while working-class children are more often taught deference.

The second half of the book is about cultural legacy. A culture of honor from the Scottish borders helps explain patterns of violence in the American South generations later. Airline accident records show that crews from cultures with high deference to authority struggled to challenge a captain's mistake, and that an airline fixed its safety record by retraining how its pilots communicated. The patience and precision required by rice farming may underlie East Asian strength in mathematics, along with number systems that are simpler to learn. And the summer gap in American schooling explains much of the achievement difference between rich and poor students, which is why a school that extends the school day and year can close it.

Gladwell ends with his own family, tracing his mother's path from Jamaica through a chain of opportunities that had nothing to do with merit. His conclusion is not that effort is unimportant. It is that effort can only be exercised when opportunity exists, and that if we want more outliers, we should build the structures that create them rather than wait for geniuses to appear on their own.
        """.trimIndent(),
    ),
)

fun findBook(id: String): Book? = LIBRARY.firstOrNull { it.id == id }
