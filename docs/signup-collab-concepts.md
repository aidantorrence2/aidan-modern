# /sign-up-collab — Five Concepts to Beat V4

Planning document. No code in this pass — this is the thinking that has to happen
before anything gets built. Everything below is grounded in what's actually in
this repo: the V3→V5 component history, the in-code experiment rationale, the
analytics events that exist, the exit-interview data model, and the assets on
disk.

---

## 1. Where the funnel stands today

**Live page:** `/sign-up-collab` renders `components/SignUpFormCollabV4.tsx`
(`analyticsPath="/sign-up-collab"` so the funnel is continuous across version
swaps). Six frames + done:

1. **Capture** — full-bleed film hero (5-image crossfade), white card overlapping
   the hero, LINE/WhatsApp segmented control, phone number, `Get Started`.
   The lead row is POSTed to Supabase the moment this frame submits; Meta
   `Lead` fires here.
2. **Vibe** — 2×2 portfolio-image tiles, one tap auto-advances.
3. **Notes** — optional textarea.
4. **Location** — geo-detected city chips.
5. **Photo** — selfie upload with good/bad example contact sheets; upload
   auto-advances.
6. **Instagram** — optional, `Finish Sign-Up` / `Skip`.

Everything after frame 1 PATCH-enriches the already-banked row. 24h
localStorage resume. Heavy first-party instrumentation (`lib/track.ts` → Neon
`analytics_events`): `slide_shown`, `field_engaged`, `validation_error`,
`channel_switched`, `faq_opened`, `not_for_me_clicked`, ~30 events total.

**Support pages:** `/sign-up-collab/faq` (8 Q&As ordered as an argument:
*Is it really free? → Why? → What's the catch?*) and
`/sign-up-collab/not-for-me` (exit interview with reason chips).

**Version history and what it taught:**

| Version | Idea | Lesson encoded in the code |
|---|---|---|
| `/sign-up` (white-v2) | "Design your photo shoot" configurator | 4 required asks before any lead is recorded — worst friction ladder |
| `-new` (3step) | Zero-effort "That's the whole plan" | Objection-handling-as-form-row ("Outfit" is a non-field); safety copy ("daytime and public") |
| V3 (capture-first) | Nothing between hero and the number field | **93% of ad clickers bounced at 0% scroll; required photo upload killed 24% of the rest.** Lead written at the tap. LINE add-friend = zero-typing conversion |
| V4 (live) | Capture-first + vibe frame + doubt-handling | "Tap-first" (contact ask on frame 4) was tried and **reverted** — the ask is back on the doorstep. FAQ link moved *into* the capture card. "It's not for me" exits added |
| V5 (staged, not live) | V4 + wardrobe-styler frame | Investment/endowment mechanic *after* the lead is banked |

**The two structural facts every concept must respect:**

1. **The first frame is ~the whole game.** 93% of ad clickers never scroll.
   Whatever a concept's big idea is, it must be legible in the first viewport
   of a phone, or it doesn't exist.
2. **Capture-first is the proven backbone.** One required field (a number)
   before the row is written and `Lead` fires; everything after is upside.
   The one experiment that moved the ask later was reverted. Concepts may
   *reframe* the ask; they should not *delay* it past one screen without an
   explicit, measured reason.

**Measured objections** (the `/not-for-me` chips exist because real visitors
tapped them): **Seems too good to be true · Not confident on camera · Bad
timing · Just browsing.** These are the four dragons. Each concept below is
aimed primarily at one of them.

---

## 2. The untapped levers (gaps analysis)

Across all five existing variants, **nobody has ever used**:

- **Scarcity / urgency** — no dates, no spot counts, no timers. And the real
  business has *genuine* scarcity: Aidan is physically in one city for a
  limited window. This is the rare case where urgency is honest.
- **Named social proof** — zero testimonials on any signup page, despite
  `data/shoots.ts` holding 27 named, city-tagged shoots with full galleries
  and public `/shoots/[slug]` pages that function as verifiable receipts.
  (⚠️ `components/Testimonials.tsx` contains **fabricated placeholder quotes**
  and is dead code. It must never ship. Real quotes have to be collected from
  past subjects first.)
- **Price anchoring** — "free" is never anchored against what it's worth. The
  Bali page already publishes Rp 5,000,000 (~$300) for the equivalent
  Signature session. "Free" with no anchor reads as "worthless" or "scam";
  anchored, it reads as a $300 gift with a stated reason.
- **Personalization reflection** — V4/V5 collect vibe, city, outfit… and never
  show the visitor anything built from their answers until a plain done
  screen. The intent data is pure extraction, zero endowment.
- **Zero-typing conversion** — V3's LINE add-friend deep link (the tap *was*
  the conversion) was removed in V4. Typing a phone number on mobile is the
  single largest remaining friction in the flow.
- **The photographer himself** — `public/images/self/` has 5 photos of Aidan;
  no signup page shows the human you'd be meeting. For a solo-female-traveler
  audience deciding whether to meet a stranger, this is a trust lever, not
  decoration.
- **Safety framing** — "-new" had "daytime and public"; V4 dropped it. It
  directly serves the "Not confident on camera" / implicit-safety objection.

**Infrastructure gaps that cap what we can learn:**

- **No A/B splitting.** Variants are compared sequentially in time (ad-mix
  and seasonality confound everything). `scripts/pull-collab-analytics.mjs`
  doesn't even segment by the `version` prop that every page already reports.
- **Meta `Lead` is client-side only.** No Conversions API, no `eventID` dedup —
  ad-blocked/iOS leads exist in Supabase but are invisible to ad optimization.
- Unverifiable claims exist in the repo ("Featured in Vogue Italia, Hypebeast,
  WWD" — copy only, no assets). Don't reuse on these pages without proof.

---

## 3. Invariants — carried into every concept

Baseline all five concepts on the V4 chassis rather than reinventing it:

- Mobile-first, max-w-md single column, warm paper `#f4f2ee`, Georgia-italic
  headline system, emerald CTA.
- **Lead banked on the first submit** (background POST + retry), PATCH
  enrichment after, `(id, contact)` claim check.
- LINE/WhatsApp locale routing, geo city chips, country-code detection.
- 24h resume snapshot + Start over; honeypot; `initPageAnalytics` with a
  distinct `version` tag per concept.
- `Questions?` → FAQ inside the capture card; quiet "It's not for me" exits.
- Good/bad selfie contact sheets on the photo frame.
- **Honesty constraint:** no fabricated testimonials, no fake counters, no
  false deadlines. Every scarcity/proof element must be backed by real data
  (availability slots, shoots.ts) or it doesn't ship.

Naming: follow the established route convention — new concepts land as
`/sign-up-collab-v6` … `-v10` (noindex), each a `SignUpFormCollabV{N}.tsx`,
promoted to `/sign-up-collab` only when it wins.

---

## 4. The five concepts

### Concept 1 — V6 "City Dates" (honest scarcity)

**Target objection:** *Bad timing / Just browsing.*
**Hypothesis:** Giving the free offer a real, dated window in the visitor's own
city converts browsers into now-actors, because the cost of "later" becomes
explicit — and it's *true*, which is why it can be loud.

**The pitch:** The hero stops being generic. It says, in the visitor's
detected city:

> **Bangkok — Nov 3 to Nov 14.**
> I'm shooting free collab sessions on film while I'm in town.
> When I leave, this page closes for Bangkok.

**Frame-by-frame:**

1. **Capture** — same chassis as V4, but the headline block is the city + date
   window (from a small city-schedule data source, see below), with a
   sub-line: "a few collab slots this trip" (only if true; never a fake
   number). If the visitor's city has no scheduled window: graceful fallback
   headline ("Next in {nearest scheduled city} — or tell me where you are and
   I'll let you know when I'm close"), which converts the miss into a
   waitlist lead — a lead type the funnel currently throws away.
2–6. Unchanged from V4 (vibe → notes → location → photo → IG), except the
   location frame pre-confirms the scheduled city instead of asking cold.
   Done screen restates the window: "I'll message you within 24 hours — we'll
   lock a day before Nov 14."

**Per-city proof:** under the capture card, the proof grid filters to shoots
from that city/region when `data/shoots.ts` has them (Bangkok: Kiki, Sasha,
Pharima; Tokyo: Ellie, Rin, Sumika; Bali: Althea, Merasa…), each captioned
first-name + city. Proof from *your* city is categorically stronger than
proof from anywhere.

**What has to be built:**
- A tiny `data/citySchedule.ts` (city, ISO country, start/end dates, optional
  slot note) — hand-maintained, or derived from the existing Neon
  `availability_slots` table which already has an admin UI.
- Hero date logic + fallback/waitlist branch (waitlist = same POST, moodboard
  gets `Waitlist: {city}`).
- City → shoots.ts filter for the proof grid.

**Risks / mitigations:**
- *Stale dates are worse than no dates.* Mitigate: window auto-expires by
  date; expired city falls back to the waitlist branch automatically.
- Geo-detection wrong → wrong city in headline. Mitigate: the city is
  tappable to change (reuses city chips), and the detected city is already
  only a default elsewhere in the flow.
- Ad traffic is often city-targeted anyway — the page can also read a
  `?city=` param from the ad so headline and ad always agree.

**Metrics:** frame-1 submit rate vs V4 (primary); `not_for_me` chip mix
(expect "Bad timing" share to drop); waitlist-lead volume (new metric, pure
upside).
**Effort:** S–M. Highest impact-to-effort ratio of the five; the mechanic is
real and no competitor page can copy it without also traveling.

---

### Concept 2 — V7 "Receipts" (verifiable social proof)

**Target objection:** *Seems too good to be true.*
**Hypothesis:** The skeptic doesn't need more persuasion, she needs
*evidence she can check herself*. Named, city-tagged, clickable proof —
receipts, not claims — beats any amount of copy.

**The pitch:** Same capture-first frame 1, but the entire proof layer is
rebuilt around verifiability:

- **The ledger.** Replace the anonymous 6-up proof grid with a scrolling
  ledger of real shoots: photo, first name, city, roughly-when — "Greta ·
  Venice", "Kiki · Bangkok", "Indy · Dunedin" — each row tappable through to
  the real `/shoots/[slug]` gallery (opens in-place as a lightbox so we don't
  leak the funnel; "back to sign-up" is one tap). 27 shoots · 19 cities is a
  stat the repo can back frame-for-frame.
- **The human.** A small "who you'd be meeting" block: one photo of Aidan
  (`public/images/self/`), two sentences in first person, and the
  `@madebyaidan` handle. The IG account is itself the biggest receipt —
  frame the link as "check my tags", not "follow me".
- **The catch, stated plainly.** Inline the FAQ's strongest move as a
  two-column exchange card directly under the ask: **You get** (1–2 hr
  directed shoot, edited photos, full res, free, no deposit, nothing to buy)
  / **I get** (photos for my portfolio and Instagram — and if you'd rather I
  didn't post them, I won't). Naming the catch is what kills
  "too good to be true"; hiding it is what feeds it.

**Frame-by-frame:** identical flow to V4; only frame 1's below-card content
and the done screen change (done screen gains the ledger too — post-signup
reassurance reduces the ghost rate when he messages them).

**What has to be built:**
- Ledger component fed from `data/shoots.ts` (already has name, city, cover,
  gallery — zero new data needed).
- Lightbox gallery view (or reuse `/shoots/[slug]` in a modal route).
- Exchange card (pure copy, sourced from the FAQ so form and FAQ agree).

**Parallel non-code task (start now, pays into every future variant):**
collect 3–5 real quotes from past subjects via IG DM, with permission to use
first name + city. The repo currently has **zero** real testimonials and one
fabricated placeholder file that must stay dead. Until real quotes exist,
this concept deliberately ships without quotes — receipts over reviews.

**Risks:** proof-heavy frame 1 could push the card down — keep the ledger
*below* the card, exchange card compact; the 93%-never-scroll rule means the
card + one ledger row must fit the first viewport.
**Metrics:** frame-1 submit rate; `faq_opened` rate (expect ↓ — the answer
moved onto the page); "Seems too good to be true" chip share (expect ↓);
ledger-row taps (new event `proof_opened`).
**Effort:** M.

---

### Concept 3 — V8 "Your Shoot Plan" (personalization mirror)

**Target objection:** *Just browsing* (and low-intent leads that ghost).
**Hypothesis:** If two taps of input produce a visibly personalized shoot
plan, the phone number stops being "contact info for a stranger" and becomes
"the address where my plan gets delivered". Reframing the ask beats
shrinking it.

**The pitch:** One tap of intent *before* the ask — but only one, and it's a
tap, not typing (this is the crucial difference from the reverted tap-first
experiment, which put **three** frames before the ask):

1. **Frame 1 — vibe as the hero.** Full-bleed 2×2 vibe tiles *are* the hero:
   "Pick your vibe — I'll build your shoot plan." One tap auto-advances.
   This is a shallower commitment than typing a number, and tap-through here
   is itself an engagement signal the analytics can read.
2. **Frame 2 — the plan + the ask, one screen.** The top half assembles live
   from the tap: the matching moodboard strip (`public/images/moodboards/`
   already has beach/street/nature/indoor/editorial sets), detected city,
   "golden hour, 1–2 hrs", "what to wear: I'll send suggestions". Under it,
   the capture card, retitled: **"Where should I send your plan?"** —
   LINE/WhatsApp segmented control, number, CTA **"Send me my plan"**. Lead
   POSTs here; moodboard already carries `Look:` + `City:` from frame 1.
3–6. Notes → photo → Instagram as in V4 (location is already captured).
   **Done screen delivers the plan** — the same assembled moodboard +
   city + next-steps card, screenshot-worthy on purpose (she shares it, the
   page acquires for free).

**Why this can win where tap-first lost:** tap-first failed with three
low-value asks before the number. This puts *one* zero-typing tap first and
makes the payoff visible on the very screen that asks for the number. The
bet is narrower and the reward is on-screen.

**What has to be built:**
- Vibe-tile hero (exists in V4, promoted to frame 1).
- Plan-assembly block (moodboard strip per vibe + city line — static mapping,
  no backend).
- Done-screen plan card.
- New events: `plan_shown`, `plan_screenshot_hint`, plus existing funnel.

**Risks:** this is the one concept that re-tests a *losing* direction —
gate it honestly: if frame-1→2 progression is below V4's frame-1 submit rate
in the first N sessions, kill fast. Run it *after* an A/B harness exists
(§5) so the comparison is concurrent, not sequential.
**Metrics:** end-to-end banked-lead rate (primary — not frame-1 rate, since
the ask moved); lead *quality* (reply rate when Aidan messages — track
manually or via a `Replied` stamp in admin); done-screen dwell.
**Effort:** M.

---

### Concept 4 — V9 "One Tap" (zero-typing conversion)

**Target objection:** none of the four — this attacks **friction itself**.
**Hypothesis:** Typing a phone number on a phone is the largest remaining
cost in the funnel. Making the conversion a single tap that opens a chat
thread (the medium the follow-up already lives in) raises conversions even
if it complicates measurement.

**The pitch:** Frame 1 keeps hero + card, but the card's primary action is:

> **[ Message me on WhatsApp ]** ← one tap, opens `wa.me/491758966210`
> with a prefilled draft: *"Hi Aidan — I'm in {city}, I want the free
> collab shoot 📸"*
> `or leave your number and I'll message you ↓` ← V4's field, demoted to
> secondary

LINE path: `line.me` add-friend deep link (V3 already shipped this exact
mechanic — restore it), routed by the existing locale logic. The FAQ page
already deep-links composed messages into `wa.me`, so the pattern is proven
in-repo.

**Why chat-as-funnel fits this business:** the entire post-signup flow is
already a manual WhatsApp/LINE conversation. This concept just removes the
form standing between the ad and the conversation. The visitor lands in a
thread where *she* has sent the first message — psychologically committed,
and Aidan's reply is guaranteed deliverable (no wrong-number leads, which
the current funnel can't detect).

**The measurement problem, solved honestly:**
- The tap fires `chat_cta_tapped` + Meta `Lead` client-side, and POSTs a
  provisional row (`contact: 'whatsapp — tapped through'`, mirroring V3's
  `LINE — added me` pattern) so the admin list and Slack still see it.
- Ground truth = messages actually received. Prefilled drafts carry the city
  so threads are attributable; a per-variant emoji/tag in the draft
  (e.g. "📸") distinguishes this page's threads from organic DMs.
- Accepted limitation: tap→send drop-off is invisible in-page. That delta
  (taps vs threads received) becomes the concept's own health metric.

**Frames 2+:** none required — but an optional "while you're here" enrichment
screen (vibe tiles + selfie upload) shows *after* the tap for people who
return to the tab, PATCHing the provisional row. Pure upside, zero gate.

**Risks:** deep links behave differently in in-app browsers (IG/FB webview —
where most ad traffic lives). This needs real-device testing in the IG
in-app browser *first*; if `wa.me` opens reliably there (it generally does),
this concept is the single biggest friction cut available. Keep the number
field as the always-works fallback.
**Metrics:** taps/visit, threads-received/day (manual count or a lightweight
"mark as arrived" toggle in admin), provisional-row → real-thread match rate.
**Effort:** S code, M verification (device testing matrix).

---

### Concept 5 — V10 "The Catch" (radical transparency + value anchor)

**Target objection:** *Seems too good to be true* + *Not confident on camera*
— the two chips that represent trust, attacked with tone instead of proof
volume (Concept 2 attacks the same dragon with receipts; this one attacks it
with candor; they are deliberately different bets on the same objection).

**The pitch:** The page reads like a short, signed letter, not a landing
page. Headline:

> **A free photo shoot. Here's the actual catch.**

Then, in first person, above the ask, ~5 short lines:

1. *The catch:* "I'm building my portfolio in {city}. Your shoot is my
   content too — I may post some frames on my Instagram. If you'd rather I
   didn't, tell me and I won't. That's the whole deal."
2. *The anchor:* "When I book this session commercially it's ~$300
   [the Signature tier the Bali page already publishes]. Collabs are free
   because we're trading — you get the photos, I get the portfolio."
3. *The nerves:* "No experience needed. I direct everything — where to
   stand, what to do with your hands, where to look. Awkward is normal for
   the first ten minutes; that's my problem to fix, not yours."
4. *The safety line:* "Daytime, public places. Bring a friend if you like."
   (restores the "-new" variant's copy V4 dropped)
5. *The face:* Aidan's photo + name + handle, right beside the signature.

Capture card directly under the letter — same V4 mechanics, CTA reworded to
match the tone: **"Okay — message me the details"**.

**Frame-by-frame:** letter+capture (1) → vibe (2) → location (3) → photo (4,
with the good/bad sheets reframed as "so I can plan light and film for *you*,
not to judge you" — directly serving the not-confident objection) → IG (5).
Notes frame dropped (lowest-value frame in V4; notes field moves onto the
done screen as optional).

**What has to be built:** almost entirely copy + layout on the V4 chassis;
the anchor needs one decision from Aidan (which number to cite and phrasing
he's comfortable with — it must be true and defensible). No new data sources.

**Risks:** tone is the whole bet — it must survive translation to an audience
reading English as a second language (short sentences, no idioms). The $300
anchor must never appear next to "what's the catch" in a way that implies a
future upsell; the FAQ's "nothing to buy afterwards" line rides directly
under it.
**Metrics:** frame-1 submit rate; "too good to be true" + "not confident"
chip shares; FAQ open rate (expect ↓); photo-frame completion rate
(expect ↑ from the reframed good/bad copy).
**Effort:** S. Cheapest concept to ship; a pure copy/framing experiment on
proven mechanics.

---

## 5. Measurement plan — build this before or with concept #1

Sequential URL-swapping (how v3→v4 was compared) confounds every result with
ad-mix and time. Two small investments make all five concepts actually
readable:

1. **Concurrent splitting.** Lightweight `middleware.ts`: hash a cookie
   (`at_vid` already exists) into buckets, rewrite `/sign-up-collab` to the
   assigned variant component (all variants keep
   `analyticsPath="/sign-up-collab"` + their own `version` tag — exactly the
   mechanism V4 already uses, so zero tracking changes). Two arms at a time
   (champion vs one challenger); no flag service needed.
2. **Version-segmented reporting.** `scripts/pull-collab-analytics.mjs`
   currently ignores the `version` prop entirely. Add a `GROUP BY version`
   cut for: sessions, frame-1 submit rate, banked leads, completed profiles
   (enrich_success), photo-frame completion, not-for-me chip mix.
3. **Server-side `Lead` (Meta CAPI).** Fire from `POST /api/sign-up` with an
   `eventID` shared with the client pixel for dedup. This single change
   improves *every* variant's ad optimization and makes Concept 4's
   provisional-row leads visible to Meta even when the pixel is blocked.

**Primary metric for all concepts:** banked leads per landing session
(Supabase row written ÷ `page_view`), with reply-rate-after-contact as the
quality backstop so we never optimize into junk leads.
**Guardrails:** photo-frame completion rate (lead quality proxy),
"too good to be true" chip share, `submit_error` rate.
**Sample-size reality check:** at this funnel's volume, run each test to a
pre-agreed session count (pull the current daily sessions from
`pull-collab-analytics.mjs` and size for detecting a ~20% relative lift —
smaller lifts aren't worth chasing at low traffic; ship the next concept
instead).

## 6. Recommended sequence

| Order | Concept | Why this slot |
|---|---|---|
| 0 | Measurement plan (§5) | Everything else is unreadable without it |
| 1 | **V10 "The Catch"** | Cheapest, pure copy, attacks the #1 measured objection — fastest signal |
| 2 | **V6 "City Dates"** | Highest expected lift; needs the small schedule data source; honest urgency is the biggest untouched lever |
| 3 | **V7 "Receipts"** | Data already in repo; start collecting real quotes *now* in parallel |
| 4 | **V9 "One Tap"** | After in-app-browser device testing; biggest friction cut, hardest measurement |
| 5 | **V8 "Your Shoot Plan"** | Re-tests a risky direction — run it last, concurrently, with a fast kill rule |

Winning elements compose: City Dates' hero + The Catch's letter + Receipts'
ledger are not mutually exclusive — the sequence exists to attribute lift
before combining them into the next champion.

---

*Sources: `components/SignUpFormCollab{V3,V4,V5}.tsx`, `SignUpFormCollabNew.tsx`,
`SignUpForm.tsx`, `app/sign-up-collab/{faq,not-for-me}/page.tsx`,
`app/api/sign-up/route.ts`, `app/api/feedback/route.ts`, `lib/track.ts`,
`lib/cityChips.ts`, `data/shoots.ts`, `scripts/pull-collab-analytics.mjs`,
`public/images/{proof,faves,moodboards,self,collab-examples}/`.*
